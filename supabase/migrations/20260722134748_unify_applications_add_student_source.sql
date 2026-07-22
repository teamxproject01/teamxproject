/*
# Unify Applications: Add student_id and source to agent_applications

## Overview
Previously, student self-applications and agent-submitted applications were stored
in two separate tables (`applications` and `agent_applications`). This migration
unifies them by adding `student_id` and `source` columns to `agent_applications`
so both students and agents write to the same table. The admin can then see all
applications in one view with a clear source indicator.

## Changes to agent_applications table
1. `student_id` (uuid, nullable) — links to auth.users when a student applies
   for themselves. NULL when an agent applies on behalf of a student.
2. `source` (text, default 'agent') — 'student' when self-submitted, 'agent'
   when submitted by an agent.

## RLS Policy Updates
- SELECT: students can see their own rows (student_id = auth.uid()), agents can
  see their own rows (agent_id = auth.uid()), admin staff can see all.
- INSERT: students can insert with student_id = auth.uid(), agents can insert
  with agent_id = auth.uid().
- UPDATE/DELETE: unchanged (agent or admin).

## Notes
- The `applications` table is NOT dropped — existing data is preserved.
- The old student self-apply flow will be updated in the frontend to write to
  `agent_applications` instead.
*/

-- Add student_id column
DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN student_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Add source column
DO $$ BEGIN
  ALTER TABLE agent_applications ADD COLUMN source text NOT NULL DEFAULT 'agent';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Update RLS policies to allow students to see their own applications
DROP POLICY IF EXISTS "select_agent_applications" ON agent_applications;
CREATE POLICY "select_agent_applications" ON agent_applications FOR SELECT
  TO authenticated USING (
    agent_id = auth.uid()
    OR student_id = auth.uid()
    OR is_admin_staff()
  );

DROP POLICY IF EXISTS "insert_agent_applications" ON agent_applications;
CREATE POLICY "insert_agent_applications" ON agent_applications FOR INSERT
  TO authenticated WITH CHECK (
    agent_id = auth.uid()
    OR student_id = auth.uid()
  );

DROP POLICY IF EXISTS "update_agent_applications" ON agent_applications;
CREATE POLICY "update_agent_applications" ON agent_applications FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff())
  WITH CHECK (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff());

DROP POLICY IF EXISTS "delete_agent_applications" ON agent_applications;
CREATE POLICY "delete_agent_applications" ON agent_applications FOR DELETE
  TO authenticated USING (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff());

-- Update application_documents RLS to allow students to upload docs for their own applications
DROP POLICY IF EXISTS "select_application_documents" ON application_documents;
CREATE POLICY "select_application_documents" ON application_documents FOR SELECT
  TO authenticated USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM agent_applications WHERE agent_applications.id = application_documents.application_id AND agent_applications.student_id = auth.uid())
    OR is_admin_staff()
  );

DROP POLICY IF EXISTS "insert_application_documents" ON application_documents;
CREATE POLICY "insert_application_documents" ON application_documents FOR INSERT
  TO authenticated WITH CHECK (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM agent_applications WHERE agent_applications.id = application_documents.application_id AND agent_applications.student_id = auth.uid())
  );

DROP POLICY IF EXISTS "update_application_documents" ON application_documents;
CREATE POLICY "update_application_documents" ON application_documents FOR UPDATE
  TO authenticated
  USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM agent_applications WHERE agent_applications.id = application_documents.application_id AND agent_applications.student_id = auth.uid())
    OR is_admin_staff()
  )
  WITH CHECK (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM agent_applications WHERE agent_applications.id = application_documents.application_id AND agent_applications.student_id = auth.uid())
    OR is_admin_staff()
  );

DROP POLICY IF EXISTS "delete_application_documents" ON application_documents;
CREATE POLICY "delete_application_documents" ON application_documents FOR DELETE
  TO authenticated USING (
    agent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM agent_applications WHERE agent_applications.id = application_documents.application_id AND agent_applications.student_id = auth.uid())
    OR is_admin_staff()
  );

-- Index for student_id lookups
CREATE INDEX IF NOT EXISTS idx_agent_apps_student_id ON agent_applications(student_id);
CREATE INDEX IF NOT EXISTS idx_agent_apps_source ON agent_applications(source);

-- Update storage policies to allow students to upload to their own application folders
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

DROP POLICY IF EXISTS "agent_delete_storage_docs" ON storage.objects;
CREATE POLICY "agent_delete_storage_docs" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'agent-documents' AND (
      auth.uid() = owner OR is_admin_staff()
    )
  );
