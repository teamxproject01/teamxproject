import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FileText, Clock, CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AgentApplication, AgentApplicationStatus, AGENT_APP_STATUS_LABELS } from '../../types';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const statusSteps: AgentApplicationStatus[] = ['submitted', 'under_review', 'documents_required', 'documents_approved', 'sent_to_college', 'offer_pending', 'offer_received', 'enrolled'];

export default function Applications() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_applications')
      .select('*, courses(title, level, campus)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setApplications(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  const counts = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review' || a.status === 'documents_required').length,
    offer_received: applications.filter(a => a.status === 'offer_received').length,
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track the status of all your course applications</p>
        </div>
        <Link to="/student/new-application" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Submitted', value: counts.submitted, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'In Review', value: counts.under_review, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Offers', value: counts.offer_received, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div key={label} variants={fadeUp} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* List */}
      <motion.div variants={fadeUp}>
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse" />)}
          </div>
        ) : applications.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Applications Yet</h3>
            <p className="text-slate-500 text-sm mb-6">Start your MIHE journey by applying for a course</p>
            <Link to="/student/new-application" className="btn-primary">New Application</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const currentStep = statusSteps.indexOf(app.status);
              const isRejected = app.status === 'rejected';
              const isCancelled = app.status === 'cancelled';
              const showTracker = !isRejected && !isCancelled && app.status !== 'draft';

              return (
                <div key={app.id} className="card p-6">
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-5">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-lg break-words">
                        {app.courses?.title ?? 'Unknown Course'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-slate-500 text-sm capitalize">
                          {app.courses?.level?.replace('_', ' ')}
                        </p>
                        {app.preferred_intake && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" /> {app.preferred_intake}
                            </span>
                          </>
                        )}
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-400">{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0"><AgentAppStatusBadge status={app.status} /></div>
                  </div>

                  {/* Progress tracker */}
                  {showTracker && (
                    <div className="mt-2">
                      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-0 min-w-[600px] sm:min-w-0">
                          {statusSteps.map((step, i) => {
                            const done = i <= currentStep;
                            const active = i === currentStep;
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                    done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300 text-slate-400'
                                  } ${active ? 'ring-2 sm:ring-4 ring-blue-100' : ''}`}>
                                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-medium text-center whitespace-nowrap ${done ? 'text-blue-600' : 'text-slate-400'}`}>
                                    {AGENT_APP_STATUS_LABELS[step]}
                                  </span>
                                </div>
                                {i < statusSteps.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 transition-all ${i < currentStep ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin comment / document request */}
                  {app.admin_comment && (
                    <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-600 mb-0.5">Message from Admissions</p>
                        <p className="text-sm text-slate-700">{app.admin_comment}</p>
                      </div>
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">
                        {app.admin_comment ?? 'Your application was not successful. Please contact admissions for more information.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
