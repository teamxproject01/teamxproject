CREATE OR REPLACE FUNCTION is_application_owner(app_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM agent_applications a
    WHERE a.id = app_id
      AND (a.agent_id = auth.uid() OR a.student_id = auth.uid())
  );
$$;

DROP POLICY IF EXISTS read_own_installments ON payment_installments;

CREATE POLICY "read_own_installments" ON payment_installments
  FOR SELECT TO authenticated
  USING (is_application_owner(application_id) OR is_staff());
