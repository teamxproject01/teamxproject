/*
# Add domestic & international entry requirements columns

## Purpose
The courses table currently has a single `entry_requirements` text column. To support
showing different entry requirements for domestic vs international students, we add two
new columns and migrate existing data into them.

## Changes
1. Add `entry_requirements_domestic` (text, nullable) — entry requirements for domestic students.
2. Add `entry_requirements_international` (text, nullable) — entry requirements for international students.
3. Backfill both new columns from the existing `entry_requirements` value so no data is lost.
4. The original `entry_requirements` column is kept for backward compatibility (no data loss).

## Security
No RLS policy changes — existing policies on `courses` remain unchanged.
*/

ALTER TABLE courses ADD COLUMN IF NOT EXISTS entry_requirements_domestic text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS entry_requirements_international text;

-- Backfill: copy existing entry_requirements into both new columns where they are null
UPDATE courses
SET entry_requirements_domestic = entry_requirements
WHERE entry_requirements_domestic IS NULL AND entry_requirements IS NOT NULL;

UPDATE courses
SET entry_requirements_international = entry_requirements
WHERE entry_requirements_international IS NULL AND entry_requirements IS NOT NULL;
