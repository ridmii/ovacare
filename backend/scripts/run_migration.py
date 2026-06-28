"""Migrate legacy backend/data files into MongoDB and remove local copies."""

import os
import sys

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from dotenv import load_dotenv

load_dotenv(os.path.join(BACKEND_DIR, ".env"), override=True)

from services.migrate_local_data import migrate_local_data_to_mongo

if __name__ == "__main__":
    migrate_local_data_to_mongo()
