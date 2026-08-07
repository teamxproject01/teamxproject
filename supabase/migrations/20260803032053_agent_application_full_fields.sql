/*
# Expand agent application fields to match official MIHE Education Agent Application Form

## What this does
The current `agents` table only stores agency name, contact person, phone, country, city.
The official MIHE "Education Agent Application Form" PDF requires a much larger set of
fields across 5 sections: Company Profile, Qualification Questionnaire, Recruitment &
Representative Details, Key Personnel, Referees, Declaration, plus supporting document
uploads and an Office-Use-Only admin block.

This migration adds all of those fields to the `agents` table so that:
  1. The agent signup form can collect every piece of information the PDF asks for.
  2. The admin can see every submitted field when reviewing an agent application.
  3. Supporting documents can be uploaded to a private storage bucket.

## New columns on `agents` (all nullable except where noted)

### Section 1 — Company Profile
- company_legal_entity        text
- company_trading_name        text
- business_registration_number text
- abn                         text  (Australian Business Number, AU-only)
- business_address            text
- telephone                   text
- fax_number                  text
- website                     text
- company_description         text
- industry_memberships        text

### Section 2 — Qualification & Responsibilities Questionnaire (Yes/No)
Stored as individual booleans so they are queryable and unambiguous.
- q_eatc_completed            boolean  (Completed AEI Education Agent Training Program)
- q_monitor_home_affairs      boolean  (Prepared to monitor Dept of Home Affairs website)
- q_monitor_education         boolean  (Prepared to monitor Dept of Education / AEI website)
- q_read_code_of_ethics       boolean  (Read Australian Intl Education Agent Code of Ethics)
- q_read_national_code        boolean  (Read National Code of Practice for Overseas Students)
- q_understand_visa_fulltime  boolean  (Understand student visa = full-time study)
- q_no_residency_guarantee    boolean  (No guaranteeing residency, refer to DIBP)
- q_no_conflicts              boolean  (Free from conflicts of interest)
- q_comply_mihe_requirements  boolean  (Agree to comply with MIHE promotional / process requirements)

### Section 3 — Student Recruitment & Representative Details
- students_recruited_annually integer
- target_markets              text[]  (UK, South America, Europe, Africa, Southeast Asia, South Asia, East Asia)
- has_australian_rep          boolean
- rep_organisation            text
- rep_contact_person          text
- rep_address                 text
- rep_phone                   text
- rep_email                   text
- rep_website                 text

### Section 4 — Key Personnel (repeatable, stored as JSONB array)
- key_personnel               jsonb  (array of { name_title, background })

### Section 5 — Referees (two required, stored as JSONB array)
- referees                    jsonb  (array of { full_name, legal_entity, address, phone, email, website })

### Section 6 — Declaration
- declaration_print_name      text
- declaration_date            date
- declaration_signature       text  (typed signature / agreement confirmation)

### Supporting documents (file paths in private storage bucket `agent-documents`)
- doc_application_form_path  text
- doc_reference_check_path   text
- doc_company_profile_path   text
- doc_registration_cert_path text
- doc_memberships_path       text
- doc_agent_agreement_path   text

### Office Use Only (admin-filled, not shown to agent)
- office_staff_name          text
- office_signature_date      date
- office_authorisation       text  (Approved / Rejected)
- office_date_effective      date
- office_position            text
- office_print_name          text

## Security
- RLS already enabled on `agents`. No policy changes needed — existing owner/admin
  policies continue to apply to the new columns automatically.
- A new private storage bucket `agent-documents` is created for supporting document
  uploads. Public access is denied; only authenticated users can upload, and only
  the uploader (or admin) can read their own files.

## Notes
- All new columns are nullable so existing agent rows are not affected.
- `target_markets` uses a text array so multiple regions can be stored cleanly.
- `key_personnel` and `referees` use JSONB so the repeatable blocks are flexible
  without needing extra tables.
*/

-- ===== Section 1: Company Profile =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company_legal_entity text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company_trading_name text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_registration_number text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS abn text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS business_address text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS telephone text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fax_number text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS company_description text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS industry_memberships text;

-- ===== Section 2: Qualification Questionnaire (Yes/No booleans) =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_eatc_completed boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_monitor_home_affairs boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_monitor_education boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_read_code_of_ethics boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_read_national_code boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_understand_visa_fulltime boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_no_residency_guarantee boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_no_conflicts boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS q_comply_mihe_requirements boolean;

-- ===== Section 3: Recruitment & Representative =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS students_recruited_annually integer;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS target_markets text[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS has_australian_rep boolean;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_organisation text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_contact_person text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_address text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_phone text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_email text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS rep_website text;

-- ===== Section 4: Key Personnel (JSONB array) =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS key_personnel jsonb;

-- ===== Section 5: Referees (JSONB array) =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS referees jsonb;

-- ===== Section 6: Declaration =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS declaration_print_name text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS declaration_date date;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS declaration_signature text;

-- ===== Supporting documents (storage paths) =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_application_form_path text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_reference_check_path text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_company_profile_path text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_registration_cert_path text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_memberships_path text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS doc_agent_agreement_path text;

-- ===== Office Use Only (admin) =====
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_staff_name text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_signature_date date;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_authorisation text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_date_effective date;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_position text;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS office_print_name text;

-- ===== Storage bucket for agent supporting documents =====
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-documents', 'agent-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated users can upload; users can read their own files
DROP POLICY IF EXISTS "Agent docs upload" ON storage.objects;
CREATE POLICY "Agent docs upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'agent-documents');

DROP POLICY IF EXISTS "Agent docs read own" ON storage.objects;
CREATE POLICY "Agent docs read own"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'agent-documents' AND owner = auth.uid());

DROP POLICY IF EXISTS "Agent docs update own" ON storage.objects;
CREATE POLICY "Agent docs update own"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-documents' AND owner = auth.uid());

DROP POLICY IF EXISTS "Agent docs delete own" ON storage.objects;
CREATE POLICY "Agent docs delete own"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agent-documents' AND owner = auth.uid());