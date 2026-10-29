"""Task API: create tasks, list tasks, task detail."""

import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, Field

from app.agents.research_run import schedule_research_run
from app.config import describe_missing_agent_vars, missing_agent_vars
from app.db.supabase_client import get_supabase

router = APIRouter(prefix="/tasks", tags=["tasks"])


class CreateTaskRequest(BaseModel):
    goal: str
    tools: list[str] = Field(default_factory=list)
    require_approval: bool = True


@router.post("")
def create_task(request: CreateTaskRequest, background_tasks: BackgroundTasks) -> dict:
    goal = request.goal.strip()
    if not goal:
        raise HTTPException(status_code=400, detail="Goal must not be empty.")

    if missing_agent_vars():
        # Fail loudly instead of queueing a task that cannot run.
        raise HTTPException(status_code=503, detail=describe_missing_agent_vars())

    supabase = get_supabase()
    row = (
        supabase.table("tasks")
        .insert(
            {
                "goal": goal,
                "enabled_tools": request.tools,
                "require_approval": request.require_approval,
                "status": "queued",
            }
        )
        .execute()
        .data
    )
    task = row[0]
    schedule_research_run(background_tasks, task["id"], goal)
    return {"id": task["id"]}


@router.get("")
def list_tasks() -> list[dict]:
    supabase = get_supabase()
    rows = (
        supabase.table("tasks")
        .select("id, goal, status, created_at")
        .order("created_at", desc=True)
        .execute()
        .data
    )
    return rows or []


@router.get("/{task_id}")
def get_task(task_id: str) -> dict:
    try:
        uuid.UUID(task_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Task not found.") from None

    supabase = get_supabase()
    rows = supabase.table("tasks").select("*").eq("id", task_id).execute().data
    if not rows:
        raise HTTPException(status_code=404, detail="Task not found.")
    task = rows[0]
    task["steps"] = (
        supabase.table("task_steps")
        .select("*")
        .eq("task_id", task_id)
        .order("step_index")
        .execute()
        .data
        or []
    )
    task["tool_calls"] = (
        supabase.table("tool_calls")
        .select("*")
        .eq("task_id", task_id)
        .order("created_at")
        .execute()
        .data
        or []
    )
    return task
