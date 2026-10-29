-- Initial schema: tasks, task_steps, tool_calls, approvals, files + private storage bucket.

create extension if not exists pgcrypto;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  goal text not null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'waiting_approval', 'completed', 'failed')),
  enabled_tools text[] not null default '{}',
  require_approval boolean not null default true,
  summary text,
  error_message text,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table public.task_steps (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  agent text not null,
  step_index int not null,
  status text not null default 'waiting' check (status in ('waiting', 'working', 'done', 'failed')),
  message text,
  started_at timestamptz,
  finished_at timestamptz
);

create table public.tool_calls (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  step_id uuid references public.task_steps (id) on delete set null,
  tool_name text not null,
  input jsonb,
  output jsonb,
  status text not null default 'running' check (status in ('running', 'ok', 'failed')),
  created_at timestamptz not null default now()
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  tool_call_id uuid references public.tool_calls (id) on delete set null,
  action text not null,
  payload jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  name text not null,
  mime_type text,
  storage_path text not null,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_tasks_created_at on public.tasks (created_at desc);
create index idx_task_steps_task_id on public.task_steps (task_id);
create index idx_tool_calls_task_id on public.tool_calls (task_id);
create index idx_tool_calls_step_id on public.tool_calls (step_id);
create index idx_approvals_task_id on public.approvals (task_id);
create index idx_approvals_tool_call_id on public.approvals (tool_call_id);
create index idx_files_task_id on public.files (task_id);

-- Row Level Security: enabled, no policies.
-- The backend uses the secret/service key which bypasses RLS;
-- no policies means no direct anonymous access to any of these tables.
alter table public.tasks enable row level security;
alter table public.task_steps enable row level security;
alter table public.tool_calls enable row level security;
alter table public.approvals enable row level security;
alter table public.files enable row level security;

-- Private storage bucket for task outputs.
insert into storage.buckets (id, name, public)
values ('task-outputs', 'task-outputs', false)
on conflict (id) do nothing;
