
-- Fix RLS recursion: select_own_profile called is_staff() which queries profiles again.
-- Split into two non-recursive policies instead.
DROP POLICY IF EXISTS "select_own_profile" ON profiles;

CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

CREATE POLICY "staff_select_all_profiles" ON profiles FOR SELECT
  TO authenticated USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN (
      'admin', 'super_admin', 'admissions', 'finance',
      'marketing', 'support', 'agent'
    )
  );
