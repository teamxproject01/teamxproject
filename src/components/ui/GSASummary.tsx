import { ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { computeGSAStatus } from '../../lib/gsa';

interface GSASummaryProps {
  app: any;
  defaultOpen?: boolean;
}

function YesNo({ value }: { value: boolean | null | undefined }) {
  if (value === true) return <span className="text-amber-600 font-medium">Yes</span>;
  if (value === false) return <span className="text-green-600 font-medium">No</span>;
  return <span className="text-slate-400">—</span>;
}

function BoolCheck({ value }: { value: boolean | null | undefined }) {
  return value ? <span className="text-green-600 font-medium">Checked</span> : <span className="text-red-500 font-medium">Not checked</span>;
}

export default function GSASummary({ app, defaultOpen = false }: GSASummaryProps) {
  const [open, setOpen] = useState(defaultOpen);

  const gsaStatus = computeGSAStatus(app);
  const statusColor =
    gsaStatus.status === 'green' ? 'bg-green-100 text-green-700' :
    gsaStatus.status === 'yellow' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700';

  const hasGSAData = app.gsa_choice_reason || app.gsa_current_circumstances || app.gsa_funding_source ||
    app.gsa_immigration_history_has !== null || app.gsa_has_previous_coe !== null;

  if (!hasGSAData) {
    return (
      <div className="card p-4">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4" />
          <p className="text-sm">No GSA data submitted</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-700" />
          <h3 className="font-bold text-slate-900">Genuine Student Assessment (GSA)</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{gsaStatus.label}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 text-sm">
          <p className="text-xs text-slate-400 italic">{gsaStatus.reason}</p>

          {/* Immigration History */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Immigration History</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Has immigration history?</span><YesNo value={app.gsa_immigration_history_has} /></div>
              {app.gsa_immigration_history_has && app.gsa_immigration_history_details && (
                <div><p className="text-slate-500 text-xs mt-1">Details:</p><p className="text-slate-700">{app.gsa_immigration_history_details}</p></div>
              )}
            </div>
          </div>

          {/* Choice of Course */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Choice of Course</p>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-700">{app.gsa_choice_reason || '—'}</p>
            </div>
          </div>

          {/* Previous CoE */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Previous CoE</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Has previous CoE?</span><YesNo value={app.gsa_has_previous_coe} /></div>
              {app.gsa_has_previous_coe && Array.isArray(app.gsa_previous_coes) && app.gsa_previous_coes.length > 0 && (
                <div className="mt-2 space-y-2">
                  {app.gsa_previous_coes.map((coe: any, i: number) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-xs font-medium text-slate-700">{coe.institution} — {coe.course}</p>
                      <p className="text-xs text-slate-500">{coe.start_date} to {coe.end_date}</p>
                      <p className="text-xs text-slate-500">Reason: {coe.reason_for_withdrawing}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Previous Study in Australia */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Previous Study in Australia</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Studied in Australia?</span><YesNo value={app.gsa_studied_in_australia} /></div>
              {app.gsa_studied_in_australia && Array.isArray(app.gsa_previous_australia_study) && app.gsa_previous_australia_study.length > 0 && (
                <div className="mt-2 space-y-2">
                  {app.gsa_previous_australia_study.map((s: any, i: number) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-xs font-medium text-slate-700">{s.institution} — {s.course}</p>
                      <p className="text-xs text-slate-500">{s.start_date} to {s.end_date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Study Gaps */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gaps in Studies</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Has study gaps?</span><YesNo value={app.gsa_has_study_gaps} /></div>
              {app.gsa_has_study_gaps && Array.isArray(app.gsa_study_gaps) && app.gsa_study_gaps.length > 0 && (
                <div className="mt-2 space-y-2">
                  {app.gsa_study_gaps.map((g: any, i: number) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500">{g.start_date} to {g.end_date}</p>
                      <p className="text-xs text-slate-700">{g.details_of_gap}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Current Circumstances */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Circumstances</p>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-slate-700">{app.gsa_current_circumstances || '—'}</p>
            </div>
          </div>

          {/* Financial */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ability to Afford</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div><span className="text-slate-500">Funding Source:</span> <span className="text-slate-700">{app.gsa_funding_source || '—'}</span></div>
              <div><span className="text-slate-500">Estimated Tuition:</span> <span className="text-slate-700">{app.gsa_estimated_tuition || '—'}</span></div>
              <div><span className="text-slate-500">Estimated Living:</span> <span className="text-slate-700">{app.gsa_estimated_living || '—'}</span></div>
              {app.gsa_financial_details && <div><span className="text-slate-500">Details:</span> <span className="text-slate-700">{app.gsa_financial_details}</span></div>}
            </div>
          </div>

          {/* Student Declaration */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Student Declaration</p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Decl 1</span><BoolCheck value={app.gsa_student_decl_1} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Decl 2</span><BoolCheck value={app.gsa_student_decl_2} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Decl 3</span><BoolCheck value={app.gsa_student_decl_3} /></div>
                <div className="flex justify-between"><span className="text-slate-500">Decl 4</span><BoolCheck value={app.gsa_student_decl_4} /></div>
              </div>
              <div><span className="text-slate-500">Name:</span> <span className="text-slate-700">{app.gsa_student_decl_name || '—'}</span></div>
              <div><span className="text-slate-500">Date:</span> <span className="text-slate-700">{app.gsa_student_decl_date || '—'}</span></div>
              <div><span className="text-slate-500">Signature:</span> <span className="text-slate-700 font-mono">{app.gsa_student_decl_signature || '—'}</span></div>
              {app.gsa_student_decl_guardian !== undefined && (
                <div><span className="text-slate-500">Guardian signed:</span> <BoolCheck value={app.gsa_student_decl_guardian} /></div>
              )}
            </div>
          </div>

          {/* Agent Declaration (only for agent-submitted apps) */}
          {app.source === 'agent' && (app.gsa_agent_decl_1 !== undefined || app.gsa_agent_decl_name) && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Agent Declaration</p>
              <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <div className="flex justify-between"><span className="text-slate-500">Decl 1</span><BoolCheck value={app.gsa_agent_decl_1} /></div>
                  <div className="flex justify-between"><span className="text-slate-500">Decl 2</span><BoolCheck value={app.gsa_agent_decl_2} /></div>
                  <div className="flex justify-between"><span className="text-slate-500">Decl 3</span><BoolCheck value={app.gsa_agent_decl_3} /></div>
                </div>
                <div><span className="text-slate-500">Name:</span> <span className="text-slate-700">{app.gsa_agent_decl_name || '—'}</span></div>
                <div><span className="text-slate-500">Date:</span> <span className="text-slate-700">{app.gsa_agent_decl_date || '—'}</span></div>
                <div><span className="text-slate-500">Signature:</span> <span className="text-slate-700 font-mono">{app.gsa_agent_decl_signature || '—'}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
