import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, Users, TrendingUp,
  ArrowUp, Activity, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { supabase } from '../../lib/supabase';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const COLORS = ['#3B9AE1', '#93CAFE', '#10B981', '#F59E0B', '#EF4444'];

const monthlyData = [
  { month: 'Sep', applications: 45, forms: 28 },
  { month: 'Oct', applications: 62, forms: 35 },
  { month: 'Nov', applications: 78, forms: 42 },
  { month: 'Dec', applications: 41, forms: 20 },
  { month: 'Jan', applications: 95, forms: 58 },
  { month: 'Feb', applications: 124, forms: 71 },
  { month: 'Mar', applications: 108, forms: 63 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    applications: { total: 0, new: 0, pending: 0, approved: 0, rejected: 0 },
    forms: { total: 0, submitted: 0, under_review: 0 },
    students: 0,
  });
  const [recentApps, setRecentApps] = useState<any[]>([]);
  const [pendingDocs, setPendingDocs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('applications').select('status', { count: 'exact' }),
      supabase.from('forms').select('status', { count: 'exact' }),
      supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'student'),
      supabase.from('applications').select('*, profiles(full_name, email), courses(title)').order('created_at', { ascending: false }).limit(6),
      supabase.from('documents').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]).then(([apps, forms, students, recent, docs]) => {
      const appData = apps.data ?? [];
      const formData = forms.data ?? [];

      setStats({
        applications: {
          total: appData.length,
          new: appData.filter(a => a.status === 'submitted').length,
          pending: appData.filter(a => a.status === 'under_review').length,
          approved: appData.filter(a => a.status === 'approved').length,
          rejected: appData.filter(a => a.status === 'rejected').length,
        },
        forms: {
          total: formData.length,
          submitted: formData.filter(f => f.status === 'submitted').length,
          under_review: formData.filter(f => f.status === 'under_review').length,
        },
        students: students.count ?? 0,
      });
      setRecentApps(recent.data ?? []);
      setPendingDocs(docs.count ?? 0);
      setLoading(false);
    });
  }, []);

  const pieData = [
    { name: 'Submitted', value: stats.applications.new },
    { name: 'Under Review', value: stats.applications.pending },
    { name: 'Approved', value: stats.applications.approved },
    { name: 'Rejected', value: stats.applications.rejected },
    { name: 'Draft', value: Math.max(0, stats.applications.total - stats.applications.new - stats.applications.pending - stats.applications.approved - stats.applications.rejected) },
  ].filter(d => d.value > 0);

  const statCards = [
    { label: 'Total Students', value: stats.students, icon: Users, color: 'bg-blue-600', trend: '+12%' },
    { label: 'New Applications', value: stats.applications.new, icon: FileText, color: 'bg-sky-500', trend: '+8%' },
    { label: 'Under Review', value: stats.applications.pending, icon: Clock, color: 'bg-amber-500', trend: '+3%' },
    { label: 'Approved This Month', value: stats.applications.approved, icon: CheckCircle, color: 'bg-green-500', trend: '+15%' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of all applications, forms, and student activity</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, trend }) => (
          <motion.div key={label} variants={fadeUp} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                <ArrowUp className="w-3 h-3" /> {trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '—' : value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Area chart */}
        <motion.div variants={fadeUp} className="card p-6 md:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Application & Form Volume (7 months)
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B9AE1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B9AE1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="formGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#93CAFE" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#93CAFE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="applications" stroke="#3B9AE1" strokeWidth={2} fill="url(#appGrad)" name="Applications" />
              <Area type="monotone" dataKey="forms" stroke="#93CAFE" strokeWidth={2} fill="url(#formGrad)" name="Forms" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
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
              <div className="space-y-2 mt-2">
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

      {/* Bar chart + Recent */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Monthly Applications by Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
              <Bar dataKey="applications" fill="#3B9AE1" radius={[6, 6, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent apps */}
        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Recent Applications</h3>
          {recentApps.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">No applications yet</div>
          ) : (
            <div className="space-y-3">
              {recentApps.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(app.profiles?.full_name ?? 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{app.profiles?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-slate-400 truncate">{app.courses?.title ?? 'Unknown Course'}</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    app.status === 'approved' ? 'bg-green-100 text-green-700' :
                    app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'under_review' ? 'bg-amber-100 text-amber-700' :
                    app.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Alerts */}
      <motion.div variants={fadeUp} className="card p-5">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" /> Action Required
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: 'Applications awaiting review', count: stats.applications.pending, color: 'border-amber-400 bg-amber-50' },
            { label: 'Forms pending decision', count: stats.forms.under_review, color: 'border-blue-400 bg-blue-50' },
            { label: 'Documents pending verification', count: pendingDocs, color: 'border-slate-300 bg-slate-50' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`p-4 rounded-xl border-l-4 ${color}`}>
              <div className="text-2xl font-bold text-slate-900">{count}</div>
              <div className="text-xs text-slate-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
