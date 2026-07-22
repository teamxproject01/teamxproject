import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, PlusCircle, FolderOpen } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import { AgentApplication, AGENT_APPLICATION_STATUSES, AGENT_APP_STATUS_LABELS } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function MyApplications() {
  const { profile } = useAuth();
  const [apps, setApps] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_applications')
      .select('*, courses(title, level, campus)')
      .eq('agent_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data ?? []); setLoading(false); });
  }, [profile]);

  const filtered = apps.filter(a => {
    const matchSearch = a.student_full_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.application_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.courses?.title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCards = [
    { label: 'Total', value: apps.length, color: 'bg-blue-600' },
    { label: 'Draft', value: apps.filter(a => a.status === 'draft').length, color: 'bg-slate-400' },
    { label: 'Pending', value: apps.filter(a => ['submitted', 'under_review', 'documents_required', 'documents_approved', 'sent_to_college', 'offer_pending'].includes(a.status)).length, color: 'bg-amber-500' },
    { label: 'Approved', value: apps.filter(a => ['offer_received', 'enrolled'].includes(a.status)).length, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage all your student applications</p>
        </div>
        <Link to="/agent/new-application" className="btn-primary text-sm px-4 py-2.5 flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Application
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center mb-2`}>
              <FileText className="w-4 h-4 text-white" />
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
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student, ID, or course…" className="input-field pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-10 pr-8 cursor-pointer appearance-none min-w-44">
            <option value="all">All Status</option>
            {AGENT_APPLICATION_STATUSES.map(s => <option key={s} value={s}>{AGENT_APP_STATUS_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Applications Found</h3>
          <p className="text-slate-500 text-sm mb-4">Create your first student application to get started</p>
          <Link to="/agent/new-application" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> New Application
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app) => (
            <motion.div key={app.id} variants={fadeUp} initial="hidden" animate="visible">
              <Link to={`/agent/applications/${app.id}`} className="card p-4 hover:shadow-card-hover transition-all block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(app.student_full_name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{app.student_full_name || 'Unknown'}</p>
                      <div className="flex-shrink-0"><AgentAppStatusBadge status={app.status} /></div>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {app.application_id ?? '—'} • {app.courses?.title ?? 'No course'} • {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
