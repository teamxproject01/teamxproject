import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, Building2, Clock, Ban, Users, AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface AgentWithProfile {
  id: string;
  user_id: string;
  agency_name: string;
  contact_person: string;
  phone?: string;
  country?: string;
  city?: string;
  approval_status: string;
  admin_notes?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
}

export default function ManageAgents() {
  const [agents, setAgents] = useState<AgentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<AgentWithProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  const load = () => {
    supabase
      .from('agents')
      .select('*, profiles!inner(full_name, email)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAgents((data as any) ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const filtered = agents.filter(a => {
    const matchSearch = (a.agency_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.contact_person ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.profiles?.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (agent: AgentWithProfile, status: string) => {
    setUpdating(true);
    await supabase.from('agents').update({ approval_status: status, updated_at: new Date().toISOString() }).eq('id', agent.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: `agent_${status}`,
      target_table: 'agents',
      target_id: agent.id,
      metadata: { agency_name: agent.agency_name },
    });
    // Create notification for agent
    await supabase.from('agent_notifications').insert({
      user_id: agent.user_id,
      title: status === 'approved' ? 'Account Approved' : status === 'rejected' ? 'Account Rejected' : 'Account Suspended',
      message: status === 'approved'
        ? 'Your agent account has been approved. You can now create and submit student applications.'
        : status === 'rejected'
        ? 'Your agent account application has been rejected. Please contact support for more information.'
        : 'Your agent account has been suspended. Please contact support.',
      type: 'general',
    });
    load();
    setSelected({ ...agent, approval_status: status });
    setUpdating(false);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-slate-100 text-slate-600',
  };

  const statCards = [
    { label: 'Total Agents', value: agents.length, icon: Users, color: 'bg-blue-600' },
    { label: 'Pending', value: agents.filter(a => a.approval_status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Approved', value: agents.filter(a => a.approval_status === 'approved').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected/Suspended', value: agents.filter(a => ['rejected', 'suspended'].includes(a.approval_status)).length, icon: Ban, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Agents</h1>
        <p className="text-slate-500 text-sm mt-1">Review, approve, and manage agent accounts</p>
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
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by agency, contact, or email…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No agents found</p>
            </div>
          ) : (
            filtered.map((agent) => (
              <motion.div
                key={agent.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelected(agent)}
                className={`card p-4 cursor-pointer transition-all ${
                  selected?.id === agent.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{agent.agency_name || 'Unnamed Agency'}</p>
                      <span className={`badge text-xs flex-shrink-0 ${statusColors[agent.approval_status]}`}>{agent.approval_status}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{agent.contact_person} • {agent.profiles?.email}</p>
                    <p className="text-xs text-slate-400">{agent.country}, {agent.city} • {new Date(agent.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Agent Detail</h3>
                <span className={`badge ${statusColors[selected.approval_status]}`}>{selected.approval_status}</span>
              </div>

              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white mb-4">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div><p className="text-xs text-slate-400">Agency Name</p><p className="font-semibold text-slate-800">{selected.agency_name}</p></div>
                <div><p className="text-xs text-slate-400">Contact Person</p><p className="text-slate-700">{selected.contact_person}</p></div>
                <div><p className="text-xs text-slate-400">Email</p><p className="text-slate-700">{selected.profiles?.email}</p></div>
                <div><p className="text-xs text-slate-400">Phone</p><p className="text-slate-700">{selected.phone || '—'}</p></div>
                <div><p className="text-xs text-slate-400">Location</p><p className="text-slate-700">{selected.city}, {selected.country}</p></div>
                <div><p className="text-xs text-slate-400">Registered</p><p className="text-slate-700">{new Date(selected.created_at).toLocaleDateString()}</p></div>
                {selected.admin_notes && <div><p className="text-xs text-slate-400">Admin Notes</p><p className="text-slate-700">{selected.admin_notes}</p></div>}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-2">Actions</p>
                {selected.approval_status !== 'approved' && (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateStatus(selected, 'approved')}>
                    <CheckCircle className="w-4 h-4" /> Approve Agent
                  </Button>
                )}
                {selected.approval_status !== 'rejected' && (
                  <Button size="sm" variant="danger" className="w-full" loading={updating} onClick={() => updateStatus(selected, 'rejected')}>
                    <XCircle className="w-4 h-4" /> Reject Agent
                  </Button>
                )}
                {selected.approval_status !== 'suspended' && (
                  <Button size="sm" variant="secondary" className="w-full" loading={updating} onClick={() => updateStatus(selected, 'suspended')}>
                    <Ban className="w-4 h-4" /> Suspend Agent
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select an agent to view details and manage their account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
