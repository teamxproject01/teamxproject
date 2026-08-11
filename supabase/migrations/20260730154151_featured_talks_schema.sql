/*
# Featured Talks Video Management

1. New Tables
   - `featured_talks_videos` - stores YouTube video entries for the Featured Talks section
     - `id` (uuid, primary key)
     - `youtube_id` (text) - YouTube video ID
     - `title` (text) - video title
     - `duration` (text) - display duration e.g. "18:01"
     - `is_enabled` (boolean) - show/hide individual video
     - `sort_order` (integer) - display order
     - `created_at` (timestamptz)
   - `featured_talks_config` - single-row section settings
     - `id` (integer, always 1)
     - `section_enabled` (boolean) - toggle the entire section on/off

2. Security
   - RLS enabled on both tables
   - Public (anon + authenticated) can read both tables
   - Only authenticated users (admin staff) can write

3. Seed Data
   - Pre-populated with the original 6 hardcoded videos
   - Section enabled by default
*/

CREATE TABLE IF NOT EXISTS featured_talks_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  youtube_id text NOT NULL,
  title text NOT NULL,
  duration text NOT NULL DEFAULT '0:00',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS featured_talks_config (
  id integer PRIMARY KEY DEFAULT 1,
  section_enabled boolean NOT NULL DEFAULT true
);

ALTER TABLE featured_talks_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_talks_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_videos" ON featured_talks_videos;
CREATE POLICY "public_read_videos" ON featured_talks_videos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_insert_videos" ON featured_talks_videos;
CREATE POLICY "staff_insert_videos" ON featured_talks_videos
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "staff_update_videos" ON featured_talks_videos;
CREATE POLICY "staff_update_videos" ON featured_talks_videos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "staff_delete_videos" ON featured_talks_videos;
CREATE POLICY "staff_delete_videos" ON featured_talks_videos
  FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "public_read_config" ON featured_talks_config;
CREATE POLICY "public_read_config" ON featured_talks_config
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "staff_update_config" ON featured_talks_config;
CREATE POLICY "staff_update_config" ON featured_talks_config
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

INSERT INTO featured_talks_config (id, section_enabled)
  VALUES (1, true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO featured_talks_videos (youtube_id, title, duration, is_enabled, sort_order) VALUES
  ('qp0HIF3SfI4', 'How Great Leaders Inspire Action | Simon Sinek', '18:01', true, 1),
  ('iCvmsMzlF7o', 'The Power of Vulnerability | Brené Brown', '20:19', true, 2),
  ('Ks-_Mh1QhMc', 'Your Body Language Shapes Who You Are | Amy Cuddy', '21:02', true, 3),
  ('rrkrvAUbU9Y', 'The Puzzle of Motivation | Dan Pink', '18:36', true, 4),
  ('ullgxHECeiw', 'Inside the Mind of a Master Procrastinator | Tim Urban', '14:03', true, 5),
  ('GXy__kBVq1M', 'The Happy Secret to Better Work | Shawn Achor', '12:20', true, 6)
ON CONFLICT DO NOTHING;
