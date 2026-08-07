ALTER TABLE agent_applications
  ADD COLUMN IF NOT EXISTS tuition_fee numeric(10,2),
  ADD COLUMN IF NOT EXISTS offer_acceptance_fee numeric(10,2),
  ADD COLUMN IF NOT EXISTS payment_plan_type text DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS course_duration_months int DEFAULT 6,
  ADD COLUMN IF NOT EXISTS payment_plan_configured_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_plan_configured_by uuid;
