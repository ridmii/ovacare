from __future__ import annotations

import os
from functools import lru_cache

from pymongo import MongoClient
from pymongo.database import Database


def _resolve_db_name(uri: str) -> str:
    if "://" not in uri:
        return "ovacare"
    path = uri.split("://", 1)[1]
    if "/" not in path:
        return "ovacare"
    db_name = path.split("/", 1)[1].split("?")[0]
    return db_name or "ovacare"


@lru_cache(maxsize=1)
def get_database() -> Database:
    uri = (
        os.getenv("BOOKING_MONGODB_URI")
        or os.getenv("MONGODB_URI")
        or "mongodb://127.0.0.1:27017/ovacare"
    )
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")
    return client[_resolve_db_name(uri)]


def get_collection(name: str):
    return get_database()[name]
