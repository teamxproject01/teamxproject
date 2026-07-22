import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle, XCircle, Eye, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const load = () =>
    supabase
      .from('applications')
      .select('*, profiles(full_name, email, phone), courses(title, level, campus)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApplications(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const filtered = applications.filter((a) => {
    const name = a.profiles?.full_name ?? '';
    const course = a.courses?.title ?? '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      course.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    await supabase.from('applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, action: `update_application_status_${status}`, target_table: 'applications', target_id: id });
    load();
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    setUpdating(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Review and process all student applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or course…"
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field pl-10 pr-8 cursor-pointer appearance-none min-w-40"
          >
            <option value="all">All Status</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </div>
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
            filtered.map((app) => (
              <motion.div
                key={app.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelected(app)}
                className={`card p-4 cursor-pointer transition-all ${
                  selected?.id === app.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(app.profiles?.full_name ?? 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{app.profiles?.full_name ?? 'Unknown'}</p>
                      <div className="flex-shrink-0"><StatusBadge status={app.status} /></div>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{app.courses?.title ?? 'Unknown Course'}</p>
                    <p className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Application Detail</h3>
                <StatusBadge status={selected.status} />
              </div>

              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-4">
                {(selected.profiles?.full_name ?? 'U').charAt(0)}
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Student</p>
                  <p className="font-semibold text-slate-800">{selected.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Email</p>
                  <p className="text-slate-700">{selected.profiles?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Course Applied</p>
                  <p className="font-semibold text-slate-800">{selected.courses?.title}</p>
                  <p className="text-xs text-slate-500 capitalize">{selected.courses?.level?.replace('_', ' ')} • {selected.courses?.campus}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Applied</p>
                  <p className="text-slate-700">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>

              {!['approved', 'rejected'].includes(selected.status) && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 mb-2">Update Status</p>
                  {selected.status !== 'under_review' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full"
                      loading={updating}
                      onClick={() => updateStatus(selected.id, 'under_review')}
                    >
                      <Eye className="w-4 h-4" /> Mark Under Review
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    loading={updating}
                    onClick={() => updateStatus(selected.id, 'approved')}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    className="w-full"
                    loading={updating}
                    onClick={() => updateStatus(selected.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
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
