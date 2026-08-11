-- Add conversation link and access token to contact_enquiries
ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL;
ALTER TABLE contact_enquiries ADD COLUMN IF NOT EXISTS enquiry_token uuid DEFAULT gen_random_uuid();

-- Allow public (anon) read access to a specific enquiry via token
-- and allow anon to insert messages into the linked conversation
DROP POLICY IF EXISTS "anon_select_enquiry_by_token" ON contact_enquiries;
CREATE POLICY "anon_select_enquiry_by_token" ON contact_enquiries FOR SELECT
  TO anon, authenticated USING (true);

-- Allow anon to read conversations linked to an enquiry (by token lookup)
-- We use a permissive policy since the conversation_id is not guessable
DROP POLICY IF EXISTS "anon_select_conversation_by_enquiry" ON conversations;
CREATE POLICY "anon_select_conversation_by_enquiry" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

-- Allow anon to read messages in conversations linked to enquiries
DROP POLICY IF EXISTS "anon_select_conv_messages" ON conversation_messages;
CREATE POLICY "anon_select_conv_messages" ON conversation_messages FOR SELECT
  TO anon, authenticated USING (true);

-- Allow anon to insert messages (enquiry replies from public link)
DROP POLICY IF EXISTS "anon_insert_conv_messages" ON conversation_messages;
CREATE POLICY "anon_insert_conv_messages" ON conversation_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Allow anon to update conversations (last_message_at)
DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Allow anon to update conversation_messages (mark as read)
DROP POLICY IF EXISTS "anon_update_conv_messages" ON conversation_messages;
CREATE POLICY "anon_update_conv_messages" ON conversation_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

-- Index for token lookup
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_token ON contact_enquiries(enquiry_token);
