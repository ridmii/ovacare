from __future__ import annotations

import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from bson.binary import Binary

from services.mongodb_client import get_collection

_BACKEND_DIR = Path(__file__).resolve().parents[1]
_DATA_DIR = _BACKEND_DIR / "data"


def _parse_email_file(path: Path) -> Dict[str, str]:
    text = path.read_text(encoding="utf-8", errors="ignore")
    to_email = ""
    subject = ""
    body = text

    to_match = re.search(r"^To:\s*(.+)$", text, re.MULTILINE)
    subject_match = re.search(r"^Subject:\s*(.+)$", text, re.MULTILINE)
    if to_match:
        to_email = to_match.group(1).strip()
    if subject_match:
        subject = subject_match.group(1).strip()
        parts = text.split(f"Subject: {subject_match.group(1)}", 1)
        if len(parts) > 1:
            body = parts[1].strip()

    return {"toEmail": to_email, "subject": subject, "body": body}


def _delete_path(path: Path) -> None:
    if path.exists():
        path.unlink()


def _migrate_newsletter() -> int:
    source = _DATA_DIR / "newsletter_subscribers.json"
    if not source.exists():
        return 0

    try:
        subscribers = json.loads(source.read_text(encoding="utf-8") or "[]")
    except Exception:
        return 0

    if not isinstance(subscribers, list):
        return 0

    collection = get_collection("newsletter_subscribers")
    migrated = 0
    for item in subscribers:
        email = (item.get("email") or "").strip().lower()
        if not email:
            continue
        if collection.find_one({"email": email}):
            continue
        collection.insert_one(
            {
                "email": email,
                "subscribedAt": item.get("subscribedAt")
                or datetime.now(timezone.utc).isoformat(),
            }
        )
        migrated += 1

    _delete_path(source)
    return migrated


def _migrate_catalog_bookings() -> int:
    source = _DATA_DIR / "bookings.json"
    if not source.exists():
        return 0

    try:
        bookings = json.loads(source.read_text(encoding="utf-8") or "[]")
    except Exception:
        return 0

    if not isinstance(bookings, list):
        return 0

    collection = get_collection("catalog_bookings")
    migrated = 0
    for booking in bookings:
        booking_id = str(booking.get("id") or "")
        if not booking_id:
            continue
        if collection.find_one({"legacyId": booking_id}):
            continue
        collection.insert_one({**booking, "legacyId": booking_id, "source": "file_migration"})
        migrated += 1

    _delete_path(source)
    return migrated


def _migrate_specialist_match_requests() -> int:
    folder = _DATA_DIR / "specialist_match_requests"
    if not folder.exists():
        return 0

    collection = get_collection("specialistmatchrequests")
    migrated = 0

    for path in folder.glob("*.json"):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue

        request_id = record.get("requestId")
        doctor_name = record.get("doctorName", "")
        created_at = record.get("createdAt")
        if request_id and collection.find_one({"legacyRequestId": request_id}):
            _delete_path(path)
            continue

        collection.insert_one(
            {
                "submitterName": record.get("submitterName", ""),
                "submitterEmail": record.get("submitterEmail", ""),
                "doctorName": doctor_name,
                "specialty": record.get("specialty", ""),
                "location": record.get("location", ""),
                "details": record.get("details", ""),
                "status": "pending",
                "legacyRequestId": request_id,
                "createdAt": created_at,
                "updatedAt": created_at,
            }
        )
        migrated += 1
        _delete_path(path)

    return migrated


def _migrate_provider_applications() -> int:
    folder = _DATA_DIR / "provider_applications"
    if not folder.exists():
        return 0

    collection = get_collection("providerapplications")
    migrated = 0

    for path in folder.glob("*.json"):
        try:
            record = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue

        request_id = record.get("requestId")
        if request_id and collection.find_one({"legacyRequestId": request_id}):
            _delete_path(path)
            continue

        created_at = record.get("createdAt")
        collection.insert_one(
            {
                "name": record.get("name", ""),
                "specialty": record.get("specialty", ""),
                "description": record.get("description", ""),
                "email": record.get("email", ""),
                "phone": record.get("phone", ""),
                "status": "pending",
                "legacyRequestId": request_id,
                "createdAt": created_at,
                "updatedAt": created_at,
            }
        )
        migrated += 1
        _delete_path(path)

    return migrated


def _migrate_report_requests() -> int:
    folder = _DATA_DIR / "report_requests"
    if not folder.exists():
        return 0

    collection = get_collection("report_requests")
    migrated = 0

    for meta_path in folder.glob("*.json"):
        try:
            record = json.loads(meta_path.read_text(encoding="utf-8"))
        except Exception:
            continue

        request_id = record.get("requestId")
        if request_id and collection.find_one({"requestId": request_id}):
            pdf_path = Path(record.get("pdfPath", ""))
            _delete_path(meta_path)
            _delete_path(pdf_path)
            continue

        pdf_path = Path(record.get("pdfPath", ""))
        pdf_bytes = b""
        filename = record.get("filename", "report.pdf")
        if pdf_path.exists():
            pdf_bytes = pdf_path.read_bytes()
        else:
            for candidate in folder.glob(f"{request_id}_*.pdf"):
                pdf_bytes = candidate.read_bytes()
                filename = candidate.name.split("_", 1)[-1] if "_" in candidate.name else candidate.name
                pdf_path = candidate
                break

        collection.insert_one(
            {
                "requestId": request_id,
                "createdAt": record.get("createdAt"),
                "status": record.get("status", "pending_doctor_delivery"),
                "patientName": record.get("patientName", ""),
                "patientEmail": record.get("patientEmail", ""),
                "doctorId": record.get("doctorId"),
                "doctorName": record.get("doctorName", ""),
                "report": record.get("report", {}),
                "filename": filename,
                "pdf": Binary(pdf_bytes) if pdf_bytes else None,
            }
        )
        migrated += 1
        _delete_path(meta_path)
        _delete_path(pdf_path)

    for orphan_pdf in folder.glob("*.pdf"):
        _delete_path(orphan_pdf)

    return migrated


def _migrate_sent_emails() -> int:
    folder = _DATA_DIR / "sent_emails"
    if not folder.exists():
        return 0

    collection = get_collection("sent_emails")
    migrated = 0

    for path in folder.iterdir():
        if path.suffix.lower() == ".txt":
            parsed = _parse_email_file(path)
            if not parsed["toEmail"]:
                continue
            legacy_id = path.stem
            if collection.find_one({"legacyId": legacy_id}):
                _delete_path(path)
                continue
            collection.insert_one(
                {
                    **parsed,
                    "delivered": False,
                    "mode": "file_migration",
                    "legacyId": legacy_id,
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            )
            migrated += 1
            _delete_path(path)
        elif path.suffix.lower() == ".pdf":
            legacy_id = path.stem
            if collection.find_one({"legacyId": legacy_id}):
                _delete_path(path)
                continue
            collection.insert_one(
                {
                    "toEmail": "",
                    "subject": "Attachment",
                    "body": "",
                    "delivered": False,
                    "mode": "file_migration",
                    "legacyId": legacy_id,
                    "filename": path.name,
                    "attachment": Binary(path.read_bytes()),
                    "createdAt": datetime.now(timezone.utc).isoformat(),
                }
            )
            migrated += 1
            _delete_path(path)

    return migrated


def migrate_local_data_to_mongo() -> Dict[str, int]:
    """Import legacy file storage into MongoDB and delete local files."""
    results = {
        "newsletter_subscribers": _migrate_newsletter(),
        "catalog_bookings": _migrate_catalog_bookings(),
        "specialistmatchrequests": _migrate_specialist_match_requests(),
        "providerapplications": _migrate_provider_applications(),
        "report_requests": _migrate_report_requests(),
        "sent_emails": _migrate_sent_emails(),
    }

    for folder_name in (
        "specialist_match_requests",
        "provider_applications",
        "report_requests",
        "sent_emails",
    ):
        folder = _DATA_DIR / folder_name
        if folder.exists() and not any(folder.iterdir()):
            folder.rmdir()

    total = sum(results.values())
    if total:
        print(f"📦 Migrated {total} local records to MongoDB: {results}")

    return results
