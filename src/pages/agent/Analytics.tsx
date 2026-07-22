import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Clock, CheckCircle, XCircle, FileText, Award, AlertCircle, BarChart3,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentApplication, AGENT_APP_STATUS_LABELS } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const COLORS = ['#3B9AE1', '#93CAFE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#94A3B8'];

export default function Analytics() {
  const { profile } = useAuth();
  const [apps, setApps] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_applications')
      .select('*, courses(title)')
      .eq('agent_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setApps(data ?? []); setLoading(false); });
  }, [profile]);

  const analytics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthly = apps.filter(a => {
      const d = new Date(a.created_at);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    const pending = apps.filter(a => ['submitted', 'under_review', 'documents_required', 'documents_approved', 'sent_to_college', 'offer_pending'].includes(a.status)).length;
    const offerReceived = apps.filter(a => a.status === 'offer_received').length;
    const enrolled = apps.filter(a => a.status === 'enrolled').length;
    const rejected = apps.filter(a => a.status === 'rejected').length;
    const docPending = apps.filter(a => a.status === 'documents_required').length;

    // Monthly chart (last 7 months)
    const monthlyData: { month: string; applications: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const label = d.toLocaleDateString('en', { month: 'short' });
      const count = apps.filter(a => {
        const ad = new Date(a.created_at);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      monthlyData.push({ month: label, applications: count });
    }

    // Status pie
    const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {});
    const pieData = Object.entries(statusCounts)
      .map(([status, value]) => ({ name: AGENT_APP_STATUS_LABELS[status as keyof typeof AGENT_APP_STATUS_LABELS] ?? status, value }))
      .filter(d => d.value > 0);

    // Course interest
    const courseCounts = apps.reduce<Record<string, number>>((acc, a) => {
      const title = a.courses?.title ?? 'No Course';
      acc[title] = (acc[title] || 0) + 1;
      return acc;
    }, {});
    const courseData = Object.entries(courseCounts).map(([name, value]) => ({ name, value }));

    // Conversion funnel
    const funnel = [
      { stage: 'Submitted', count: apps.filter(a => a.status !== 'draft').length },
      { stage: 'Under Review', count: apps.filter(a => ['under_review', 'documents_required', 'documents_approved', 'sent_to_college', 'offer_pending', 'offer_received', 'enrolled'].includes(a.status)).length },
      { stage: 'Offer Received', count: offerReceived },
      { stage: 'Enrolled', count: enrolled },
    ];

    return { monthly, pending, offerReceived, enrolled, rejected, docPending, monthlyData, pieData, courseData, funnel };
  }, [apps]);

  const kpiCards = [
    { label: 'Monthly Applications', value: analytics.monthly, icon: TrendingUp, color: 'bg-blue-600' },
    { label: 'Pending', value: analytics.pending, icon: Clock, color: 'bg-amber-500' },
    { label: 'Offer Received', value: analytics.offerReceived, icon: Award, color: 'bg-green-500' },
    { label: 'Enrolled', value: analytics.enrolled, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Rejected', value: analytics.rejected, icon: XCircle, color: 'bg-red-500' },
    { label: 'Doc Pending', value: analytics.docPending, icon: AlertCircle, color: 'bg-orange-500' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Track your performance and application progress</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpiCards.map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp} className="card p-4">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-xl font-bold text-slate-900">{loading ? '—' : value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Monthly bar chart */}
      <motion.div variants={fadeUp} className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" /> Monthly Applications
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Bar dataKey="applications" fill="#3B9AE1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Status pie */}
        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Application Status Distribution</h3>
          {analytics.pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                    {analytics.pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-3 max-h-40 overflow-y-auto">
                {analytics.pieData.map((d, i) => (
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
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
        </motion.div>

        {/* Course interest */}
        <motion.div variants={fadeUp} className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Course Interest</h3>
          {analytics.courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.courseData} layout="vertical" margin={{ top: 5, right: 5, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={120} />
                <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="value" fill="#10B981" radius={[0, 6, 6, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
        </motion.div>
      </div>

      {/* Conversion funnel */}
      <motion.div variants={fadeUp} className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> Application Conversion Funnel
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={analytics.funnel} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="stage" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, border: 'none' }} />
            <Line type="monotone" dataKey="count" stroke="#3B9AE1" strokeWidth={3} dot={{ r: 6, fill: '#3B9AE1' }} name="Applications" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
}
