from __future__ import annotations

import os
from dataclasses import dataclass

from dotenv import load_dotenv


_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_ENV_PATH = os.path.join(_BACKEND_DIR, ".env")

@dataclass(frozen=True)
class EmailConfig:
    host: str
    port: int
    user: str
    password: str
    from_address: str
    from_name: str
    use_tls: bool
    use_ssl: bool
    timeout: int
    save_locally_when_unconfigured: bool

    @property
    def is_configured(self) -> bool:
        return bool(self.host and self.user and self.password)

    def missing_fields(self) -> list[str]:
        missing = []
        if not self.host:
            missing.append("SMTP_HOST")
        if not self.user:
            missing.append("SMTP_USER")
        if not self.password:
            missing.append("SMTP_PASSWORD")
        return missing

    def public_status(self) -> dict:
        return {
            "configured": self.is_configured,
            "host": self.host or None,
            "port": self.port,
            "user": self._mask_email(self.user) if self.user else None,
            "fromAddress": self.from_address or None,
            "fromName": self.from_name or None,
            "useTls": self.use_tls,
            "useSsl": self.use_ssl,
            "saveLocallyWhenUnconfigured": self.save_locally_when_unconfigured,
            "missingFields": self.missing_fields() if not self.is_configured else [],
        }

    @staticmethod
    def _mask_email(email: str) -> str:
        if "@" not in email:
            return "***"
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            masked_local = f"{local[0]}***"
        else:
            masked_local = f"{local[0]}***{local[-1]}"
        return f"{masked_local}@{domain}"


def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def get_email_config() -> EmailConfig:
    # Re-read .env in dev so SMTP changes apply without a manual server restart.
    if _env_bool("FLASK_DEBUG", False) or os.getenv("FLASK_ENV", "").strip().lower() == "development":
        load_dotenv(_ENV_PATH, override=True)

    user = os.getenv("SMTP_USER", "").strip()
    # Gmail app passwords are often copied with spaces — strip them all.
    password = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
    from_address = os.getenv("SMTP_FROM", user).strip()
    from_name = os.getenv("SMTP_FROM_NAME", "OvaCare").strip() or "OvaCare"

    return EmailConfig(
        host=os.getenv("SMTP_HOST", "").strip(),
        port=int(os.getenv("SMTP_PORT", "587")),
        user=user,
        password=password,
        from_address=from_address or user,
        from_name=from_name,
        use_tls=_env_bool("SMTP_USE_TLS", True),
        use_ssl=_env_bool("SMTP_USE_SSL", False),
        timeout=int(os.getenv("SMTP_TIMEOUT", "30")),
        save_locally_when_unconfigured=_env_bool("SMTP_SAVE_LOCALLY", False),
    )
