export type Role =
  | 'student'
  | 'admin'
  | 'admissions'
  | 'finance'
  | 'marketing'
  | 'support'
  | 'agent'
  | 'super_admin';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  email: string;
  phone?: string;
  created_at: string;
  suspended?: boolean;
  must_reset_password?: boolean;
  signature?: string | null;
}

export interface Course {
  id: string;
  title: string;
  cricos_code?: string;
  level: 'undergraduate' | 'postgraduate' | 'graduate_certificate' | 'diploma';
  duration: string;
  campus: string;
  fees?: { domestic: number; international: number };
  intake_dates?: string[];
  overview?: string;
  career_outcomes?: string[];
  entry_requirements?: string;
  entry_requirements_domestic?: string;
  entry_requirements_international?: string;
  image_url?: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  student_id: string;
  course_id?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
  notes?: string;
  created_at: string;
  updated_at: string;
  courses?: Course;
  profiles?: Profile;
}

export type FormType =
  | 'special_consideration'
  | 'course_variation'
  | 'credit_transfer'
  | 'refund'
  | 'consent'
  | 'statutory_declaration'
  | 'general_enquiry';

export interface Form {
  id: string;
  student_id: string;
  form_type: FormType;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  data: Record<string, unknown>;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  form_id?: string;
  student_id: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  doc_type: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  uploaded_at: string;
}

export interface Message {
  id: string;
  student_id: string;
  sender_role: string;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_table?: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export const FORM_LABELS: Record<FormType, string> = {
  special_consideration: 'Special Consideration',
  course_variation: 'Course Variation',
  credit_transfer: 'Credit Transfer / RPL',
  refund: 'Refund Request',
  consent: 'Consent Form',
  statutory_declaration: 'Statutory Declaration',
  general_enquiry: 'General Enquiry',
};

// ── Agent Portal types ────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  user_id: string;
  agency_name: string;
  contact_person: string;
  phone?: string;
  country?: string;
  city?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export type AgentApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'documents_required'
  | 'approved'
  | 'offer_letter_sent'
  | 'waiting_for_signature'
  | 'signed_offer_review'
  | 'offer_accepted'
  | 'waiting_for_payment'
  | 'paid_coe_issued'
  | 'rejected'
  | 'enrolled'
  | 'cancelled';

export interface AgentApplication {
  id: string;
  application_id?: string;
  agent_id: string;
  course_id?: string;
  student_full_name: string;
  student_title?: string;
  student_first_name?: string;
  student_middle_name?: string;
  student_last_name?: string;
  student_gender?: string;
  student_dob?: string;
  student_country_of_birth?: string;
  student_nationality?: string;
  student_marital_status?: string;
  student_passport_number?: string;
  student_passport_expiry?: string;
  student_mobile_number?: string;
  student_email?: string;
  student_phone?: string;
  student_in_australia?: boolean | null;
  student_current_location?: string;
  residential_street_number?: string;
  residential_street_name?: string;
  residential_suburb?: string;
  residential_city?: string;
  residential_state?: string;
  residential_country?: string;
  residential_post_code?: string;
  postal_same_as_residential?: boolean | null;
  postal_street_number?: string;
  postal_street_name?: string;
  postal_suburb?: string;
  postal_city?: string;
  postal_state?: string;
  postal_country?: string;
  postal_post_code?: string;
  emergency_full_name?: string;
  emergency_relationship?: string;
  emergency_address?: string;
  emergency_mobile?: string;
  emergency_phone?: string;
  emergency_email?: string;
  disability_has?: boolean | null;
  disability_details?: string;
  qualification_level?: string;
  qualification_name?: string;
  qualification_year?: string;
  qualification_institution?: string;
  qualification_country?: string;
  qualification_institution_phone?: string;
  qualification_contact_email?: string;
  applying_rpl?: boolean | null;
  applying_credit_transfer?: boolean | null;
  purpose_of_study?: string;
  purpose_other?: string;
  employment_status?: string;
  visa_held?: boolean | null;
  visa_previously_held?: boolean | null;
  visa_application_status?: string;
  gte_meets?: boolean | null;
  funds_first_year?: boolean | null;
  funds_living?: boolean | null;
  oshc_arrange?: boolean | null;
  airport_pickup?: boolean | null;
  additional_support_required?: boolean | null;
  additional_support_details?: string;
  first_language?: string;
  english_speaking_level?: string;
  student_education_level?: string;
  student_english_test_status?: string;
  preferred_intake?: string;
  agent_notes?: string;
  notes?: string;
  student_decl_1?: boolean; student_decl_2?: boolean; student_decl_3?: boolean; student_decl_4?: boolean;
  student_decl_5?: boolean; student_decl_6?: boolean; student_decl_7?: boolean; student_decl_8?: boolean;
  student_decl_9?: boolean; student_decl_10?: boolean; student_decl_11?: boolean; student_decl_12?: boolean;
  student_decl_13?: boolean; student_decl_14?: boolean;
  student_decl_name?: string;
  student_decl_signature?: string;
  student_decl_date?: string;
  status: AgentApplicationStatus;
  admin_comment?: string;
  public_comment?: string;
  offer_letter_path?: string;
  offer_letter_uploaded_at?: string;
  offer_accepted?: boolean;
  offer_accepted_at?: string;
  signed_offer_path?: string;
  signed_offer_uploaded_at?: string;
  coe_path?: string;
  coe_issued_at?: string;
  payment_status?: string;
  payment_amount?: number;
  stripe_payment_intent_id?: string;
  stripe_payment_status?: string;
  payment_completed_at?: string;
  tuition_fee?: number | null;
  offer_acceptance_fee?: number | null;
  payment_plan_type?: 'full' | 'emi' | null;
  course_duration_months?: number | null;
  payment_plan_configured_at?: string | null;
  payment_plan_configured_by?: string | null;
  enrollment_url?: string;
  enrolled_at?: string;
  english_reading?: number | null;
  english_writing?: number | null;
  english_speaking?: number | null;
  english_listening?: number | null;
  english_overall?: number | null;
  english_meets_standard?: boolean | null;
  created_at: string;
  updated_at: string;
  courses?: Course;
  student_id?: string;
  source?: string;
  // GSA fields
  gsa_immigration_history_has?: boolean | null;
  gsa_immigration_history_details?: string | null;
  gsa_choice_reason?: string | null;
  gsa_has_previous_coe?: boolean | null;
  gsa_previous_coes?: PreviousCoERecord[] | null;
  gsa_studied_in_australia?: boolean | null;
  gsa_previous_australia_study?: PreviousAustraliaStudyRecord[] | null;
  gsa_has_study_gaps?: boolean | null;
  gsa_study_gaps?: StudyGapRecord[] | null;
  gsa_current_circumstances?: string | null;
  gsa_funding_source?: string | null;
  gsa_estimated_tuition?: string | null;
  gsa_estimated_living?: string | null;
  gsa_financial_details?: string | null;
  gsa_student_decl_1?: boolean | null;
  gsa_student_decl_2?: boolean | null;
  gsa_student_decl_3?: boolean | null;
  gsa_student_decl_4?: boolean | null;
  gsa_student_decl_name?: string | null;
  gsa_student_decl_date?: string | null;
  gsa_student_decl_signature?: string | null;
  gsa_student_decl_guardian?: boolean | null;
  gsa_agent_decl_1?: boolean | null;
  gsa_agent_decl_2?: boolean | null;
  gsa_agent_decl_3?: boolean | null;
  gsa_agent_decl_name?: string | null;
  gsa_agent_decl_date?: string | null;
  gsa_agent_decl_signature?: string | null;
  gsa_status?: GSAStatus | null;
  gsa_admin_notes?: string | null;
}

export type GSAStatus = 'not_started' | 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface PreviousCoERecord {
  institution: string;
  course: string;
  start_date: string;
  end_date: string;
  reason_for_withdrawing: string;
}

export interface PreviousAustraliaStudyRecord {
  institution: string;
  course: string;
  start_date: string;
  end_date: string;
}

export interface StudyGapRecord {
  start_date: string;
  end_date: string;
  details_of_gap: string;
}

export interface GSAData {
  gsa_immigration_history_has: boolean | null;
  gsa_immigration_history_details: string;
  gsa_choice_reason: string;
  gsa_has_previous_coe: boolean | null;
  gsa_previous_coes: PreviousCoERecord[];
  gsa_studied_in_australia: boolean | null;
  gsa_previous_australia_study: PreviousAustraliaStudyRecord[];
  gsa_has_study_gaps: boolean | null;
  gsa_study_gaps: StudyGapRecord[];
  gsa_current_circumstances: string;
  gsa_funding_source: string;
  gsa_estimated_tuition: string;
  gsa_estimated_living: string;
  gsa_financial_details: string;
  gsa_student_decl_1: boolean;
  gsa_student_decl_2: boolean;
  gsa_student_decl_3: boolean;
  gsa_student_decl_4: boolean;
  gsa_student_decl_name: string;
  gsa_student_decl_date: string;
  gsa_student_decl_signature: string;
  gsa_student_decl_guardian: boolean;
  gsa_agent_decl_1: boolean;
  gsa_agent_decl_2: boolean;
  gsa_agent_decl_3: boolean;
  gsa_agent_decl_name: string;
  gsa_agent_decl_date: string;
  gsa_agent_decl_signature: string;
}

export function createEmptyGSA(): GSAData {
  return {
    gsa_immigration_history_has: null,
    gsa_immigration_history_details: '',
    gsa_choice_reason: '',
    gsa_has_previous_coe: null,
    gsa_previous_coes: [],
    gsa_studied_in_australia: null,
    gsa_previous_australia_study: [],
    gsa_has_study_gaps: null,
    gsa_study_gaps: [],
    gsa_current_circumstances: '',
    gsa_funding_source: '',
    gsa_estimated_tuition: '',
    gsa_estimated_living: '',
    gsa_financial_details: '',
    gsa_student_decl_1: false,
    gsa_student_decl_2: false,
    gsa_student_decl_3: false,
    gsa_student_decl_4: false,
    gsa_student_decl_name: '',
    gsa_student_decl_date: '',
    gsa_student_decl_signature: '',
    gsa_student_decl_guardian: false,
    gsa_agent_decl_1: false,
    gsa_agent_decl_2: false,
    gsa_agent_decl_3: false,
    gsa_agent_decl_name: '',
    gsa_agent_decl_date: '',
    gsa_agent_decl_signature: '',
  };
}

export interface EnglishScoreStandard {
  id: string;
  test_type: string;
  min_reading: number;
  min_writing: number;
  min_speaking: number;
  min_listening: number;
  min_overall: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ENGLISH_TESTS_WITH_SCORES = ['IELTS', 'PTE', 'TOEFL', 'Duolingo'] as const;

export type DocumentStatus = 'required' | 'uploaded' | 'under_review' | 'approved' | 'rejected' | 'missing';

export interface ApplicationDocument {
  id: string;
  application_id: string;
  agent_id: string;
  document_type: string;
  file_path: string;
  file_name: string;
  file_size?: number;
  status: DocumentStatus;
  admin_comment?: string;
  uploaded_at: string;
}

export interface AgentNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'general' | 'status_change' | 'document_request' | 'document_review' | 'offer' | 'enrolment';
  is_read: boolean;
  created_at: string;
}

export const AGENT_APPLICATION_STATUSES: AgentApplicationStatus[] = [
  'draft', 'submitted', 'under_review', 'documents_required', 'approved',
  'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled', 'rejected', 'cancelled',
];

export const AGENT_APP_STATUS_LABELS: Record<AgentApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  documents_required: 'Documents Required',
  approved: 'Approved',
  offer_letter_sent: 'Offer Letter Sent',
  waiting_for_signature: 'Waiting for Signature',
  signed_offer_review: 'Signed Offer Under Review',
  offer_accepted: 'Offer Accepted',
  waiting_for_payment: 'Waiting for Payment',
  paid_coe_issued: 'Paid / COE Issued',
  enrolled: 'Enrolled',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const AGENT_DOC_TYPES = [
  'Passport',
  'Academic Transcript',
  'Academic Certificate',
  'English Test Result',
  'CV / Resume',
  'Statement of Purpose',
  'Visa Document',
  'Financial Document',
  'Other Supporting Document',
] as const;

export const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-100 text-amber-700',
  verified: 'bg-green-100 text-green-700',
  expired: 'bg-red-100 text-red-700',
  documents_required: 'bg-orange-100 text-orange-700',
  offer_letter_sent: 'bg-indigo-100 text-indigo-700',
  waiting_for_signature: 'bg-amber-100 text-amber-700',
  signed_offer_review: 'bg-amber-100 text-amber-700',
  offer_accepted: 'bg-teal-100 text-teal-700',
  waiting_for_payment: 'bg-orange-100 text-orange-700',
  paid_coe_issued: 'bg-emerald-100 text-emerald-700',
  enrolled: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
  uploaded: 'bg-blue-100 text-blue-700',
  required: 'bg-amber-100 text-amber-700',
  under_review_doc: 'bg-amber-100 text-amber-700',
  missing: 'bg-red-100 text-red-700',
};

// ── Communication & History types ────────────────────────────────────────────

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  is_read: boolean;
  is_replied: boolean;
  reply?: string;
  replied_at?: string;
  replied_by?: string;
  linked_profile_id?: string;
  conversation_id?: string;
  enquiry_token?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  application_id?: string;
  student_id?: string;
  agent_id?: string;
  subject: string;
  last_message_at?: string;
  created_by?: string;
  created_at: string;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender_id?: string;
  sender_role: 'admin' | 'student' | 'agent';
  sender_name: string;
  body: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface DocumentRequest {
  id: string;
  application_id: string;
  requested_by?: string;
  document_type: string;
  description?: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  fulfilled_at?: string;
  created_at: string;
}

export interface ApprovalSnapshot {
  id: string;
  application_id: string;
  status: string;
  approved_by?: string;
  approved_by_name?: string;
  signature?: string | null;
  snapshot: Record<string, unknown>;
  comment?: string;
  created_at: string;
}
