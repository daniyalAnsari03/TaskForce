"""Keeps secrets out of all log output (console and files).

Attaches a filter to every configured handler so that anything recorded for a
task - logger calls and exception tracebacks alike - goes through
`app.config.redact_secrets` before it is rendered.
"""

import logging
import traceback

from app.config import redact_secrets


class SecretRedactingFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        try:
            record.msg = redact_secrets(record.getMessage())
            record.args = ()
            if record.exc_info:
                record.exc_text = redact_secrets(
                    "".join(traceback.format_exception(*record.exc_info))
                )
        except Exception:
            pass
        return True


def _add_filter(handler: logging.Handler, redactor: SecretRedactingFilter) -> None:
    if redactor not in getattr(handler, "filters", []):
        handler.addFilter(redactor)


def install_secret_redaction() -> None:
    """Attach the filter to all handlers already configured, and make sure the
    root logger has one so nothing falls through to logging.lastResort."""
    redactor = SecretRedactingFilter()
    root = logging.getLogger()

    for name in list(logging.root.manager.loggerDict):
        if not isinstance(logging.getLogger(name), logging.Logger):
            continue
        for handler in logging.getLogger(name).handlers:
            _add_filter(handler, redactor)

    if not root.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
        )
        root.addHandler(handler)
    for handler in root.handlers:
        _add_filter(handler, redactor)
