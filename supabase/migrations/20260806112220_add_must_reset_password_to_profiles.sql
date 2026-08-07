-- Track whether a student must reset their password on first login
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS must_reset_password boolean NOT NULL DEFAULT false;
