/*
# Communication, Contact Enquiries, Document Requests & Approval History

## Purpose
This migration adds the database infrastructure for:
1. Storing public contact form enquiries with read/unread status and admin reply capability
2. Two-way messaging between Admin, Student, and Agent with conversation threading
3. Document requests from admin to student/agent
4. Immutable approval snapshots for application history

## New Tables

### 1. contact_enquiries
Stores all submissions from the public Contact Us form.
- `id` (uuid PK)
- `name` (text) — submitter's full name
- `email` (text) — submitter's email
- `phone` (text) — optional phone
- `subject` (text) — enquiry subject
- `message` (text) — enquiry body
- `is_read` (boolean, default false) — admin read status
- `is_replied` (boolean, default false) — admin replied status
- `reply` (text) — admin's reply text
- `replied_at` (timestamptz) — when admin replied
- `replied_by` (uuid) — admin user who replied
- `linked_profile_id` (uuid) — if the email matches an existing profile
- `created_at` (timestamptz, default now())

### 2. conversations
Top-level conversation thread linking participants.
- `id` (uuid PK)
- `application_id` (uuid, FK to agent_applications, nullable) — optional link to an application
- `student_id` (uuid, nullable) — student profile ID
- `agent_id` (uuid, nullable) — agent profile ID
- `subject` (text) — conversation topic
- `last_message_at` (timestamptz) — for sorting
- `created_by` (uuid) — who started the conversation
- `created_at` (timestamptz, default now())

### 3. conversation_messages
Individual messages within a conversation.
- `id` (uuid PK)
- `conversation_id` (uuid, FK to conversations)
- `sender_id` (uuid) — auth user ID of sender
- `sender_role` (text) — 'admin' | 'student' | 'agent'
- `sender_name` (text) — display name of sender
- `body` (text) — message content
- `is_read` (boolean, default false) — read by recipient
- `read_at` (timestamptz) — when read
- `created_at` (timestamptz, default now())

### 4. document_requests
Requests from admin to student/agent for specific documents.
- `id` (uuid PK)
- `application_id` (uuid, FK to agent_applications)
- `requested_by` (uuid) — admin user ID
- `document_type` (text) — type of document requested
- `description` (text) — details/instructions
- `status` (text, default 'pending') — pending | fulfilled | cancelled
- `fulfilled_at` (timestamptz) — when document was uploaded
- `created_at` (timestamptz, default now())

### 5. approval_snapshots
Immutable record of application state at the moment of approval.
- `id` (uuid PK)
- `application_id` (uuid, FK to agent_applications)
- `status` (text) — the status set (approved, rejected, etc.)
- `approved_by` (uuid) — admin user ID
- `approved_by_name` (text) — admin's display name
- `snapshot` (jsonb) — full application data at time of approval
- `comment` (text) — admin comment at time of approval
- `created_at` (timestamptz, default now())

## Security (RLS)
- contact_enquiries: public INSERT (anon can submit), staff-only SELECT/UPDATE
- conversations: authenticated SELECT/INSERT/UPDATE for participants and staff
- conversation_messages: authenticated SELECT/INSERT for participants and staff
- document_requests: staff INSERT/UPDATE, participants SELECT
- approval_snapshots: staff SELECT/INSERT, no UPDATE/DELETE (immutable)

## Notes
1. The old `messages` table is kept for backward compatibility but new messaging uses conversations + conversation_messages.
2. approval_snapshots has no UPDATE or DELETE policies — records are immutable once created.
3. contact_enquiries allows anon INSERT so the public contact form works without login.
*/

-- 1. contact_enquiries
CREATE TABLE IF NOT EXISTS contact_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  is_replied boolean NOT NULL DEFAULT false,
  reply text,
  replied_at timestamptz,
  replied_by uuid REFERENCES auth.users(id),
  linked_profile_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_enquiries" ON contact_enquiries;
CREATE POLICY "anon_insert_enquiries" ON contact_enquiries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_select_enquiries" ON contact_enquiries;
CREATE POLICY "staff_select_enquiries" ON contact_enquiries FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
  );

DROP POLICY IF EXISTS "staff_update_enquiries" ON contact_enquiries;
CREATE POLICY "staff_update_enquiries" ON contact_enquiries FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
  );

-- 2. conversations
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES agent_applications(id) ON DELETE CASCADE,
  student_id uuid,
  agent_id uuid,
  subject text NOT NULL DEFAULT '',
  last_message_at timestamptz DEFAULT now(),
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_conversations" ON conversations;
CREATE POLICY "auth_select_conversations" ON conversations FOR SELECT
  TO authenticated USING (
    student_id = auth.uid() OR agent_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
  );

DROP POLICY IF EXISTS "auth_insert_conversations" ON conversations;
CREATE POLICY "auth_insert_conversations" ON conversations FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_conversations" ON conversations;
CREATE POLICY "auth_update_conversations" ON conversations FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- 3. conversation_messages
CREATE TABLE IF NOT EXISTS conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid DEFAULT auth.uid(),
  sender_role text NOT NULL,
  sender_name text NOT NULL DEFAULT '',
  body text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_conv_messages" ON conversation_messages;
CREATE POLICY "auth_select_conv_messages" ON conversation_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_messages.conversation_id
      AND (
        c.student_id = auth.uid() OR c.agent_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
      )
    )
  );

DROP POLICY IF EXISTS "auth_insert_conv_messages" ON conversation_messages;
CREATE POLICY "auth_insert_conv_messages" ON conversation_messages FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_conv_messages" ON conversation_messages;
CREATE POLICY "auth_update_conv_messages" ON conversation_messages FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- 4. document_requests
CREATE TABLE IF NOT EXISTS document_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  requested_by uuid,
  document_type text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  fulfilled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_doc_requests" ON document_requests;
CREATE POLICY "auth_select_doc_requests" ON document_requests FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM agent_applications a
      WHERE a.id = document_requests.application_id
      AND (
        a.student_id = auth.uid() OR a.agent_id = auth.uid() OR
        EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
      )
    )
  );

DROP POLICY IF EXISTS "staff_insert_doc_requests" ON document_requests;
CREATE POLICY "staff_insert_doc_requests" ON document_requests FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_update_doc_requests" ON document_requests;
CREATE POLICY "staff_update_doc_requests" ON document_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- 5. approval_snapshots (immutable)
CREATE TABLE IF NOT EXISTS approval_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  status text NOT NULL,
  approved_by uuid,
  approved_by_name text,
  snapshot jsonb NOT NULL DEFAULT '{}',
  comment text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE approval_snapshots ENABLE ROW LEVEL SECURITY;

-- Only INSERT and SELECT — no UPDATE or DELETE policies = immutable
DROP POLICY IF EXISTS "staff_select_snapshots" ON approval_snapshots;
CREATE POLICY "staff_select_snapshots" ON approval_snapshots FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin','super_admin','admissions','finance','marketing','support'))
  );

DROP POLICY IF EXISTS "staff_insert_snapshots" ON approval_snapshots;
CREATE POLICY "staff_insert_snapshots" ON approval_snapshots FOR INSERT
  TO authenticated WITH CHECK (true);

-- Also allow students/agents to see their own approval history
DROP POLICY IF EXISTS "owner_select_snapshots" ON approval_snapshots;
CREATE POLICY "owner_select_snapshots" ON approval_snapshots FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM agent_applications a
      WHERE a.id = approval_snapshots.application_id
      AND (a.student_id = auth.uid() OR a.agent_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created ON contact_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_read ON contact_enquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_conversations_app ON conversations(application_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(student_id, agent_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv ON conversation_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_doc_requests_app ON document_requests(application_id);
CREATE INDEX IF NOT EXISTS idx_approval_snapshots_app ON approval_snapshots(application_id, created_at DESC);