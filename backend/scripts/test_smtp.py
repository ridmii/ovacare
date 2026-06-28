#!/usr/bin/env python3
"""Send a test email using SMTP settings from backend/.env."""

from __future__ import annotations

import argparse
import os
import sys

from dotenv import load_dotenv

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

load_dotenv(os.path.join(BACKEND_DIR, ".env"))

from config.email_config import get_email_config
from services.email_service import send_test_email


def main() -> int:
    parser = argparse.ArgumentParser(description="Send an OvaCare SMTP test email")
    parser.add_argument(
        "recipient",
        nargs="?",
        default=os.getenv("SMTP_TEST_RECIPIENT", "").strip(),
        help="Recipient email address (defaults to SMTP_TEST_RECIPIENT)",
    )
    args = parser.parse_args()

    if not args.recipient:
        print("Error: provide a recipient email or set SMTP_TEST_RECIPIENT in backend/.env")
        return 1

    config = get_email_config()
    if not config.is_configured:
        missing = ", ".join(config.missing_fields())
        print(f"Error: SMTP is not configured. Missing: {missing}")
        print("Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in backend/.env")
        print("Gmail: create an App Password at https://myaccount.google.com/apppasswords")
        return 1

    try:
        result = send_test_email(to_email=args.recipient)
    except ValueError as exc:
        print(f"Error: {exc}")
        return 1

    print(f"Test email sent to {args.recipient}")
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
