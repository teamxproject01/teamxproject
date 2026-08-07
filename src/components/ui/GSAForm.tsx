import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ShieldCheck, AlertCircle, Info, FileText, User, Briefcase } from 'lucide-react';
import type { GSAData, PreviousCoERecord, PreviousAustraliaStudyRecord, StudyGapRecord } from '../types';

interface GSAFormProps {
  data: GSAData;
  onChange: (data: GSAData) => void;
  isAgentSubmitted: boolean;
  autoFill: {
    familyName: string;
    givenNames: string;
    dateOfBirth: string;
    courseTitle: string;
    agentName?: string;
    agentAgency?: string;
  };
}

function YesNoToggle({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => onChange(true)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${value === true ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400'}`}>
        Yes
      </button>
      <button type="button" onClick={() => onChange(false)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${value === false ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-blue-400'}`}>
        No
      </button>
    </div>
  );
}

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? 'bg-blue-700 border-blue-700' : 'border-slate-300 group-hover:border-blue-400'}`}>
          {checked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
      </div>
      <span className="text-sm text-slate-600 leading-relaxed">{label}</span>
    </label>
  );
}

function SectionCard({ icon: Icon, title, children, defaultOpen = true }: { icon: any; title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card p-5">
      <button type="button" onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full text-left">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-blue-700" />
        </div>
        <h3 className="font-bold text-slate-800 text-sm flex-1">{title}</h3>
        <svg className={`w-5 h-5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="pt-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RepeatableTable<T>({
  rows, onChange, blank, render, columns,
}: {
  rows: T[];
  onChange: (rows: T[]) => void;
  blank: () => T;
  render: (row: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  columns: string[];
}) {
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Entry {i + 1}</span>
            {rows.length > 1 && (
              <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {render(row, (patch) => onChange(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r)))}
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, blank()])} className="flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800">
        <Plus className="w-4 h-4" /> Add another
      </button>
    </div>
  );
}

const inputClass = 'input-field';
const labelClass = 'label';

export default function GSAForm({ data, onChange, isAgentSubmitted, autoFill }: GSAFormProps) {
  const set = <K extends keyof GSAData>(key: K, value: GSAData[K]) => onChange({ ...data, [key]: value });

  const isUnder18 = (() => {
    if (!autoFill.dateOfBirth) return false;
    const dob = new Date(autoFill.dateOfBirth);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970) < 18;
  })();

  return (
    <div className="space-y-4">
      {/* Auto-fill banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700">
          <p className="font-semibold mb-1">Auto-filled from your application</p>
          <p className="text-xs text-slate-500">
            Name, date of birth, and course title are automatically carried over from your application details.
            {isAgentSubmitted && ' Agent details are also pre-filled from the agent account.'}
            {isUnder18 && ' As you are under 18, the Student Declaration must be signed by a parent or legal guardian.'}
          </p>
        </div>
      </div>

      {/* Auto-filled fields display */}
      <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
        <div>
          <p className="text-xs text-slate-400">Family Name / Given Names</p>
          <p className="text-sm text-slate-700 font-medium">{autoFill.familyName} {autoFill.givenNames}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Date of Birth</p>
          <p className="text-sm text-slate-700 font-medium">{autoFill.dateOfBirth || '—'}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Course Title</p>
          <p className="text-sm text-slate-700 font-medium">{autoFill.courseTitle || '—'}</p>
        </div>
        {isAgentSubmitted && (
          <div>
            <p className="text-xs text-slate-400">Agent</p>
            <p className="text-sm text-slate-700 font-medium">{autoFill.agentName || '—'} ({autoFill.agentAgency || '—'})</p>
          </div>
        )}
      </div>

      {/* Section 1: Immigration History */}
      <SectionCard icon={ShieldCheck} title="Section 1: Immigration History">
        <div>
          <label className={labelClass}>Have you ever had a visa refused, cancelled, or been deported from any country?</label>
          <YesNoToggle value={data.gsa_immigration_history_has} onChange={(v) => set('gsa_immigration_history_has', v)} />
        </div>
        <AnimatePresence>
          {data.gsa_immigration_history_has === true && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2">
                <label className={labelClass}>Details</label>
                <textarea value={data.gsa_immigration_history_details} onChange={(e) => set('gsa_immigration_history_details', e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="Provide full details including country, visa type, date, and reason…" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {data.gsa_immigration_history_has === true && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">This response will flag your application for manual staff review.</p>
          </div>
        )}
      </SectionCard>

      {/* Section 2: Choice of Course */}
      <SectionCard icon={FileText} title="Section 2: Choice of Course">
        <div>
          <label className={labelClass}>Why did you choose this course and MIHE? What are your study and career goals?</label>
          <textarea value={data.gsa_choice_reason} onChange={(e) => set('gsa_choice_reason', e.target.value)} className={`${inputClass} min-h-[100px] resize-y`} placeholder="Explain your motivation for choosing this course, why MIHE, and how it aligns with your future career plans…" />
        </div>
      </SectionCard>

      {/* Section 3: Previous CoE */}
      <SectionCard icon={FileText} title="Section 3: Previous CoE from Another Institution">
        <div>
          <label className={labelClass}>Have you held a CoE (Confirmation of Enrolment) from another institution?</label>
          <YesNoToggle value={data.gsa_has_previous_coe} onChange={(v) => set('gsa_has_previous_coe', v)} />
        </div>
        <AnimatePresence>
          {data.gsa_has_previous_coe === true && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2">
                <RepeatableTable<PreviousCoERecord>
                  rows={data.gsa_previous_coes.length > 0 ? data.gsa_previous_coes : [{ institution: '', course: '', start_date: '', end_date: '', reason_for_withdrawing: '' }]}
                  onChange={(rows) => set('gsa_previous_coes', rows)}
                  blank={() => ({ institution: '', course: '', start_date: '', end_date: '', reason_for_withdrawing: '' })}
                  columns={["Institution", "Course", "Start Date", "End Date", "Reason for Withdrawing"]}
                  render={(row, update) => (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Institution</label>
                        <input type="text" value={row.institution} onChange={(e) => update({ institution: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Course</label>
                        <input type="text" value={row.course} onChange={(e) => update({ course: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Start Date</label>
                        <input type="date" value={row.start_date} onChange={(e) => update({ start_date: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input type="date" value={row.end_date} onChange={(e) => update({ end_date: e.target.value })} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Reason for Withdrawing</label>
                        <textarea value={row.reason_for_withdrawing} onChange={(e) => update({ reason_for_withdrawing: e.target.value })} className={`${inputClass} min-h-[60px] resize-y`} />
                      </div>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Section 4: Previous Study in Australia */}
      <SectionCard icon={Briefcase} title="Section 4: Previous Study in Australia">
        <div>
          <label className={labelClass}>Have you previously studied in Australia?</label>
          <YesNoToggle value={data.gsa_studied_in_australia} onChange={(v) => set('gsa_studied_in_australia', v)} />
        </div>
        <AnimatePresence>
          {data.gsa_studied_in_australia === true && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2">
                <RepeatableTable<PreviousAustraliaStudyRecord>
                  rows={data.gsa_previous_australia_study.length > 0 ? data.gsa_previous_australia_study : [{ institution: '', course: '', start_date: '', end_date: '' }]}
                  onChange={(rows) => set('gsa_previous_australia_study', rows)}
                  blank={() => ({ institution: '', course: '', start_date: '', end_date: '' })}
                  columns={["Institution", "Course", "Start Date", "End Date"]}
                  render={(row, update) => (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Institution</label>
                        <input type="text" value={row.institution} onChange={(e) => update({ institution: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Course</label>
                        <input type="text" value={row.course} onChange={(e) => update({ course: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Start Date</label>
                        <input type="date" value={row.start_date} onChange={(e) => update({ start_date: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input type="date" value={row.end_date} onChange={(e) => update({ end_date: e.target.value })} className={inputClass} />
                      </div>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Section 5: Gaps in Studies */}
      <SectionCard icon={AlertCircle} title="Section 5: Gaps in Studies">
        <div>
          <label className={labelClass}>Have there been any gaps in your studies?</label>
          <YesNoToggle value={data.gsa_has_study_gaps} onChange={(v) => set('gsa_has_study_gaps', v)} />
        </div>
        <AnimatePresence>
          {data.gsa_has_study_gaps === true && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="pt-2">
                <RepeatableTable<StudyGapRecord>
                  rows={data.gsa_study_gaps.length > 0 ? data.gsa_study_gaps : [{ start_date: '', end_date: '', details_of_gap: '' }]}
                  onChange={(rows) => set('gsa_study_gaps', rows)}
                  blank={() => ({ start_date: '', end_date: '', details_of_gap: '' })}
                  columns={["Start Date", "End Date", "Details of Gap"]}
                  render={(row, update) => (
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Start Date</label>
                        <input type="date" value={row.start_date} onChange={(e) => update({ start_date: e.target.value })} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <input type="date" value={row.end_date} onChange={(e) => update({ end_date: e.target.value })} className={inputClass} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Details of Gap</label>
                        <textarea value={row.details_of_gap} onChange={(e) => update({ details_of_gap: e.target.value })} className={`${inputClass} min-h-[60px] resize-y`} placeholder="Explain what you were doing during this period…" />
                      </div>
                    </div>
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Section 6: Current Circumstances */}
      <SectionCard icon={User} title="Section 6: Current Circumstances">
        <div>
          <label className={labelClass}>Describe your current circumstances (employment, study, living situation)</label>
          <textarea value={data.gsa_current_circumstances} onChange={(e) => set('gsa_current_circumstances', e.target.value)} className={`${inputClass} min-h-[80px] resize-y`} placeholder="What are you currently doing? Are you working, studying, or both? Describe your living situation…" />
        </div>
      </SectionCard>

      {/* Section 7: Ability to Afford */}
      <SectionCard icon={Briefcase} title="Section 7: Ability to Afford">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Funding Source</label>
            <input type="text" value={data.gsa_funding_source} onChange={(e) => set('gsa_funding_source', e.target.value)} className={inputClass} placeholder="e.g. Family savings, bank loan, scholarship, personal savings…" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Estimated Tuition Funds (AUD)</label>
              <input type="text" value={data.gsa_estimated_tuition} onChange={(e) => set('gsa_estimated_tuition', e.target.value)} className={inputClass} placeholder="e.g. $50,000" />
            </div>
            <div>
              <label className={labelClass}>Estimated Living Funds (AUD)</label>
              <input type="text" value={data.gsa_estimated_living} onChange={(e) => set('gsa_estimated_living', e.target.value)} className={inputClass} placeholder="e.g. $25,000/year" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Additional Financial Details</label>
            <textarea value={data.gsa_financial_details} onChange={(e) => set('gsa_financial_details', e.target.value)} className={`${inputClass} min-h-[60px] resize-y`} placeholder="Any additional information about your financial capacity…" />
          </div>
        </div>
      </SectionCard>

      {/* Section 8: Student Declaration */}
      <SectionCard icon={ShieldCheck} title="Section 8: Student Declaration">
        <div className="space-y-3">
          {isUnder18 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">As the student is under 18, this declaration must be signed by a parent or legal guardian.</p>
            </div>
          )}
          <Checkbox checked={data.gsa_student_decl_1} onChange={(v) => set('gsa_student_decl_1', v)} label="I understand my obligations under the Australian student visa conditions." />
          <Checkbox checked={data.gsa_student_decl_2} onChange={(v) => set('gsa_student_decl_2', v)} label="I understand I must maintain enrollment and satisfactory academic progress." />
          <Checkbox checked={data.gsa_student_decl_3} onChange={(v) => set('gsa_student_decl_3', v)} label="I understand I must have sufficient funds to cover tuition and living expenses." />
          <Checkbox checked={data.gsa_student_decl_4} onChange={(v) => set('gsa_student_decl_4', v)} label="I understand I must notify MIHE of any change in my circumstances." />
          {isUnder18 && (
            <Checkbox checked={data.gsa_student_decl_guardian} onChange={(v) => set('gsa_student_decl_guardian', v)} label="I confirm I am the parent or legal guardian of the student and am signing on their behalf." />
          )}
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className={labelClass}>Print Name</label>
              <input type="text" value={data.gsa_student_decl_name} onChange={(e) => set('gsa_student_decl_name', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={data.gsa_student_decl_date} onChange={(e) => set('gsa_student_decl_date', e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Signature (type your full name)</label>
            <input type="text" value={data.gsa_student_decl_signature} onChange={(e) => set('gsa_student_decl_signature', e.target.value)} className={inputClass} placeholder="Type your full name as signature" />
          </div>
        </div>
      </SectionCard>

      {/* Section 9: Agent Declaration (conditional) */}
      {isAgentSubmitted && (
        <SectionCard icon={ShieldCheck} title="Section 9: Agent Declaration">
          <div className="space-y-3">
            <Checkbox checked={data.gsa_agent_decl_1} onChange={(v) => set('gsa_agent_decl_1', v)} label="I confirm that the information provided in this application is accurate to the best of my knowledge." />
            <Checkbox checked={data.gsa_agent_decl_2} onChange={(v) => set('gsa_agent_decl_2', v)} label="I have not provided false or misleading information." />
            <Checkbox checked={data.gsa_agent_decl_3} onChange={(v) => set('gsa_agent_decl_3', v)} label="I understand my obligations as an education agent under the National Code of Practice." />
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className={labelClass}>Print Name</label>
                <input type="text" value={data.gsa_agent_decl_name} onChange={(e) => set('gsa_agent_decl_name', e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input type="date" value={data.gsa_agent_decl_date} onChange={(e) => set('gsa_agent_decl_date', e.target.value)} className={inputClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Signature (type your full name)</label>
              <input type="text" value={data.gsa_agent_decl_signature} onChange={(e) => set('gsa_agent_decl_signature', e.target.value)} className={inputClass} placeholder="Type your full name as signature" />
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
