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
  | 'documents_approved'
  | 'sent_to_college'
  | 'offer_pending'
  | 'offer_received'
  | 'rejected'
  | 'enrolled'
  | 'cancelled';

export interface AgentApplication {
  id: string;
  application_id?: string;
  agent_id: string;
  course_id?: string;
  student_full_name: string;
  student_dob?: string;
  student_email?: string;
  student_phone?: string;
  student_nationality?: string;
  student_current_country?: string;
  student_passport_number?: string;
  student_education_level?: string;
  student_english_test_status?: string;
  preferred_intake?: string;
  agent_notes?: string;
  status: AgentApplicationStatus;
  admin_comment?: string;
  english_reading?: number | null;
  english_writing?: number | null;
  english_speaking?: number | null;
  english_listening?: number | null;
  english_overall?: number | null;
  english_meets_standard?: boolean | null;
  created_at: string;
  updated_at: string;
  courses?: Course;
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
  'draft', 'submitted', 'under_review', 'documents_required', 'documents_approved',
  'sent_to_college', 'offer_pending', 'offer_received', 'rejected', 'enrolled', 'cancelled',
];

export const AGENT_APP_STATUS_LABELS: Record<AgentApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  documents_required: 'Documents Required',
  documents_approved: 'Documents Approved',
  sent_to_college: 'Sent to College',
  offer_pending: 'Offer Pending',
  offer_received: 'Offer Received',
  rejected: 'Rejected',
  enrolled: 'Enrolled',
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
  documents_approved: 'bg-green-100 text-green-700',
  sent_to_college: 'bg-cyan-100 text-cyan-700',
  offer_pending: 'bg-purple-100 text-purple-700',
  offer_received: 'bg-green-100 text-green-700',
  enrolled: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-500',
  uploaded: 'bg-blue-100 text-blue-700',
  required: 'bg-amber-100 text-amber-700',
  under_review_doc: 'bg-amber-100 text-amber-700',
  missing: 'bg-red-100 text-red-700',
};
