from functools import lru_cache
import os

from supabase import Client, create_client

from app.config import load_env

load_env()

_REQUIRED_VARS = ("SUPABASE_URL", "SUPABASE_SERVICE_KEY")


class SupabaseConfigError(RuntimeError):
    """Raised when a required Supabase environment variable is missing."""


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    """Return the cached Supabase client, creating it lazily on first call."""
    values = {name: os.getenv(name) for name in _REQUIRED_VARS}
    missing = [name for name in _REQUIRED_VARS if not values[name]]
    if missing:
        raise SupabaseConfigError(
            f"Missing required environment variable: {', '.join(missing)}"
        )
    return create_client(values["SUPABASE_URL"], values["SUPABASE_SERVICE_KEY"])
