/*
# Agent Portal Schema

## Overview
Adds the complete data model for the Agent Portal — allowing education agents
to register, get admin-approved, create student applications, upload documents,
track application status through an 11-stage lifecycle, receive notifications,
and view analytics.

## New Tables
1. `agents` — one row per agent; stores agency details and admin approval status.
2. `agent_applications` — student applications submitted by agents (separate from
   the existing `applications` table which is for student self-applications).
   Contains all student details inline (not linked to auth.users) plus course_id,
   11-value status lifecycle, and admin_comment.
3. `application_documents` — documents uploaded for each agent application, with
   their own review workflow (required → uploaded → under_review → approved/rejected).
4. `agent_notifications` — notifications delivered to agents (status changes,
   document requests, admin messages).

## Helper Functions
- `is_admin_staff()` — returns true when the signed-in user's profile role is
  admin, super_admin, or admissions. Used in RLS policies for admin access to
  agent data.

## Storage
- Creates `agent-documents` storage bucket (private) with policies allowing
  agents to upload/read their own files and admins to read/update all.

## Security
- RLS enabled on all four new tables.
- Agents can only access their own rows (agent_id = auth.uid() / user_id = auth.uid()).
- Admin staff (admin/super_admin/admissions) can access all agent data.
- Agent notifications can be inserted by any authenticated user (admin creates them)
  but only read/updated by the owning agent.
- Storage bucket policies scope file access by owner.

## Triggers
- `set_agent_app_id` — auto-generates a human-readable application_id
  (APP-YYYY-NNNN) on insert.
*/

-- ──────────────────────────────────────────────────────────────────────────────
-- Helper: is_admin_staff()
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin_staff()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'admissions')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: agents
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_name      text NOT NULL DEFAULT '',
  contact_person   text NOT NULL DEFAULT '',
  phone            text,
  country          text,
  city             text,
  approval_status  text NOT NULL DEFAULT 'pending',
  admin_notes      text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_agents" ON agents;
CREATE POLICY "select_agents" ON agents FOR SELECT
  TO authenticated USING (user_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "insert_agents" ON agents;
CREATE POLICY "insert_agents" ON agents FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "update_agents" ON agents;
CREATE POLICY "update_agents" ON agents FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR is_admin_staff())
  WITH CHECK (user_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "delete_agents" ON agents;
CREATE POLICY "delete_agents" ON agents FOR DELETE
  TO authenticated USING (is_admin_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: agent_applications
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_applications (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id            text UNIQUE,
  agent_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id                 uuid REFERENCES courses(id),
  student_full_name         text NOT NULL DEFAULT '',
  student_dob               date,
  student_email             text,
  student_phone             text,
  student_nationality       text,
  student_current_country   text,
  student_passport_number   text,
  student_education_level   text,
  student_english_test_status text,
  preferred_intake          text,
  agent_notes               text,
  status                    text NOT NULL DEFAULT 'draft',
  admin_comment             text,
  created_at                timestamptz DEFAULT now(),
  updated_at                timestamptz DEFAULT now()
);

ALTER TABLE agent_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_agent_applications" ON agent_applications;
CREATE POLICY "select_agent_applications" ON agent_applications FOR SELECT
  TO authenticated USING (agent_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "insert_agent_applications" ON agent_applications;
CREATE POLICY "insert_agent_applications" ON agent_applications FOR INSERT
  TO authenticated WITH CHECK (agent_id = auth.uid());

DROP POLICY IF EXISTS "update_agent_applications" ON agent_applications;
CREATE POLICY "update_agent_applications" ON agent_applications FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid() OR is_admin_staff())
  WITH CHECK (agent_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "delete_agent_applications" ON agent_applications;
CREATE POLICY "delete_agent_applications" ON agent_applications FOR DELETE
  TO authenticated USING (agent_id = auth.uid() OR is_admin_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Sequence + Trigger: auto-generate application_id
-- ──────────────────────────────────────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS agent_app_id_seq START 1;

CREATE OR REPLACE FUNCTION generate_agent_app_id()
RETURNS trigger AS $$
BEGIN
  IF new.application_id IS NULL OR new.application_id = '' THEN
    new.application_id := 'APP-' || EXTRACT(YEAR FROM now())::text || '-' || lpad(nextval('agent_app_id_seq')::text, 4, '0');
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_agent_app_id ON agent_applications;
CREATE TRIGGER set_agent_app_id
  BEFORE INSERT ON agent_applications
  FOR EACH ROW EXECUTE PROCEDURE generate_agent_app_id();

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: application_documents
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  uuid NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  agent_id        uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type   text NOT NULL,
  file_path       text NOT NULL,
  file_name       text NOT NULL DEFAULT '',
  file_size       integer,
  status          text NOT NULL DEFAULT 'uploaded',
  admin_comment   text,
  uploaded_at     timestamptz DEFAULT now()
);

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_application_documents" ON application_documents;
CREATE POLICY "select_application_documents" ON application_documents FOR SELECT
  TO authenticated USING (agent_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "insert_application_documents" ON application_documents;
CREATE POLICY "insert_application_documents" ON application_documents FOR INSERT
  TO authenticated WITH CHECK (agent_id = auth.uid());

DROP POLICY IF EXISTS "update_application_documents" ON application_documents;
CREATE POLICY "update_application_documents" ON application_documents FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid() OR is_admin_staff())
  WITH CHECK (agent_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "delete_application_documents" ON application_documents;
CREATE POLICY "delete_application_documents" ON application_documents FOR DELETE
  TO authenticated USING (agent_id = auth.uid() OR is_admin_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: agent_notifications
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title       text NOT NULL DEFAULT '',
  message     text NOT NULL DEFAULT '',
  type        text NOT NULL DEFAULT 'general',
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE agent_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_agent_notifications" ON agent_notifications;
CREATE POLICY "select_agent_notifications" ON agent_notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "insert_agent_notifications" ON agent_notifications;
CREATE POLICY "insert_agent_notifications" ON agent_notifications FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_agent_notifications" ON agent_notifications;
CREATE POLICY "update_agent_notifications" ON agent_notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "delete_agent_notifications" ON agent_notifications;
CREATE POLICY "delete_agent_notifications" ON agent_notifications FOR DELETE
  TO authenticated USING (user_id = auth.uid() OR is_admin_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Storage bucket: agent-documents
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-documents', 'agent-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "agent_insert_storage_docs" ON storage.objects;
CREATE POLICY "agent_insert_storage_docs" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'agent-documents');

DROP POLICY IF EXISTS "agent_select_storage_docs" ON storage.objects;
CREATE POLICY "agent_select_storage_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'agent-documents' AND (
      auth.uid() = owner OR is_admin_staff()
    )
  );

DROP POLICY IF EXISTS "admin_update_storage_docs" ON storage.objects;
CREATE POLICY "admin_update_storage_docs" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'agent-documents' AND is_admin_staff()
  );

DROP POLICY IF EXISTS "agent_delete_storage_docs" ON storage.objects;
CREATE POLICY "agent_delete_storage_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'agent-documents' AND (
      auth.uid() = owner OR is_admin_staff()
    )
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agents_user_id            ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_approval_status    ON agents(approval_status);
CREATE INDEX IF NOT EXISTS idx_agent_apps_agent_id       ON agent_applications(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_apps_status         ON agent_applications(status);
CREATE INDEX IF NOT EXISTS idx_agent_apps_course_id      ON agent_applications(course_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_application_id  ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_docs_agent_id         ON application_documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifs_user_id      ON agent_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_notifs_is_read      ON agent_notifications(is_read);
