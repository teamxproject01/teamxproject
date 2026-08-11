import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Upload, CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  FileText, X, Calendar, ShieldCheck, Heart, Briefcase, Plane, FileSignature, HelpCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import EnglishScoreInput, { EnglishScoreFields, emptyEnglishScores, checkEnglishEligibility } from '../../components/ui/EnglishScoreInput';
import { Course, EnglishScoreStandard, ENGLISH_TESTS_WITH_SCORES, GSAData, createEmptyGSA } from '../../types';
import GSAForm from '../../components/ui/GSAForm';
import GSASummary from '../../components/ui/GSASummary';
import { validateGSA } from '../../lib/gsa';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const educationLevels = ['Year 11 or Equivalent', 'Year 12 or Equivalent', "Bachelor's Degree", "Master's Degree", 'Australian Diploma or Advanced Diploma'];
const englishTests = ['Not Taken', 'IELTS', 'PTE', 'TOEFL', 'Duolingo', 'Other'];
const titles = ['Mr.', 'Ms.', 'Miss.', 'Mrs.', 'Other'];
const genders = ['Male', 'Female', 'Indeterminate/Intersex'];
const maritalStatuses = ['Single', 'Married', 'De Facto', 'Divorced', 'Widowed', 'Separated'];
const englishSpeakingLevels = ['Excellent', 'Very well', 'Well', 'Little well', 'Not well'];
const purposesOfStudy = [
  'To get a job', 'To explore a different career path', 'To start my own business',
  'To develop my current business', 'To pursue better job opportunities or promotion',
  'It is a requirement for my current job', 'To obtain additional skills relevant to my job',
  'To gain admission to another program of study', 'For personal interest or self-development',
  'To obtain skills for community/voluntary work', 'Other',
];
const employmentStatuses = ['Full time employed', 'Part time employed', 'Casual employed', 'Self employed', 'Unemployed'];
const visaAppStatuses = ['Granted', 'Rejected', 'Never applied'];
const intakes = ['January', 'May', 'September'];

const DECLARATIONS = [
  'I declare that the information submitted with this application is true, complete and up to date. I acknowledge that the provision of incorrect information or the withholding of relevant information relating to my application might invalidate my application and that MIHE may refuse to assess my application or withdraw a letter of offer or cancel my enrolment at any stage.',
  'I authorise MIHE to verify my academic and professional qualifications and work experience. I understand that MIHE reserves the right to inform other tertiary institutes and regulatory agencies if any documents provided are found to be false.',
  'I confirm that I have received and read MIHE\'s current course information (www.mihe.vic.edu.au/mihe-courses) and student handbook (www.mihe.vic.edu.au/student-handbook) and fully understand the requirements of the course applied for.',
  'I have read, understood and consent to the Terms and Conditions of Enrolment and the International Student Refund Policy and Procedure of MIHE (www.mihe.vic.edu.au/policy-and-procedure).',
  'I understand that at the time of enrolment I will be required to provide all original documents submitted with this application.',
  'I understand that MIHE reserves the right to alter any course, program, unit, entry requirement or fee without prior notice.',
  'I declare that I am a Genuine Temporary Entrant (GTE) and genuine student, and that I have read and understood the conditions relating to these requirements at www.homeaffairs.gov.au. I understand that if MIHE forms the opinion that I am not a GTE and genuine student, it may refuse to assess my application, withdraw a letter of offer, or cancel my enrolment at any stage.',
  'I am aware of the estimated total course fees and living expenses for my study in Australia. I understand that total course fees do not cover books, materials, travel or other additional costs related to my study.',
  'I declare that I have enough funds to support myself and my family members (if applicable) for the total period of my stay in Australia, including course fees, living expenses, travel costs and OSHC, regardless of whether dependents accompany me.',
  'Australian law states that applicants under the age of 18 must have signed consent from a parent or guardian, who must countersign this application.',
  'I have read and understood MIHE\'s Privacy Policy (www.mihe.vic.edu.au/policy-and-procedure). I understand that my personal information may be released to government agencies as required by law, and may be disclosed to third parties for the purpose of progressing my application.',
  'I authorise MIHE to access the Australian Immigration Visa Entitlements Verification Online (VEVO) system to obtain information on my visa status at any time.',
  'I declare that my signature is true and correct and matches the signature on my passport.',
  'I declare to abide by the policies, procedures, rules and regulations of MIHE. I have read and understood the above conditions and accept them in full.',
];

const DOC_TYPES = [
  'Passport', 'Year 12 / Senior High School Documents', 'English Proficiency Test',
  'Qualifications Completed', 'Financial Documents', 'GTE Statement',
  'Credit Transfer / RPL Documents', 'Other Supporting Document',
];

const initialForm = {
  student_title: '',
  student_first_name: '',
  student_middle_name: '',
  student_last_name: '',
  student_full_name: '',
  student_gender: '',
  student_dob: '',
  student_country_of_birth: '',
  student_nationality: '',
  student_marital_status: '',
  student_passport_number: '',
  student_passport_expiry: '',
  student_mobile_number: '',
  student_phone: '',
  student_email: '',
  student_in_australia: '' as '' | 'yes' | 'no',
  student_current_location: '',
  residential_street_number: '',
  residential_street_name: '',
  residential_suburb: '',
  residential_city: '',
  residential_state: '',
  residential_country: '',
  residential_post_code: '',
  postal_same_as_residential: '' as '' | 'yes' | 'no',
  postal_street_number: '',
  postal_street_name: '',
  postal_suburb: '',
  postal_city: '',
  postal_state: '',
  postal_country: '',
  postal_post_code: '',
  emergency_full_name: '',
  emergency_relationship: '',
  emergency_address: '',
  emergency_mobile: '',
  emergency_phone: '',
  emergency_email: '',
  disability_has: '' as '' | 'yes' | 'no',
  disability_details: '',
  qualification_level: '',
  qualification_name: '',
  qualification_year: '',
  qualification_institution: '',
  qualification_country: '',
  qualification_institution_phone: '',
  qualification_contact_email: '',
  applying_rpl: '' as '' | 'yes' | 'no',
  applying_credit_transfer: '' as '' | 'yes' | 'no',
  purpose_of_study: '',
  purpose_other: '',
  employment_status: '',
  visa_held: '' as '' | 'yes' | 'no',
  visa_previously_held: '' as '' | 'yes' | 'no',
  visa_application_status: '',
  gte_meets: '' as '' | 'yes' | 'no',
  funds_first_year: '' as '' | 'yes' | 'no',
  funds_living: '' as '' | 'yes' | 'no',
  oshc_arrange: '' as '' | 'yes' | 'no',
  airport_pickup: '' as '' | 'yes' | 'no',
  additional_support_required: '' as '' | 'yes' | 'no',
  additional_support_details: '',
  first_language: '',
  english_speaking_level: '',
  student_education_level: '',
  student_english_test_status: '',
  preferred_intake: '',
  course_id: '',
  notes: '',
  student_decl_1: false, student_decl_2: false, student_decl_3: false, student_decl_4: false,
  student_decl_5: false, student_decl_6: false, student_decl_7: false, student_decl_8: false,
  student_decl_9: false, student_decl_10: false, student_decl_11: false, student_decl_12: false,
  student_decl_13: false, student_decl_14: false,
  student_decl_name: '',
  student_decl_signature: '',
  student_decl_date: '',
};

export default function StudentNewApplication() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [standards, setStandards] = useState<EnglishScoreStandard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [form, setForm] = useState({ ...initialForm });

  const [englishScores, setEnglishScores] = useState<EnglishScoreFields>(emptyEnglishScores);
  const [gsaData, setGSAData] = useState<GSAData>(createEmptyGSA());
  const [documents, setDocuments] = useState<{ type: string; file: File | null; existingPath?: string; existingName?: string }[]>([
    { type: 'Passport', file: null },
    { type: 'Year 12 / Senior High School Documents', file: null },
  ]);

  useEffect(() => {
    supabase.from('courses').select('*').order('title').then(({ data }) => setCourses(data ?? []));
    supabase.from('english_score_standards').select('*').eq('is_active', true).then(({ data }) => setStandards(data ?? []));
    if (profile) {
      const nameParts = (profile.full_name || '').split(' ');
      setForm(f => ({
        ...f,
        student_first_name: nameParts[0] || '',
        student_middle_name: nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : '',
        student_last_name: nameParts.length > 1 ? nameParts[nameParts.length - 1] : '',
        student_full_name: profile.full_name || '',
        student_email: profile.email || '',
        student_mobile_number: profile.phone || '',
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (!editId) return;
    supabase.from('agent_applications').select('*').eq('id', editId).maybeSingle().then(async ({ data }) => {
      if (!data) return;
      if (data.status !== 'draft') {
        setError('This application has already been submitted and cannot be edited.');
        return;
      }
      setIsDraft(true);
      const { data: existingDocs } = await supabase
        .from('application_documents')
        .select('*')
        .eq('application_id', editId)
        .order('uploaded_at', { ascending: true });
      if (existingDocs && existingDocs.length > 0) {
        setDocuments(existingDocs.map((d: any) => ({
          type: d.document_type, file: null, existingPath: d.file_path, existingName: d.file_name,
        })));
      }
      setForm({
        ...initialForm,
        ...Object.fromEntries(Object.entries(data).filter(([k]) => k in initialForm)),
        student_in_australia: data.student_in_australia === true ? 'yes' : data.student_in_australia === false ? 'no' : '',
        postal_same_as_residential: data.postal_same_as_residential === true ? 'yes' : data.postal_same_as_residential === false ? 'no' : '',
        disability_has: data.disability_has === true ? 'yes' : data.disability_has === false ? 'no' : '',
        applying_rpl: data.applying_rpl === true ? 'yes' : data.applying_rpl === false ? 'no' : '',
        applying_credit_transfer: data.applying_credit_transfer === true ? 'yes' : data.applying_credit_transfer === false ? 'no' : '',
        visa_held: data.visa_held === true ? 'yes' : data.visa_held === false ? 'no' : '',
        visa_previously_held: data.visa_previously_held === true ? 'yes' : data.visa_previously_held === false ? 'no' : '',
        gte_meets: data.gte_meets === true ? 'yes' : data.gte_meets === false ? 'no' : '',
        funds_first_year: data.funds_first_year === true ? 'yes' : data.funds_first_year === false ? 'no' : '',
        funds_living: data.funds_living === true ? 'yes' : data.funds_living === false ? 'no' : '',
        oshc_arrange: data.oshc_arrange === true ? 'yes' : data.oshc_arrange === false ? 'no' : '',
        airport_pickup: data.airport_pickup === true ? 'yes' : data.airport_pickup === false ? 'no' : '',
        additional_support_required: data.additional_support_required === true ? 'yes' : data.additional_support_required === false ? 'no' : '',
      });
      setEnglishScores({
        english_reading: data.english_reading?.toString() || '',
        english_writing: data.english_writing?.toString() || '',
        english_speaking: data.english_speaking?.toString() || '',
        english_listening: data.english_listening?.toString() || '',
        english_overall: data.english_overall?.toString() || '',
      });
      setGSAData({
        gsa_immigration_history_has: data.gsa_immigration_history_has ?? null,
        gsa_immigration_history_details: data.gsa_immigration_history_details || '',
        gsa_choice_reason: data.gsa_choice_reason || '',
        gsa_has_previous_coe: data.gsa_has_previous_coe ?? null,
        gsa_previous_coes: data.gsa_previous_coes ?? [],
        gsa_studied_in_australia: data.gsa_studied_in_australia ?? null,
        gsa_previous_australia_study: data.gsa_previous_australia_study ?? [],
        gsa_has_study_gaps: data.gsa_has_study_gaps ?? null,
        gsa_study_gaps: data.gsa_study_gaps ?? [],
        gsa_current_circumstances: data.gsa_current_circumstances || '',
        gsa_funding_source: data.gsa_funding_source || '',
        gsa_estimated_tuition: data.gsa_estimated_tuition || '',
        gsa_estimated_living: data.gsa_estimated_living || '',
        gsa_financial_details: data.gsa_financial_details || '',
        gsa_student_decl_1: data.gsa_student_decl_1 ?? false,
        gsa_student_decl_2: data.gsa_student_decl_2 ?? false,
        gsa_student_decl_3: data.gsa_student_decl_3 ?? false,
        gsa_student_decl_4: data.gsa_student_decl_4 ?? false,
        gsa_student_decl_name: data.gsa_student_decl_name || '',
        gsa_student_decl_date: data.gsa_student_decl_date || '',
        gsa_student_decl_signature: data.gsa_student_decl_signature || '',
        gsa_student_decl_guardian: data.gsa_student_decl_guardian ?? false,
        gsa_agent_decl_1: data.gsa_agent_decl_1 ?? false,
        gsa_agent_decl_2: data.gsa_agent_decl_2 ?? false,
        gsa_agent_decl_3: data.gsa_agent_decl_3 ?? false,
        gsa_agent_decl_name: data.gsa_agent_decl_name || '',
        gsa_agent_decl_date: data.gsa_agent_decl_date || '',
        gsa_agent_decl_signature: data.gsa_agent_decl_signature || '',
      });
    });
  }, [editId]);

  const selectedCourse = courses.find(c => c.id === form.course_id);
  const selectedStandard = standards.find(s => s.test_type === form.student_english_test_status);
  const needsEnglishScores = ENGLISH_TESTS_WITH_SCORES.includes(form.student_english_test_status as any);

  const update = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));
  const updateScore = (field: keyof EnglishScoreFields, value: string) => setEnglishScores(prev => ({ ...prev, [field]: value }));

  const englishEligibility = needsEnglishScores
    ? checkEnglishEligibility(form.student_english_test_status, englishScores, standards)
    : { eligible: true, failures: [] };

  const stepValid = (() => {
    if (step === 1) {
      const required = form.student_title && form.student_first_name && form.student_last_name
        && form.student_gender && form.student_dob && form.student_country_of_birth
        && form.student_nationality && form.student_passport_number && form.student_passport_expiry
        && form.student_mobile_number && form.student_email;
      if (!required) return false;
      if (needsEnglishScores) {
        const allFilled = englishScores.english_reading && englishScores.english_writing && englishScores.english_speaking && englishScores.english_listening && englishScores.english_overall;
        return allFilled && englishEligibility.eligible;
      }
      return true;
    }
    if (step === 2) return form.course_id && form.preferred_intake;
    if (step === 5) {
      const allDeclChecked = Array.from({ length: 14 }, (_, i) => (form as any)[`student_decl_${i + 1}`]).every(Boolean);
      return allDeclChecked && form.student_decl_name.trim() && form.student_decl_signature.trim();
    }
    if (step === 6) return !validateGSA(gsaData, false);
    return true;
  })();

  const gsaAutoFill = {
    familyName: form.student_last_name || form.student_full_name.split(' ').slice(-1).join(' '),
    givenNames: [form.student_first_name, form.student_middle_name].filter(Boolean).join(' ') || form.student_full_name.split(' ').slice(0, -1).join(' '),
    dateOfBirth: form.student_dob,
    courseTitle: selectedCourse?.title ?? '',
  };

  const handleFileChange = (index: number, file: File | null) => {
    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, file } : d));
  };
  const addDocRow = () => setDocuments(prev => [...prev, { type: 'Other Supporting Document', file: null }]);
  const removeDocRow = (index: number) => setDocuments(prev => prev.filter((_, i) => i !== index));

  const buildPayload = (status: 'draft' | 'submitted') => {
    const boolFields = [
      'student_in_australia', 'postal_same_as_residential', 'disability_has',
      'applying_rpl', 'applying_credit_transfer', 'visa_held', 'visa_previously_held',
      'gte_meets', 'funds_first_year', 'funds_living', 'oshc_arrange', 'airport_pickup',
      'additional_support_required',
    ];
    const o: Record<string, any> = { ...form, status };
    for (const k of boolFields) {
      o[k] = o[k] === 'yes' ? true : o[k] === 'no' ? false : null;
    }
    o.student_full_name = [form.student_first_name, form.student_middle_name, form.student_last_name].filter(Boolean).join(' ') || form.student_full_name;
    o.student_dob = form.student_dob || null;
    o.student_passport_expiry = form.student_passport_expiry || null;
    o.student_decl_date = form.student_decl_date || null;
    o.course_id = form.course_id || null;
    o.english_reading = needsEnglishScores ? parseFloat(englishScores.english_reading) || null : null;
    o.english_writing = needsEnglishScores ? parseFloat(englishScores.english_writing) || null : null;
    o.english_speaking = needsEnglishScores ? parseFloat(englishScores.english_speaking) || null : null;
    o.english_listening = needsEnglishScores ? parseFloat(englishScores.english_listening) || null : null;
    o.english_overall = needsEnglishScores ? parseFloat(englishScores.english_overall) || null : null;
    o.english_meets_standard = needsEnglishScores ? englishEligibility.eligible : null;
    o.gsa_immigration_history_has = gsaData.gsa_immigration_history_has;
    o.gsa_immigration_history_details = gsaData.gsa_immigration_history_details || null;
    o.gsa_choice_reason = gsaData.gsa_choice_reason || null;
    o.gsa_has_previous_coe = gsaData.gsa_has_previous_coe;
    o.gsa_previous_coes = gsaData.gsa_previous_coes.length > 0 ? gsaData.gsa_previous_coes : null;
    o.gsa_studied_in_australia = gsaData.gsa_studied_in_australia;
    o.gsa_previous_australia_study = gsaData.gsa_previous_australia_study.length > 0 ? gsaData.gsa_previous_australia_study : null;
    o.gsa_has_study_gaps = gsaData.gsa_has_study_gaps;
    o.gsa_study_gaps = gsaData.gsa_study_gaps.length > 0 ? gsaData.gsa_study_gaps : null;
    o.gsa_current_circumstances = gsaData.gsa_current_circumstances || null;
    o.gsa_funding_source = gsaData.gsa_funding_source || null;
    o.gsa_estimated_tuition = gsaData.gsa_estimated_tuition || null;
    o.gsa_estimated_living = gsaData.gsa_estimated_living || null;
    o.gsa_financial_details = gsaData.gsa_financial_details || null;
    o.gsa_student_decl_1 = gsaData.gsa_student_decl_1;
    o.gsa_student_decl_2 = gsaData.gsa_student_decl_2;
    o.gsa_student_decl_3 = gsaData.gsa_student_decl_3;
    o.gsa_student_decl_4 = gsaData.gsa_student_decl_4;
    o.gsa_student_decl_name = gsaData.gsa_student_decl_name || null;
    o.gsa_student_decl_date = gsaData.gsa_student_decl_date || null;
    o.gsa_student_decl_signature = gsaData.gsa_student_decl_signature || null;
    o.gsa_student_decl_guardian = gsaData.gsa_student_decl_guardian;
    if (status === 'submitted') {
      o.source = 'student';
      o.gsa_status = 'pending';
    }
    return o;
  };

  const handleSaveDraft = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    let data: any = null;
    if (isDraft && editId) {
      const { data: updated, error: updateError } = await supabase.from('agent_applications')
        .update(buildPayload('draft')).eq('id', editId).select().single();
      if (updateError) { setError(updateError.message); setLoading(false); return; }
      data = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase.from('agent_applications')
        .insert({ student_id: profile.id, agent_id: profile.id, source: 'student', ...buildPayload('draft') }).select().single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }
      data = inserted;
    }
    if (data) await uploadDocuments(data.id);
    setLoading(false);
    navigate('/student/applications');
  };

  const handleSubmit = async () => {
    if (!profile) return;
    if (!form.student_first_name || !form.student_last_name || !form.student_email || !form.course_id || !form.preferred_intake) {
      setError('Please complete all required fields before submitting.');
      return;
    }
    if (needsEnglishScores && !englishEligibility.eligible) {
      setError(`English scores do not meet minimum requirements: ${englishEligibility.failures.join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    let data: any = null;
    if (isDraft && editId) {
      const { data: updated, error: updateError } = await supabase.from('agent_applications')
        .update(buildPayload('submitted')).eq('id', editId).select().single();
      if (updateError) { setError(updateError.message); setLoading(false); return; }
      data = updated;
    } else {
      const { data: inserted, error: insertError } = await supabase.from('agent_applications')
        .insert({ student_id: profile.id, agent_id: profile.id, ...buildPayload('submitted') }).select().single();
      if (insertError) { setError(insertError.message); setLoading(false); return; }
      data = inserted;
    }
    if (data) {
      await uploadDocuments(data.id);
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/student/applications'), 2500);
  };

  const uploadDocuments = async (appId: string) => {
    if (!profile) return;
    for (const doc of documents) {
      if (!doc.file) continue;
      const MAX = 20 * 1024 * 1024;
      const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (doc.file.size > MAX || !ALLOWED.includes(doc.file.type)) continue;

      const { data: existing } = await supabase
        .from('application_documents')
        .select('id, file_path')
        .eq('application_id', appId)
        .eq('document_type', doc.type);
      if (existing && existing.length > 0) {
        for (const ex of existing) {
          if (ex.file_path) {
            await supabase.storage.from('agent-documents').remove([ex.file_path]);
          }
          await supabase.from('application_documents').delete().eq('id', ex.id);
        }
      }

      const filePath = `${profile.id}/${appId}/${Date.now()}_${doc.file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('agent-documents')
        .upload(filePath, doc.file);

      if (!uploadError) {
        await supabase.from('application_documents').insert({
          application_id: appId,
          agent_id: profile.id,
          document_type: doc.type,
          file_path: filePath,
          file_name: doc.file.name,
          file_size: doc.file.size,
          status: 'uploaded',
        });
      }
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-500 text-sm">Redirecting to your applications…</p>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Course', icon: BookOpen },
    { num: 3, label: 'Education & Visa', icon: Briefcase },
    { num: 4, label: 'Documents', icon: Upload },
    { num: 5, label: 'Declaration', icon: FileSignature },
    { num: 6, label: 'GSA', icon: ShieldCheck },
    { num: 7, label: 'Review & Submit', icon: CheckCircle },
  ];

  const inputCls = 'input-field';
  const labelCls = 'label';

  const isInvalid = (value: any) => {
    if (!showValidation) return false;
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    return false;
  };

  const errCls = (value: any) => isInvalid(value) ? 'input-error' : inputCls;
  const errLabel = (value: any) => isInvalid(value) ? 'label text-red-600' : labelCls;

  const yesNo = (key: string) => {
    const invalid = isInvalid((form as any)[key]);
    return (
      <div className={invalid ? 'flex gap-4 p-3 rounded-xl border-2 border-red-400 bg-red-50' : 'flex gap-4'}>
        {['yes', 'no'].map(o => (
          <label key={o} className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name={key} checked={(form as any)[key] === o} onChange={() => update(key, o)} className="w-4 h-4 accent-blue-700" />
            <span className="text-sm text-slate-700 capitalize">{o === 'yes' ? 'Yes' : 'No'}</span>
          </label>
        ))}
      </div>
    );
  };
  const yesNoError = (key: string) => {
    if (!isInvalid((form as any)[key])) return null;
    return <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> This field is mandatory</p>;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{isDraft ? 'Edit Draft Application' : 'New Application'}</h1>
        <p className="text-slate-500 text-sm mt-1">{isDraft ? 'Update and submit your saved draft' : 'Apply for a course at MIHE'}</p>
      </div>

      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between max-w-2xl min-w-[560px] sm:min-w-0">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${step >= s.num ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.num ? 'bg-blue-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Personal Details */}
        {step === 1 && (
          <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-6">
            <h2 className="font-bold text-slate-900">Personal Details</h2>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={errLabel(form.student_title)}>Title *</label>
                <select value={form.student_title} onChange={(e) => update('student_title', e.target.value)} className={errCls(form.student_title)}>
                  <option value="">Select…</option>
                  {titles.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={errLabel(form.student_first_name)}>First Name *</label>
                <input type="text" value={form.student_first_name} onChange={(e) => update('student_first_name', e.target.value)} className={errCls(form.student_first_name)} placeholder="John" />
              </div>
              <div>
                <label className={errLabel(form.student_last_name)}>Last Name *</label>
                <input type="text" value={form.student_last_name} onChange={(e) => update('student_last_name', e.target.value)} className={errCls(form.student_last_name)} placeholder="Smith" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Middle Name</label>
                <input type="text" value={form.student_middle_name} onChange={(e) => update('student_middle_name', e.target.value)} className={inputCls} placeholder="Robert" />
              </div>
              <div>
                <label className={errLabel(form.student_gender)}>Gender *</label>
                <select value={form.student_gender} onChange={(e) => update('student_gender', e.target.value)} className={errCls(form.student_gender)}>
                  <option value="">Select…</option>
                  {genders.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className={errLabel(form.student_dob)}>Date of Birth *</label>
                <input type="date" value={form.student_dob} onChange={(e) => update('student_dob', e.target.value)} className={errCls(form.student_dob)} />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className={errLabel(form.student_country_of_birth)}>Country of Birth *</label>
                <input type="text" value={form.student_country_of_birth} onChange={(e) => update('student_country_of_birth', e.target.value)} className={errCls(form.student_country_of_birth)} placeholder="Australia" />
              </div>
              <div>
                <label className={errLabel(form.student_nationality)}>Nationality *</label>
                <input type="text" value={form.student_nationality} onChange={(e) => update('student_nationality', e.target.value)} className={errCls(form.student_nationality)} placeholder="Australian" />
              </div>
              <div>
                <label className={labelCls}>Marital Status</label>
                <select value={form.student_marital_status} onChange={(e) => update('student_marital_status', e.target.value)} className={inputCls}>
                  <option value="">Select…</option>
                  {maritalStatuses.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={errLabel(form.student_passport_number)}>Passport Number *</label>
                <input type="text" value={form.student_passport_number} onChange={(e) => update('student_passport_number', e.target.value)} className={errCls(form.student_passport_number)} placeholder="P1234567" />
              </div>
              <div>
                <label className={errLabel(form.student_passport_expiry)}>Passport Expiry *</label>
                <input type="date" value={form.student_passport_expiry} onChange={(e) => update('student_passport_expiry', e.target.value)} className={errCls(form.student_passport_expiry)} />
              </div>
              <div>
                <label className={errLabel(form.student_mobile_number)}>Mobile Number *</label>
                <input type="tel" value={form.student_mobile_number} onChange={(e) => update('student_mobile_number', e.target.value)} className={errCls(form.student_mobile_number)} placeholder="+61 400 000 000" />
              </div>
              <div>
                <label className={labelCls}>Phone Number</label>
                <input type="tel" value={form.student_phone} onChange={(e) => update('student_phone', e.target.value)} className={inputCls} placeholder="+61 3 9000 0000" />
              </div>
              <div>
                <label className={errLabel(form.student_email)}>Email ID *</label>
                <input type="email" value={form.student_email} onChange={(e) => update('student_email', e.target.value)} className={errCls(form.student_email)} placeholder="student@email.com" />
              </div>
            </div>

            <div className="space-y-2">
              <label className={errLabel(form.student_in_australia)}>Are you currently in Australia? *</label>
{yesNo('student_in_australia')}{yesNoError('student_in_australia')}
              {form.student_in_australia === 'no' && (
                <input type="text" value={form.student_current_location} onChange={(e) => update('student_current_location', e.target.value)} className={inputCls} placeholder="Which country are you living in?" />
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Residential Address — Permanent address (home country)</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={errLabel(form.residential_street_number)}>Street Number *</label><input type="text" value={form.residential_street_number} onChange={(e) => update('residential_street_number', e.target.value)} className={errCls(form.residential_street_number)} /></div>
                <div><label className={errLabel(form.residential_street_name)}>Street Name *</label><input type="text" value={form.residential_street_name} onChange={(e) => update('residential_street_name', e.target.value)} className={errCls(form.residential_street_name)} /></div>
                <div><label className={errLabel(form.residential_suburb)}>Suburb/Town *</label><input type="text" value={form.residential_suburb} onChange={(e) => update('residential_suburb', e.target.value)} className={errCls(form.residential_suburb)} /></div>
                <div><label className={errLabel(form.residential_city)}>City *</label><input type="text" value={form.residential_city} onChange={(e) => update('residential_city', e.target.value)} className={errCls(form.residential_city)} /></div>
                <div><label className={errLabel(form.residential_state)}>State *</label><input type="text" value={form.residential_state} onChange={(e) => update('residential_state', e.target.value)} className={errCls(form.residential_state)} /></div>
                <div><label className={errLabel(form.residential_country)}>Country *</label><input type="text" value={form.residential_country} onChange={(e) => update('residential_country', e.target.value)} className={errCls(form.residential_country)} /></div>
                <div><label className={errLabel(form.residential_post_code)}>Post Code *</label><input type="text" value={form.residential_post_code} onChange={(e) => update('residential_post_code', e.target.value)} className={errCls(form.residential_post_code)} /></div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">Postal Address</h3>
              <div className="space-y-2 mb-3">
                <label className={errLabel(form.postal_same_as_residential)}>Is your postal address the same as your residential address? *</label>
{yesNo('postal_same_as_residential')}{yesNoError('postal_same_as_residential')}
              </div>
              {form.postal_same_as_residential === 'no' && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><label className={labelCls}>Street Number</label><input type="text" value={form.postal_street_number} onChange={(e) => update('postal_street_number', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Street Name</label><input type="text" value={form.postal_street_name} onChange={(e) => update('postal_street_name', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Suburb/Town</label><input type="text" value={form.postal_suburb} onChange={(e) => update('postal_suburb', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>City</label><input type="text" value={form.postal_city} onChange={(e) => update('postal_city', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>State</label><input type="text" value={form.postal_state} onChange={(e) => update('postal_state', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Country</label><input type="text" value={form.postal_country} onChange={(e) => update('postal_country', e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Post Code</label><input type="text" value={form.postal_post_code} onChange={(e) => update('postal_post_code', e.target.value)} className={inputCls} /></div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-blue-700" />
                <h3 className="font-semibold text-slate-800 text-sm">Emergency Contact Details</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className={errLabel(form.emergency_full_name)}>Full Name *</label><input type="text" value={form.emergency_full_name} onChange={(e) => update('emergency_full_name', e.target.value)} className={errCls(form.emergency_full_name)} /></div>
                <div><label className={errLabel(form.emergency_relationship)}>Relationship *</label><input type="text" value={form.emergency_relationship} onChange={(e) => update('emergency_relationship', e.target.value)} className={errCls(form.emergency_relationship)} placeholder="Parent" /></div>
                <div><label className={errLabel(form.emergency_address)}>Address *</label><input type="text" value={form.emergency_address} onChange={(e) => update('emergency_address', e.target.value)} className={errCls(form.emergency_address)} /></div>
                <div><label className={errLabel(form.emergency_mobile)}>Mobile *</label><input type="tel" value={form.emergency_mobile} onChange={(e) => update('emergency_mobile', e.target.value)} className={errCls(form.emergency_mobile)} /></div>
                <div><label className={labelCls}>Phone</label><input type="tel" value={form.emergency_phone} onChange={(e) => update('emergency_phone', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Email ID</label><input type="email" value={form.emergency_email} onChange={(e) => update('emergency_email', e.target.value)} className={inputCls} /></div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">English Language Proficiency</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={errLabel(form.first_language)}>First Language *</label>
                  <select value={form.first_language} onChange={(e) => update('first_language', e.target.value)} className={errCls(form.first_language)}>
                    <option value="">Select…</option>
                    <option>English</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className={errLabel(form.student_english_test_status)}>English Test Status *</label>
                  <select value={form.student_english_test_status} onChange={(e) => { update('student_english_test_status', e.target.value); setEnglishScores(emptyEnglishScores); }} className={errCls(form.student_english_test_status)}>
                    <option value="">Select…</option>
                    {englishTests.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={errLabel(form.english_speaking_level)}>How well do you speak English? *</label>
                  <select value={form.english_speaking_level} onChange={(e) => update('english_speaking_level', e.target.value)} className={errCls(form.english_speaking_level)}>
                    <option value="">Select…</option>
                    {englishSpeakingLevels.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              {needsEnglishScores && (
                <EnglishScoreInput testType={form.student_english_test_status} scores={englishScores} onChange={updateScore} standard={selectedStandard} />
              )}
              {needsEnglishScores && !englishEligibility.eligible && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-3">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Scores below minimum requirement</p>
                    <p className="text-xs text-red-600">{englishEligibility.failures.join(' · ')}</p>
                  </div>
                </div>
              )}
              {needsEnglishScores && englishEligibility.eligible && englishScores.english_overall && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mt-3">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-700">English scores meet the minimum requirements.</p>
                </div>
              )}
            </div>

            <div>
              <label className={labelCls}>Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Any additional information…" />
            </div>
          </motion.div>
        )}

        {/* Step 2: Course & Intake */}
        {step === 2 && (
          <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 mb-2">MIHE — Courses</h2>
            <div>
              <label className={errLabel(form.preferred_intake)}>MIHE Intake (trimester) *</label>
              <select value={form.preferred_intake} onChange={(e) => update('preferred_intake', e.target.value)} className={errCls(form.preferred_intake)}>
                <option value="">— Select —</option>
                {intakes.map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <p className={`text-sm font-medium ${isInvalid(form.course_id) ? 'text-red-600' : 'text-slate-700'}`}>Tick the course you wish to apply for *</p>
              {courses.map(course => (
                <label key={course.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.course_id === course.id ? 'border-blue-500 bg-blue-50' : isInvalid(form.course_id) ? 'border-red-300' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="course" checked={form.course_id === course.id} onChange={() => update('course_id', course.id)} className="sr-only" />
                  <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{course.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{course.level.replace('_', ' ')} • {course.campus} • {course.duration}</p>
                    {course.fees && <p className="text-xs text-slate-500 mt-0.5">Domestic: ${course.fees.domestic?.toLocaleString()} • International: ${course.fees.international?.toLocaleString()}</p>}
                  </div>
                  {form.course_id === course.id && <CheckCircle className="w-5 h-5 text-blue-700 flex-shrink-0" />}
                </label>
              ))}
              {isInvalid(form.course_id) && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3 shrink-0" /> Please select a course</p>}
            </div>
            {selectedCourse && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                <p className="font-semibold text-slate-700">Course Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">CRICOS:</span> <span className="text-slate-700">{selectedCourse.cricos_code || '—'}</span></div>
                  <div><span className="text-slate-400">Campus:</span> <span className="text-slate-700">{selectedCourse.campus}</span></div>
                  <div><span className="text-slate-400">Duration:</span> <span className="text-slate-700">{selectedCourse.duration}</span></div>
                  <div><span className="text-slate-400">Level:</span> <span className="text-slate-700 capitalize">{selectedCourse.level.replace('_', ' ')}</span></div>
                  {selectedCourse.entry_requirements && <div className="col-span-2"><span className="text-slate-400">Entry Requirements:</span> <span className="text-slate-700">{selectedCourse.entry_requirements}</span></div>}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Education, Visa, Employment, GTE */}
        {step === 3 && (
          <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700" />
              <h2 className="font-bold text-slate-900">Disability or Medical Condition</h2>
            </div>
            <p className="text-xs text-slate-500">Your response will not impact the evaluation of your qualifications.</p>
            <div className="space-y-2">
              <label className={errLabel(form.disability_has)}>Do you have any disabilities or medical conditions that you would like MIHE to be aware of? *</label>
{yesNo('disability_has')}{yesNoError('disability_has')}
              {form.disability_has === 'yes' && (
                <textarea value={form.disability_details} onChange={(e) => update('disability_details', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Please indicate the areas" />
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Previous Qualification and Education Background</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={errLabel(form.qualification_level)}>Highest COMPLETED qualification level *</label>
                  <select value={form.qualification_level} onChange={(e) => update('qualification_level', e.target.value)} className={errCls(form.qualification_level)}>
                    <option value="">Select…</option>
                    {educationLevels.map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div><label className={errLabel(form.qualification_name)}>Qualification Name *</label><input type="text" value={form.qualification_name} onChange={(e) => update('qualification_name', e.target.value)} className={errCls(form.qualification_name)} /></div>
                <div><label className={errLabel(form.qualification_year)}>Year of Completion *</label><input type="text" value={form.qualification_year} onChange={(e) => update('qualification_year', e.target.value)} className={errCls(form.qualification_year)} placeholder="2020" /></div>
                <div><label className={errLabel(form.qualification_institution)}>Institution Name *</label><input type="text" value={form.qualification_institution} onChange={(e) => update('qualification_institution', e.target.value)} className={errCls(form.qualification_institution)} /></div>
                <div><label className={errLabel(form.qualification_country)}>Country (where qualification completed) *</label><input type="text" value={form.qualification_country} onChange={(e) => update('qualification_country', e.target.value)} className={errCls(form.qualification_country)} /></div>
                <div><label className={labelCls}>Institution Phone Number</label><input type="tel" value={form.qualification_institution_phone} onChange={(e) => update('qualification_institution_phone', e.target.value)} className={inputCls} /></div>
                <div><label className={labelCls}>Contact Person Email ID</label><input type="email" value={form.qualification_contact_email} onChange={(e) => update('qualification_contact_email', e.target.value)} className={inputCls} /></div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Credit Transfer / RPL</h2>
              <div className="space-y-3">
                <div><label className={errLabel(form.applying_rpl)}>Applying for Recognition of Prior Learning? *</label>{yesNo('applying_rpl')}{yesNoError('applying_rpl')}</div>
                <div><label className={errLabel(form.applying_credit_transfer)}>Applying for a Credit Transfer? *</label>{yesNo('applying_credit_transfer')}{yesNoError('applying_credit_transfer')}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Purpose of Study</h2>
              <p className="text-xs text-slate-500 mb-2">Please select only one</p>
              <select value={form.purpose_of_study} onChange={(e) => update('purpose_of_study', e.target.value)} className={inputCls}>
                <option value="">Select…</option>
                {purposesOfStudy.map(p => <option key={p}>{p}</option>)}
              </select>
              {form.purpose_of_study === 'Other' && (
                <textarea value={form.purpose_other} onChange={(e) => update('purpose_other', e.target.value)} className="input-field mt-2 min-h-[60px] resize-y" placeholder="Other, please specify (max 500 chars)" maxLength={500} />
              )}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-blue-700" />
                <h2 className="font-bold text-slate-900">Employment</h2>
              </div>
              <label className={errLabel(form.employment_status)}>Current employment status *</label>
<select value={form.employment_status} onChange={(e) => update('employment_status', e.target.value)} className={errCls(form.employment_status)}>
                <option value="">Select…</option>
                {employmentStatuses.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="w-4 h-4 text-blue-700" />
                <h2 className="font-bold text-slate-900">Visa Information</h2>
              </div>
              <div className="space-y-3">
                <div><label className={errLabel(form.visa_held)}>Do you hold any visa for Australia? *</label>{yesNo('visa_held')}{yesNoError('visa_held')}</div>
                <div><label className={errLabel(form.visa_previously_held)}>Have you previously held any visa for Australia? *</label>{yesNo('visa_previously_held')}{yesNoError('visa_previously_held')}</div>
                <div>
                  <label className={errLabel(form.visa_application_status)}>Have you ever applied for a visa for Australia that was granted or rejected? *</label>
                  <select value={form.visa_application_status} onChange={(e) => update('visa_application_status', e.target.value)} className={errCls(form.visa_application_status)}>
                    <option value="">Select…</option>
                    {visaAppStatuses.map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Genuine Temporary Entrant and Financial Capacity</h2>
              <div className="space-y-3">
                <div>
                  <label className={errLabel(form.gte_meets)}>Do you meet the criteria of a Genuine Temporary Entrant (GTE)? *</label>
{yesNo('gte_meets')}{yesNoError('gte_meets')}
                  <p className="text-xs text-slate-400 mt-1">For detailed information about the GTE requirement, visit immi.homeaffairs.gov.au. Please provide a Genuine Temporary Entrant Statement with your application.</p>
                </div>
                <div><label className={errLabel(form.funds_first_year)}>Do you hold sufficient funds for the first year of the applied course fee? *</label>{yesNo('funds_first_year')}{yesNoError('funds_first_year')}</div>
                <div><label className={errLabel(form.funds_living)}>Do you hold sufficient funds for cost of living in Australia (for an individual AUD $29,710)? *</label>{yesNo('funds_living')}{yesNoError('funds_living')}</div>
                <p className="text-xs text-slate-400">If yes to either above, please provide a Bank Statement, Confirmation of Bank Balance, or other proof that funds are accessible.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Additional Services</h2>
              <div className="space-y-3">
                <div><label className={errLabel(form.oshc_arrange)}>Would you like MIHE to arrange your Overseas Student Health Cover (OSHC) for your entire period of study? *</label>{yesNo('oshc_arrange')}{yesNoError('oshc_arrange')}</div>
                <div><label className={errLabel(form.airport_pickup)}>Would you like us to arrange an airport pickup at the time of your arrival in Australia? *</label>{yesNo('airport_pickup')}{yesNoError('airport_pickup')}</div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <h2 className="font-bold text-slate-900 mb-3">Additional Support</h2>
              <div className="space-y-2">
                <label className={errLabel(form.additional_support_required)}>Do you require any additional support while studying at MIHE? *</label>
{yesNo('additional_support_required')}{yesNoError('additional_support_required')}
                {form.additional_support_required === 'yes' && (
                  <textarea value={form.additional_support_details} onChange={(e) => update('additional_support_details', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Please describe the support you require" />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Documents */}
        {step === 4 && (
          <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Application Documents</h2>
              <Button size="sm" variant="secondary" onClick={addDocRow}>+ Add Document</Button>
            </div>
            <p className="text-sm text-slate-500">Upload a certified copy of each document below. Incomplete applications will not be processed. All documents must be translated into English and certified where required. PDF, JPG, PNG, DOC or DOCX — max 20 MB each.</p>

            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="sm:w-64">
                    <label className={labelCls}>Document Type</label>
                    <select value={doc.type} onChange={(e) => setDocuments(prev => prev.map((d, idx) => idx === i ? { ...d, type: e.target.value } : d))} className={inputCls}>
                      {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className={labelCls}>File</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" className="sr-only" onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)} />
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600 truncate">{doc.file ? doc.file.name : 'Choose file…'}</span>
                      </label>
                      {documents.length > 1 && (
                        <button onClick={() => removeDocRow(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 5: Student Declaration */}
        {step === 5 && (
          <motion.div key="step5" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileSignature className="w-5 h-5 text-blue-700" />
              <h2 className="font-bold text-slate-900">Student Declaration</h2>
            </div>
            <p className="text-sm text-slate-500">You must read and agree to every declaration below.</p>

            <div className="space-y-3">
              {DECLARATIONS.map((decl, i) => (
                <label key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={(form as any)[`student_decl_${i + 1}`] ?? false} onChange={(e) => update(`student_decl_${i + 1}`, e.target.checked)} className="w-5 h-5 mt-0.5 accent-blue-700 flex-shrink-0" />
                  <span className="text-xs text-slate-700 leading-relaxed">{decl}</span>
                </label>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className={errLabel(form.student_decl_name)}>Student Name *</label>
                <input type="text" value={form.student_decl_name} onChange={(e) => update('student_decl_name', e.target.value)} className={errCls(form.student_decl_name)} placeholder="Full name" />
              </div>
              <div>
                <label className={errLabel(form.student_decl_signature)}>Signature (type your full name) *</label>
                <input type="text" value={form.student_decl_signature} onChange={(e) => update('student_decl_signature', e.target.value)} className={errCls(form.student_decl_signature)} placeholder="Type your full name" style={{ fontFamily: 'Georgia, serif' }} />
              </div>
              <div>
                <label className={labelCls}>Date</label>
                <input type="text" value={form.student_decl_date || new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })} readOnly className={`${inputCls} bg-slate-50`} />
                <p className="text-xs text-slate-400 mt-1">Recorded automatically</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: GSA */}
        {step === 6 && (
          <motion.div key="step6gsa" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900">Genuine Student Assessment (GSA)</h2>
                <p className="text-xs text-slate-500">Required sections — all fields must be completed</p>
              </div>
            </div>
            <GSAForm data={gsaData} onChange={setGSAData} isAgentSubmitted={false} autoFill={gsaAutoFill} />
          </motion.div>
        )}

        {/* Step 7: Review */}
        {step === 7 && (
          <motion.div key="step7" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 mb-2">Review & Submit</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Personal Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Title:</span> <span className="font-medium text-slate-800">{form.student_title || '—'}</span></div>
                  <div><span className="text-slate-400">Name:</span> <span className="font-medium text-slate-800">{[form.student_first_name, form.student_middle_name, form.student_last_name].filter(Boolean).join(' ') || '—'}</span></div>
                  <div><span className="text-slate-400">Gender:</span> <span className="font-medium text-slate-800">{form.student_gender || '—'}</span></div>
                  <div><span className="text-slate-400">DOB:</span> <span className="font-medium text-slate-800">{form.student_dob || '—'}</span></div>
                  <div><span className="text-slate-400">Marital Status:</span> <span className="font-medium text-slate-800">{form.student_marital_status || '—'}</span></div>
                  <div><span className="text-slate-400">Country of Birth:</span> <span className="font-medium text-slate-800">{form.student_country_of_birth || '—'}</span></div>
                  <div><span className="text-slate-400">Nationality:</span> <span className="font-medium text-slate-800">{form.student_nationality || '—'}</span></div>
                  <div><span className="text-slate-400">Passport:</span> <span className="font-medium text-slate-800">{form.student_passport_number || '—'}</span></div>
                  <div><span className="text-slate-400">Passport Expiry:</span> <span className="font-medium text-slate-800">{form.student_passport_expiry || '—'}</span></div>
                  <div><span className="text-slate-400">Mobile:</span> <span className="font-medium text-slate-800">{form.student_mobile_number || '—'}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <span className="font-medium text-slate-800">{form.student_phone || '—'}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-800">{form.student_email || '—'}</span></div>
                  <div><span className="text-slate-400">In Australia:</span> <span className="font-medium text-slate-800">{form.student_in_australia || '—'}</span></div>
                  {form.student_in_australia === 'no' && <div><span className="text-slate-400">Current Location:</span> <span className="font-medium text-slate-800">{form.student_current_location || '—'}</span></div>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Residential Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Street Number:</span> <span className="font-medium text-slate-800">{form.residential_street_number || '—'}</span></div>
                  <div><span className="text-slate-400">Street Name:</span> <span className="font-medium text-slate-800">{form.residential_street_name || '—'}</span></div>
                  <div><span className="text-slate-400">Suburb/Town:</span> <span className="font-medium text-slate-800">{form.residential_suburb || '—'}</span></div>
                  <div><span className="text-slate-400">City:</span> <span className="font-medium text-slate-800">{form.residential_city || '—'}</span></div>
                  <div><span className="text-slate-400">State:</span> <span className="font-medium text-slate-800">{form.residential_state || '—'}</span></div>
                  <div><span className="text-slate-400">Country:</span> <span className="font-medium text-slate-800">{form.residential_country || '—'}</span></div>
                  <div><span className="text-slate-400">Post Code:</span> <span className="font-medium text-slate-800">{form.residential_post_code || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Postal Address</h3>
                <div className="bg-slate-50 p-4 rounded-xl text-sm">
                  {form.postal_same_as_residential === 'yes' ? (
                    <p className="text-slate-600">Same as residential address</p>
                  ) : form.postal_same_as_residential === 'no' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><span className="text-slate-400">Street Number:</span> <span className="font-medium text-slate-800">{form.postal_street_number || '—'}</span></div>
                      <div><span className="text-slate-400">Street Name:</span> <span className="font-medium text-slate-800">{form.postal_street_name || '—'}</span></div>
                      <div><span className="text-slate-400">Suburb/Town:</span> <span className="font-medium text-slate-800">{form.postal_suburb || '—'}</span></div>
                      <div><span className="text-slate-400">City:</span> <span className="font-medium text-slate-800">{form.postal_city || '—'}</span></div>
                      <div><span className="text-slate-400">State:</span> <span className="font-medium text-slate-800">{form.postal_state || '—'}</span></div>
                      <div><span className="text-slate-400">Country:</span> <span className="font-medium text-slate-800">{form.postal_country || '—'}</span></div>
                      <div><span className="text-slate-400">Post Code:</span> <span className="font-medium text-slate-800">{form.postal_post_code || '—'}</span></div>
                    </div>
                  ) : <p className="text-slate-400">Not specified</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Full Name:</span> <span className="font-medium text-slate-800">{form.emergency_full_name || '—'}</span></div>
                  <div><span className="text-slate-400">Relationship:</span> <span className="font-medium text-slate-800">{form.emergency_relationship || '—'}</span></div>
                  <div><span className="text-slate-400">Address:</span> <span className="font-medium text-slate-800">{form.emergency_address || '—'}</span></div>
                  <div><span className="text-slate-400">Mobile:</span> <span className="font-medium text-slate-800">{form.emergency_mobile || '—'}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <span className="font-medium text-slate-800">{form.emergency_phone || '—'}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-800">{form.emergency_email || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">English Language Proficiency</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">First Language:</span> <span className="font-medium text-slate-800">{form.first_language || '—'}</span></div>
                  <div><span className="text-slate-400">English Test:</span> <span className="font-medium text-slate-800">{form.student_english_test_status || '—'}</span></div>
                  <div><span className="text-slate-400">Speaking Level:</span> <span className="font-medium text-slate-800">{form.english_speaking_level || '—'}</span></div>
                  {needsEnglishScores && (
                    <>
                      <div><span className="text-slate-400">Reading:</span> <span className="font-medium text-slate-800">{englishScores.english_reading || '—'}</span></div>
                      <div><span className="text-slate-400">Writing:</span> <span className="font-medium text-slate-800">{englishScores.english_writing || '—'}</span></div>
                      <div><span className="text-slate-400">Speaking:</span> <span className="font-medium text-slate-800">{englishScores.english_speaking || '—'}</span></div>
                      <div><span className="text-slate-400">Listening:</span> <span className="font-medium text-slate-800">{englishScores.english_listening || '—'}</span></div>
                      <div><span className="text-slate-400">Overall:</span> <span className="font-medium text-slate-800">{englishScores.english_overall || '—'}</span></div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Selected Course</h3>
                <div className="bg-slate-50 p-4 rounded-xl">
                  {selectedCourse ? (
                    <>
                      <p className="font-semibold text-slate-800">{selectedCourse.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{selectedCourse.level.replace('_', ' ')} • {selectedCourse.campus} • {selectedCourse.duration}</p>
                      <p className="text-xs text-slate-500 mt-1">Intake: {form.preferred_intake || '—'}</p>
                    </>
                  ) : <p className="text-slate-400 text-sm">No course selected</p>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Disability / Medical Condition</h3>
                <div className="bg-slate-50 p-4 rounded-xl text-sm">
                  <div><span className="text-slate-400">Has disability/medical condition:</span> <span className="font-medium text-slate-800">{form.disability_has || '—'}</span></div>
                  {form.disability_has === 'yes' && <div className="mt-1"><span className="text-slate-400">Details:</span> <span className="font-medium text-slate-800">{form.disability_details || '—'}</span></div>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Education Background</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Highest Qualification Level:</span> <span className="font-medium text-slate-800">{form.qualification_level || '—'}</span></div>
                  <div><span className="text-slate-400">Qualification Name:</span> <span className="font-medium text-slate-800">{form.qualification_name || '—'}</span></div>
                  <div><span className="text-slate-400">Year of Completion:</span> <span className="font-medium text-slate-800">{form.qualification_year || '—'}</span></div>
                  <div><span className="text-slate-400">Institution:</span> <span className="font-medium text-slate-800">{form.qualification_institution || '—'}</span></div>
                  <div><span className="text-slate-400">Country:</span> <span className="font-medium text-slate-800">{form.qualification_country || '—'}</span></div>
                  <div><span className="text-slate-400">Institution Phone:</span> <span className="font-medium text-slate-800">{form.qualification_institution_phone || '—'}</span></div>
                  <div><span className="text-slate-400">Contact Email:</span> <span className="font-medium text-slate-800">{form.qualification_contact_email || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Credit Transfer / RPL</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Applying for RPL:</span> <span className="font-medium text-slate-800">{form.applying_rpl || '—'}</span></div>
                  <div><span className="text-slate-400">Applying for Credit Transfer:</span> <span className="font-medium text-slate-800">{form.applying_credit_transfer || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Purpose of Study & Employment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Purpose of Study:</span> <span className="font-medium text-slate-800">{form.purpose_of_study || '—'}{form.purpose_of_study === 'Other' && form.purpose_other ? ` (${form.purpose_other})` : ''}</span></div>
                  <div><span className="text-slate-400">Employment Status:</span> <span className="font-medium text-slate-800">{form.employment_status || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Visa Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Holds Visa for Australia:</span> <span className="font-medium text-slate-800">{form.visa_held || '—'}</span></div>
                  <div><span className="text-slate-400">Previously Held Visa:</span> <span className="font-medium text-slate-800">{form.visa_previously_held || '—'}</span></div>
                  <div><span className="text-slate-400">Visa Application Status:</span> <span className="font-medium text-slate-800">{form.visa_application_status || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">GTE & Financial Capacity</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Meets GTE Criteria:</span> <span className="font-medium text-slate-800">{form.gte_meets || '—'}</span></div>
                  <div><span className="text-slate-400">Funds for First Year:</span> <span className="font-medium text-slate-800">{form.funds_first_year || '—'}</span></div>
                  <div><span className="text-slate-400">Funds for Living:</span> <span className="font-medium text-slate-800">{form.funds_living || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Additional Services & Support</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">OSHC Arrangement:</span> <span className="font-medium text-slate-800">{form.oshc_arrange || '—'}</span></div>
                  <div><span className="text-slate-400">Airport Pickup:</span> <span className="font-medium text-slate-800">{form.airport_pickup || '—'}</span></div>
                  <div><span className="text-slate-400">Additional Support Required:</span> <span className="font-medium text-slate-800">{form.additional_support_required || '—'}</span></div>
                  {form.additional_support_required === 'yes' && <div className="col-span-2"><span className="text-slate-400">Support Details:</span> <span className="font-medium text-slate-800">{form.additional_support_details || '—'}</span></div>}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Documents ({documents.filter(d => d.file).length} uploaded)</h3>
                <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                  {documents.filter(d => d.file).length === 0 ? (
                    <p className="text-slate-400 text-sm">No documents uploaded</p>
                  ) : documents.filter(d => d.file).map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-slate-700">{d.type}:</span>
                      <span className="text-slate-500">{d.file?.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Student Declaration</h3>
                <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${Array.from({ length: 14 }, (_, i) => (form as any)[`student_decl_${i + 1}`]).every(Boolean) ? 'text-green-600' : 'text-slate-300'}`} />
                    <span className="text-slate-600">{Array.from({ length: 14 }, (_, i) => (form as any)[`student_decl_${i + 1}`]).filter(Boolean).length} of 14 declarations agreed</span>
                  </div>
                  <div><span className="text-slate-400">Name:</span> <span className="font-medium text-slate-800">{form.student_decl_name || '—'}</span></div>
                  <div><span className="text-slate-400">Signature:</span> <span className="font-medium text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>{form.student_decl_signature || '—'}</span></div>
                  <div><span className="text-slate-400">Date:</span> <span className="font-medium text-slate-800">{form.student_decl_date || new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric' })}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Genuine Student Assessment (GSA)</h3>
                <GSASummary app={{ ...gsaData, source: 'student' }} defaultOpen={true} />
              </div>

              {form.notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Additional Notes</h3>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700">{form.notes}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="secondary" onClick={() => { setShowValidation(false); setStep(s => s - 1); }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <Button variant="ghost" onClick={() => setShowDraftDialog(true)}>
            {isDraft ? 'Update Draft' : 'Save Draft & Exit'}
          </Button>
          {step < 7 ? (
            <Button onClick={() => {
              if (stepValid) { setShowValidation(false); setStep(s => s + 1); }
              else { setShowValidation(true); }
            }}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Submit Application
            </Button>
          )}
        </div>
      </div>

      {showDraftDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Save as Draft?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-5">Your progress will be saved and you can continue this application later from your applications list.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowDraftDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveDraft} loading={loading}>Save & Exit</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
