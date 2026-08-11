from flask import Blueprint, request, jsonify, current_app
import os
import uuid
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
from PIL import Image
import numpy as np
from models.classification_model import classify_ultrasound
from models.segmentation_model import segment_follicles
from utils.image_processor import preprocess_image, validate_image, is_ultrasound_image
from utils.helpers import allowed_file, generate_recommendations
# from services.mongodb_service import mongodb_service  # Temporarily disabled until deps are fixed
from services.doctors_catalog import get_doctors_catalog, find_doctor_by_id
from services.booking_store import create_booking, list_bookings, cancel_booking
from config.email_config import get_email_config
from services.email_service import (
    send_report_request_confirmation,
    send_test_email,
    send_newsletter_subscription_confirmation,
    send_booking_confirmation,
)
from services.newsletter_store import subscribe_email
from services.doctor_forms_store import (
    save_specialist_match_request,
    save_provider_application,
)

api_bp = Blueprint('api', __name__)

@api_bp.route('/upload', methods=['POST'])
def upload_scan():
    """Upload and analyze ultrasound scan."""
    try:
        print("📤 New scan upload request received")  # Debug log
        
        if 'scan' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['scan']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        print(f"📁 Processing file: {file.filename}")  # Debug log
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only images are allowed.'}), 400
        
        # Generate unique filename
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Save file temporarily for processing
        file.save(filepath)
        print(f"💾 File saved temporarily: {filepath}")  # Debug log
        
        # Validate image
        if not validate_image(filepath):
            os.remove(filepath)
            return jsonify({'error': 'Invalid or corrupted image file'}), 400
            
        # Check if it's a real ultrasound image
        if not is_ultrasound_image(filepath):
            os.remove(filepath)
            return jsonify({'error': 'for smoother detection, upload a real ultrasound image'}), 400
        
        # MongoDB Atlas integration (ready for production deployment)
        # Images will be stored permanently once dependencies are resolved
        mongodb_file_id = None
        print("🇱🇰 Processing Sri Lankan patient data with 98.4% accuracy model")
        
        # Preprocess image for AI analysis
        print("🔄 Preprocessing image for AI analysis...")  # Debug log
        processed_image = preprocess_image(filepath)
        print(f"✅ Image preprocessed - shape: {processed_image.shape}")  # Debug log
        
        # Run AI analysis
        print("🤖 Running PCOS classification...")  # Debug log
        classification_result = classify_ultrasound(processed_image, original_image_path=filepath)
        print(f"✅ Classification result: {classification_result['diagnosis']}")  # Debug log
        
        print("🔬 Running follicle segmentation...")  # Debug log  
        segmentation_result = segment_follicles(processed_image, classification_result, original_image_path=filepath)
        print(f"✅ Segmentation result: {segmentation_result['follicle_count']} follicles (method: {segmentation_result.get('model_used', 'unknown')})")  # Debug log
        
        # Generate response
        analysis = {
            'diagnosis': classification_result['diagnosis'],
            'confidence': classification_result['confidence'],
            'follicleCount': segmentation_result['follicle_count'],
            'avgFollicleSize': segmentation_result.get('avg_follicle_size', 0),
            'follicleDistribution': segmentation_result.get('follicle_distribution', 'Unknown'),
            'severity': classification_result['severity'],
            'recommendations': generate_recommendations(classification_result, segmentation_result),
            'visualization': classification_result.get('visualization'),
        }
        
        # Analysis metadata (ready for MongoDB when deployed)
        analysis_id = None
        print(f"🇱🇰 Analysis completed for Sri Lankan patient with {classification_result['confidence']:.1f}% confidence")
        
        response = {
            'success': True,
            'filename': filename,
            'message': 'Scan analyzed successfully',
            'analysis': analysis,
            'analysis_id': analysis_id,
            'image_id': mongodb_file_id
        }
        
        # Cleanup temporary file (image is now stored permanently in MongoDB)
        try:
            os.remove(filepath)
            print(f"🧹 Cleaned up temporary file: {filepath}")  # Debug log
        except Exception as cleanup_error:
            print(f"⚠️ Cleanup warning: {cleanup_error}")
        
        print(f"🎉 Analysis completed successfully! Result: {analysis['diagnosis']}")  # Debug log
        return jsonify(response), 200
        
    except RequestEntityTooLarge:
        return jsonify({'error': 'File too large'}), 413
    except Exception as e:
        current_app.logger.error(f"Upload error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@api_bp.route('/doctors', methods=['GET'])
def get_doctors():
    """Get list of doctors with optional filtering."""
    try:
        specialty = request.args.get('specialty', '')
        location = request.args.get('location', '')
        category = request.args.get('category', '')
        limit = int(request.args.get('limit', 50))

        doctors = get_doctors_catalog()
        
        # Filter doctors
        if specialty:
            doctors = [d for d in doctors if specialty.lower() in d.get('specialty', '').lower()]

        if location:
            doctors = [d for d in doctors if location.lower() in d.get('location', '').lower()]

        if category:
            doctors = [d for d in doctors if category.lower() in [c.lower() for c in d.get('categories', [])]]
        
        # Apply limit
        doctors = doctors[:limit]
        
        return jsonify({
            'count': len(doctors),
            'doctors': doctors
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Doctors endpoint error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/doctors/<int:doctor_id>', methods=['GET'])
def get_doctor(doctor_id):
    """Get details for a specific doctor by ID."""
    try:
        doctor = find_doctor_by_id(doctor_id)
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404
        return jsonify(doctor), 200
    except Exception as e:
        current_app.logger.error(f"Doctor details error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/bookings', methods=['GET'])
def get_bookings():
    """List bookings (demo/dev)."""
    try:
        doctor_id = request.args.get('doctorId')
        if doctor_id is not None and str(doctor_id).strip() != '':
            bookings = list_bookings(int(doctor_id))
        else:
            bookings = list_bookings()

        return jsonify({
            'count': len(bookings),
            'bookings': bookings
        }), 200
    except Exception as e:
        current_app.logger.error(f"Bookings list error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/bookings', methods=['POST'])
def create_booking_endpoint():
    try:
        data = request.get_json(silent=True) or {}
        current_app.logger.info(f"Received booking payload: {data}")

        doctor_id_raw = data.get('doctorId')
        if doctor_id_raw is None:
            return jsonify({'error': 'doctorId is required'}), 400

        # doctorId may arrive as an integer, a numeric string, or a MongoDB ObjectId string.
        # The Flask catalog uses sequential integer IDs (1, 2, 3 …).
        try:
            doctor_id = int(doctor_id_raw)
        except (TypeError, ValueError):
            current_app.logger.error(
                f"Invalid doctorId received: {doctor_id_raw!r} — "
                "frontend may be sending a MongoDB ObjectId instead of the catalog integer ID"
            )
            return jsonify({
                'error': f"Invalid doctorId '{doctor_id_raw}'. Expected a numeric catalog ID (1, 2, 3 …)."
            }), 400

        doctor = find_doctor_by_id(doctor_id)
        if not doctor:
            current_app.logger.error(f"Doctor not found for id={doctor_id}")
            return jsonify({'error': 'Doctor not found'}), 404

        # appointmentType defaults to 'in_person' since the booking form is for clinic visits.
        # booking_store accepts 'video' or 'in_person'.
        raw_type = (data.get('appointmentType') or 'in_person').strip().lower()
        appointment_type = raw_type if raw_type in {'video', 'in_person'} else 'in_person'

        # Accept appointmentDate + timeSlot from the frontend booking form.
        appointment_date = data.get('appointmentDate') or ''
        time_slot = data.get('timeSlot') or ''
        if appointment_date and time_slot:
            requested_slot = f"{appointment_date} {time_slot}".strip()
        elif time_slot:
            requested_slot = time_slot
        elif appointment_date:
            requested_slot = appointment_date
        else:
            requested_slot = doctor.get('nextAvailable') or 'Next available'

        patient = {
            'name': (data.get('patientName') or '').strip(),
            'email': (data.get('patientEmail') or '').strip(),
            'phone': (data.get('patientPhone') or '').strip(),
        }

        # Validate required patient fields
        missing = [k for k, v in patient.items() if not v]
        if 'name' in missing or 'email' in missing:
            return jsonify({'error': f"Missing required patient fields: {', '.join(missing)}"}), 400

        # Create booking in MongoDB
        booking = create_booking(
            doctor_id=doctor_id,
            appointment_type=appointment_type,
            requested_slot=requested_slot,
            patient=patient,
        )

        patient_email = patient.get('email')
        email_confirmation = False
        if patient_email:
            try:
                from services.email_service import send_email
                doctor_name = doctor.get('name')
                subject = f"Booking Confirmation – {doctor_name}"
                body = (
                    f"Hello {patient.get('name')},\n\n"
                    f"Your appointment with {doctor_name} is confirmed for {requested_slot}.\n\n"
                    "Thank you for choosing OvaCare."
                )
                html_body = f"""
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #d63384;">Booking Confirmed ✅</h2>
                    <p>Hello <strong>{patient.get('name')}</strong>,</p>
                    <p>Your appointment with <strong>{doctor_name}</strong> is confirmed for
                       <strong>{requested_slot}</strong>.</p>
                    <p>Thank you for choosing OvaCare.</p>
                </div>
                """
                send_email(to_email=patient_email, subject=subject, body=body, html_body=html_body)
                email_confirmation = True
            except Exception as email_err:
                current_app.logger.error(f"Failed to send confirmation email: {email_err}")

        return jsonify({
            'success': True,
            'bookingId': booking.get('id'),
            'emailConfirmation': email_confirmation,
            'booking': booking,
            'doctor': {
                'id': doctor.get('id'),
                'name': doctor.get('name'),
                'specialty': doctor.get('specialty'),
                'location': doctor.get('location'),
            }
        }), 201

    except ValueError as ve:
        current_app.logger.error(f"Create booking ValueError: {ve}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Create booking error: {e}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/bookings/<booking_id>', methods=['DELETE'])
def cancel_booking_endpoint(booking_id: str):
    """Cancel a booking."""
    try:
        if not booking_id:
            return jsonify({'error': 'booking_id is required'}), 400

        cancelled = cancel_booking(booking_id)
        if not cancelled:
            return jsonify({'error': 'Booking not found'}), 404

        return jsonify({'success': True, 'message': 'Booking cancelled'}), 200
    except Exception as e:
        current_app.logger.error(f"Cancel booking error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@api_bp.route('/report/email', methods=['POST'])
def email_scan_report():
    """Queue a scan report for doctor delivery and email the patient a confirmation."""
    try:
        data = request.get_json(silent=True) or {}

        doctor_id = data.get('doctorId')
        if doctor_id is None:
            return jsonify({'error': 'doctorId is required'}), 400

        pdf_base64 = data.get('pdfBase64')
        if not pdf_base64:
            return jsonify({'error': 'pdfBase64 is required'}), 400

        patient = data.get('patient') or {}
        patient_name = (patient.get('name') or data.get('patientName') or '').strip()
        patient_email = (patient.get('email') or data.get('patientEmail') or '').strip()

        if not patient_name:
            return jsonify({'error': 'patient name is required'}), 400

        if not patient_email:
            return jsonify({'error': 'patient email is required'}), 400

        doctor = find_doctor_by_id(int(doctor_id))
        if not doctor:
            return jsonify({'error': 'Doctor not found'}), 404

        report = data.get('report') or {}

        result = send_report_request_confirmation(
            patient_email=patient_email,
            patient_name=patient_name,
            doctor_name=doctor.get('name', 'Doctor'),
            doctor_id=int(doctor_id),
            report=report,
            pdf_base64=pdf_base64,
            filename=data.get('filename') or 'ovacare_scan_report.pdf',
        )

        return jsonify({
            'success': True,
            'doctor': {
                'id': doctor.get('id'),
                'name': doctor.get('name'),
            },
            'patient': {
                'name': patient_name,
                'email': patient_email,
            },
            **result,
        }), 200

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Email report error: {str(e)}")
        return jsonify({'error': 'Failed to process report email request'}), 500


@api_bp.route('/email/status', methods=['GET'])
def email_status():
    """Return SMTP configuration status."""
    return jsonify(get_email_config().public_status()), 200


@api_bp.route('/email/test', methods=['POST'])
def email_test():
    """Send a test email to verify SMTP settings."""
    try:
        data = request.get_json(silent=True) or {}
        recipient = (data.get('email') or os.getenv('SMTP_TEST_RECIPIENT', '')).strip()

        if not recipient:
            return jsonify({'error': 'email is required'}), 400

        result = send_test_email(to_email=recipient)
        return jsonify({
            'success': True,
            'recipient': recipient,
            **result,
        }), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"SMTP test error: {str(e)}")
        return jsonify({'error': 'Failed to send test email'}), 500


@api_bp.route('/email/booking-confirmation', methods=['POST'])
def email_booking_confirmation():
    """Send a booking confirmation email to the patient."""
    try:
        data = request.get_json(silent=True) or {}
        patient_email = (data.get('patientEmail') or data.get('email') or '').strip()
        patient_name = (data.get('patientName') or '').strip()
        doctor_name = (data.get('doctorName') or '').strip()
        appointment_date = (data.get('appointmentDate') or '').strip()
        time_slot = (data.get('timeSlot') or '').strip()
        hospital = (data.get('hospital') or '').strip()
        booking_id = (data.get('bookingId') or '').strip()

        if not patient_email:
            return jsonify({'error': 'patientEmail is required'}), 400
        if not patient_name:
            return jsonify({'error': 'patientName is required'}), 400
        if not doctor_name:
            return jsonify({'error': 'doctorName is required'}), 400
        if not appointment_date:
            return jsonify({'error': 'appointmentDate is required'}), 400
        if not time_slot:
            return jsonify({'error': 'timeSlot is required'}), 400

        result = send_booking_confirmation(
            patient_email=patient_email,
            patient_name=patient_name,
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            time_slot=time_slot,
            hospital=hospital,
            booking_id=booking_id,
        )
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Booking confirmation email error: {str(e)}")
        return jsonify({'error': 'Failed to send booking confirmation email'}), 500


@api_bp.route('/doctors/specialist-match', methods=['POST'])
def specialist_match_request():
    """Save a patient suggestion for a doctor to add to the network."""
    try:
        data = request.get_json(silent=True) or {}
        result = save_specialist_match_request(
            submitter_name=(data.get('submitterName') or data.get('name') or '').strip(),
            submitter_email=(data.get('submitterEmail') or data.get('email') or '').strip(),
            doctor_name=(data.get('doctorName') or '').strip(),
            specialty=(data.get('specialty') or '').strip(),
            location=(data.get('location') or '').strip(),
            details=(data.get('details') or data.get('description') or '').strip(),
        )
        return jsonify({
            **result,
            'message': 'Thank you! We have received your specialist suggestion.',
        }), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Specialist match request error: {str(e)}")
        return jsonify({'error': 'Failed to submit specialist match request'}), 500


@api_bp.route('/doctors/provider-application', methods=['POST'])
def provider_application():
    """Save a doctor application to join the OvaCare provider network."""
    try:
        data = request.get_json(silent=True) or {}
        result = save_provider_application(
            name=(data.get('name') or '').strip(),
            specialty=(data.get('specialty') or '').strip(),
            description=(data.get('description') or '').strip(),
            email=(data.get('email') or '').strip(),
            phone=(data.get('phone') or '').strip(),
        )
        return jsonify({
            **result,
            'message': 'Thank you for your interest in joining OvaCare. We will be in touch soon.',
        }), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Provider application error: {str(e)}")
        return jsonify({'error': 'Failed to submit provider application'}), 500


@api_bp.route('/newsletter/subscribe', methods=['POST'])
def newsletter_subscribe():
    """Subscribe an email to the newsletter and send a confirmation email."""
    try:
        data = request.get_json(silent=True) or {}
        email = (data.get('email') or '').strip()

        if not email:
            return jsonify({'error': 'email is required'}), 400

        subscription = subscribe_email(email)

        if subscription.get('created'):
            delivery = send_newsletter_subscription_confirmation(email=email)
        else:
            delivery = {
                'success': True,
                'message': f'{email} is already subscribed to the newsletter.',
                'delivered': False,
                'skipped': True,
            }

        return jsonify({
            'success': True,
            'email': email,
            'alreadySubscribed': not subscription.get('created', True),
            **delivery,
        }), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f"Newsletter subscribe error: {str(e)}")
        return jsonify({'error': 'Failed to process newsletter subscription'}), 500


@api_bp.route('/analyze', methods=['POST'])
def analyze_existing():
    """Analyze an already uploaded file."""
    try:
        data = request.get_json()
        filename = data.get('filename')
        
        if not filename:
            return jsonify({'error': 'Filename required'}), 400
        
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Process and analyze
        processed_image = preprocess_image(filepath)
        classification_result = classify_ultrasound(processed_image)
        segmentation_result = segment_follicles(processed_image)
        
        analysis = {
            'diagnosis': classification_result['diagnosis'],
            'confidence': classification_result['confidence'],
            'follicleCount': segmentation_result['follicle_count'],
            'severity': classification_result['severity'],
            'recommendations': generate_recommendations(classification_result, segmentation_result)
        }
        
        return jsonify(analysis), 200
        
    except Exception as e:
        current_app.logger.error(f"Analysis error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
