CREATE TABLE IF NOT EXISTS payment_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES agent_applications(id) ON DELETE CASCADE,
  installment_number int NOT NULL,
  label text NOT NULL,
  amount numeric(10,2) NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  paid_at timestamptz,
  overdue_notified_at timestamptz,
  admin_warning_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(application_id, installment_number)
);

ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_installments" ON payment_installments
  FOR SELECT TO authenticated
  USING (is_staff());

CREATE POLICY "insert_installments_admin" ON payment_installments
  FOR INSERT TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "update_installments_admin" ON payment_installments
  FOR UPDATE TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "delete_installments_admin" ON payment_installments
  FOR DELETE TO authenticated
  USING (is_staff());

CREATE INDEX IF NOT EXISTS idx_payment_installments_application_id
  ON payment_installments(application_id);

CREATE INDEX IF NOT EXISTS idx_payment_installments_status
  ON payment_installments(status);

CREATE INDEX IF NOT EXISTS idx_payment_installments_due_date
  ON payment_installments(due_date);
