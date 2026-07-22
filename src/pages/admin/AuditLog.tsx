import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AuditLog } from '../../types';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<(AuditLog & { profiles?: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*, profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setLogs(data ?? []); setLoading(false); });
  }, []);

  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    (l.profiles?.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (l.target_table ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const actionColor = (action: string) => {
    if (action.includes('approve')) return 'bg-green-100 text-green-700';
    if (action.includes('reject') || action.includes('delete')) return 'bg-red-100 text-red-700';
    if (action.includes('update') || action.includes('edit')) return 'bg-amber-100 text-amber-700';
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Audit Log
          </h1>
          <p className="text-slate-500 text-sm mt-1">Full trail of all staff actions across the platform</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by action, user, or table…"
          className="input-field pl-10"
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Shield className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <div className="hidden md:grid grid-cols-12 px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div className="col-span-3">Action</div>
              <div className="col-span-2">Table</div>
              <div className="col-span-3">User</div>
              <div className="col-span-4">Timestamp</div>
            </div>
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="px-4 py-3 text-sm hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col gap-1.5 md:contents">
                  <div className="md:col-span-3">
                    <span className={`badge text-xs ${actionColor(log.action)}`}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-slate-500 text-xs md:col-span-2">
                    <span className="md:hidden font-semibold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Table: </span>
                    {log.target_table ?? '—'}
                  </div>
                  <div className="text-slate-700 truncate md:col-span-3">
                    <span className="md:hidden font-semibold text-slate-400 uppercase text-[10px] tracking-wider mr-1">User: </span>
                    {log.profiles?.full_name ?? 'System'}
                  </div>
                  <div className="text-slate-400 text-xs md:col-span-4">
                    <span className="md:hidden font-semibold text-slate-400 uppercase text-[10px] tracking-wider mr-1">Time: </span>
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
