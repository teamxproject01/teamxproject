import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, FileText, Clock, CheckCircle, XCircle, Calendar, AlertCircle,
  Upload, Bell, ArrowRight, Award, Download, ExternalLink, ChevronDown, ChevronUp,
  CreditCard, AlertTriangle, FileSignature,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { AgentApplication, AgentApplicationStatus, AGENT_APP_STATUS_LABELS, DocumentRequest } from '../../types';
import { AgentAppStatusBadge } from '../../components/ui/AgentStatusBadge';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const statusSteps: AgentApplicationStatus[] = [
  'submitted', 'under_review', 'documents_required', 'approved',
  'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled',
];

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 hover:bg-slate-50 transition-colors rounded-lg px-3 -mx-3"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-blue-700" />
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Applications() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<AgentApplication[]>([]);
  const [docRequests, setDocRequests] = useState<Record<string, DocumentRequest[]>>({});
  const [installments, setInstallments] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<string | null>(null);
  const [signedOfferFiles, setSignedOfferFiles] = useState<Record<string, File | null>>({});
  const [uploadingSignedOffer, setUploadingSignedOffer] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_applications')
      .select('*, courses(title, level, campus)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        setApplications(data ?? []);

        const appIds = (data ?? []).map((a: any) => a.id);
        if (appIds.length > 0) {
          const { data: reqs } = await supabase.from('document_requests').select('*').in('application_id', appIds).order('created_at', { ascending: false });
          const reqMap: Record<string, DocumentRequest[]> = {};
          (reqs ?? []).forEach((r: any) => {
            if (!reqMap[r.application_id]) reqMap[r.application_id] = [];
            reqMap[r.application_id].push(r);
          });
          setDocRequests(reqMap);

          const { data: insts } = await supabase.from('payment_installments').select('*').in('application_id', appIds).order('installment_number', { ascending: true });
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

  const counts = {
    total: applications.length,
    submitted: applications.filter(a => a.status === 'submitted').length,
    under_review: applications.filter(a => a.status === 'under_review' || a.status === 'documents_required').length,
    offers: applications.filter(a => ['offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted'].includes(a.status)).length,
  };

  const payInstallment = async (installmentId: string) => {
    setPaying(installmentId);
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-session`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
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

  const uploadSignedOffer = async (appId: string) => {
    const file = signedOfferFiles[appId];
    if (!file) return;
    setUploadingSignedOffer(appId);
    try {
      const filePath = `offers/${appId}/signed_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, file);
      if (uploadError) throw uploadError;

      await supabase.from('agent_applications').update({
        signed_offer_path: filePath,
        signed_offer_uploaded_at: new Date().toISOString(),
        offer_accepted: false,
        status: 'signed_offer_review',
        updated_at: new Date().toISOString(),
      }).eq('id', appId);

      const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin']);
      if (admins) {
        for (const admin of admins) {
          await supabase.from('agent_notifications').insert({
            user_id: admin.id,
            title: 'Signed Offer Uploaded — Review Required',
            message: 'A student has uploaded a signed offer letter. Please review and approve or reject it.',
            type: 'offer',
          });
        }
      }

      setSignedOfferFiles(prev => ({ ...prev, [appId]: null }));
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, signed_offer_path: filePath, offer_accepted: false, status: 'signed_offer_review' as AgentApplicationStatus } : a));
    } catch (err: any) {
      alert(err.message || 'Failed to upload signed offer');
    }
    setUploadingSignedOffer(null);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-5xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Track the status of all your course applications</p>
        </div>
        <Link to="/student/new-application" className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </motion.div>

      <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: counts.total, icon: FileText, color: 'text-blue-700 bg-blue-50' },
          { label: 'Submitted', value: counts.submitted, icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'In Review', value: counts.under_review, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
          { label: 'Offers', value: counts.offers, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
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
            <Link to="/student/new-application" className="btn-primary">Apply Now</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => {
              const currentStep = statusSteps.indexOf(app.status);
              const isRejected = app.status === 'rejected';
              const isCancelled = app.status === 'cancelled';
              const showTracker = !isRejected && !isCancelled && app.status !== 'draft';
              const pendingReqs = docRequests[app.id]?.filter(r => r.status === 'pending') ?? [];

              return (
                <Link key={app.id} to={`/student/applications/${app.id}`} className={`card p-6 block hover:shadow-md transition-shadow ${
                  app.status === 'documents_required' || isRejected ? 'border-2 border-red-200' : ''
                }`}>
                  {app.status === 'draft' && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <p className="text-xs font-semibold text-slate-600">Draft — not yet submitted</p>
                      </div>
                      <Link
                        to={`/student/new-application/${app.id}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                      >
                        Continue <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                  {(app.status === 'documents_required' || pendingReqs.length > 0) && (
                    <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                      <Bell className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-red-700 mb-1">Action Required</p>
                        {pendingReqs.map(r => (
                          <p key={r.id} className="text-xs text-red-600">• {r.document_type}{r.description ? ` — ${r.description}` : ''}</p>
                        ))}
                        <Link to="/student/documents" className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-red-700 hover:text-red-900">
                          <Upload className="w-3.5 h-3.5" /> Upload now <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}

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
                      <p className="text-xs text-amber-600">Your signed offer letter has been uploaded and is awaiting admin review. You will be notified once it is approved or if you need to re-sign.</p>
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
                      {!app.offer_accepted && !app.signed_offer_path && (app.status === 'offer_letter_sent' || app.status === 'waiting_for_signature') && (
                        <div className="mt-3 pt-3 border-t border-indigo-100 space-y-2" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                          <p className="text-xs text-slate-600 font-medium">To accept the offer, upload your signed offer letter:</p>
                          <label className="flex items-center gap-2 p-2.5 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-white">
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png,.webp"
                              className="sr-only"
                              onChange={(e) => setSignedOfferFiles(prev => ({ ...prev, [app.id]: e.target.files?.[0] ?? null }))}
                              disabled={uploadingSignedOffer === app.id}
                            />
                            <FileSignature className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-600 truncate">{signedOfferFiles[app.id]?.name ?? 'Choose signed offer…'}</span>
                          </label>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); uploadSignedOffer(app.id); }}
                            disabled={!signedOfferFiles[app.id] || uploadingSignedOffer === app.id}
                            className="btn-primary text-xs w-full inline-flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {uploadingSignedOffer === app.id ? (
                              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading…</>
                            ) : (
                              <><FileSignature className="w-3.5 h-3.5" /> Upload Signed Offer</>
                            )}
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
                              <p className="text-sm font-semibold text-green-700">All payments complete! Your COE will be issued shortly.</p>
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
                      <p className="text-sm font-semibold text-blue-700 mb-1">You're enrolled! Click below to complete enrollment:</p>
                      <a href={app.enrollment_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Open Enrollment Link
                      </a>
                    </div>
                  )}

                  {/* Public comment (visible to student) */}
                  {app.public_comment && (
                    <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-blue-600 mb-0.5">Message from Admissions</p>
                        <p className="text-sm text-slate-700">{app.public_comment}</p>
                      </div>
                    </div>
                  )}

                  {isRejected && (
                    <div className="flex items-center gap-2 mt-2 p-3 bg-red-50 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <p className="text-sm text-red-600">
                        {app.public_comment ?? 'Your application was not successful. Please contact admissions for more information.'}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
