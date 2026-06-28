from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any, Dict

from services.mongodb_client import get_collection


def _is_valid_email(email: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()))


def save_specialist_match_request(
    *,
    submitter_name: str,
    submitter_email: str,
    doctor_name: str,
    specialty: str,
    location: str,
    details: str,
) -> Dict[str, Any]:
    submitter_name = submitter_name.strip()
    submitter_email = submitter_email.strip()
    doctor_name = doctor_name.strip()
    specialty = specialty.strip()
    location = location.strip()
    details = details.strip()

    if not doctor_name:
        raise ValueError("Doctor name is required")
    if not specialty:
        raise ValueError("Specialty is required")
    if not location:
        raise ValueError("Location is required")
    if submitter_email and not _is_valid_email(submitter_email):
        raise ValueError("Please provide a valid email address")

    now = datetime.now(timezone.utc)
    record = {
        "submitterName": submitter_name,
        "submitterEmail": submitter_email,
        "doctorName": doctor_name,
        "specialty": specialty,
        "location": location,
        "details": details,
        "status": "pending",
        "createdAt": now,
        "updatedAt": now,
    }
    result = get_collection("specialistmatchrequests").insert_one(record)
    return {"success": True, "requestId": str(result.inserted_id)}


def save_provider_application(
    *,
    name: str,
    specialty: str,
    description: str,
    email: str = "",
    phone: str = "",
) -> Dict[str, Any]:
    name = name.strip()
    specialty = specialty.strip()
    description = description.strip()
    email = email.strip()
    phone = phone.strip()

    if not name:
        raise ValueError("Name is required")
    if not specialty:
        raise ValueError("Specialty is required")
    if not description:
        raise ValueError("Description is required")
    if email and not _is_valid_email(email):
        raise ValueError("Please provide a valid email address")

    now = datetime.now(timezone.utc)
    record = {
        "name": name,
        "specialty": specialty,
        "description": description,
        "email": email,
        "phone": phone,
        "status": "pending",
        "createdAt": now,
        "updatedAt": now,
    }
    result = get_collection("providerapplications").insert_one(record)
    return {"success": True, "requestId": str(result.inserted_id)}
