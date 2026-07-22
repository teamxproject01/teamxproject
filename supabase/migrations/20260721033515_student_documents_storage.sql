/*
# Student Documents Storage Bucket

Creates a private storage bucket for student document uploads.
Students can upload/read/delete their own files; staff can read all.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "student_insert_docs_storage" ON storage.objects;
CREATE POLICY "student_insert_docs_storage" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'student-documents' AND auth.uid() = owner);

DROP POLICY IF EXISTS "student_select_docs_storage" ON storage.objects;
CREATE POLICY "student_select_docs_storage" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'student-documents' AND (
      auth.uid() = owner OR is_staff()
    )
  );

DROP POLICY IF EXISTS "student_delete_docs_storage" ON storage.objects;
CREATE POLICY "student_delete_docs_storage" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'student-documents' AND (
      auth.uid() = owner OR is_staff()
    )
  );
