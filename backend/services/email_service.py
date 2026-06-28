from __future__ import annotations



import base64

import re

import smtplib

from datetime import datetime, timezone

from email.mime.multipart import MIMEMultipart

from email.mime.text import MIMEText

from email.utils import formataddr

from typing import Any, Dict, Optional



from bson.binary import Binary



from config.email_config import EmailConfig, get_email_config

from services.mongodb_client import get_collection





def _is_valid_email(email: str) -> bool:

    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()))





def _build_report_summary(report: Dict[str, Any]) -> str:

    recommendations = report.get("recommendations") or []

    rec_lines = "\n".join(f"- {item}" for item in recommendations[:5])



    return (

        f"Diagnosis: {report.get('diagnosis', 'N/A')}\n"

        f"Confidence: {report.get('confidence', 'N/A')}%\n"

        f"Severity: {report.get('severity', 'N/A')}\n"

        f"Follicle Count: {report.get('follicleCount', 'N/A')}\n\n"

        f"Recommendations:\n{rec_lines or '- See attached PDF report'}"

    )





def _save_report_request(

    *,

    patient_email: str,

    patient_name: str,

    doctor_name: str,

    doctor_id: int,

    report: Dict[str, Any],

    pdf_bytes: bytes,

    filename: str,

) -> Dict[str, str]:

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")

    safe_email = patient_email.replace("@", "_at_")

    request_id = f"{timestamp}_{safe_email}"



    get_collection("report_requests").insert_one(

        {

            "requestId": request_id,

            "createdAt": datetime.now(timezone.utc).isoformat(),

            "status": "pending_doctor_delivery",

            "patientName": patient_name,

            "patientEmail": patient_email,

            "doctorId": doctor_id,

            "doctorName": doctor_name,

            "report": report,

            "filename": filename,

            "pdf": Binary(pdf_bytes),

        }

    )



    return {"requestId": request_id}





def _log_sent_email(

    *,

    to_email: str,

    subject: str,

    body: str,

    html_body: Optional[str] = None,

    delivered: bool = False,

    mode: str = "db_saved",

    error: Optional[str] = None,

) -> str:

    record_id = get_collection("sent_emails").insert_one(

        {

            "toEmail": to_email,

            "subject": subject,

            "body": body,

            "htmlBody": html_body,

            "delivered": delivered,

            "mode": mode,

            "error": error,

            "createdAt": datetime.now(timezone.utc).isoformat(),

        }

    ).inserted_id

    return str(record_id)





def _connect_smtp(config: EmailConfig):

    if config.use_ssl:

        return smtplib.SMTP_SSL(config.host, config.port, timeout=config.timeout)



    server = smtplib.SMTP(config.host, config.port, timeout=config.timeout)

    server.ehlo()

    if config.use_tls:

        server.starttls()

        server.ehlo()

    return server





def _build_message(

    *,

    email_config: EmailConfig,

    to_email: str,

    subject: str,

    body: str,

    html_body: str | None = None,

) -> MIMEMultipart:

    msg = MIMEMultipart("alternative")

    msg["From"] = formataddr((email_config.from_name, email_config.from_address))

    msg["To"] = to_email

    msg["Subject"] = subject

    msg["Reply-To"] = email_config.from_address

    msg.attach(MIMEText(body, "plain", "utf-8"))

    if html_body:

        msg.attach(MIMEText(html_body, "html", "utf-8"))

    return msg





def send_email(

    *,

    to_email: str,

    subject: str,

    body: str,

    html_body: str | None = None,

    config: EmailConfig | None = None,

) -> Dict[str, Any]:

    email_config = config or get_email_config()

    to_email = to_email.strip()



    if not _is_valid_email(to_email):

        raise ValueError("Please provide a valid recipient email address")



    if not email_config.is_configured:

        record_id = _log_sent_email(

            to_email=to_email,

            subject=subject,

            body=body,

            html_body=html_body,

            delivered=False,

            mode="db_saved",

            error="SMTP is not configured",

        )

        return {

            "delivered": False,

            "mode": "db_saved",

            "recordId": record_id,

        }



    msg = _build_message(

        email_config=email_config,

        to_email=to_email,

        subject=subject,

        body=body,

        html_body=html_body,

    )



    try:

        with _connect_smtp(email_config) as server:

            server.login(email_config.user, email_config.password)

            server.send_message(msg)

    except smtplib.SMTPAuthenticationError as exc:

        record_id = _log_sent_email(

            to_email=to_email,

            subject=subject,

            body=body,

            html_body=html_body,

            delivered=False,

            mode="smtp_failed",

            error=str(exc),

        )

        raise ValueError(

            "SMTP authentication failed. Verify SMTP_USER and SMTP_PASSWORD in backend/.env."

        ) from exc

    except smtplib.SMTPException as exc:

        record_id = _log_sent_email(

            to_email=to_email,

            subject=subject,

            body=body,

            html_body=html_body,

            delivered=False,

            mode="smtp_failed",

            error=str(exc),

        )

        raise ValueError(f"Failed to send email via SMTP: {exc}") from exc



    record_id = _log_sent_email(

        to_email=to_email,

        subject=subject,

        body=body,

        html_body=html_body,

        delivered=True,

        mode="smtp",

    )

    return {"delivered": True, "mode": "smtp", "recordId": record_id}





def send_test_email(*, to_email: str) -> Dict[str, Any]:

    subject = "OvaCare SMTP Test Email"

    body = (

        "This is a test email from the OvaCare backend.\n\n"

        "If you received this message, SMTP is configured correctly."

    )

    return send_email(to_email=to_email, subject=subject, body=body)





def send_report_request_confirmation(

    *,

    patient_email: str,

    patient_name: str,

    doctor_name: str,

    doctor_id: int,

    report: Dict[str, Any],

    pdf_base64: str,

    filename: str = "ovacare_scan_report.pdf",

) -> Dict[str, Any]:

    patient_email = patient_email.strip()

    patient_name = patient_name.strip()

    doctor_name = doctor_name.strip()



    if not patient_name:

        raise ValueError("Patient name is required")



    if not patient_email:

        raise ValueError("Patient email is required")



    if not _is_valid_email(patient_email):

        raise ValueError("Please provide a valid email address")



    if not pdf_base64:

        raise ValueError("PDF report attachment is required")



    pdf_bytes = base64.b64decode(pdf_base64)

    summary = _build_report_summary(report)



    saved_request = _save_report_request(

        patient_email=patient_email,

        patient_name=patient_name,

        doctor_name=doctor_name,

        doctor_id=doctor_id,

        report=report,

        pdf_bytes=pdf_bytes,

        filename=filename,

    )



    subject = "OvaCare - Your scan report request was received"

    body = (

        f"Dear {patient_name},\n\n"

        "Thank you for using OvaCare.\n\n"

        f"We have received your request to share your PCOS scan analysis report with {doctor_name}.\n"

        "We will let you know once your report has been successfully sent to the doctor.\n\n"

        "Report summary:\n"

        f"{summary}\n\n"

        "You can also download your PDF report anytime from the OvaCare scan results page.\n\n"

        "Regards,\n"

        "OvaCare Team"

    )



    delivery = send_email(to_email=patient_email, subject=subject, body=body)



    if delivery.get("delivered"):

        message = (

            f"Confirmation email sent to {patient_email}. "

            f"We will notify you once your report is sent to {doctor_name}."

        )

    else:

        message = (

            f"Your report request was saved. A confirmation email for {patient_email} "

            f"was stored in the database because SMTP is not configured."

        )



    return {

        "success": True,

        "message": message,

        **saved_request,

        **delivery,

    }





def send_newsletter_subscription_confirmation(*, email: str) -> Dict[str, Any]:

    email = email.strip()



    if not email:

        raise ValueError("Email address is required")



    if not _is_valid_email(email):

        raise ValueError("Please provide a valid email address")



    subject = "You're subscribed to the OvaCare newsletter"

    body = (

        "Thank you for subscribing to the OvaCare newsletter!\n\n"

        "You've successfully joined our mailing list. We'll send you the latest PCOS "

        "health tips, educational resources, and OvaCare product updates.\n\n"

        "If you did not subscribe, you can ignore this email.\n\n"

        "Regards,\n"

        "OvaCare Team"

    )

    html_body = (

        "<p>Thank you for subscribing to the <strong>OvaCare</strong> newsletter!</p>"

        "<p>You've successfully joined our mailing list. We'll send you the latest PCOS "

        "health tips, educational resources, and OvaCare product updates.</p>"

        "<p>If you did not subscribe, you can ignore this email.</p>"

        "<p>Regards,<br>OvaCare Team</p>"

    )



    delivery = send_email(to_email=email, subject=subject, body=body, html_body=html_body)



    if delivery.get("delivered"):

        message = f"Subscription confirmed. A welcome email was sent to {email}."

    else:

        message = (

            f"Subscription saved for {email}. A confirmation email was stored in the database "

            "because SMTP is not configured."

        )



    return {

        "success": True,

        "message": message,

        **delivery,

    }





def send_booking_confirmation(

    *,

    patient_email: str,

    patient_name: str,

    doctor_name: str,

    appointment_date: str,

    time_slot: str,

    hospital: str = "",

    booking_id: str = "",

) -> Dict[str, Any]:

    patient_email = patient_email.strip()

    patient_name = patient_name.strip()



    if not patient_name:

        raise ValueError("Patient name is required")

    if not patient_email:

        raise ValueError("Patient email is required")

    if not _is_valid_email(patient_email):

        raise ValueError("Please provide a valid email address")



    location_line = f"\nLocation: {hospital}" if hospital else ""

    booking_ref = f"\nBooking reference: {booking_id}" if booking_id else ""



    subject = "OvaCare - Your consultation is confirmed"

    body = (

        f"Dear {patient_name},\n\n"

        "Your consultation booking with OvaCare has been confirmed.\n\n"

        f"Doctor: {doctor_name}\n"

        f"Date: {appointment_date}\n"

        f"Time: {time_slot}{location_line}{booking_ref}\n\n"

        "Please arrive a few minutes early if your appointment is in person, "

        "or check your email for a video link if you booked a virtual consultation.\n\n"

        "Regards,\n"

        "OvaCare Team"

    )

    html_body = (

        f"<p>Dear {patient_name},</p>"

        "<p>Your consultation booking with <strong>OvaCare</strong> has been confirmed.</p>"

        "<ul>"

        f"<li><strong>Doctor:</strong> {doctor_name}</li>"

        f"<li><strong>Date:</strong> {appointment_date}</li>"

        f"<li><strong>Time:</strong> {time_slot}</li>"

        + (f"<li><strong>Location:</strong> {hospital}</li>" if hospital else "")

        + (f"<li><strong>Booking reference:</strong> {booking_id}</li>" if booking_id else "")

        + "</ul>"

        "<p>Please arrive a few minutes early if your appointment is in person, "

        "or check your email for a video link if you booked a virtual consultation.</p>"

        "<p>Regards,<br>OvaCare Team</p>"

    )



    delivery = send_email(

        to_email=patient_email,

        subject=subject,

        body=body,

        html_body=html_body,

    )



    if delivery.get("delivered"):

        message = f"Booking confirmation email sent to {patient_email}."

    else:

        message = (

            f"Booking confirmation for {patient_email} was stored in the database "

            "because SMTP is not configured."

        )



    return {"success": True, "message": message, **delivery}


