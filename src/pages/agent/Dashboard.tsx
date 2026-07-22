import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, PlusCircle, Bell,
  TrendingUp, AlertCircle, FolderOpen,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import { AGENT_APP_STATUS_LABELS, AgentApplication } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['#3B9AE1', '#93CAFE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#94A3B8'];

export default function AgentDashboard() {
  const { profile, agent } = useAuth();
  const [apps, setApps] = useState<AgentApplication[]>([]);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    Promise.all([
      supabase.from('agent_applications').select('*, courses(title, level)').eq('agent_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('agent_notifications').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5),
    ]).then(([appsRes, notifRes]) => {
      setApps(appsRes.data ?? []);
      setNotifs(notifRes.data ?? []);
      setLoading(false);
    });
  }, [profile]);

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const total = apps.length;
  const thisMonthCount = apps.filter(a => {
    const d = new Date(a.created_at);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;
  const pending = apps.filter(a => ['submitted', 'under_review', 'documents_required', 'documents_approved', 'sent_to_college', 'offer_pending'].includes(a.status)).length;
  const approved = apps.filter(a => ['offer_received', 'enrolled'].includes(a.status)).length;
  const rejected = apps.filter(a => a.status === 'rejected').length;

  // Monthly chart data (last 7 months)
  const monthlyData = (() => {
    const months: { month: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const label = d.toLocaleDateString('en', { month: 'short' });
      const count = apps.filter(a => {
        const ad = new Date(a.created_at);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      months.push({ month: label, count });
    }
    return months;
  })();

  // Status pie data
  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts)
    .map(([status, value]) => ({ name: AGENT_APP_STATUS_LABELS[status as keyof typeof AGENT_APP_STATUS_LABELS] ?? status, value }))
    .filter(d => d.value > 0);

  const recentApps = apps.slice(0, 5);

  const statCards = [
    { label: 'Total Applications', value: total, icon: FileText, color: 'bg-blue-600' },
    { label: 'This Month', value: thisMonthCount, icon: TrendingUp, color: 'bg-sky-500' },
    { label: 'Pending', value: pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'Approved', value: approved, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected', value: rejected, icon: XCircle, color: 'bg-red-500' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome banner */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-blue-600 to-sky-500 rounded-2xl p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold">Welcome back, {agent?.agency_name || profile?.full_name || 'Agent'}</h1>
        <p className="text-blue-100 text-sm mt-1">
          {agent?.approval_status === 'approved'
            ? 'Your account is approved. Manage your student applications below.'
            : `Account status: ${agent?.approval_status ?? 'pending'}. Some features may be restricted until approved.`}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp} className="card p-5">
            <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '—' : value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick action */}
      <motion.div variants={fadeUp}>
        <Link to="/agent/new-application" className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-all group">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <PlusCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-slate-900">Create New Student Application</p>
            <p className="text-sm text-slate-500">Start a new application for a prospective student</p>
          </div>
          <div className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">Start →</div>
        </Link>
      </motion.div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Applications (7 months)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" fill="#3B9AE1" radius={[6, 6, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Application Status</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </motion.div>
      </div>

      {/* Recent apps + Notifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={fadeUp} className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Applications</h3>
            <Link to="/agent/applications" className="text-sm text-blue-600 font-semibold hover:text-blue-700">View all</Link>
          </div>
          {recentApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <FolderOpen className="w-8 h-8 mb-2" />
              <p className="text-sm">No applications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <Link key={app.id} to={`/agent/applications/${app.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(app.student_full_name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{app.student_full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-400 truncate">{app.courses?.title ?? 'No course selected'} • {app.application_id ?? '—'}</p>
                  </div>
                  <div className="flex-shrink-0"><AgentAppStatusBadge status={app.status} /></div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" /> Notifications
            </h3>
            <Link to="/agent/notifications" className="text-sm text-blue-600 font-semibold hover:text-blue-700">All</Link>
          </div>
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400">
              <Bell className="w-8 h-8 mb-2" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifs.map((n) => (
                <div key={n.id} className={`p-3 rounded-xl ${n.is_read ? 'bg-slate-50' : 'bg-blue-50 border border-blue-100'}`}>
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
