
-- Fix is_staff() to read from profiles table instead of JWT app_metadata,
-- which is never populated for users created via SQL insert.
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = auth.uid()) IN (
      'admin', 'super_admin', 'admissions', 'finance',
      'marketing', 'support', 'agent'
    ),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
