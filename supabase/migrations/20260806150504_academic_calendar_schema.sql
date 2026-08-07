/*
# Academic Calendar System

1. New Tables
- `academic_calendar_events`
  - `id` (uuid, primary key)
  - `title` (text, not null) — event name shown on the calendar
  - `description` (text, nullable) — optional rich details shown when a user clicks an event
  - `event_date` (date, not null) — the date the event falls on
  - `end_date` (date, nullable) — optional end date for multi-day events
  - `event_type` (text, not null default 'general') — category: holiday, exam, orientation, break, deadline, general
  - `year` (int, not null) — the academic year this event belongs to, auto-derived from event_date
  - `is_active` (boolean, default true) — admin can hide an event without deleting it
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Security
- Enable RLS on `academic_calendar_events`.
- Admins (role admin, super_admin, admissions) can do full CRUD.
- All authenticated users (students, agents, staff) can read active events.
- This is a shared institutional calendar — no per-user ownership needed.

3. Notes
- The `year` column is populated via a trigger from `event_date` so events
  automatically group by the year they fall in. When a new year arrives,
  admins simply add new events for that year — old events remain visible
  but can be filtered by year on the frontend.
*/

CREATE TABLE IF NOT EXISTS academic_calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  end_date date,
  event_type text NOT NULL DEFAULT 'general',
  year int NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE academic_calendar_events ENABLE ROW LEVEL SECURITY;

-- Read: all authenticated users can see active events
DROP POLICY IF EXISTS "read_calendar_events" ON academic_calendar_events;
CREATE POLICY "read_calendar_events" ON academic_calendar_events
  FOR SELECT TO authenticated USING (true);

-- Insert: admin and super_admin only
DROP POLICY IF EXISTS "insert_calendar_events" ON academic_calendar_events;
CREATE POLICY "insert_calendar_events" ON academic_calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Update: admin and super_admin only
DROP POLICY IF EXISTS "update_calendar_events" ON academic_calendar_events;
CREATE POLICY "update_calendar_events" ON academic_calendar_events
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Delete: admin and super_admin only
DROP POLICY IF EXISTS "delete_calendar_events" ON academic_calendar_events;
CREATE POLICY "delete_calendar_events" ON academic_calendar_events
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('admin', 'super_admin')
    )
  );

-- Index for year-based filtering
CREATE INDEX IF NOT EXISTS idx_calendar_events_year ON academic_calendar_events(year);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON academic_calendar_events(event_date);

-- Trigger to auto-set year from event_date
CREATE OR REPLACE FUNCTION set_calendar_event_year()
RETURNS trigger AS $$
BEGIN
  NEW.year := EXTRACT(YEAR FROM NEW.event_date)::int;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_calendar_year ON academic_calendar_events;
CREATE TRIGGER trg_set_calendar_year
  BEFORE INSERT OR UPDATE OF event_date ON academic_calendar_events
  FOR EACH ROW EXECUTE FUNCTION set_calendar_event_year();

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_calendar_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calendar_updated_at ON academic_calendar_events;
CREATE TRIGGER trg_calendar_updated_at
  BEFORE UPDATE ON academic_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_calendar_updated_at();
