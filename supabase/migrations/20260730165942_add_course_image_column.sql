/*
# Add course image support

1. Schema Changes
   - Adds `image_url` column (text, nullable) to the `courses` table.
     Stores the public URL of the course's cover image. When NULL, the
     frontend falls back to a default image based on the course level.

2. Storage
   - Creates a new public storage bucket `course-images` for uploading
     course cover images. Public so the images can be rendered on the
     public website without signed URLs.
   - Storage policies allow authenticated users (admins) to upload/update/
     delete images, and anyone (anon + authenticated) to read them.

3. Security
   - No changes to existing table RLS — only an additive column.
   - Storage policies are public-read, authenticated-write.
*/

-- Add image_url column to courses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE courses ADD COLUMN image_url text;
  END IF;
END $$;

-- Create public bucket for course images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-images', 'course-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "course_images_public_read" ON storage.objects;
CREATE POLICY "course_images_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'course-images');

DROP POLICY IF EXISTS "course_images_auth_insert" ON storage.objects;
CREATE POLICY "course_images_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-images');

DROP POLICY IF EXISTS "course_images_auth_update" ON storage.objects;
CREATE POLICY "course_images_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-images') WITH CHECK (bucket_id = 'course-images');

DROP POLICY IF EXISTS "course_images_auth_delete" ON storage.objects;
CREATE POLICY "course_images_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-images');
