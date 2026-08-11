/*
# Fix Student Access to Agent-Created Applications and Storage

## Problem
When an agent creates an application on behalf of a student, the student
could not see the application in their student portal — including the offer
letter, COE, and signed offer documents. Two RLS policies caused this:

1. `agent_applications` SELECT policy only allowed `agent_id = auth.uid() OR is_admin_staff()`.
   Students (whose `student_id` is set on the row after account creation) were blocked.

2. `agent-documents` storage bucket SELECT policy only allowed `auth.uid() = owner OR is_admin_staff()`.
   The offer letter, COE, and signed offer are uploaded by admin, so `owner` is the admin's
   user id — students could not create signed URLs to download these files.

## Changes

### 1. agent_applications SELECT policy
- Updated to also allow students to read rows where `student_id = auth.uid()`.

### 2. agent-documents storage SELECT policy
- Updated to allow students to read objects whose path belongs to an application
  where they are the student (student_id = auth.uid()). This covers offer letters,
  COEs, and signed offers stored under paths like `offers/<app_id>/...` and
  `coe/<app_id>/...`.

## Security
- Students can only read applications where they are the assigned student.
- Students can only download files from the agent-documents bucket that belong
  to their own applications.
- No write access is granted to students — they still cannot insert, update,
  or delete agent_applications or storage objects in the agent-documents bucket.
*/

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Fix agent_applications SELECT policy to include students
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "select_agent_applications" ON agent_applications;

CREATE POLICY "select_agent_applications" ON agent_applications FOR SELECT
  TO authenticated
  USING (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- 2. Helper function: check if a storage object belongs to a student's application
-- ──────────────────────────────────────────────────────────────────────────────
-- Offer letters are stored at: offers/<application_id>/<filename>
-- COEs are stored at: coe/<application_id>/<filename>
-- Signed offers are stored at: signed-offers/<application_id>/<filename>
-- Agent-uploaded documents are at: <agent_id>/<application_id>/<filename>
-- We need to check if any application owned by the student has an id that
-- appears as a substring of the file path (the second path segment).
CREATE OR REPLACE FUNCTION is_student_application_storage(path text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM agent_applications a
    WHERE a.student_id = auth.uid()
      AND (
        a.id::text = split_part(trim('/' from path), '/', 2)
        OR path LIKE '%/' || a.id::text || '/%'
      )
  );
$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- 3. Fix agent-documents storage SELECT policy to allow students
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "agent_select_storage_docs" ON storage.objects;

CREATE POLICY "agent_select_storage_docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'agent-documents' AND (
      auth.uid() = owner
      OR is_admin_staff()
      OR is_student_application_storage(name)
    )
  );
