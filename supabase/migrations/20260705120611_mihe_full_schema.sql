/*
# MIHE Full Platform Schema

## Overview
Creates the complete data model for the Melbourne Institute of Higher Education (MIHE)
digital campus platform — covering public course listings, student applications and forms,
document tracking, internal messaging, and a full audit trail.

## New Tables
1. `profiles` — one row per auth user; stores role, full name, email, phone.
2. `courses` — course catalogue managed by admin staff.
3. `applications` — student applications linked to a course; status lifecycle.
4. `forms` — student-submitted forms (Special Consideration, Course Variation, etc.) stored as JSONB.
5. `documents` — metadata for files uploaded to Supabase Storage.
6. `messages` — admin/lecturer notices delivered to individual students.
7. `audit_logs` — immutable log of every significant action in the system.

## Helper Functions
- `is_staff()` — returns true when the signed-in user's JWT app_metadata role is a staff role.
- `handle_new_user()` — trigger function that creates a matching `profiles` row on every new signup.

## Security
- RLS enabled on all seven tables.
- Students may only SELECT/UPDATE/DELETE their own rows (student_id = auth.uid()).
- Staff (any non-student role) may SELECT all rows for their operations.
- Courses are publicly readable by anon and authenticated roles.
- Audit log rows can be inserted by any authenticated user but read only by staff.

## Seed Data
Six sample courses are inserted for demo/development purposes.
*/

-- ──────────────────────────────────────────────────────────────────────────────
-- Helper: is_staff()
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') IN (
      'admin', 'super_admin', 'admissions', 'finance',
      'marketing', 'support', 'agent'
    ),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: profiles
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       text        NOT NULL DEFAULT 'student',
  full_name  text        NOT NULL DEFAULT '',
  email      text        NOT NULL DEFAULT '',
  phone      text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id OR is_staff());

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id OR is_staff())
WITH CHECK (auth.uid() = id OR is_staff());

DROP POLICY IF EXISTS "delete_profile" ON profiles;
CREATE POLICY "delete_profile" ON profiles FOR DELETE
TO authenticated USING (is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: courses
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title               text        NOT NULL,
  cricos_code         text,
  level               text        NOT NULL DEFAULT 'undergraduate',
  duration            text        NOT NULL DEFAULT '3 years',
  campus              text        NOT NULL DEFAULT 'Melbourne',
  fees                jsonb,
  intake_dates        text[],
  overview            text,
  career_outcomes     text[],
  entry_requirements  text,
  is_featured         boolean DEFAULT false,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_courses" ON courses;
CREATE POLICY "public_read_courses" ON courses FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_insert_courses" ON courses;
CREATE POLICY "staff_insert_courses" ON courses FOR INSERT
TO authenticated WITH CHECK (is_staff());

DROP POLICY IF EXISTS "staff_update_courses" ON courses;
CREATE POLICY "staff_update_courses" ON courses FOR UPDATE
TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "staff_delete_courses" ON courses;
CREATE POLICY "staff_delete_courses" ON courses FOR DELETE
TO authenticated USING (is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: applications
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id  uuid REFERENCES courses(id),
  status     text NOT NULL DEFAULT 'draft',
  notes      text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON applications;
CREATE POLICY "select_own_applications" ON applications FOR SELECT
TO authenticated USING (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "insert_own_applications" ON applications;
CREATE POLICY "insert_own_applications" ON applications FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "update_own_applications" ON applications;
CREATE POLICY "update_own_applications" ON applications FOR UPDATE
TO authenticated
USING (auth.uid() = student_id OR is_staff())
WITH CHECK (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "delete_own_applications" ON applications;
CREATE POLICY "delete_own_applications" ON applications FOR DELETE
TO authenticated USING (auth.uid() = student_id OR is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: forms
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS forms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type    text NOT NULL,
  status       text NOT NULL DEFAULT 'draft',
  data         jsonb DEFAULT '{}',
  submitted_at timestamptz,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_forms" ON forms;
CREATE POLICY "select_own_forms" ON forms FOR SELECT
TO authenticated USING (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "insert_own_forms" ON forms;
CREATE POLICY "insert_own_forms" ON forms FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "update_own_forms" ON forms;
CREATE POLICY "update_own_forms" ON forms FOR UPDATE
TO authenticated
USING (auth.uid() = student_id OR is_staff())
WITH CHECK (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "delete_own_forms" ON forms;
CREATE POLICY "delete_own_forms" ON forms FOR DELETE
TO authenticated USING (auth.uid() = student_id OR is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: documents
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     uuid REFERENCES forms(id),
  student_id  uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path   text NOT NULL,
  file_name   text NOT NULL DEFAULT '',
  file_size   integer,
  doc_type    text NOT NULL DEFAULT 'general',
  status      text NOT NULL DEFAULT 'pending',
  uploaded_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_documents" ON documents;
CREATE POLICY "select_own_documents" ON documents FOR SELECT
TO authenticated USING (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "insert_own_documents" ON documents;
CREATE POLICY "insert_own_documents" ON documents FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "update_own_documents" ON documents;
CREATE POLICY "update_own_documents" ON documents FOR UPDATE
TO authenticated
USING (auth.uid() = student_id OR is_staff())
WITH CHECK (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "delete_own_documents" ON documents;
CREATE POLICY "delete_own_documents" ON documents FOR DELETE
TO authenticated USING (auth.uid() = student_id OR is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: messages
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_role text NOT NULL DEFAULT 'admin',
  subject     text NOT NULL DEFAULT '',
  content     text NOT NULL,
  is_read     boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_messages" ON messages;
CREATE POLICY "select_own_messages" ON messages FOR SELECT
TO authenticated USING (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "insert_messages" ON messages;
CREATE POLICY "insert_messages" ON messages FOR INSERT
TO authenticated WITH CHECK (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "update_own_messages" ON messages;
CREATE POLICY "update_own_messages" ON messages FOR UPDATE
TO authenticated
USING (auth.uid() = student_id OR is_staff())
WITH CHECK (auth.uid() = student_id OR is_staff());

DROP POLICY IF EXISTS "delete_messages" ON messages;
CREATE POLICY "delete_messages" ON messages FOR DELETE
TO authenticated USING (is_staff());

-- ──────────────────────────────────────────────────────────────────────────────
-- Table: audit_logs
-- ──────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users(id),
  action       text NOT NULL,
  target_table text,
  target_id    uuid,
  metadata     jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_read_audit_logs" ON audit_logs;
CREATE POLICY "staff_read_audit_logs" ON audit_logs FOR SELECT
TO authenticated USING (is_staff());

DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON audit_logs;
CREATE POLICY "authenticated_insert_audit_logs" ON audit_logs FOR INSERT
TO authenticated WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- Trigger: create profile on signup
-- ──────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.email, ''),
    COALESCE(new.raw_app_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ──────────────────────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status      ON applications(status);
CREATE INDEX IF NOT EXISTS idx_forms_student_id         ON forms(student_id);
CREATE INDEX IF NOT EXISTS idx_forms_status             ON forms(status);
CREATE INDEX IF NOT EXISTS idx_documents_student_id     ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_student_id      ON messages(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id       ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_level            ON courses(level);
CREATE INDEX IF NOT EXISTS idx_courses_featured         ON courses(is_featured);

-- ──────────────────────────────────────────────────────────────────────────────
-- Seed: sample courses
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO courses (title, cricos_code, level, duration, campus, fees, intake_dates, overview, career_outcomes, entry_requirements, is_featured) VALUES
(
  'Bachelor of Business Administration',
  '0101234A', 'undergraduate', '3 years', 'Melbourne CBD',
  '{"domestic": 28000, "international": 32000}',
  ARRAY['February 2025', 'July 2025'],
  'A comprehensive business program covering management, finance, marketing, and entrepreneurship. Graduates are equipped with the skills to lead in diverse business environments globally.',
  ARRAY['Business Analyst','Marketing Manager','Financial Advisor','Entrepreneur','Operations Manager'],
  'Minimum ATAR 65 or equivalent. IELTS 6.0 (no band below 5.5) for international students.',
  true
),
(
  'Master of Business Administration',
  '0102345B', 'postgraduate', '2 years', 'Melbourne CBD',
  '{"domestic": 36000, "international": 42000}',
  ARRAY['February 2025', 'July 2025', 'November 2025'],
  'An advanced MBA designed for working professionals seeking to elevate their leadership capabilities and strategic business acumen in a dynamic global environment.',
  ARRAY['Chief Executive Officer','General Manager','Strategy Consultant','Investment Banker','Startup Founder'],
  'Bachelor degree with minimum 2 years professional work experience. IELTS 6.5 (no band below 6.0) for international students.',
  true
),
(
  'Bachelor of Information Technology',
  '0103456C', 'undergraduate', '3 years', 'Melbourne CBD',
  '{"domestic": 30000, "international": 34000}',
  ARRAY['February 2025', 'July 2025'],
  'Cutting-edge IT program covering software development, cybersecurity, cloud computing, and AI fundamentals — preparing graduates for the technology-driven future.',
  ARRAY['Software Engineer','Data Scientist','Cybersecurity Analyst','Cloud Architect','AI Engineer'],
  'Minimum ATAR 70 or equivalent. IELTS 6.0 (no band below 5.5) for international students.',
  true
),
(
  'Master of Information Technology',
  '0104567D', 'postgraduate', '2 years', 'Melbourne CBD',
  '{"domestic": 38000, "international": 44000}',
  ARRAY['February 2025', 'July 2025'],
  'Advanced IT specialisation in emerging technologies including AI, blockchain, and enterprise systems — for graduates ready to lead digital transformation.',
  ARRAY['IT Director','Principal Engineer','Data Engineer','Solutions Architect','Tech Lead'],
  'Bachelor degree in IT or related field. IELTS 6.5 (no band below 6.0) for international students.',
  false
),
(
  'Bachelor of Accounting',
  '0105678E', 'undergraduate', '3 years', 'Melbourne CBD',
  '{"domestic": 27000, "international": 31000}',
  ARRAY['February 2025', 'July 2025'],
  'Rigorous accounting program fully aligned with CPA Australia and CA ANZ pathways, covering financial reporting, taxation, auditing, and corporate governance.',
  ARRAY['Chartered Accountant','Financial Controller','Tax Consultant','Auditor','CFO'],
  'Minimum ATAR 65 or equivalent. IELTS 6.0 (no band below 5.5) for international students.',
  true
),
(
  'Graduate Certificate in Business',
  '0106789F', 'graduate_certificate', '6 months', 'Melbourne CBD',
  '{"domestic": 14000, "international": 16000}',
  ARRAY['February 2025', 'May 2025', 'August 2025', 'November 2025'],
  'Fast-tracked business qualification for professionals seeking to formalise their business knowledge and gain a formal credential within six months.',
  ARRAY['Team Leader','Project Manager','Business Development Officer'],
  'Relevant work experience or bachelor degree in any field. No IELTS required for Australian residents.',
  false
)
ON CONFLICT DO NOTHING;
