import os
import re
from pathlib import Path

from dotenv import load_dotenv

# Load backend/.env by absolute path (derived from this file's location) so the
# variables are available regardless of the process's working directory.
_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


def load_env() -> None:
    """Load backend/.env by absolute path (derived from this file's location) so
    the variables are available regardless of the process's working directory.
    Idempotent; real-environment values always take precedence."""
    load_dotenv(dotenv_path=_ENV_FILE)
    _normalize_env_vars()

_VARS_TO_NORMALIZE = (
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "TAVILY_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_KEY",
    "FRONTEND_ORIGIN",
)


def _clean_value(value: str | None) -> str | None:
    """Trim whitespace, surrounding quotes, and treat blank values as absent."""
    if value is None:
        return None
    cleaned = value.strip()
    if len(cleaned) >= 2 and cleaned[0] == cleaned[-1] and cleaned[0] in ("'", '"'):
        cleaned = cleaned[1:-1].strip()
    return cleaned or None


def _normalize_env_vars() -> None:
    """Push cleaned values back into os.environ so the OpenAI client and Tavily
    MCP code (which read the raw environment) see usable, non-empty values."""
    for name in _VARS_TO_NORMALIZE:
        cleaned = _clean_value(os.environ.get(name))
        if cleaned is None:
            os.environ.pop(name, None)
        else:
            os.environ[name] = cleaned


load_env()

REQUIRED_AGENT_VARS = ("OPENAI_API_KEY", "OPENAI_MODEL", "TAVILY_API_KEY")

# Secret values that must never appear in logs, error messages or stored rows.
SECRET_ENV_VARS = ("TAVILY_API_KEY", "OPENAI_API_KEY", "SUPABASE_SERVICE_KEY")
_REDACTED = "[redacted]"
_TAVILY_KEY_PATTERN = re.compile(r"(tavilyApiKey=)[^&\s'\"]*")


class ConfigError(RuntimeError):
    """Raised when required environment configuration is missing."""


def missing_agent_vars() -> list[str]:
    """Return the names of required agent variables that are not set (empty or
    whitespace-only values count as missing)."""
    return [name for name in REQUIRED_AGENT_VARS if not _clean_value(os.getenv(name))]


def describe_missing_agent_vars() -> str:
    missing = missing_agent_vars()
    return (
        "Agent runtime is not configured. Missing environment variable(s): "
        + ", ".join(missing)
        + ". Set them in backend/.env and restart the backend."
    )


def redact_secrets(text: str) -> str:
    """Remove API keys and key-bearing URLs from any text before it is logged or saved."""
    masked = text
    for name in SECRET_ENV_VARS:
        value = os.getenv(name)
        if value and value in masked:
            masked = masked.replace(value, _REDACTED)
    # Also mask the Tavily MCP URL parameter in case the key itself differs in form.
    masked = _TAVILY_KEY_PATTERN.sub(r"\1[redacted]", masked)
    return masked
