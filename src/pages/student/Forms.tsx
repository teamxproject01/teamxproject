import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, ChevronRight, X, CheckCircle, AlertCircle, Clock, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Form, FORM_LABELS, FormType } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

// ── Special Consideration multi-step form ─────────────────────────────────────

type SCData = {
  affectedAssessments: string;
  reason: string;
  reasonOther: string;
  startDate: string;
  endDate: string;
  impact: string;
  requestedOutcome: string;
  supportingEvidenceType: string;
  declaration: boolean;
};

const INITIAL_SC: SCData = {
  affectedAssessments: '',
  reason: '',
  reasonOther: '',
  startDate: '',
  endDate: '',
  impact: '',
  requestedOutcome: '',
  supportingEvidenceType: '',
  declaration: false,
};

const REASONS = [
  'Medical condition or illness',
  'Mental health condition',
  'Bereavement / family crisis',
  'Victim of crime or violence',
  'Natural disaster or emergency',
  'Serious accident / injury',
  'Other (please specify below)',
];

const OUTCOMES = [
  'Extension on assessment due date',
  'Alternative assessment',
  'Deferred exam / assessment',
  'Late withdrawal without academic penalty',
  'Grade review',
];

const EVIDENCE_TYPES = [
  'Medical certificate',
  'Doctor\'s letter / medical report',
  'Death certificate / bereavement notice',
  'Police report',
  'Statutory declaration',
  'Other supporting documentation',
];

function SpecialConsiderationForm({
  onSave,
  onClose,
  existing,
}: {
  onSave: (data: SCData, submit: boolean) => Promise<void>;
  onClose: () => void;
  existing?: Partial<SCData>;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<SCData>({ ...INITIAL_SC, ...(existing ?? {}) });
  const [loading, setLoading] = useState(false);

  const steps = ['Assessments', 'Circumstances', 'Request', 'Declaration'];

  const update = (field: keyof SCData, value: string | boolean) =>
    setData((d) => ({ ...d, [field]: value }));

  const saveAs = async (submit: boolean) => {
    setLoading(true);
    await onSave(data, submit);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Special Consideration Request</h2>
            <p className="text-xs text-slate-500 mt-0.5">Step {step + 1} of {steps.length}: {steps[step]}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4">
          <div className="flex gap-2">
            {steps.map((s, i) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {step === 0 && (
            <>
              <div>
                <label className="label">Which assessments are affected? *</label>
                <textarea
                  required
                  rows={3}
                  value={data.affectedAssessments}
                  onChange={(e) => update('affectedAssessments', e.target.value)}
                  className="input-field resize-none"
                  placeholder="e.g. Assignment 2 (due 15 May), Mid-semester exam (20 May)"
                />
                <p className="text-xs text-slate-400 mt-1">List all assessments you are requesting consideration for.</p>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div>
                <label className="label">Reason for Request *</label>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label key={r} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${data.reason === r ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                        {data.reason === r && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <input
                        type="radio"
                        className="sr-only"
                        name="reason"
                        value={r}
                        checked={data.reason === r}
                        onChange={() => update('reason', r)}
                      />
                      <span className="text-sm text-slate-700">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
              {data.reason === 'Other (please specify below)' && (
                <div>
                  <label className="label">Please specify *</label>
                  <input
                    type="text"
                    value={data.reasonOther}
                    onChange={(e) => update('reasonOther', e.target.value)}
                    className="input-field"
                    placeholder="Describe your circumstances…"
                  />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Date From *</label>
                  <input type="date" value={data.startDate} onChange={(e) => update('startDate', e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label">Date To *</label>
                  <input type="date" value={data.endDate} onChange={(e) => update('endDate', e.target.value)} className="input-field" />
                </div>
              </div>
              <div>
                <label className="label">How did this impact your ability to study? *</label>
                <textarea
                  rows={3}
                  value={data.impact}
                  onChange={(e) => update('impact', e.target.value)}
                  className="input-field resize-none"
                  placeholder="Describe how the circumstances directly affected your academic performance…"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="label">Requested Outcome *</label>
                <div className="space-y-2">
                  {OUTCOMES.map((o) => (
                    <label key={o} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 cursor-pointer transition-all">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${data.requestedOutcome === o ? 'border-blue-600 bg-blue-600' : 'border-slate-300'}`}>
                        {data.requestedOutcome === o && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <input type="radio" className="sr-only" name="outcome" value={o} checked={data.requestedOutcome === o} onChange={() => update('requestedOutcome', o)} />
                      <span className="text-sm text-slate-700">{o}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Supporting Evidence Type</label>
                <select value={data.supportingEvidenceType} onChange={(e) => update('supportingEvidenceType', e.target.value)} className="input-field">
                  <option value="">Select evidence type</option>
                  {EVIDENCE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <p className="text-xs text-slate-400 mt-1">Upload your evidence in Documents after submitting this form.</p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-slate-700 leading-relaxed space-y-3">
                <h3 className="font-bold text-slate-900">Summary</h3>
                <p><strong>Assessments:</strong> {data.affectedAssessments || '—'}</p>
                <p><strong>Reason:</strong> {data.reason || '—'} {data.reasonOther && `(${data.reasonOther})`}</p>
                <p><strong>Period:</strong> {data.startDate} to {data.endDate}</p>
                <p><strong>Requested outcome:</strong> {data.requestedOutcome || '—'}</p>
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl border-slate-200 hover:border-blue-300 transition-colors">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${data.declaration ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                  {data.declaration && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                </div>
                <input type="checkbox" className="sr-only" checked={data.declaration} onChange={(e) => update('declaration', e.target.checked)} />
                <span className="text-sm text-slate-700 leading-relaxed">
                  I declare that the information provided in this form is true and correct. I understand that providing false information is a serious breach of MIHE's Student Code of Conduct and may result in disciplinary action.
                </span>
              </label>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {step > 0 && (
              <Button variant="secondary" size="sm" onClick={() => setStep(s => s - 1)}>
                Back
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => saveAs(false)} loading={loading}>
              <Save className="w-4 h-4" /> Save Draft
            </Button>
          </div>
          <div>
            {step < steps.length - 1 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)}>
                Continue <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => saveAs(true)} loading={loading} disabled={!data.declaration}>
                Submit Form <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Forms page ────────────────────────────────────────────────────────────

const FORM_TYPES: { type: FormType; desc: string }[] = [
  { type: 'special_consideration', desc: 'Request consideration for assessments affected by illness, injury, or other serious circumstances' },
  { type: 'course_variation', desc: 'Change subjects, load, or study mode for the current or upcoming semester' },
  { type: 'credit_transfer', desc: 'Apply for credit from prior study or recognition of prior learning (RPL)' },
  { type: 'refund', desc: 'Submit a request for a partial or full refund of fees paid' },
  { type: 'consent', desc: 'Provide consent for the release of academic records or personal information' },
  { type: 'statutory_declaration', desc: 'Declare circumstances in lieu of official documentation' },
  { type: 'general_enquiry', desc: 'Submit a general academic enquiry to student services' },
];

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [activeFormType, setActiveFormType] = useState<FormType | null>(null);
  const [editingForm, setEditingForm] = useState<Form | null>(null);

  const loadForms = () =>
    supabase
      .from('forms')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setForms(data ?? []); setLoading(false); });

  useEffect(() => { loadForms(); }, []);

  const handleSave = async (data: SCData, submit: boolean) => {
    if (editingForm) {
      await supabase.from('forms').update({
        data,
        status: submit ? 'submitted' : 'draft',
        submitted_at: submit ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }).eq('id', editingForm.id);
    } else {
      await supabase.from('forms').insert({
        form_type: activeFormType,
        status: submit ? 'submitted' : 'draft',
        data,
        submitted_at: submit ? new Date().toISOString() : null,
      });
    }
    setActiveFormType(null);
    setEditingForm(null);
    loadForms();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Forms</h1>
          <p className="text-slate-500 text-sm mt-1">Submit and track your academic forms and requests</p>
        </div>
        <Button onClick={() => setShowNew(!showNew)}>
          <Plus className="w-4 h-4" /> New Form
        </Button>
      </div>

      {/* New form selector */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card p-5 overflow-hidden"
          >
            <h2 className="font-bold text-slate-900 mb-4">Select Form Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FORM_TYPES.map(({ type, desc }) => (
                <button
                  key={type}
                  onClick={() => { setActiveFormType(type); setShowNew(false); setEditingForm(null); }}
                  className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-all group"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                    <FileText className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{FORM_LABELS[type]}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : forms.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Forms Yet</h3>
          <p className="text-slate-500 text-sm mb-6">Submit a form using the button above</p>
        </div>
      ) : (
        <motion.div
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {forms.map((form) => (
            <motion.div key={form.id} variants={fadeUp} className="card p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                form.status === 'approved' ? 'bg-green-100' :
                form.status === 'rejected' ? 'bg-red-100' :
                form.status === 'under_review' ? 'bg-amber-100' :
                form.status === 'submitted' ? 'bg-blue-100' : 'bg-slate-100'
              }`}>
                {form.status === 'approved' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                 form.status === 'rejected' ? <AlertCircle className="w-5 h-5 text-red-500" /> :
                 <Clock className="w-5 h-5 text-slate-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{FORM_LABELS[form.form_type as FormType] ?? form.form_type}</p>
                  <StatusBadge status={form.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {form.submitted_at
                    ? `Submitted ${new Date(form.submitted_at).toLocaleDateString()}`
                    : `Draft saved ${new Date(form.updated_at).toLocaleDateString()}`}
                </p>
              </div>
              {form.status === 'draft' && form.form_type === 'special_consideration' && (
                <button
                  onClick={() => { setEditingForm(form); setActiveFormType(form.form_type as FormType); }}
                  className="btn-ghost text-sm px-3 py-1.5"
                >
                  Continue
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {activeFormType === 'special_consideration' && (
          <SpecialConsiderationForm
            onSave={handleSave}
            onClose={() => { setActiveFormType(null); setEditingForm(null); }}
            existing={editingForm?.data as Partial<SCData>}
          />
        )}
        {activeFormType && activeFormType !== 'special_consideration' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-8 text-center"
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{FORM_LABELS[activeFormType]}</h2>
              <p className="text-slate-500 text-sm mb-6">This form will be available in the next update. Please contact student services directly for urgent requests.</p>
              <Button onClick={() => setActiveFormType(null)}>Close</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
