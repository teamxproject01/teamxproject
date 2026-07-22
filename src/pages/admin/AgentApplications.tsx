import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, FileText, CheckCircle, XCircle, Eye, AlertCircle, MessageSquare, User, Briefcase,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import Button from '../../components/ui/Button';
import { AgentApplication, AgentApplicationStatus, AGENT_APPLICATION_STATUSES, AGENT_APP_STATUS_LABELS } from '../../types';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

function SourceBadge({ source }: { source: string }) {
  const isStudent = source === 'student';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isStudent ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
      {isStudent ? <User className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
      {isStudent ? 'Student' : 'Agent'}
    </span>
  );
}

export default function AgentApplications() {
  const [apps, setApps] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [agents, setAgents] = useState<{ user_id: string; agency_name: string }[]>([]);
  const [selected, setSelected] = useState<AgentApplication | null>(null);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const load = () => {
    Promise.all([
      supabase.from('agent_applications').select('*, courses(title, level, campus), agents!inner(agency_name)').order('created_at', { ascending: false }),
      supabase.from('agents').select('user_id, agency_name').eq('approval_status', 'approved'),
    ]).then(([appsRes, agentsRes]) => {
      setApps(appsRes.data ?? []);
      setAgents(agentsRes.data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = apps.filter(a => {
    const matchSearch = (a.student_full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.application_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.courses?.title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSource = sourceFilter === 'all' || (a as any).source === sourceFilter;
    return matchSearch && matchStatus && matchSource;
  });

  const updateStatus = async (app: AgentApplication, status: AgentApplicationStatus) => {
    setUpdating(true);
    await supabase.from('agent_applications').update({
      status,
      admin_comment: comment || app.admin_comment,
      updated_at: new Date().toISOString(),
    }).eq('id', app.id);

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: `agent_app_${status}`,
      target_table: 'agent_applications',
      target_id: app.id,
      metadata: { student: app.student_full_name, comment },
    });

    const appSource = (app as any).source ?? 'agent';
    const notifyUserId = appSource === 'student' ? (app as any).student_id : app.agent_id;
    const notificationTable = appSource === 'student' ? 'messages' : 'agent_notifications';

    if (appSource === 'student') {
      await supabase.from('messages').insert({
        student_id: notifyUserId,
        sender_role: 'admin',
        subject: 'Application Status Updated',
        content: `Your application (${app.application_id}) for ${app.courses?.title ?? 'your course'} has been updated to "${AGENT_APP_STATUS_LABELS[status]}".${comment ? ` Message: ${comment}` : ''}`,
        is_read: false,
      });
    } else {
      await supabase.from('agent_notifications').insert({
        user_id: notifyUserId,
        title: 'Application Status Updated',
        message: `Application ${app.application_id} for ${app.student_full_name} has been updated to "${AGENT_APP_STATUS_LABELS[status]}".${comment ? ` Comment: ${comment}` : ''}`,
        type: status === 'offer_received' ? 'offer' : status === 'enrolled' ? 'enrolment' : status === 'documents_required' ? 'document_request' : 'status_change',
      });
    }

    load();
    setSelected({ ...app, status, admin_comment: comment || app.admin_comment });
    setComment('');
    setUpdating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Review and process all student applications — submitted by students or agents</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, ID, or course…" className="input-field pl-10" />
        </div>
        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Sources</option>
          <option value="student">Student</option>
          <option value="agent">Agent</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Status</option>
          {AGENT_APPLICATION_STATUSES.map(s => <option key={s} value={s}>{AGENT_APP_STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No applications found</p>
            </div>
          ) : (
            filtered.map((app) => {
              const appSource = (app as any).source ?? 'agent';
              const agencyName = (app as any).agents?.agency_name;
              return (
                <motion.div
                  key={app.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  onClick={() => { setSelected(app); setComment(''); }}
                  className={`card p-4 cursor-pointer transition-all ${
                    selected?.id === app.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(app.student_full_name || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-slate-800 text-sm truncate">{app.student_full_name || 'Unknown'}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <SourceBadge source={appSource} />
                          <AgentAppStatusBadge status={app.status} />
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {app.application_id ?? '—'} • {app.courses?.title ?? 'No course'}
                        {appSource === 'agent' && agencyName ? ` • via ${agencyName}` : ''}
                      </p>
                      <p className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Application Detail</h3>
                <SourceBadge source={(selected as any).source ?? 'agent'} />
              </div>

              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
                {(selected.student_full_name || 'U').charAt(0)}
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Status</span>
                  <AgentAppStatusBadge status={selected.status} />
                </div>
                <div><p className="text-xs text-slate-400">Student</p><p className="font-semibold text-slate-800">{selected.student_full_name}</p></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="text-slate-700">{selected.student_email || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Phone</p><p className="text-slate-700">{selected.student_phone || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Course</p><p className="font-semibold text-slate-800">{selected.courses?.title ?? '—'}</p></div>
                <div><p className="text-xs text-slate-400">Intake</p><p className="text-slate-700">{selected.preferred_intake || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Nationality</p><p className="text-slate-700">{selected.student_nationality || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Passport</p><p className="text-slate-700">{selected.student_passport_number || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Education</p><p className="text-slate-700">{selected.student_education_level || '—'}</p></div>
                <div><p className="text-xs text-slate-400">English Test</p><p className="text-slate-700">{selected.student_english_test_status || '—'}</p></div>
                {selected.english_overall != null && (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-slate-400">English Scores</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${selected.english_meets_standard ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {selected.english_meets_standard ? 'Meets Standard' : 'Below Standard'}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-xs text-center">
                      <div><p className="text-slate-400">R</p><p className="font-semibold text-slate-800">{selected.english_reading ?? '—'}</p></div>
                      <div><p className="text-slate-400">W</p><p className="font-semibold text-slate-800">{selected.english_writing ?? '—'}</p></div>
                      <div><p className="text-slate-400">S</p><p className="font-semibold text-slate-800">{selected.english_speaking ?? '—'}</p></div>
                      <div><p className="text-slate-400">L</p><p className="font-semibold text-slate-800">{selected.english_listening ?? '—'}</p></div>
                      <div><p className="text-slate-400">O</p><p className="font-semibold text-slate-800">{selected.english_overall ?? '—'}</p></div>
                    </div>
                  </div>
                )}
                <div><p className="text-xs text-slate-400">Application ID</p><p className="text-slate-700 font-mono">{selected.application_id ?? '—'}</p></div>
                <div><p className="text-xs text-slate-400">Applied</p><p className="text-slate-700">{new Date(selected.created_at).toLocaleString()}</p></div>
                {selected.agent_notes && <div><p className="text-xs text-slate-400">Notes</p><p className="text-slate-700">{selected.agent_notes}</p></div>}
                {selected.admin_comment && <div className="p-3 bg-amber-50 rounded-xl"><p className="text-xs text-amber-600">Current Comment</p><p className="text-sm text-slate-700">{selected.admin_comment}</p></div>}
              </div>

              {!['enrolled', 'cancelled', 'rejected'].includes(selected.status) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <label className="label flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Admin Comment</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field min-h-[60px] resize-y" placeholder="Add a comment for the applicant…" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500">Update Status</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selected.status !== 'under_review' && (
                      <Button size="sm" variant="secondary" loading={updating} onClick={() => updateStatus(selected, 'under_review')}>
                        <Eye className="w-4 h-4" /> Under Review
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" className="bg-orange-500 hover:bg-orange-600 text-white border-0" loading={updating} onClick={() => updateStatus(selected, 'documents_required')}>
                      <AlertCircle className="w-4 h-4" /> Docs Required
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateStatus(selected, 'documents_approved')}>
                      <CheckCircle className="w-4 h-4" /> Docs Approved
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-cyan-500 hover:bg-cyan-600 text-white border-0" loading={updating} onClick={() => updateStatus(selected, 'sent_to_college')}>
                      Sent to College
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-purple-500 hover:bg-purple-600 text-white border-0" loading={updating} onClick={() => updateStatus(selected, 'offer_pending')}>
                      Offer Pending
                    </Button>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateStatus(selected, 'offer_received')}>
                      <CheckCircle className="w-4 h-4" /> Offer Received
                    </Button>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" loading={updating} onClick={() => updateStatus(selected, 'enrolled')}>
                      <CheckCircle className="w-4 h-4" /> Enrolled
                    </Button>
                    <Button size="sm" variant="danger" loading={updating} onClick={() => updateStatus(selected, 'rejected')}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Eye className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select an application to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
