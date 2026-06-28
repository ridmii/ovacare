from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

from services.mongodb_client import get_collection


def subscribe_email(email: str) -> Dict[str, Any]:
    normalized = email.strip().lower()
    collection = get_collection("newsletter_subscribers")
    existing = collection.find_one({"email": normalized})

    if existing:
        return {
            "created": False,
            "email": normalized,
            "subscribedAt": existing.get("subscribedAt"),
        }

    subscribed_at = datetime.now(timezone.utc).isoformat()
    collection.insert_one({"email": normalized, "subscribedAt": subscribed_at})
    return {"created": True, "email": normalized, "subscribedAt": subscribed_at}
