import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ShieldCheck, AlertCircle, CheckCircle, XCircle, Clock, FileText,
  User, Briefcase, Users, ChevronRight, ClipboardCheck, PenLine,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { computeGSAStatus } from '../../lib/gsa';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface GSAApplication {
  id: string;
  student_full_name: string;
  student_dob?: string;
  student_email?: string;
  course_id?: string;
  agent_id: string;
  source: string;
  status: string;
  created_at: string;
  courses?: { title: string };
  agents?: { agency_name: string; contact_person: string };
  gsa_status?: string | null;
  gsa_admin_notes?: string | null;
  gsa_immigration_history_has?: boolean | null;
  gsa_immigration_history_details?: string | null;
  gsa_choice_reason?: string | null;
  gsa_has_previous_coe?: boolean | null;
  gsa_previous_coes?: any[] | null;
  gsa_studied_in_australia?: boolean | null;
  gsa_previous_australia_study?: any[] | null;
  gsa_has_study_gaps?: boolean | null;
  gsa_study_gaps?: any[] | null;
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
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const display = value && String(value).trim() ? value : '—';
  const isDash = display === '—';
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm ${isDash ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>{display}</p>
    </div>
  );
}

function YesNoBadge({ value }: { value?: boolean | null }) {
  if (value === null || value === undefined) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {value ? 'Yes' : 'No'}
    </span>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-t border-slate-100">
      <Icon className="w-4 h-4 text-blue-700" />
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</h4>
    </div>
  );
}

const GSA_STATUS_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-500',
  pending: 'bg-amber-100 text-amber-700',
  reviewed: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function GSAAdmin() {
  const [apps, setApps] = useState<GSAApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<GSAApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = async () => {
    const { data: appsData, error } = await supabase
      .from('agent_applications')
      .select('*, courses (title)')
      .neq('status', 'draft')
      .not('gsa_status', 'is', null)
      .neq('gsa_status', 'not_started')
      .order('created_at', { ascending: false });

    if (error || !appsData) {
      setApps([]);
      setLoading(false);
      return;
    }

    // Fetch agent info separately (no direct FK from agent_applications to agents table)
    const agentIds = [...new Set(appsData.map((a: any) => a.agent_id).filter(Boolean))] as string[];
    let agentMap: Record<string, { agency_name: string; contact_person: string }> = {};
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('agents')
        .select('user_id, agency_name, contact_person')
        .in('user_id', agentIds);
      agentMap = Object.fromEntries((agents ?? []).map((a: any) => [a.user_id, a]));
    }

    setApps(appsData.map((a: any) => ({ ...a, agents: agentMap[a.agent_id] ?? null })) as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selected) setAdminNotes(selected.gsa_admin_notes ?? '');
  }, [selected?.id]);

  const filtered = apps.filter(a => {
    const matchSearch = (a.student_full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.courses?.title ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.agents?.agency_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.gsa_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateGSAStatus = async (appId: string, status: string) => {
    setUpdating(true);
    await supabase.from('agent_applications').update({
      gsa_status: status,
      gsa_admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', appId);

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: `gsa_${status}`,
      target_table: 'agent_applications',
      target_id: appId,
      metadata: { student_name: selected?.student_full_name },
    });

    load();
    setSelected({ ...selected!, gsa_status: status, gsa_admin_notes: adminNotes });
    setUpdating(false);
  };

  const statCards = [
    { label: 'Total GSA Records', value: apps.length, icon: ShieldCheck, color: 'bg-blue-700' },
    { label: 'Pending Review', value: apps.filter(a => a.gsa_status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Reviewed', value: apps.filter(a => a.gsa_status === 'reviewed').length, icon: ClipboardCheck, color: 'bg-blue-500' },
    { label: 'Approved', value: apps.filter(a => a.gsa_status === 'approved').length, icon: CheckCircle, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">GSA — Genuine Student Assessment</h1>
        <p className="text-slate-500 text-sm mt-1">Review and assess genuine student applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className="text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-xl font-bold text-slate-900">{loading ? '—' : value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, course, or agent…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All GSA Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No GSA records found</p>
            </div>
          ) : (
            filtered.map((app) => {
              const gsaResult = computeGSAStatus(app);
              return (
                <motion.div
                  key={app.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => setSelected(app)}
                  className={`card p-4 cursor-pointer transition-all ${selected?.id === app.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">{app.student_full_name}</p>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {gsaResult.status === 'green' && <CheckCircle className="w-4 h-4 text-green-600" />}
                          {gsaResult.status === 'yellow' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                          {gsaResult.status === 'red' && <XCircle className="w-4 h-4 text-red-500" />}
                          <span className={`badge text-xs ${GSA_STATUS_COLORS[app.gsa_status ?? 'not_started']}`}>{app.gsa_status ?? 'not_started'}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{app.courses?.title ?? 'No course'}</p>
                      <p className="text-xs text-slate-400">
                        {app.source === 'agent' ? `Agent: ${app.agents?.agency_name ?? '—'}` : 'Direct student'} • {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">GSA Detail</h3>
                <div className="flex items-center gap-2">
                  {(() => {
                    const r = computeGSAStatus(selected);
                    return (
                      <span className={`badge text-xs ${r.status === 'green' ? 'bg-green-100 text-green-700' : r.status === 'yellow' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                        {r.label}
                      </span>
                    );
                  })()}
                  <span className={`badge ${GSA_STATUS_COLORS[selected.gsa_status ?? 'not_started']}`}>{selected.gsa_status ?? 'not_started'}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {/* Basic info */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Student Name" value={selected.student_full_name} />
                  <InfoRow label="Date of Birth" value={selected.student_dob} />
                  <InfoRow label="Course" value={selected.courses?.title} />
                  <InfoRow label="Source" value={selected.source === 'agent' ? `Agent: ${selected.agents?.agency_name ?? '—'}` : 'Direct student'} />
                  {selected.source === 'agent' && <InfoRow label="Agent Contact" value={selected.agents?.contact_person} />}
                  <InfoRow label="Email" value={selected.student_email} />
                </div>

                {/* Section 1: Immigration History */}
                <SectionHeader icon={ShieldCheck} title="Immigration History" />
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400">Prior visa refusal/cancellation/deportation:</p>
                  <YesNoBadge value={selected.gsa_immigration_history_has} />
                </div>
                {selected.gsa_immigration_history_has && (
                  <InfoRow label="Details" value={selected.gsa_immigration_history_details} />
                )}
                {selected.gsa_immigration_history_has && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">Flagged for manual review due to immigration history.</p>
                  </div>
                )}

                {/* Section 2: Choice of Course */}
                <SectionHeader icon={FileText} title="Choice of Course" />
                <InfoRow label="Reason for course choice" value={selected.gsa_choice_reason} />

                {/* Section 3: Previous CoE */}
                <SectionHeader icon={FileText} title="Previous CoE" />
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400">Held previous CoE:</p>
                  <YesNoBadge value={selected.gsa_has_previous_coe} />
                </div>
                {selected.gsa_has_previous_coe && (selected.gsa_previous_coes ?? []).length > 0 && (
                  <div className="space-y-2">
                    {selected.gsa_previous_coes!.map((coe, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{coe.institution} — {coe.course}</p>
                        <p className="text-xs text-slate-500">{coe.start_date} to {coe.end_date}</p>
                        <p className="text-xs text-slate-500">Reason for withdrawing: {coe.reason_for_withdrawing}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 4: Previous Study in Australia */}
                <SectionHeader icon={Briefcase} title="Previous Study in Australia" />
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400">Previously studied in Australia:</p>
                  <YesNoBadge value={selected.gsa_studied_in_australia} />
                </div>
                {selected.gsa_studied_in_australia && (selected.gsa_previous_australia_study ?? []).length > 0 && (
                  <div className="space-y-2">
                    {selected.gsa_previous_australia_study!.map((s, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-800">{s.institution} — {s.course}</p>
                        <p className="text-xs text-slate-500">{s.start_date} to {s.end_date}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 5: Gaps in Studies */}
                <SectionHeader icon={AlertCircle} title="Gaps in Studies" />
                <div className="flex items-center gap-3">
                  <p className="text-xs text-slate-400">Has study gaps:</p>
                  <YesNoBadge value={selected.gsa_has_study_gaps} />
                </div>
                {selected.gsa_has_study_gaps && (selected.gsa_study_gaps ?? []).length > 0 && (
                  <div className="space-y-2">
                    {selected.gsa_study_gaps!.map((g, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500">{g.start_date} to {g.end_date}</p>
                        <p className="text-sm text-slate-700">{g.details_of_gap}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Section 6: Current Circumstances */}
                <SectionHeader icon={User} title="Current Circumstances" />
                <InfoRow label="Current circumstances" value={selected.gsa_current_circumstances} />

                {/* Section 7: Ability to Afford */}
                <SectionHeader icon={Briefcase} title="Ability to Afford" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Funding Source" value={selected.gsa_funding_source} />
                  <InfoRow label="Estimated Tuition" value={selected.gsa_estimated_tuition} />
                  <InfoRow label="Estimated Living" value={selected.gsa_estimated_living} />
                </div>
                <InfoRow label="Additional Financial Details" value={selected.gsa_financial_details} />

                {/* Section 8: Student Declaration */}
                <SectionHeader icon={PenLine} title="Student Declaration" />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_student_decl_1} /><p className="text-xs text-slate-600">Understands visa obligations</p></div>
                  <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_student_decl_2} /><p className="text-xs text-slate-600">Must maintain enrollment & progress</p></div>
                  <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_student_decl_3} /><p className="text-xs text-slate-600">Sufficient funds for tuition & living</p></div>
                  <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_student_decl_4} /><p className="text-xs text-slate-600">Must notify MIHE of changes</p></div>
                  {selected.gsa_student_decl_guardian && <div className="flex items-center gap-2"><YesNoBadge value={true} /><p className="text-xs text-slate-600">Signed by parent/guardian (student under 18)</p></div>}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Print Name" value={selected.gsa_student_decl_name} />
                  <InfoRow label="Date" value={selected.gsa_student_decl_date} />
                  <InfoRow label="Signature" value={selected.gsa_student_decl_signature} />
                </div>

                {/* Section 9: Agent Declaration */}
                {selected.source === 'agent' && (
                  <>
                    <SectionHeader icon={ShieldCheck} title="Agent Declaration" />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_agent_decl_1} /><p className="text-xs text-slate-600">Info is accurate to best of knowledge</p></div>
                      <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_agent_decl_2} /><p className="text-xs text-slate-600">No false or misleading information</p></div>
                      <div className="flex items-center gap-2"><YesNoBadge value={selected.gsa_agent_decl_3} /><p className="text-xs text-slate-600">Understands agent obligations</p></div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <InfoRow label="Agent Print Name" value={selected.gsa_agent_decl_name} />
                      <InfoRow label="Agent Date" value={selected.gsa_agent_decl_date} />
                      <InfoRow label="Agent Signature" value={selected.gsa_agent_decl_signature} />
                    </div>
                  </>
                )}

                {/* Admin notes */}
                <SectionHeader icon={ClipboardCheck} title="Admin Assessment" />
                <div>
                  <label className="label">Internal Notes</label>
                  <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="input-field min-h-[80px] resize-y" placeholder="Add internal assessment notes…" />
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Assessment Actions</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary" loading={updating} onClick={() => updateGSAStatus(selected.id, 'reviewed')}>
                      Mark Reviewed
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateGSAStatus(selected.id, 'approved')}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" loading={updating} onClick={() => updateGSAStatus(selected.id, 'rejected')}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                  <button onClick={() => navigate(`/admin/applications`)} className="w-full text-xs text-blue-700 font-semibold hover:text-blue-800 flex items-center justify-center gap-1 pt-2">
                    Go to Applications <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a GSA record to review the full assessment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
