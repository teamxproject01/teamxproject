import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Upload, CheckCircle, AlertCircle, ChevronRight, ChevronLeft,
  FileText, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import EnglishScoreInput, { EnglishScoreFields, emptyEnglishScores, checkEnglishEligibility } from '../../components/ui/EnglishScoreInput';
import { Course, EnglishScoreStandard, ENGLISH_TESTS_WITH_SCORES } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const educationLevels = ['High School', 'Diploma', 'Bachelor Degree', 'Master Degree', 'PhD', 'Other'];
const englishTests = ['Not Taken', 'IELTS', 'PTE', 'TOEFL', 'Duolingo', 'Other'];

export default function NewApplication() {
  const { profile, agent } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [standards, setStandards] = useState<EnglishScoreStandard[]>([]);
  const [englishScores, setEnglishScores] = useState<EnglishScoreFields>(emptyEnglishScores);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    student_full_name: '',
    student_dob: '',
    student_email: '',
    student_phone: '',
    student_nationality: '',
    student_current_country: '',
    student_passport_number: '',
    student_education_level: '',
    student_english_test_status: '',
    preferred_intake: '',
    agent_notes: '',
    course_id: '',
  });

  const [documents, setDocuments] = useState<{ type: string; file: File | null }[]>([
    { type: 'Passport', file: null },
    { type: 'Academic Transcript', file: null },
  ]);

  useEffect(() => {
    supabase.from('courses').select('*').order('title').then(({ data }) => setCourses(data ?? []));
    supabase.from('english_score_standards').select('*').eq('is_active', true).then(({ data }) => setStandards(data ?? []));
  }, []);

  const selectedCourse = courses.find(c => c.id === form.course_id);
  const selectedStandard = standards.find(s => s.test_type === form.student_english_test_status);
  const needsEnglishScores = ENGLISH_TESTS_WITH_SCORES.includes(form.student_english_test_status as any);

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));
  const updateScore = (field: keyof EnglishScoreFields, value: string) => setEnglishScores(prev => ({ ...prev, [field]: value }));

  const englishEligibility = needsEnglishScores
    ? checkEnglishEligibility(form.student_english_test_status, englishScores, standards)
    : { eligible: true, failures: [] };

  const stepValid = (() => {
    if (step === 1) {
      const baseValid = form.student_full_name && form.student_dob && form.student_email && form.student_phone && form.student_education_level && form.student_english_test_status;
      if (!baseValid) return false;
      if (needsEnglishScores) {
        const allFilled = englishScores.english_reading && englishScores.english_writing && englishScores.english_speaking && englishScores.english_listening && englishScores.english_overall;
        return allFilled && englishEligibility.eligible;
      }
      return true;
    }
    if (step === 2) {
      return form.course_id;
    }
    return true;
  })();

  const handleFileChange = (index: number, file: File | null) => {
    setDocuments(prev => prev.map((d, i) => i === index ? { ...d, file } : d));
  };

  const addDocRow = () => {
    setDocuments(prev => [...prev, { type: 'Other Supporting Document', file: null }]);
  };

  const removeDocRow = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    if (!profile) return;
    setLoading(true);
    setError('');
    const { data, error: insertError } = await supabase.from('agent_applications').insert({
      agent_id: profile.id,
      ...form,
      student_dob: form.student_dob || null,
      course_id: form.course_id || null,
      status: 'draft',
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    // Upload documents
    if (data) {
      await uploadDocuments(data.id);
    }

    setLoading(false);
    navigate('/agent/applications');
  };

  const handleSubmit = async () => {
    if (!profile) return;
    if (!form.student_full_name || !form.student_email || !form.course_id) {
      setError('Please complete all required fields before submitting.');
      return;
    }

    if (needsEnglishScores && !englishEligibility.eligible) {
      setError(`English scores do not meet minimum requirements: ${englishEligibility.failures.join(', ')}`);
      return;
    }

    setLoading(true);
    setError('');
    const { data, error: insertError } = await supabase.from('agent_applications').insert({
      agent_id: profile.id,
      source: 'agent',
      ...form,
      student_dob: form.student_dob || null,
      course_id: form.course_id || null,
      english_reading: needsEnglishScores ? parseFloat(englishScores.english_reading) || null : null,
      english_writing: needsEnglishScores ? parseFloat(englishScores.english_writing) || null : null,
      english_speaking: needsEnglishScores ? parseFloat(englishScores.english_speaking) || null : null,
      english_listening: needsEnglishScores ? parseFloat(englishScores.english_listening) || null : null,
      english_overall: needsEnglishScores ? parseFloat(englishScores.english_overall) || null : null,
      english_meets_standard: needsEnglishScores ? englishEligibility.eligible : null,
      status: 'submitted',
    }).select().single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    if (data) {
      await uploadDocuments(data.id);
      // Create notification
      await supabase.from('agent_notifications').insert({
        user_id: profile.id,
        title: 'Application Submitted',
        message: `Your application (${data.application_id}) for ${data.student_full_name} has been submitted successfully.`,
        type: 'status_change',
      });
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/agent/applications'), 2500);
  };

  const uploadDocuments = async (appId: string) => {
    if (!profile) return;
    for (const doc of documents) {
      if (!doc.file) continue;
      const MAX = 10 * 1024 * 1024;
      const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (doc.file.size > MAX || !ALLOWED.includes(doc.file.type)) continue;

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

  if (agent && agent.approval_status !== 'approved') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Approval Required</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Your agent account is currently <span className="font-semibold capitalize">{agent.approval_status}</span>.
          You can't create new applications until an admin approves your account.
        </p>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Student Info', icon: User },
    { num: 2, label: 'Course Selection', icon: BookOpen },
    { num: 3, label: 'Documents', icon: Upload },
    { num: 4, label: 'Review & Submit', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Student Application</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new application for a prospective student</p>
      </div>

      {/* Step indicator */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center justify-between max-w-2xl min-w-[500px] sm:min-w-0">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all ${
                step >= s.num ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${step >= s.num ? 'text-slate-800' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${step > s.num ? 'bg-blue-600' : 'bg-slate-200'}`} />
            )}
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
        {/* Step 1: Student Info */}
        {step === 1 && (
          <motion.div key="step1" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 mb-2">Student Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name *</label>
                <input required type="text" value={form.student_full_name} onChange={(e) => update('student_full_name', e.target.value)} className="input-field" placeholder="John Smith" />
              </div>
              <div>
                <label className="label">Date of Birth *</label>
                <input required type="date" value={form.student_dob} onChange={(e) => update('student_dob', e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input required type="email" value={form.student_email} onChange={(e) => update('student_email', e.target.value)} className="input-field" placeholder="student@email.com" />
              </div>
              <div>
                <label className="label">Phone Number *</label>
                <input required type="tel" value={form.student_phone} onChange={(e) => update('student_phone', e.target.value)} className="input-field" placeholder="+61 400 000 000" />
              </div>
              <div>
                <label className="label">Nationality</label>
                <input type="text" value={form.student_nationality} onChange={(e) => update('student_nationality', e.target.value)} className="input-field" placeholder="Australian" />
              </div>
              <div>
                <label className="label">Current Country</label>
                <input type="text" value={form.student_current_country} onChange={(e) => update('student_current_country', e.target.value)} className="input-field" placeholder="Australia" />
              </div>
              <div>
                <label className="label">Passport Number</label>
                <input type="text" value={form.student_passport_number} onChange={(e) => update('student_passport_number', e.target.value)} className="input-field" placeholder="P1234567" />
              </div>
              <div>
                <label className="label">Current Education Level *</label>
                <select required value={form.student_education_level} onChange={(e) => update('student_education_level', e.target.value)} className="input-field">
                  <option value="">Select…</option>
                  {educationLevels.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">English Test Status *</label>
                <select required value={form.student_english_test_status} onChange={(e) => {
                  update('student_english_test_status', e.target.value);
                  setEnglishScores(emptyEnglishScores);
                }} className="input-field">
                  <option value="">Select…</option>
                  {englishTests.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred Intake</label>
                <input type="text" value={form.preferred_intake} onChange={(e) => update('preferred_intake', e.target.value)} className="input-field" placeholder="February 2026" />
              </div>
            </div>

            {needsEnglishScores && (
              <EnglishScoreInput
                testType={form.student_english_test_status}
                scores={englishScores}
                onChange={updateScore}
                standard={selectedStandard}
              />
            )}

            {needsEnglishScores && !englishEligibility.eligible && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Scores below minimum requirement</p>
                  <p className="text-xs text-red-600">{englishEligibility.failures.join(' · ')}</p>
                </div>
              </div>
            )}

            {needsEnglishScores && englishEligibility.eligible && englishScores.english_overall && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">English scores meet the minimum requirements.</p>
              </div>
            )}

            <div>
              <label className="label">Agent Notes</label>
              <textarea value={form.agent_notes} onChange={(e) => update('agent_notes', e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Any additional notes about this student…" />
            </div>
          </motion.div>
        )}

        {/* Step 2: Course Selection */}
        {step === 2 && (
          <motion.div key="step2" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 mb-2">Course Selection</h2>
            <div className="space-y-2">
              {courses.map(course => (
                <label
                  key={course.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    form.course_id === course.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                  }`}
                >
                  <input type="radio" name="course" checked={form.course_id === course.id} onChange={() => update('course_id', course.id)} className="sr-only" />
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{course.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{course.level.replace('_', ' ')} • {course.campus} • {course.duration}</p>
                    {course.fees && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Domestic: ${course.fees.domestic?.toLocaleString()} • International: ${course.fees.international?.toLocaleString()}
                      </p>
                    )}
                  </div>
                  {form.course_id === course.id && <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                </label>
              ))}
            </div>

            {selectedCourse && (
              <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-2 text-sm">
                <p className="font-semibold text-slate-700">Course Details</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">CRICOS:</span> <span className="text-slate-700">{selectedCourse.cricos_code || '—'}</span></div>
                  <div><span className="text-slate-400">Campus:</span> <span className="text-slate-700">{selectedCourse.campus}</span></div>
                  <div><span className="text-slate-400">Duration:</span> <span className="text-slate-700">{selectedCourse.duration}</span></div>
                  <div><span className="text-slate-400">Level:</span> <span className="text-slate-700 capitalize">{selectedCourse.level.replace('_', ' ')}</span></div>
                  {selectedCourse.entry_requirements && (
                    <div className="col-span-2"><span className="text-slate-400">Entry Requirements:</span> <span className="text-slate-700">{selectedCourse.entry_requirements}</span></div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <motion.div key="step3" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Upload Documents</h2>
              <Button size="sm" variant="secondary" onClick={addDocRow}>+ Add Document</Button>
            </div>
            <p className="text-sm text-slate-500">Upload at least the required documents. PDF, JPG, PNG, WebP — max 10 MB each.</p>

            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="sm:w-56">
                    <label className="label">Document Type</label>
                    <select value={doc.type} onChange={(e) => setDocuments(prev => prev.map((d, idx) => idx === i ? { ...d, type: e.target.value } : d))} className="input-field">
                      {['Passport', 'Academic Transcript', 'Academic Certificate', 'English Test Result', 'CV / Resume', 'Statement of Purpose', 'Visa Document', 'Financial Document', 'Other Supporting Document'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="label">File</label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)} />
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

        {/* Step 4: Review */}
        {step === 4 && (
          <motion.div key="step4" variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0 }} className="card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 mb-2">Review & Submit</h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Student Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm bg-slate-50 p-4 rounded-xl">
                  <div><span className="text-slate-400">Name:</span> <span className="font-medium text-slate-800">{form.student_full_name || '—'}</span></div>
                  <div><span className="text-slate-400">DOB:</span> <span className="font-medium text-slate-800">{form.student_dob || '—'}</span></div>
                  <div><span className="text-slate-400">Email:</span> <span className="font-medium text-slate-800">{form.student_email || '—'}</span></div>
                  <div><span className="text-slate-400">Phone:</span> <span className="font-medium text-slate-800">{form.student_phone || '—'}</span></div>
                  <div><span className="text-slate-400">Nationality:</span> <span className="font-medium text-slate-800">{form.student_nationality || '—'}</span></div>
                  <div><span className="text-slate-400">Passport:</span> <span className="font-medium text-slate-800">{form.student_passport_number || '—'}</span></div>
                  <div><span className="text-slate-400">Education:</span> <span className="font-medium text-slate-800">{form.student_education_level || '—'}</span></div>
                  <div><span className="text-slate-400">English Test:</span> <span className="font-medium text-slate-800">{form.student_english_test_status || '—'}</span></div>
                  {needsEnglishScores && (
                    <>
                      <div><span className="text-slate-400">Reading:</span> <span className="font-medium text-slate-800">{englishScores.english_reading || '—'}</span></div>
                      <div><span className="text-slate-400">Writing:</span> <span className="font-medium text-slate-800">{englishScores.english_writing || '—'}</span></div>
                      <div><span className="text-slate-400">Speaking:</span> <span className="font-medium text-slate-800">{englishScores.english_speaking || '—'}</span></div>
                      <div><span className="text-slate-400">Listening:</span> <span className="font-medium text-slate-800">{englishScores.english_listening || '—'}</span></div>
                      <div><span className="text-slate-400">Overall:</span> <span className="font-medium text-slate-800">{englishScores.english_overall || '—'}</span></div>
                    </>
                  )}
                  <div><span className="text-slate-400">Intake:</span> <span className="font-medium text-slate-800">{form.preferred_intake || '—'}</span></div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">Selected Course</h3>
                <div className="bg-slate-50 p-4 rounded-xl">
                  {selectedCourse ? (
                    <>
                      <p className="font-semibold text-slate-800">{selectedCourse.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{selectedCourse.level.replace('_', ' ')} • {selectedCourse.campus} • {selectedCourse.duration}</p>
                    </>
                  ) : <p className="text-slate-400 text-sm">No course selected</p>}
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

              {form.agent_notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-2">Agent Notes</h3>
                  <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700">{form.agent_notes}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          )}
        </div>
        <div className="flex gap-3 flex-wrap justify-end">
          <Button variant="ghost" onClick={handleSaveDraft} loading={loading}>
            Save Draft
          </Button>
          {step < 4 ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!stepValid}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={loading}>
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
