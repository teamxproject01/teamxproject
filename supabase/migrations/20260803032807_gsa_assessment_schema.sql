/*
# Genuine Student Assessment (GSA) Schema

## Purpose
When a student (or an agent on a student's behalf) starts a new application, the form must
include all Genuine Student Assessment (GSA) sections — Immigration History, Choice of Course,
Previous CoE, Previous Study in Australia, Gaps in Studies, Current Circumstances, Ability to
Afford, and both Declarations — as part of the same application flow.

This migration stores GSA data directly on the `agent_applications` table (same row as the
application itself) so that name, DOB, course title, and agent details are always in sync —
no duplicated separate document that can drift out of sync.

## New columns on `agent_applications`

### Section 1 — Immigration History
- gsa_immigration_history_has    boolean   (Yes/No: any prior visa refusal/cancellation/deportation)
- gsa_immigration_history_details text     (details if Yes)

### Section 2 — Choice of Course
- gsa_choice_reason              text      (why this course / why MIHE)

### Section 3 — Previous CoE
- gsa_has_previous_coe           boolean   (Yes/No: held a CoE from another institution)
- gsa_previous_coes              jsonb     (array of { institution, course, start_date, end_date, reason_for_withdrawing })

### Section 4 — Previous Study in Australia
- gsa_studied_in_australia       boolean   (Yes/No)
- gsa_previous_australia_study  jsonb     (array of { institution, course, start_date, end_date })

### Section 5 — Gaps in Studies
- gsa_has_study_gaps             boolean   (Yes/No)
- gsa_study_gaps                 jsonb     (array of { start_date, end_date, details_of_gap })

### Section 6 — Current Circumstances
- gsa_current_circumstances      text      (current employment / study / living situation)

### Section 7 — Ability to Afford
- gsa_funding_source             text      (family savings, bank loan, scholarship, etc.)
- gsa_estimated_tuition          text      (estimated tuition funds available)
- gsa_estimated_living           text      (estimated living funds available)
- gsa_financial_details          text      (additional financial details)

### Section 8 — Student Declaration
- gsa_student_decl_1             boolean   (I understand my obligations under the student visa)
- gsa_student_decl_2             boolean   (I understand I must maintain enrollment and satisfactory progress)
- gsa_student_decl_3             boolean   (I understand I must have sufficient funds for tuition and living)
- gsa_student_decl_4             boolean   (I understand I must notify MIHE of any change in circumstances)
- gsa_student_decl_name          text      (print name)
- gsa_student_decl_date          date      (date)
- gsa_student_decl_signature     text      (typed signature)
- gsa_student_decl_guardian      boolean   (true if signed by parent/guardian because student is under 18)

### Section 9 — Agent Declaration (only when source = 'agent')
- gsa_agent_decl_1               boolean   (I confirm the info provided is accurate to the best of my knowledge)
- gsa_agent_decl_2               boolean   (I have not provided false or misleading information)
- gsa_agent_decl_3               boolean   (I understand my obligations as an education agent)
- gsa_agent_decl_name            text      (print name)
- gsa_agent_decl_date            date      (date)
- gsa_agent_decl_signature       text      (typed signature)

### GSA Assessment Status (admin-side)
- gsa_status                     text      (not_started / pending / reviewed / approved / rejected, default not_started)
- gsa_admin_notes                text      (internal admin notes)

## Security
- RLS already enabled on `agent_applications`. Existing policies (owner or admin staff) apply
  to all new columns automatically — no new policies needed.
- All new columns are nullable so existing applications are unaffected.

## Notes
1. GSA data lives on the same row as the application — name, DOB, course title, and agent
   details are read from the existing columns, never duplicated. The frontend auto-fills
   matching GSA fields from data already captured in steps 1-2 of the wizard.
2. `gsa_previous_coes`, `gsa_previous_australia_study`, and `gsa_study_gaps` are JSONB arrays
   to support repeatable rows without needing extra tables.
3. `gsa_status` defaults to 'not_started' so applications without GSA data are clearly
   distinguishable from those that have been submitted for review.
*/

-- Section 1: Immigration History
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_immigration_history_has boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_immigration_history_details text;

-- Section 2: Choice of Course
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_choice_reason text;

-- Section 3: Previous CoE
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_has_previous_coe boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_previous_coes jsonb;

-- Section 4: Previous Study in Australia
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_studied_in_australia boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_previous_australia_study jsonb;

-- Section 5: Gaps in Studies
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_has_study_gaps boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_study_gaps jsonb;

-- Section 6: Current Circumstances
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_current_circumstances text;

-- Section 7: Ability to Afford
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_funding_source text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_estimated_tuition text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_estimated_living text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_financial_details text;

-- Section 8: Student Declaration
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_1 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_2 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_3 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_4 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_name text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_date date;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_signature text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_student_decl_guardian boolean;

-- Section 9: Agent Declaration
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_1 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_2 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_3 boolean;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_name text;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_date date;
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_agent_decl_signature text;

-- GSA Assessment Status (admin)
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_status text DEFAULT 'not_started';
ALTER TABLE agent_applications ADD COLUMN IF NOT EXISTS gsa_admin_notes text;

-- Index for filtering by GSA status
CREATE INDEX IF NOT EXISTS idx_agent_apps_gsa_status ON agent_applications (gsa_status);