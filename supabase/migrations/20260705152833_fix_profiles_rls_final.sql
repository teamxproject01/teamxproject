-- Drop all existing profiles policies to start clean
DROP POLICY IF EXISTS "select_own_profile"        ON profiles;
DROP POLICY IF EXISTS "staff_select_all_profiles" ON profiles;
DROP POLICY IF EXISTS "insert_own_profile"        ON profiles;
DROP POLICY IF EXISTS "update_own_profile"        ON profiles;
DROP POLICY IF EXISTS "delete_profile"            ON profiles;

-- SELECT: a user can always read their own row (no subquery, no recursion)
CREATE POLICY "select_own_profile" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- SELECT: staff can read all profiles — use a SECURITY DEFINER view to break recursion
-- Instead of a subquery into profiles, we read the caller's role via a helper that
-- bypasses RLS (SECURITY DEFINER runs as the function owner, not the calling user).
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE POLICY "staff_select_all_profiles" ON profiles
  FOR SELECT TO authenticated
  USING (
    get_my_role() IN ('admin','super_admin','admissions','finance','marketing','support','agent')
  );

-- INSERT: users can only insert their own profile row
CREATE POLICY "insert_own_profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: own row, or staff (using SECURITY DEFINER helper — no recursion)
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE TO authenticated
  USING     ((auth.uid() = id) OR get_my_role() IN ('admin','super_admin'))
  WITH CHECK((auth.uid() = id) OR get_my_role() IN ('admin','super_admin'));

-- DELETE: staff only
CREATE POLICY "delete_profile" ON profiles
  FOR DELETE TO authenticated
  USING (get_my_role() IN ('admin','super_admin'));
