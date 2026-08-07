/*
# Store Resend API key as a database secret

## Purpose
Store the Resend API key in a secure table that edge functions can read.
This is needed because we cannot set edge function secrets via the MCP tools.

## New Table
- `app_secrets` — stores key-value pairs for application secrets
  - `key` (text PK) — secret name
  - `value` (text) — secret value
  - `created_at` (timestamptz)

## Security
- RLS enabled, no policies = no direct access from frontend
- Only the service role (used by edge functions) can read/write
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

-- No policies = locked down. Only service role bypasses RLS.

-- Insert the Resend API key (set via environment variable or manual insert)
-- Do NOT hardcode secrets in migration files. Insert manually in production:
-- INSERT INTO app_secrets (key, value) VALUES ('RESEND_API_KEY', '<your-key-here>')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
-- The key has already been applied to the database via the Supabase MCP tool.