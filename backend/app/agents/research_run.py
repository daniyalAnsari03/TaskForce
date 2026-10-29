"""Background executor for Researcher task runs.

Flow for one task:
1. tasks.status -> running + started_at, insert one task_steps row (working).
2. Run the Researcher with `Runner.run_streamed`, logging every tool call
   (start/output) as a tool_calls row keyed by call_id.
3. On success: step -> done, task -> completed with tasks.summary (final answer).
4. On any error: step -> failed, task -> failed with a clear error_message.
   No exception is allowed to escape this module.
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

from agents import Runner
from fastapi import BackgroundTasks
from supabase import Client

from app.agents.researcher import (
    build_fallback_research_agent,
    build_mcp_research_agent,
    validate_agent_config,
)
from app.config import ConfigError, redact_secrets
from app.db.supabase_client import get_supabase

logger = logging.getLogger("taskforce.research_run")

MAX_MESSAGE_LENGTH = 500
MAX_OUTPUT_TEXT = 8000


class MCPServerUnavailableError(RuntimeError):
    """Raised when the Tavily MCP path fails, at connect time or during the run."""


def schedule_research_run(
    background_tasks: BackgroundTasks, task_id: str, goal: str
) -> None:
    background_tasks.add_task(run_research_task, task_id, goal)


def run_research_task(task_id: str, goal: str) -> None:
    """Entry point for FastAPI background tasks. Never raises."""
    try:
        asyncio.run(_run_research_task(task_id, goal))
    except Exception:
        # Last-resort guard: the DB was already updated inside _run_research_task,
        # this only protects the server from a silent crash.
        logger.exception("Research run crashed for task %s", task_id)


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _clamp(text: str) -> str:
    return text if len(text) <= MAX_MESSAGE_LENGTH else text[:MAX_MESSAGE_LENGTH] + "..."


def _clean_text(text: str) -> str:
    """Mask all API keys / key-bearing URLs before text is shown or stored."""
    return _clamp(redact_secrets(text))


def _redact(value: Any) -> Any:
    """Recursively mask secrets inside a tool input/output payload."""
    if isinstance(value, str):
        return redact_secrets(value)
    if isinstance(value, dict):
        return {key: _redact(item) for key, item in value.items()}
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


def _extract_tool_input(item: Any) -> dict:
    raw = getattr(item, "raw_item", None)
    arguments = getattr(raw, "arguments", None)
    if arguments is None and isinstance(raw, dict):
        arguments = raw.get("arguments")
    if isinstance(arguments, str):
        try:
            parsed = json.loads(arguments)
            return parsed if isinstance(parsed, dict) else {"raw": arguments}
        except ValueError:
            return {"raw": arguments}
    if isinstance(arguments, dict):
        return arguments
    return {}


def _normalize_output(output: Any) -> Any:
    if output is None or isinstance(output, (dict, list, int, float, bool)):
        return output
    text = str(output)
    try:
        return json.loads(text)
    except ValueError:
        return {"text": text[:MAX_OUTPUT_TEXT]}


class ToolCallLogger:
    """Writes one tool_calls row per agent tool call (running -> ok/failed)."""

    def __init__(self, supabase: Client, task_id: str, step_id: str | None = None):
        self.supabase = supabase
        self.task_id = task_id
        self.step_id = step_id
        self.count = 0
        self._pending: dict[str, str] = {}

    def bind_step(self, step_id: str) -> None:
        self.step_id = step_id

    def start(self, call_id: str, tool_name: str, input_payload: dict) -> None:
        self.count += 1
        try:
            response = (
                self.supabase.table("tool_calls")
                .insert(
                    {
                        "task_id": self.task_id,
                        "step_id": self.step_id,
                        "tool_name": tool_name,
                        "input": _redact(input_payload),
                        "status": "running",
                    }
                )
                .execute()
            )
        except Exception:
            logger.exception("Failed to insert tool_calls row for task %s", self.task_id)
            return
        rows = response.data or []
        if call_id and rows:
            self._pending[call_id] = rows[0]["id"]

    def finish(self, call_id: str, output: Any) -> None:
        row_id = self._pending.pop(call_id, None)
        payload = {"output": _redact(_normalize_output(output)), "status": "ok"}
        try:
            if row_id:
                self.supabase.table("tool_calls").update(payload).eq("id", row_id).execute()
            else:
                self.supabase.table("tool_calls").insert(
                    {
                        "task_id": self.task_id,
                        "step_id": self.step_id,
                        "tool_name": "unknown",
                        "input": {},
                        **payload,
                    }
                ).execute()
        except Exception:
            logger.exception(
                "Failed to update tool_calls row for task %s", self.task_id
            )

    def fail_pending(self, message: str) -> None:
        try:
            self.supabase.table("tool_calls").update(
                {"status": "failed", "output": {"error": _clean_text(message)}}
            ).eq("task_id", self.task_id).eq("status", "running").execute()
        except Exception:
            logger.exception(
                "Failed to mark pending tool_calls as failed for task %s", self.task_id
            )
        self._pending.clear()

    def observe_event(self, supabase: Client, event: Any) -> None:
        if getattr(event, "type", None) != "run_item_stream_event":
            return
        name = getattr(event, "name", None)
        item = getattr(event, "item", None)
        if name == "tool_called" and getattr(item, "type", None) == "tool_call_item":
            call_id = getattr(item, "call_id", None) or ""
            tool_name = getattr(item, "tool_name", None) or "unknown"
            self.start(call_id, tool_name, _extract_tool_input(item))
        elif name == "tool_output" and getattr(item, "type", None) == "tool_call_output_item":
            call_id = getattr(item, "call_id", None) or ""
            self.finish(call_id, getattr(item, "output", None))


async def _run_agent(agent: Any, goal: str, tool_logger: ToolCallLogger) -> str:
    result = Runner.run_streamed(agent, input=goal)
    async for event in result.stream_events():
        tool_logger.observe_event(tool_logger.supabase, event)
    final_output = getattr(result, "final_output", None)
    if final_output is None:
        raise RuntimeError("The Researcher returned no final answer.")
    return str(final_output)


async def _run_mcp_research(goal: str, tool_logger: ToolCallLogger) -> str:
    """Run the Researcher through the Tavily MCP server.

    The exact server instance attached to the agent must stay connected for the
    whole run, so `Runner.run_streamed` and full stream consumption happen inside
    the `async with server:` block (exiting it runs cleanup and unsets the
    session).
    """
    agent, server = build_mcp_research_agent()
    try:
        async with server:
            await server.list_tools()
            return await _run_agent(agent, goal, tool_logger)
    except Exception as exc:
        raise MCPServerUnavailableError(
            f"Tavily MCP research failed ({type(exc).__name__}); "
            "retrying once with the direct Tavily search API."
        ) from exc


async def _run_fallback_research(goal: str, tool_logger: ToolCallLogger) -> str:
    """Run the Researcher with the direct Tavily web_search function tool."""
    # The fallback agent gets a fresh web_search tool (and fresh 3-search counter).
    return await _run_agent(build_fallback_research_agent(), goal, tool_logger)


async def _run_research(goal: str, tool_logger: ToolCallLogger) -> tuple[str, str]:
    """Try web search through MCP; retry once via the Tavily API on any MCP failure.

    Returns (summary, description of the path that was used).
    """
    try:
        summary = await _run_mcp_research(goal, tool_logger)
        return summary, "Tavily MCP server"
    except MCPServerUnavailableError as exc:
        logger.warning(
            "Tavily MCP path failed; using direct Tavily search API fallback: %s",
            _clean_text(str(exc)),
            exc_info=exc,
        )
        tool_logger.fail_pending(
            "Tavily MCP path failed; the search was retried via the direct Tavily API."
        )
    summary = await _run_fallback_research(goal, tool_logger)
    return summary, "direct Tavily web_search fallback"


async def _run_research_task(task_id: str, goal: str) -> None:
    supabase = get_supabase()
    tool_logger = ToolCallLogger(supabase, task_id)
    step_id = None
    try:
        supabase.table("tasks").update(
            {"status": "running", "started_at": _iso_now()}
        ).eq("id", task_id).execute()

        try:
            validate_agent_config()
        except ConfigError as exc:
            raise RuntimeError(str(exc)) from exc

        step_row = (
            supabase.table("task_steps")
            .insert(
                {
                    "task_id": task_id,
                    "agent": "Researcher",
                    "step_index": 1,
                    "status": "working",
                    "started_at": _iso_now(),
                }
            )
            .execute()
        )
        step_rows = step_row.data or []
        if step_rows:
            step_id = step_rows[0]["id"]
            tool_logger.bind_step(step_id)

        summary, search_path = await _run_research(goal, tool_logger)

        supabase.table("task_steps").update(
            {
                "status": "done",
                "message": (
                    f"Researcher finished with {tool_logger.count} web searches "
                    f"via the {search_path}."
                ),
                "finished_at": _iso_now(),
            }
        ).eq("id", step_id).execute()
        supabase.table("tasks").update(
            {
                "status": "completed",
                "summary": summary,
                "finished_at": _iso_now(),
            }
        ).eq("id", task_id).execute()
    except Exception as exc:
        message = _clean_text(str(exc).strip() or type(exc).__name__)
        logger.exception("Research run failed for task %s", task_id)
        tool_logger.fail_pending(message)
        try:
            if step_id:
                supabase.table("task_steps").update(
                    {
                        "status": "failed",
                        "message": message,
                        "finished_at": _iso_now(),
                    }
                ).eq("id", step_id).execute()
        except Exception:
            logger.exception("Failed to mark step failed for task %s", task_id)
        try:
            supabase.table("tasks").update(
                {
                    "status": "failed",
                    "error_message": message,
                    "finished_at": _iso_now(),
                }
            ).eq("id", task_id).execute()
        except Exception:
            logger.exception("Failed to mark task failed for task %s", task_id)
