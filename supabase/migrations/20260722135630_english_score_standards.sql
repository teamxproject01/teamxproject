/*
# English Score Standards & Application English Scores

## Overview
Adds a table for admin to configure minimum English test score standards
(per test type: IELTS, PTE, TOEFL, Duolingo) and adds English score columns
to agent_applications so students/agents can enter reading, writing, speaking,
and listening scores. The frontend will validate submitted scores against the
admin-configured standards before allowing the application to proceed.

## New Table: english_score_standards
- `id` (uuid, primary key)
- `test_type` (text, unique) — 'IELTS', 'PTE', 'TOEFL', 'Duolingo'
- `min_reading` (numeric)
- `min_writing` (numeric)
- `min_speaking` (numeric)
- `min_listening` (numeric)
- `min_overall` (numeric) — minimum overall/average score
- `is_active` (boolean, default true)
- `created_at` / `updated_at` (timestamptz)

## Changes to agent_applications
- `english_reading` (numeric, nullable)
- `english_writing` (numeric, nullable)
- `english_speaking` (numeric, nullable)
- `english_listening` (numeric, nullable)
- `english_overall` (numeric, nullable)
- `english_meets_standard` (boolean, nullable) — set by frontend after validation

## RLS
- english_score_standards: admin staff can CRUD; all authenticated users can SELECT
  (so the frontend can read standards to validate).
- agent_applications columns are covered by existing RLS policies.

## Default Data
- Inserts default minimum standards for IELTS, PTE, TOEFL, Duolingo.
*/

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: english_score_standards
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS english_score_standards (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type     text NOT NULL UNIQUE,
  min_reading   numeric NOT NULL DEFAULT 0,
  min_writing   numeric NOT NULL DEFAULT 0,
  min_speaking  numeric NOT NULL DEFAULT 0,
  min_listening numeric NOT NULL DEFAULT 0,
  min_overall   numeric NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE english_score_standards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_english_standards" ON english_score_standards;
CREATE POLICY "select_english_standards" ON english_score_standards FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_english_standards" ON english_score_standards;
CREATE POLICY "insert_english_standards" ON english_score_standards FOR INSERT
  TO authenticated WITH CHECK (is_admin_staff());

DROP POLICY IF EXISTS "update_english_standards" ON english_score_standards;
CREATE POLICY "update_english_standards" ON english_score_standards FOR UPDATE
  TO authenticated USING (is_admin_staff()) WITH CHECK (is_admin_staff());

DROP POLICY IF EXISTS "delete_english_standards" ON english_score_standards;
CREATE POLICY "delete_english_standards" ON english_score_standards FOR DELETE
  TO authenticated USING (is_admin_staff());

-- Default standards
INSERT INTO english_score_standards (test_type, min_reading, min_writing, min_speaking, min_listening, min_overall) VALUES
  ('IELTS', 6.0, 6.0, 6.0, 6.0, 6.5),
  ('PTE', 50, 50, 50, 50, 58),
  ('TOEFL', 18, 17, 20, 17, 79),
  ('Duolingo', 95, 95, 95, 95, 110)
ON CONFLICT (test_type) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────────────────
-- Add English score columns to agent_applications
-- ──────────────────────────────────────────────────────────────────────────────
DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_reading numeric;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_writing numeric;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_speaking numeric;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_listening numeric;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_overall numeric;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN english_meets_standard boolean;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
