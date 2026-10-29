# Multi-Agent Task Force

A multi-agent task force platform with a frontend, FastAPI backend, agent skills, and Supabase.

## How to run the backend

```
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

## Database setup

1. Copy `backend\.env.example` to `backend\.env` and fill in `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (use a `sb_secret_...` secret key, or the legacy `service_role` JWT). Never commit `.env`.
2. Log in to Supabase (opens a browser session):
   ```
   supabase login
   ```
3. Link the CLI to your project (from the repo root):
   ```
   supabase link --project-ref <your-project-ref>
   ```
4. Push the migrations (`supabase/migrations/`) to the database:
   ```
   supabase db push
   ```
5. Start the backend and verify the database connection:
   ```
   GET http://localhost:8000/health/db   ->   {"db": "ok"}
   ```
