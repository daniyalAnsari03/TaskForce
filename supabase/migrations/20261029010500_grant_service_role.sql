-- Grant Data API privileges to service_role only.
-- Tables exist but service_role has no privileges on them (error 42501).
-- RLS stays enabled with no policies; service_role bypasses RLS.

grant usage on schema public to service_role;

grant all on all tables in schema public to service_role;

grant all on all sequences in schema public to service_role;

alter default privileges in schema public grant all on tables to service_role;

alter default privileges in schema public grant all on sequences to service_role;
