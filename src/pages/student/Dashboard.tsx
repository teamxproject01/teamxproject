import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, FolderOpen, MessageSquare, CheckCircle,
  Clock, AlertCircle, ArrowRight, Bell, Calendar,
  Sparkles, TrendingUp, BookOpen,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/ui/Badge';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const importantDates = [
  { label: 'Semester 1 Commences', date: '3 February 2025', type: 'info' },
  { label: 'Census Date', date: '28 February 2025', type: 'warning' },
  { label: 'Study Break', date: '21 – 25 April 2025', type: 'success' },
  { label: 'Final Assessments', date: '9 – 20 June 2025', type: 'warning' },
  { label: 'Results Released', date: '4 July 2025', type: 'info' },
  { label: 'Semester 2 Commences', date: '14 July 2025', type: 'info' },
];

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('applications').select('*, courses(title)').order('created_at', { ascending: false }).limit(3),
      supabase.from('forms').select('*').order('created_at', { ascending: false }).limit(3),
      supabase.from('messages').select('*').eq('is_read', false).order('created_at', { ascending: false }).limit(5),
    ]).then(([apps, frms, msgs]) => {
      setApplications(apps.data ?? []);
      setForms(frms.data ?? []);
      setMessages(msgs.data ?? []);
      setLoading(false);
    });
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const quickLinks = [
    { icon: FileText, label: 'Submit a Form', href: '/student/forms', gradient: 'from-blue-500 to-blue-700' },
    { icon: FolderOpen, label: 'Upload Docs', href: '/student/documents', gradient: 'from-sky-500 to-blue-600' },
    { icon: MessageSquare, label: 'Messages', href: '/student/messages', gradient: 'from-blue-600 to-blue-800', badge: messages.length },
    { icon: Calendar, label: 'Applications', href: '/student/applications', gradient: 'from-blue-400 to-blue-600' },
  ];

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 sm:space-y-6 max-w-5xl"
    >
      {/* Welcome banner */}
      <motion.div
        variants={fadeUp}
        className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1060A8 0%, #0A4887 50%, #042148 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
        <div className="absolute bottom-0 right-32 w-32 h-32 bg-blue-400/10 rounded-full translate-y-12" />
        <div className="absolute top-1/2 right-16 w-20 h-20 bg-blue-300/10 rounded-full -translate-y-1/2" />

        <div className="relative z-10 p-5 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-blue-300" />
                <p className="text-blue-200 text-sm font-medium">{greeting},</p>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                {profile?.full_name || 'Student'}
              </h1>
              <p className="text-blue-300 text-sm">
                Student ID: <span className="font-mono font-semibold text-blue-100">MIHE-{profile?.id.slice(0, 8).toUpperCase()}</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {messages.length > 0 && (
                <Link
                  to="/student/messages"
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-white text-sm font-medium transition-colors"
                >
                  <Bell className="w-4 h-4 text-amber-300" />
                  {messages.length} unread message{messages.length > 1 ? 's' : ''}
                </Link>
              )}
              <Link
                to="/student/new-application"
                className="flex items-center gap-2 bg-white text-blue-700 font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-blue-50 transition-colors"
              >
                <BookOpen className="w-4 h-4" /> New Application
              </Link>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-5 sm:mt-6 grid grid-cols-3 gap-3 sm:gap-4 pt-4 sm:pt-5 border-t border-white/15">
            {[
              { icon: FileText, label: 'Applications', value: applications.length, href: '/student/applications' },
              { icon: FolderOpen, label: 'Active Forms', value: forms.length, href: '/student/forms' },
              { icon: TrendingUp, label: 'Profile', value: '85%', href: '/student/profile', sub: 'complete' },
            ].map(({ icon: Icon, label, value, href, sub }) => (
              <Link key={label} to={href} className="group text-center hover:bg-white/10 rounded-xl p-2 sm:p-3 transition-colors">
                <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">{value}<span className="text-xs sm:text-sm text-blue-300 font-normal ml-1">{sub}</span></div>
                <div className="text-blue-300 text-xs flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" /> {label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(({ icon: Icon, label, href, gradient, badge }) => (
          <motion.div key={label} variants={fadeUp}>
            <Link
              to={href}
              className="card p-5 flex flex-col items-center text-center hover:-translate-y-1.5 hover:shadow-blue transition-all duration-300 group"
            >
              <div className={`relative w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-blue`}>
                <Icon className="w-6 h-6 text-white" />
                {badge ? (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center border border-white">
                    {badge}
                  </span>
                ) : null}
              </div>
              <span className="text-sm font-semibold text-slate-700">{label}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Applications */}
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> My Applications
            </h2>
            <Link to="/student/applications" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-slate-500 text-sm">No applications yet</p>
              <Link to="/courses" className="btn-ghost mt-3 text-sm">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {applications.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {app.courses?.title ?? 'Unknown Course'}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString('en-AU')}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Forms */}
        <motion.div variants={fadeUp} className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-600" /> Recent Forms
            </h2>
            <Link to="/student/forms" className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-slate-500 text-sm">No forms submitted yet</p>
              <Link to="/student/forms" className="btn-ghost mt-3 text-sm">Submit a Form</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {forms.map((form) => (
                <div key={form.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                  <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {form.status === 'approved' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : form.status === 'rejected' ? (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 capitalize truncate">
                      {form.form_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(form.created_at).toLocaleDateString('en-AU')}</p>
                  </div>
                  <StatusBadge status={form.status} />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Important dates */}
      <motion.div variants={fadeUp} className="card p-6">
        <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" /> Important Dates
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {importantDates.map(({ label, date, type }) => (
            <div key={label} className={`p-3 sm:p-4 rounded-xl border-l-4 ${
              type === 'info' ? 'bg-blue-50 border-blue-400' :
              type === 'warning' ? 'bg-amber-50 border-amber-400' :
              'bg-green-50 border-green-400'
            }`}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-bold text-slate-800">{date}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
