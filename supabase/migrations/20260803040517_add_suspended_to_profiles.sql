/*
# Student Account Management — Suspended Column

## Purpose
Admins need to be able to suspend and unsuspend student accounts, and delete both
student and agent accounts. This migration adds a `suspended` boolean column to the
`profiles` table so admins can suspend students without deleting their data.

## Changes
1. `profiles.suspended` — boolean, default false. When true, the student is blocked
   from accessing the student portal (enforced in the frontend auth guard).

## Security
- RLS already allows admin/super_admin to UPDATE profiles. No policy changes needed.
- The `suspended` column is only writable by admin/super_admin via the existing
  `update_own_profile` policy (which checks `get_my_role()` for admin/super_admin).
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false;