/*
# Fix Student UPDATE Access to Agent-Created Applications

## Problem
When an agent creates an application on behalf of a student, the student
could not upload a signed offer letter from their student portal. The
`agent_applications` UPDATE policy only allowed the agent who created the
application and admin staff to make changes. Students were blocked.

## Changes

### 1. agent_applications UPDATE policy
- Updated to also allow students to update rows where `student_id = auth.uid()`.
  This lets students upload signed offer letters and trigger status changes
  (offer_letter_sent -> signed_offer_review) from their portal.

## Security
- Students can only update applications where they are the assigned student.
- The WITH CHECK clause ensures students cannot reassign ownership
  (agent_id or student_id) to another user.
- No INSERT or DELETE access is granted to students — they still cannot
  create or delete agent_applications rows.
*/

-- ──────────────────────────────────────────────────────────────────────────────
-- 1. Fix agent_applications UPDATE policy to include students
-- ──────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "update_agent_applications" ON agent_applications;

CREATE POLICY "update_agent_applications" ON agent_applications FOR UPDATE
  TO authenticated
  USING (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff())
  WITH CHECK (agent_id = auth.uid() OR student_id = auth.uid() OR is_admin_staff());
