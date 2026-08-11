-- Add columns referenced by the application form that were never created in the schema
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS first_language text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS english_speaking_level text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS student_decl_14 boolean;
