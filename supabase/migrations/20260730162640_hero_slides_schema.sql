CREATE TABLE hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order int NOT NULL DEFAULT 0,
  is_enabled bool NOT NULL DEFAULT true,
  tag text NOT NULL DEFAULT '',
  heading text NOT NULL DEFAULT '',
  heading_accent text NOT NULL DEFAULT '',
  sub text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT '',
  cta_href text NOT NULL DEFAULT '/courses',
  cta2_label text NOT NULL DEFAULT '',
  cta2_href text NOT NULL DEFAULT '/about',
  image_url text NOT NULL DEFAULT '',
  chips jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_hero_slides" ON hero_slides FOR SELECT
  TO anon, authenticated USING (true);
CREATE POLICY "insert_hero_slides" ON hero_slides FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_hero_slides" ON hero_slides FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_hero_slides" ON hero_slides FOR DELETE
  TO authenticated USING (true);

-- Seed with the 6 existing hardcoded slides
INSERT INTO hero_slides (sort_order, tag, heading, heading_accent, sub, cta_label, cta_href, cta2_label, cta2_href, image_url, chips) VALUES
(0, 'OPEN DAY', 'Experience', 'MIHE in Person', 'Tour our Melbourne CBD campus, meet faculty, and discover your future programme.', 'Book a Tour', '/contact', 'Learn More', '/about', 'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"Calendar","value":"Soon","label":"Open Day","pos":"top-5 left-5","enter":{"x":-16,"y":-16}},{"icon":"MapPin","value":"CBD","label":"Campus","pos":"top-5 right-5","enter":{"x":16,"y":-16}},{"icon":"Users","value":"Free","label":"Entry","pos":"bottom-5 left-5","enter":{"x":-16,"y":16}},{"icon":"Building2","value":"Tour","label":"Campus","pos":"bottom-5 right-5","enter":{"x":16,"y":16}}]'),
(1, 'WORLD-CLASS EDUCATION', 'Your Pathway to', 'Excellence Starts Here', 'Industry-aligned programmes designed to launch your career in a global market.', 'Explore Courses', '/courses', 'Apply Now', '/signup', 'https://images.pexels.com/photos/1438072/pexels-photo-1438072.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"TrendingUp","value":"96%","label":"Employment","pos":"top-5 left-5","enter":{"x":-16,"y":-16}},{"icon":"Users","value":"8,400+","label":"Students","pos":"top-5 right-5","enter":{"x":16,"y":-16}},{"icon":"BookOpen","value":"42+","label":"Courses","pos":"bottom-5 left-5","enter":{"x":-16,"y":16}},{"icon":"Globe","value":"60+","label":"Countries","pos":"bottom-5 right-5","enter":{"x":16,"y":16}}]'),
(2, 'ADMISSIONS OPEN', 'Join Our Next', 'Intake — July 2025', 'Secure your place for the upcoming intake. Applications close soon.', 'Apply Now', '/admissions', 'About MIHE', '/about', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"Calendar","value":"July 25","label":"Intake","pos":"top-5 left-1/2 -translate-x-1/2","enter":{"x":0,"y":-20}},{"icon":"MapPin","value":"CBD","label":"Campus","pos":"top-1/2 -translate-y-1/2 right-5","enter":{"x":20,"y":0}},{"icon":"Users","value":"Free","label":"Entry","pos":"top-1/2 -translate-y-1/2 left-5","enter":{"x":-20,"y":0}},{"icon":"CheckCircle","value":"All","label":"Courses","pos":"bottom-5 left-1/2 -translate-x-1/2","enter":{"x":0,"y":20}}]'),
(3, 'POSTGRADUATE STUDY', 'Elevate Your', 'Career with a Master''s', 'Specialised postgraduate degrees built for working professionals.', 'View Programmes', '/courses', 'Admissions', '/admissions', 'https://images.pexels.com/photos/267885/pexels-photo-267885.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"GraduationCap","value":"1,200+","label":"Graduates","pos":"top-5 right-5","enter":{"x":16,"y":-16}},{"icon":"BookOpen","value":"3 yrs","label":"Duration","pos":"top-[38%] left-5","enter":{"x":-20,"y":0}},{"icon":"Award","value":"12+","label":"Majors","pos":"top-[38%] right-5","enter":{"x":20,"y":0}},{"icon":"CheckCircle","value":"CRICOS","label":"Registered","pos":"bottom-5 left-5","enter":{"x":-16,"y":16}}]'),
(4, 'FLAGSHIP MBA', 'Lead. Innovate.', 'Transform with an MBA', 'Develop the strategic thinking and leadership skills to drive real business impact.', 'Explore MBA', '/courses', 'Apply Now', '/signup', 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"Star","value":"4.8★","label":"Rating","pos":"top-5 left-5","enter":{"x":-16,"y":-16}},{"icon":"GraduationCap","value":"2 yrs","label":"Duration","pos":"top-5 right-5","enter":{"x":16,"y":-16}},{"icon":"Globe","value":"Global","label":"Recognition","pos":"bottom-5 left-5","enter":{"x":-16,"y":16}},{"icon":"TrendingUp","value":"MBA","label":"Flagship","pos":"bottom-5 right-5","enter":{"x":16,"y":16}}]'),
(5, 'INDUSTRY CONNECTIONS', 'Real-World', 'Experience Matters', 'Internships and industry projects with 60+ corporate partners.', 'Discover More', '/about', 'Apply Now', '/signup', 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=900', '[{"icon":"Briefcase","value":"60+","label":"Partners","pos":"top-5 left-1/2 -translate-x-1/2","enter":{"x":0,"y":-20}},{"icon":"TrendingUp","value":"96%","label":"Hired","pos":"top-[30%] right-5","enter":{"x":20,"y":-10}},{"icon":"Users","value":"Paid","label":"Internships","pos":"bottom-[30%] left-5","enter":{"x":-20,"y":10}},{"icon":"Award","value":"Real","label":"Experience","pos":"bottom-5 left-1/2 -translate-x-1/2","enter":{"x":0,"y":20}}]');
