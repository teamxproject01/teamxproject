-- Add student name fields (first, middle, last)
ALTER TABLE agent_applications
  ADD COLUMN IF NOT EXISTS student_first_name text,
  ADD COLUMN IF NOT EXISTS student_middle_name text,
  ADD COLUMN IF NOT EXISTS student_last_name text;

-- Add offer letter / COE / payment columns
ALTER TABLE agent_applications
  ADD COLUMN IF NOT EXISTS offer_letter_path text,
  ADD COLUMN IF NOT EXISTS offer_letter_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS offer_accepted boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_accepted_at timestamptz,
  ADD COLUMN IF NOT EXISTS signed_offer_path text,
  ADD COLUMN IF NOT EXISTS signed_offer_uploaded_at timestamptz,
  ADD COLUMN IF NOT EXISTS coe_path text,
  ADD COLUMN IF NOT EXISTS coe_issued_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'not_required',
  ADD COLUMN IF NOT EXISTS payment_amount numeric(10,2),
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_status text,
  ADD COLUMN IF NOT EXISTS payment_completed_at timestamptz;

-- Backfill student_first_name and student_last_name from student_full_name for existing rows
UPDATE agent_applications
SET student_first_name = split_part(student_full_name, ' ', 1),
    student_last_name = CASE
      WHEN array_length(string_to_array(student_full_name, ' '), 1) > 1
      THEN array_to_string((string_to_array(student_full_name, ' '))[2:], ' ')
      ELSE split_part(student_full_name, ' ', 1)
    END
WHERE student_full_name IS NOT NULL
  AND student_first_name IS NULL;

-- Add admin_comment_visibility to distinguish private admin comments
-- admin_comment will remain as-is but we add a separate field for comments visible to agent/student
ALTER TABLE agent_applications
  ADD COLUMN IF NOT EXISTS public_comment text;

-- Add enrollment link column
ALTER TABLE agent_applications
  ADD COLUMN IF NOT EXISTS enrollment_url text,
  ADD COLUMN IF NOT EXISTS enrolled_at timestamptz;

-- Add index for payment status lookups
CREATE INDEX IF NOT EXISTS idx_agent_applications_payment_status
  ON agent_applications(payment_status);

-- Add index for offer status lookups
CREATE INDEX IF NOT EXISTS idx_agent_applications_offer_accepted
  ON agent_applications(offer_accepted);
