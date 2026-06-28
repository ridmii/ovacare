from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from services.mongodb_client import get_collection


def _collection():
    return get_collection("catalog_bookings")


def list_bookings(doctor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    query: Dict[str, Any] = {}
    if doctor_id is not None:
        query["doctorId"] = int(doctor_id)

    bookings = []
    for doc in _collection().find(query).sort("createdAt", -1):
        doc.pop("_id", None)
        bookings.append(doc)
    return bookings


def create_booking(
    *,
    doctor_id: int,
    appointment_type: str,
    requested_slot: Optional[str] = None,
    patient: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    if appointment_type not in {"video", "in_person"}:
        raise ValueError("Invalid appointmentType. Use 'video' or 'in_person'.")

    slot_key = (requested_slot or "next_available").strip().lower()
    existing = _collection().find_one(
        {
            "doctorId": int(doctor_id),
            "slotKey": slot_key,
            "status": "confirmed",
        }
    )
    if existing:
        raise ValueError("That time slot is already booked.")

    now = datetime.now(timezone.utc).isoformat()
    booking_id = str(uuid.uuid4())

    booking = {
        "id": booking_id,
        "doctorId": int(doctor_id),
        "appointmentType": appointment_type,
        "requestedSlot": requested_slot or "Next available",
        "slotKey": slot_key,
        "status": "confirmed",
        "patient": patient or {},
        "createdAt": now,
        "source": "flask_catalog",
    }

    _collection().insert_one(booking)
    return booking


def cancel_booking(booking_id: str) -> bool:
    result = _collection().update_one(
        {"id": str(booking_id), "status": {"$ne": "cancelled"}},
        {
            "$set": {
                "status": "cancelled",
                "cancelledAt": datetime.now(timezone.utc).isoformat(),
            }
        },
    )
    return result.modified_count > 0
