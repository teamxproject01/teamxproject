import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, FileText, PlusCircle, FolderOpen, CheckCircle, XCircle,
  Clock, AlertCircle, Bell, ArrowRight, Award, Download, ExternalLink,
  CreditCard, AlertTriangle, Upload,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import {
  AgentApplication,
  AgentApplicationStatus,
  AGENT_APPLICATION_STATUSES,
  AGENT_APP_STATUS_LABELS,
  DocumentRequest,
} from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusSteps: AgentApplicationStatus[] = [
  'submitted', 'under_review', 'documents_required', 'approved',
  'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled',
];

export default function MyApplications() {
  const { profile } = useAuth();
  const [apps, setApps] = useState<AgentApplication[]>([]);
  const [docRequests, setDocRequests] = useState<Record<string, DocumentRequest[]>>({});
  const [installments, setInstallments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paying, setPaying] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_applications')
      .select('*, courses(title, level, campus)')
      .eq('agent_id', profile.id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        setApps(data ?? []);

        const appIds = (data ?? []).map((a: any) => a.id);
        if (appIds.length > 0) {
          const { data: reqs } = await supabase
            .from('document_requests')
            .select('*')
            .in('application_id', appIds)
            .order('created_at', { ascending: false });
          const reqMap: Record<string, DocumentRequest[]> = {};
          (reqs ?? []).forEach((r: any) => {
            if (!reqMap[r.application_id]) reqMap[r.application_id] = [];
            reqMap[r.application_id].push(r);
          });
          setDocRequests(reqMap);

          const { data: insts } = await supabase
            .from('payment_installments')
            .select('*')
            .in('application_id', appIds)
            .order('installment_number', { ascending: true });
          const instMap: Record<string, any[]> = {};
          (insts ?? []).forEach((i: any) => {
            if (!instMap[i.application_id]) instMap[i.application_id] = [];
            instMap[i.application_id].push(i);
          });
          setInstallments(instMap);
        }

        setLoading(false);
      });
  }, [profile]);

  const filtered = apps.filter(a => {
    const matchSearch = a.student_full_name.toLowerCase().includes(search.toLowerCase()) ||
      (a.application_id ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.courses?.title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statCards = [
    { label: 'Total', value: apps.length, color: 'bg-blue-700' },
    { label: 'Draft', value: apps.filter(a => a.status === 'draft').length, color: 'bg-slate-400' },
    { label: 'Pending', value: apps.filter(a => ['submitted', 'under_review', 'documents_required'].includes(a.status)).length, color: 'bg-amber-500' },
    { label: 'Approved', value: apps.filter(a => ['approved', 'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted', 'waiting_for_payment', 'paid_coe_issued', 'enrolled'].includes(a.status)).length, color: 'bg-green-500' },
  ];

  const payInstallment = async (installmentId: string) => {
    setPaying(installmentId);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-session`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ installmentId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start payment. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment failed. Please try again.');
    }
    setPaying(null);
  };

  const handleDownload = async (path: string) => {
    const { data } = await supabase.storage.from('agent-documents').createSignedUrl(path, 60);
    if (data) window.open(data.signedUrl, '_blank');
  };

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
        <div className="space-y-4">
          {filtered.map((app) => {
            const currentStep = statusSteps.indexOf(app.status);
            const isRejected = app.status === 'rejected';
            const isCancelled = app.status === 'cancelled';
            const showTracker = !isRejected && !isCancelled && app.status !== 'draft';
            const pendingReqs = docRequests[app.id]?.filter(r => r.status === 'pending') ?? [];

            return (
              <motion.div key={app.id} variants={fadeUp} initial="hidden" animate="visible">
                <Link to={`/agent/applications/${app.id}`} className={`card p-6 block hover:shadow-card-hover transition-all ${
                  app.status === 'documents_required' || isRejected ? 'border-2 border-red-200' : ''
                }`}>
                  {/* Draft banner */}
                  {app.status === 'draft' && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600">Draft — not yet submitted</p>
                      </div>
                      <Link
                        to={`/agent/new-application/${app.id}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                      >
                        Edit Draft <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}

                  {/* Documents required banner */}
                  {(app.status === 'documents_required' || pendingReqs.length > 0) && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                      <Bell className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-700 mb-1">Action Required</p>
                        {pendingReqs.length > 0 ? (
                          pendingReqs.map(r => (
                            <p key={r.id} className="text-xs text-red-600">• {r.document_type}{r.description ? ` — ${r.description}` : ''}</p>
                          ))
                        ) : (
                          <p className="text-xs text-red-600">Additional documents are required for this application.</p>
                        )}
                        <Link to={`/agent/applications/${app.id}`} className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-red-700 hover:text-red-900">
                          <Upload className="w-3.5 h-3.5" /> View details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 sm:gap-4 mb-5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {(app.student_full_name || 'U').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-lg truncate">{app.student_full_name || 'Unknown'}</p>
                          <p className="text-xs text-slate-400 truncate">
                            {app.application_id ?? '—'} • {app.courses?.title ?? 'No course'} • {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap ml-13">
                        {app.courses?.level && (
                          <p className="text-slate-500 text-sm capitalize">{app.courses.level.replace('_', ' ')}</p>
                        )}
                        {app.courses?.campus && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-slate-500">{app.courses.campus}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0"><AgentAppStatusBadge status={app.status} /></div>
                  </div>

                  {/* Progress tracker */}
                  {showTracker && (
                    <div className="mt-2">
                      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                        <div className="flex items-center gap-0 min-w-[700px] sm:min-w-0">
                          {statusSteps.map((step, i) => {
                            const done = i <= currentStep;
                            const active = i === currentStep;
                            return (
                              <div key={step} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                                    done ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-slate-300 text-slate-400'
                                  } ${active ? 'ring-2 sm:ring-4 ring-blue-100' : ''}`}>
                                    {done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                                  </div>
                                  <span className={`text-[10px] sm:text-xs font-medium text-center whitespace-nowrap ${done ? 'text-blue-700' : 'text-slate-400'}`}>
                                    {AGENT_APP_STATUS_LABELS[step]}
                                  </span>
                                </div>
                                {i < statusSteps.length - 1 && (
                                  <div className={`flex-1 h-0.5 mx-1 transition-all ${i < currentStep ? 'bg-blue-700' : 'bg-slate-200'}`} />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signed Offer — under review */}
                  {app.signed_offer_path && app.status === 'signed_offer_review' && (
                    <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <p className="text-sm font-semibold text-amber-700">Signed Offer Under Review</p>
                      </div>
                      <p className="text-xs text-amber-600">The signed offer letter has been uploaded and is awaiting admin review. You will be notified once it is approved or if re-signing is needed.</p>
                    </div>
                  )}

                  {/* Offer Letter */}
                  {app.offer_letter_path && (
                    <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <p className="text-sm font-semibold text-indigo-700">Offer Letter Ready</p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(app.offer_letter_path!); }}
                        className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download Offer Letter
                      </button>
                      {app.offer_accepted && app.signed_offer_path && (
                        <div className="mt-2 pt-2 border-t border-indigo-100">
                          <p className="text-xs font-semibold text-teal-700">Offer Accepted</p>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(app.signed_offer_path!); }}
                            className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> Download Signed Offer
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Panel */}
                  {(app.status === 'waiting_for_payment' || (installments[app.id] && installments[app.id].length > 0)) && !app.coe_path && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-4 h-4 text-blue-700" />
                        <p className="text-sm font-bold text-slate-800">Payment</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mb-3">
                        <p className="text-sm font-semibold text-blue-700">Tuition Fee: ${app.tuition_fee ? parseFloat(app.tuition_fee.toString()).toLocaleString() : '—'}</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                          {app.payment_plan_type === 'emi' ? 'Pay the acceptance fee first, then the remaining balance in 3 installments.' : 'Full payment required to proceed.'}
                        </p>
                      </div>
                      {installments[app.id] && installments[app.id].length > 0 && (
                        <div className="space-y-2">
                          {installments[app.id].map((inst) => {
                            const isOverdue = inst.status === 'pending' && new Date(inst.due_date) < new Date();
                            return (
                              <div key={inst.id} className={`p-3 rounded-xl border ${inst.status === 'paid' ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-slate-800">{inst.label}</span>
                                      {inst.status === 'paid' && <CheckCircle className="w-3.5 h-3.5 text-green-600" />}
                                      {isOverdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      ${parseFloat(inst.amount).toLocaleString()} · Due: {new Date(inst.due_date).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                                      {inst.status === 'paid' && inst.paid_at && ` · Paid: ${new Date(inst.paid_at).toLocaleDateString('en-AU')}`}
                                      {isOverdue && ` · Overdue`}
                                    </p>
                                  </div>
                                  {inst.status === 'pending' && (
                                    <button
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); payInstallment(inst.id); }}
                                      disabled={paying === inst.id}
                                      className="btn-primary text-xs whitespace-nowrap"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" /> {paying === inst.id ? 'Processing…' : 'Pay Now'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {installments[app.id].every((i) => i.status === 'paid') && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-sm font-semibold text-green-700">All payments complete! COE will be issued shortly.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* COE */}
                  {app.coe_path && (
                    <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <p className="text-sm font-semibold text-emerald-700">COE Issued</p>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload(app.coe_path!); }}
                        className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download COE
                      </button>
                    </div>
                  )}

                  {/* Enrollment Link */}
                  {app.enrollment_url && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-sm font-semibold text-blue-700 mb-1">Enrolled! Click below to complete enrollment:</p>
                      <a href={app.enrollment_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Open Enrollment Link
                      </a>
                    </div>
                  )}

                  {/* Public comment */}
                  {app.public_comment && (
                    <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-0.5">Message from Admissions</p>
                        <p className="text-sm text-slate-700">{app.public_comment}</p>
                      </div>
                    </div>
                  )}

                  {/* Rejection banner */}
                  {isRejected && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">
                        {app.public_comment ?? 'This application was not successful. Please contact admissions for more information.'}
                      </p>
                    </div>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
