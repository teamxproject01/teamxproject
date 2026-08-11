import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, Building2, Phone, Globe,
  FileText, Upload, Plus, Trash2, ChevronRight, ChevronLeft, Briefcase, Users, ClipboardCheck, PenLine,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

const TARGET_MARKETS = ['UK', 'South America', 'Europe', 'Africa', 'Southeast Asia', 'South Asia', 'East Asia'];

const QUALIFICATION_QUESTIONS: { key: string; label: string }[] = [
  { key: 'q_eatc_completed', label: 'Completed the AEI Education Agent Training Program (EATC)?' },
  { key: 'q_monitor_home_affairs', label: 'Prepared to regularly monitor the Australian Government Department of Home Affairs website?' },
  { key: 'q_monitor_education', label: 'Prepared to regularly monitor the Australian Government Department of Education and Training / AEI website?' },
  { key: 'q_read_code_of_ethics', label: 'Thoroughly read and comprehended the Australian International Education and Training Agent Code of Ethics?' },
  { key: 'q_read_national_code', label: 'Read and understood the National Code of Practice for Registration Authorities and Providers of Education and Training to Overseas Students?' },
  { key: 'q_understand_visa_fulltime', label: 'Understand that students on a student visa must have a primary purpose of studying and must be enrolled full-time?' },
  { key: 'q_no_residency_guarantee', label: 'Comprehend that you must not guarantee residency outcomes, but can refer students to the DIBP website?' },
  { key: 'q_no_conflicts', label: 'Free from any actual or potential conflicts of interest as an education agent for MIHE?' },
  { key: 'q_comply_mihe_requirements', label: 'Agree to comply with MIHE\'s requirements regarding promotional materials, application processes, and information provided to prospective students?' },
];

const STEPS = ['Account', 'Company', 'Qualifications', 'Recruitment', 'Personnel', 'Referees', 'Declaration', 'Documents'];

interface KeyPerson { name_title: string; background: string }
interface Referee { full_name: string; legal_entity: string; address: string; phone: string; email: string; website: string }

interface FormState {
  fullName: string; email: string; password: string; confirmPwd: string;
  // Section 1
  agencyName: string; companyLegalEntity: string; companyTradingName: string;
  businessRegistrationNumber: string; abn: string; businessAddress: string;
  telephone: string; faxNumber: string; website: string;
  companyDescription: string; industryMemberships: string;
  // Section 2
  qualifications: Record<string, boolean | null>;
  // Section 3
  studentsRecruitedAnnually: string; targetMarkets: string[];
  hasAustralianRep: boolean | null;
  repOrganisation: string; repContactPerson: string; repAddress: string;
  repPhone: string; repEmail: string; repWebsite: string;
  // Section 4
  keyPersonnel: KeyPerson[];
  // Section 5
  referees: Referee[];
  // Section 6
  declarationPrintName: string; declarationDate: string; declarationSignature: string;
  // Documents
  docApplicationForm: File | null; docReferenceCheck: File | null;
  docCompanyProfile: File | null; docRegistrationCert: File | null;
  docMemberships: File | null; docAgentAgreement: File | null;
  agreed: boolean;
}

const initialForm: FormState = {
  fullName: '', email: '', password: '', confirmPwd: '',
  agencyName: '', companyLegalEntity: '', companyTradingName: '',
  businessRegistrationNumber: '', abn: '', businessAddress: '',
  telephone: '', faxNumber: '', website: '',
  companyDescription: '', industryMemberships: '',
  qualifications: Object.fromEntries(QUALIFICATION_QUESTIONS.map(q => [q.key, null])),
  studentsRecruitedAnnually: '', targetMarkets: [],
  hasAustralianRep: null,
  repOrganisation: '', repContactPerson: '', repAddress: '',
  repPhone: '', repEmail: '', repWebsite: '',
  keyPersonnel: [{ name_title: '', background: '' }, { name_title: '', background: '' }],
  referees: [
    { full_name: '', legal_entity: '', address: '', phone: '', email: '', website: '' },
    { full_name: '', legal_entity: '', address: '', phone: '', email: '', website: '' },
  ],
  declarationPrintName: '', declarationDate: '', declarationSignature: '',
  docApplicationForm: null, docReferenceCheck: null,
  docCompanyProfile: null, docRegistrationCert: null,
  docMemberships: null, docAgentAgreement: null,
  agreed: false,
};

function FileUpload({ label, file, onChange, hint }: { label: string; file: File | null; onChange: (f: File | null) => void; hint?: string }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-center gap-3">
        <label className="flex-1 cursor-pointer">
          <div className="input-field flex items-center gap-2 hover:border-blue-400 transition-colors">
            <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className={`text-sm truncate ${file ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>
              {file ? file.name : 'Choose file…'}
            </span>
          </div>
          <input type="file" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
        </label>
        {file && (
          <button type="button" onClick={() => onChange(null)} className="text-slate-400 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-blue-700 w-8' : 'bg-slate-200 w-6'}`} />
        </div>
      ))}
    </div>
  );
}

export default function BecomeAgent() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const setQualification = (key: string, value: boolean) => setForm(prev => ({ ...prev, qualifications: { ...prev.qualifications, [key]: value } }));
  const toggleMarket = (market: string) => setForm(prev => ({ ...prev, targetMarkets: prev.targetMarkets.includes(market) ? prev.targetMarkets.filter(m => m !== market) : [...prev.targetMarkets, market] }));

  const validateStep = (): string | null => {
    switch (step) {
      case 0:
        if (!form.fullName.trim()) return 'Company name is required.';
        if (!form.email.trim()) return 'Email is required.';
        if (form.password.length < 8) return 'Password must be at least 8 characters.';
        if (form.password !== form.confirmPwd) return 'Passwords do not match.';
        return null;
      case 1:
        if (!form.agencyName.trim()) return 'Agency / trading name is required.';
        if (!form.companyLegalEntity.trim()) return 'Company legal entity is required.';
        if (!form.businessAddress.trim()) return 'Business address is required.';
        if (!form.telephone.trim()) return 'Telephone is required.';
        if (!form.website.trim()) return 'Website is required.';
        return null;
      case 2:
        for (const q of QUALIFICATION_QUESTIONS) {
          if (form.qualifications[q.key] === null) return `Please answer: "${q.label}"`;
        }
        return null;
      case 3:
        if (!form.studentsRecruitedAnnually.trim()) return 'Number of students recruited annually is required.';
        if (form.targetMarkets.length === 0) return 'Select at least one target market.';
        if (form.hasAustralianRep === null) return 'Please indicate whether you have a representative in Australia.';
        if (form.hasAustralianRep) {
          if (!form.repOrganisation.trim()) return 'Representative organisation is required.';
          if (!form.repContactPerson.trim()) return 'Representative contact person is required.';
          if (!form.repPhone.trim()) return 'Representative contact number is required.';
          if (!form.repEmail.trim()) return 'Representative email is required.';
        }
        return null;
      case 4:
        if (form.keyPersonnel.length === 0) return 'Add at least one key personnel member.';
        if (form.keyPersonnel.some(p => !p.name_title.trim())) return 'Each key personnel member needs a name & title.';
        return null;
      case 5:
        if (form.referees.length < 2) return 'Two referees are required.';
        if (form.referees.some(r => !r.full_name.trim() || !r.legal_entity.trim() || !r.email.trim())) return 'Each referee needs a full name, legal entity name, and email.';
        return null;
      case 6:
        if (!form.declarationPrintName.trim()) return 'Print name is required.';
        if (!form.declarationDate) return 'Date is required.';
        if (!form.declarationSignature.trim()) return 'Signature is required.';
        if (!form.agreed) return 'Please agree to the Terms and Privacy Policy.';
        return null;
      case 7:
        return null;
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    if (step < STEPS.length - 1) setStep(step + 1);
  };
  const back = () => { setError(''); if (step > 0) setStep(step - 1); };

  const uploadFile = async (userId: string, file: File | null, folder: string): Promise<string | null> => {
    if (!file) return null;
    const ext = file.name.split('.').pop();
    const path = `${userId}/${folder}.${ext}`;
    const { error: upErr } = await supabase.storage.from('agent-documents').upload(path, file, { upsert: true });
    if (upErr) throw new Error(`Upload failed for ${folder}: ${upErr.message}`);
    return path;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validateStep();
    if (err) { setError(err); return; }

    if (step < STEPS.length - 1) {
      next();
      return;
    }

    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName, role: 'agent' } },
    });

    if (authError) {
      setLoading(false);
      setError(
        authError.message.includes('already registered') || authError.message.includes('already been registered')
          ? 'An account with this email already exists. Try signing in.'
          : authError.message
      );
      return;
    }

    if (!data.user) { setLoading(false); setError('Account creation failed. Please try again.'); return; }

    try {
      const userId = data.user.id;

      const [appFormPath, refCheckPath, companyProfilePath, regCertPath, membershipsPath, agreementPath] = await Promise.all([
        uploadFile(userId, form.docApplicationForm, 'application_form'),
        uploadFile(userId, form.docReferenceCheck, 'reference_check'),
        uploadFile(userId, form.docCompanyProfile, 'company_profile'),
        uploadFile(userId, form.docRegistrationCert, 'registration_cert'),
        uploadFile(userId, form.docMemberships, 'memberships'),
        uploadFile(userId, form.docAgentAgreement, 'agent_agreement'),
      ]);

      await supabase.from('profiles').update({ role: 'agent' }).eq('id', userId);

      const { error: agentErr } = await supabase.from('agents').insert({
        user_id: userId,
        agency_name: form.agencyName,
        contact_person: form.fullName,
        phone: form.telephone,
        country: '',
        city: '',
        approval_status: 'pending',
        company_legal_entity: form.companyLegalEntity,
        company_trading_name: form.companyTradingName,
        business_registration_number: form.businessRegistrationNumber,
        abn: form.abn,
        business_address: form.businessAddress,
        telephone: form.telephone,
        fax_number: form.faxNumber,
        website: form.website,
        company_description: form.companyDescription,
        industry_memberships: form.industryMemberships,
        q_eatc_completed: form.qualifications.q_eatc_completed,
        q_monitor_home_affairs: form.qualifications.q_monitor_home_affairs,
        q_monitor_education: form.qualifications.q_monitor_education,
        q_read_code_of_ethics: form.qualifications.q_read_code_of_ethics,
        q_read_national_code: form.qualifications.q_read_national_code,
        q_understand_visa_fulltime: form.qualifications.q_understand_visa_fulltime,
        q_no_residency_guarantee: form.qualifications.q_no_residency_guarantee,
        q_no_conflicts: form.qualifications.q_no_conflicts,
        q_comply_mihe_requirements: form.qualifications.q_comply_mihe_requirements,
        students_recruited_annually: form.studentsRecruitedAnnually ? parseInt(form.studentsRecruitedAnnually, 10) : null,
        target_markets: form.targetMarkets,
        has_australian_rep: form.hasAustralianRep,
        rep_organisation: form.repOrganisation,
        rep_contact_person: form.repContactPerson,
        rep_address: form.repAddress,
        rep_phone: form.repPhone,
        rep_email: form.repEmail,
        rep_website: form.repWebsite,
        key_personnel: form.keyPersonnel,
        referees: form.referees,
        declaration_print_name: form.declarationPrintName,
        declaration_date: form.declarationDate,
        declaration_signature: form.declarationSignature,
        doc_application_form_path: appFormPath,
        doc_reference_check_path: refCheckPath,
        doc_company_profile_path: companyProfilePath,
        doc_registration_cert_path: regCertPath,
        doc_memberships_path: membershipsPath,
        doc_agent_agreement_path: agreementPath,
      });

      if (agentErr) throw new Error(agentErr.message);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Failed to submit application. Please try again.');
      return;
    }

    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 5000);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-3xl"
      >
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 bg-blue-700 rounded-2xl flex items-center justify-center shadow-blue flex-shrink-0">
            <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="leading-[1.2]">
            <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Melbourne</span>
            <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Institute of</span>
            <span className="block text-sm font-extrabold text-blue-700 tracking-tight">Higher Education</span>
          </div>
        </Link>

        <div className="card p-5 sm:p-6 md:p-8">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Your agent application has been submitted and is pending admin review.
                You'll receive an email once approved. You can log in now to check your status.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-slate-900">Become an Agent</h1>
                <p className="text-slate-500 text-sm mt-1">Register your agency to manage student applications for MIHE</p>
              </div>

              <StepIndicator step={step} total={STEPS.length} />

              <div className="flex items-center gap-2 mb-5 text-sm font-semibold text-blue-700">
                {step === 0 && <><User className="w-4 h-4" /> Step 1: Account Details</>}
                {step === 1 && <><Building2 className="w-4 h-4" /> Step 2: Company Profile</>}
                {step === 2 && <><ClipboardCheck className="w-4 h-4" /> Step 3: Qualification & Responsibilities</>}
                {step === 3 && <><Briefcase className="w-4 h-4" /> Step 4: Student Recruitment & Representative</>}
                {step === 4 && <><Users className="w-4 h-4" /> Step 5: Key Personnel</>}
                {step === 5 && <><Users className="w-4 h-4" /> Step 6: Referees</>}
                {step === 6 && <><PenLine className="w-4 h-4" /> Step 7: Declaration</>}
                {step === 7 && <><FileText className="w-4 h-4" /> Step 8: Supporting Documents</>}
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-5"
                  >
                    {/* ===== Step 0: Account ===== */}
                    {step === 0 && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Company Name</label>
                          <div className="relative">
                            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                            <input required type="text" value={form.fullName} onChange={(e) => set('fullName', e.target.value)} className="input-field pl-10" placeholder="Global Education Partners" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                            <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="input-field pl-10" placeholder="you@agency.com" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                            <input required type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => set('password', e.target.value)} className="input-field pl-10 pr-10" placeholder="Min. 8 characters" />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="label">Confirm Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                            <input required type="password" value={form.confirmPwd} onChange={(e) => set('confirmPwd', e.target.value)} className={`input-field pl-10 ${form.confirmPwd && form.confirmPwd !== form.password ? 'border-red-300' : ''}`} placeholder="Repeat password" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===== Step 1: Company Profile ===== */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Agency / Trading Name</label>
                            <div className="relative">
                              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                              <input required type="text" value={form.agencyName} onChange={(e) => set('agencyName', e.target.value)} className="input-field pl-10" placeholder="Global Education Partners" />
                            </div>
                          </div>
                          <div>
                            <label className="label">Company Legal Entity</label>
                            <input required type="text" value={form.companyLegalEntity} onChange={(e) => set('companyLegalEntity', e.target.value)} className="input-field" placeholder="Global Education Partners Pty Ltd" />
                          </div>
                          <div>
                            <label className="label">Company Trading Name</label>
                            <input type="text" value={form.companyTradingName} onChange={(e) => set('companyTradingName', e.target.value)} className="input-field" placeholder="If different from legal entity" />
                          </div>
                          <div>
                            <label className="label">Business Registration Number</label>
                            <input type="text" value={form.businessRegistrationNumber} onChange={(e) => set('businessRegistrationNumber', e.target.value)} className="input-field" placeholder="e.g. 123456789" />
                          </div>
                          <div>
                            <label className="label">Australian Business Number (ABN)</label>
                            <input type="text" value={form.abn} onChange={(e) => set('abn', e.target.value)} className="input-field" placeholder="AU companies only" />
                          </div>
                          <div>
                            <label className="label">Website</label>
                            <div className="relative">
                              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                              <input required type="url" value={form.website} onChange={(e) => set('website', e.target.value)} className="input-field pl-10" placeholder="https://…" />
                            </div>
                          </div>
                          <div>
                            <label className="label">Telephone (with country & area code)</label>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                              <input required type="tel" value={form.telephone} onChange={(e) => set('telephone', e.target.value)} className="input-field pl-10" placeholder="+61 3 9000 0000" />
                            </div>
                          </div>
                          <div>
                            <label className="label">Fax Number</label>
                            <input type="text" value={form.faxNumber} onChange={(e) => set('faxNumber', e.target.value)} className="input-field" placeholder="If applicable" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Business Address</label>
                          <input required type="text" value={form.businessAddress} onChange={(e) => set('businessAddress', e.target.value)} className="input-field" placeholder="Full street address" />
                        </div>
                        <div>
                          <label className="label">Company Description (brief)</label>
                          <textarea value={form.companyDescription} onChange={(e) => set('companyDescription', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="A short overview of your company…" />
                        </div>
                        <div>
                          <label className="label">Industry Body / Organisation Memberships</label>
                          <textarea value={form.industryMemberships} onChange={(e) => set('industryMemberships', e.target.value)} className="input-field min-h-[60px] resize-y" placeholder="List any memberships (e.g. MARA, ICEF, etc.)" />
                        </div>
                      </div>
                    )}

                    {/* ===== Step 2: Qualification Questionnaire ===== */}
                    {step === 2 && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-500">Please answer Yes or No to each question.</p>
                        {QUALIFICATION_QUESTIONS.map((q, i) => (
                          <div key={q.key} className="flex items-start justify-between gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <p className="text-sm text-slate-700 flex-1">
                              <span className="text-slate-400 font-mono mr-1.5">{i + 1}.</span>
                              {q.label}
                            </p>
                            <div className="flex gap-2 flex-shrink-0">
                              <button type="button" onClick={() => setQualification(q.key, true)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.qualifications[q.key] === true ? 'bg-green-600 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-green-400'}`}>
                                Yes
                              </button>
                              <button type="button" onClick={() => setQualification(q.key, false)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${form.qualifications[q.key] === false ? 'bg-red-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-red-400'}`}>
                                No
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ===== Step 3: Recruitment & Representative ===== */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div>
                          <label className="label">Number of Students Recruited Annually</label>
                          <input required type="number" min="0" value={form.studentsRecruitedAnnually} onChange={(e) => set('studentsRecruitedAnnually', e.target.value)} className="input-field" placeholder="e.g. 150" />
                        </div>
                        <div>
                          <label className="label">Target Markets</label>
                          <div className="flex flex-wrap gap-2">
                            {TARGET_MARKETS.map(m => (
                              <button key={m} type="button" onClick={() => toggleMarket(m)}
                                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${form.targetMarkets.includes(m) ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400'}`}>
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="label">Do you have a representative in Australia?</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => set('hasAustralianRep', true)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${form.hasAustralianRep === true ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400'}`}>
                              Yes
                            </button>
                            <button type="button" onClick={() => set('hasAustralianRep', false)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${form.hasAustralianRep === false ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400'}`}>
                              No
                            </button>
                          </div>
                        </div>
                        {form.hasAustralianRep && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-2 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-500">Representative Details</p>
                            <div className="grid sm:grid-cols-2 gap-4">
                              <div>
                                <label className="label">Organisation</label>
                                <input required type="text" value={form.repOrganisation} onChange={(e) => set('repOrganisation', e.target.value)} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Contact Person</label>
                                <input required type="text" value={form.repContactPerson} onChange={(e) => set('repContactPerson', e.target.value)} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Address</label>
                                <input type="text" value={form.repAddress} onChange={(e) => set('repAddress', e.target.value)} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Contact Number</label>
                                <input required type="tel" value={form.repPhone} onChange={(e) => set('repPhone', e.target.value)} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Email</label>
                                <input required type="email" value={form.repEmail} onChange={(e) => set('repEmail', e.target.value)} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Website</label>
                                <input type="url" value={form.repWebsite} onChange={(e) => set('repWebsite', e.target.value)} className="input-field" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {/* ===== Step 4: Key Personnel ===== */}
                    {step === 4 && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">Add the key people in your organisation.</p>
                        {form.keyPersonnel.map((person, i) => (
                          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-500">Person {i + 1}</span>
                              {form.keyPersonnel.length > 1 && (
                                <button type="button" onClick={() => set('keyPersonnel', form.keyPersonnel.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div>
                              <label className="label">Name & Title</label>
                              <input required type="text" value={person.name_title} onChange={(e) => set('keyPersonnel', form.keyPersonnel.map((p, idx) => idx === i ? { ...p, name_title: e.target.value } : p))} className="input-field" placeholder="Jane Smith, Director" />
                            </div>
                            <div>
                              <label className="label">Background</label>
                              <textarea value={person.background} onChange={(e) => set('keyPersonnel', form.keyPersonnel.map((p, idx) => idx === i ? { ...p, background: e.target.value } : p))} className="input-field min-h-[60px] resize-y" placeholder="Brief background…" />
                            </div>
                          </div>
                        ))}
                        <button type="button" onClick={() => set('keyPersonnel', [...form.keyPersonnel, { name_title: '', background: '' }])} className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
                          <Plus className="w-4 h-4" /> Add another person
                        </button>
                      </div>
                    )}

                    {/* ===== Step 5: Referees ===== */}
                    {step === 5 && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">Two referees required, preferably from Australian Higher Education Institutions.</p>
                        {form.referees.map((ref, i) => (
                          <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-slate-500">Referee {i + 1}</span>
                              {form.referees.length > 2 && (
                                <button type="button" onClick={() => set('referees', form.referees.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <label className="label">Full Name</label>
                                <input required type="text" value={ref.full_name} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, full_name: e.target.value } : r))} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Legal Entity Name</label>
                                <input required type="text" value={ref.legal_entity} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, legal_entity: e.target.value } : r))} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Address</label>
                                <input type="text" value={ref.address} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, address: e.target.value } : r))} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Phone</label>
                                <input type="tel" value={ref.phone} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, phone: e.target.value } : r))} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Email</label>
                                <input required type="email" value={ref.email} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, email: e.target.value } : r))} className="input-field" />
                              </div>
                              <div>
                                <label className="label">Website</label>
                                <input type="url" value={ref.website} onChange={(e) => set('referees', form.referees.map((r, idx) => idx === i ? { ...r, website: e.target.value } : r))} className="input-field" />
                              </div>
                            </div>
                          </div>
                        ))}
                        {form.referees.length < 5 && (
                          <button type="button" onClick={() => set('referees', [...form.referees, { full_name: '', legal_entity: '', address: '', phone: '', email: '', website: '' }])} className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
                            <Plus className="w-4 h-4" /> Add another referee
                          </button>
                        )}
                      </div>
                    )}

                    {/* ===== Step 6: Declaration ===== */}
                    {step === 6 && (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                          <p className="text-sm text-slate-700">
                            I confirm that the information provided in this application is true and correct.
                            I agree to MIHE making enquiries and contacting the references listed above.
                          </p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Print Name</label>
                            <input required type="text" value={form.declarationPrintName} onChange={(e) => set('declarationPrintName', e.target.value)} className="input-field" />
                          </div>
                          <div>
                            <label className="label">Date</label>
                            <input required type="date" value={form.declarationDate} onChange={(e) => set('declarationDate', e.target.value)} className="input-field" />
                          </div>
                        </div>
                        <div>
                          <label className="label">Signature (type your full name)</label>
                          <input required type="text" value={form.declarationSignature} onChange={(e) => set('declarationSignature', e.target.value)} className="input-field" placeholder="Type your full name as signature" />
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <div className="relative flex-shrink-0 mt-0.5">
                            <input type="checkbox" checked={form.agreed} onChange={(e) => set('agreed', e.target.checked)} className="sr-only" />
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${form.agreed ? 'bg-blue-700 border-blue-700' : 'border-slate-300 group-hover:border-blue-400'}`}>
                              {form.agreed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 leading-relaxed">
                            I agree to MIHE's{' '}
                            <a href="#" className="text-blue-700 font-medium">Terms of Service</a>
                            {' '}and{' '}
                            <a href="#" className="text-blue-700 font-medium">Privacy Policy</a>
                          </span>
                        </label>
                      </div>
                    )}

                    {/* ===== Step 7: Documents ===== */}
                    {step === 7 && (
                      <div className="space-y-4">
                        <p className="text-xs text-slate-500">Upload the supporting documents listed in the Agent Application Checklist. PDF, DOC, or image files.</p>
                        <FileUpload label="Agent Application Form" file={form.docApplicationForm} onChange={(f) => set('docApplicationForm', f)} hint="This form itself, if submitted as a separate document" />
                        <FileUpload label="Agent Reference Check" file={form.docReferenceCheck} onChange={(f) => set('docReferenceCheck', f)} hint="At least two references, preferably Higher Education" />
                        <FileUpload label="Company Profile" file={form.docCompanyProfile} onChange={(f) => set('docCompanyProfile', f)} />
                        <FileUpload label="Company Business Registration Certificate" file={form.docRegistrationCert} onChange={(f) => set('docRegistrationCert', f)} />
                        <FileUpload label="Memberships (MARA / Education Counsellor Certificate)" file={form.docMemberships} onChange={(f) => set('docMemberships', f)} hint="Onshore agents only" />
                        <FileUpload label="Agent Agreement" file={form.docAgentAgreement} onChange={(f) => set('docAgentAgreement', f)} />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {step > 0 ? (
                    <button type="button" onClick={back} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-700">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : <div />}
                  {step < STEPS.length - 1 ? (
                    <Button type="button" onClick={next}>
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={() => handleSubmit()} loading={loading}>
                      Submit Application
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-700 font-semibold hover:text-blue-800">Sign In</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
