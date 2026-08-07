import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, User, BookOpen, FileText, Upload, CheckCircle, XCircle,
  Clock, AlertCircle, Download, History, Bell, MessageSquare, Send,
  ChevronDown, ChevronUp, Award, FileSignature, Link2, ExternalLink,
  CreditCard, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentAppStatusBadge, DocStatusBadge } from '../../components/ui/AgentStatusBadge';
import Button from '../../components/ui/Button';
import { AgentApplication, ApplicationDocument, AGENT_APP_STATUS_LABELS, AGENT_DOC_TYPES, AgentApplicationStatus, DocumentRequest, ApprovalSnapshot, ConversationMessage } from '../../types';
import GSASummary from '../../components/ui/GSASummary';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusOrder: AgentApplicationStatus[] = [
  'submitted', 'under_review', 'documents_required', 'approved',
  'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled',
];

function CollapsibleCard({ title, icon: Icon, children, defaultOpen = true, badge }: {
  title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-700" />
          <h3 className="font-bold text-slate-900">{title}</h3>
          {badge}
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-5 pb-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [app, setApp] = useState<AgentApplication | null>(null);
  const [docs, setDocs] = useState<ApplicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newDocType, setNewDocType] = useState<string>(AGENT_DOC_TYPES[0]);
  const [error, setError] = useState('');
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [snapshots, setSnapshots] = useState<ApprovalSnapshot[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [signedOfferFile, setSignedOfferFile] = useState<File | null>(null);
  const [uploadingSignedOffer, setUploadingSignedOffer] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id || !profile) return;
    Promise.all([
      supabase.from('agent_applications').select('*, courses(*)').eq('id', id).maybeSingle(),
      supabase.from('application_documents').select('*').eq('application_id', id).order('uploaded_at', { ascending: false }),
      supabase.from('document_requests').select('*').eq('application_id', id).order('created_at', { ascending: false }),
      supabase.from('approval_snapshots').select('*').eq('application_id', id).order('created_at', { ascending: false }),
      supabase.from('payment_installments').select('*').eq('application_id', id).order('installment_number', { ascending: true }),
    ]).then(async ([appRes, docRes, reqRes, snapRes, instRes]) => {
      setApp(appRes.data);
      setDocs(docRes.data ?? []);
      setDocRequests(reqRes.data ?? []);
      setSnapshots(snapRes.data ?? []);
      setInstallments(instRes.data ?? []);
      setLoading(false);
      if (appRes.data) {
        const { data: conv } = await supabase.from('conversations').select('id').eq('application_id', appRes.data.id).maybeSingle();
        if (conv) {
          const { data: msgs } = await supabase.from('conversation_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
          setMessages((msgs as ConversationMessage[]) ?? []);
        }
      }
    });
  }, [id, profile]);

  const refreshDocs = async () => {
    if (!id) return;
    const { data: refreshed } = await supabase.from('application_documents').select('*').eq('application_id', id).order('uploaded_at', { ascending: false });
    setDocs(refreshed ?? []);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType?: string, replaceDocId?: string, requestId?: string) => {
    const file = e.target.files?.[0];
    if (!file || !id || !profile || !app) return;

    const MAX = 10 * 1024 * 1024;
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (file.size > MAX) { setError('File size must be under 10 MB.'); return; }
    if (!ALLOWED.includes(file.type)) { setError('Only PDF, JPG, PNG, and WebP files are allowed.'); return; }

    setError('');
    setUploading(true);

    const type = docType || newDocType;
    const filePath = `${profile.id}/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, file);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    // If replacing a doc, delete old file and update the record
    if (replaceDocId) {
      const oldDoc = docs.find(d => d.id === replaceDocId);
      if (oldDoc) {
        await supabase.storage.from('agent-documents').remove([oldDoc.file_path]);
        await supabase.from('application_documents').delete().eq('id', replaceDocId);
      }
    }

    // Also remove any other docs of the same type (auto-remove old version)
    const oldDocsSameType = docs.filter(d => d.document_type === type && d.id !== replaceDocId);
    for (const oldDoc of oldDocsSameType) {
      await supabase.storage.from('agent-documents').remove([oldDoc.file_path]);
      await supabase.from('application_documents').delete().eq('id', oldDoc.id);
    }

    await supabase.from('application_documents').insert({
      application_id: id,
      agent_id: profile.id,
      document_type: type,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      status: 'uploaded',
    });

    // Mark the doc request as fulfilled
    if (requestId) {
      await supabase.from('document_requests').update({ status: 'fulfilled', fulfilled_at: new Date().toISOString() }).eq('id', requestId);
      const { data: refreshedReqs } = await supabase.from('document_requests').select('*').eq('application_id', id).order('created_at', { ascending: false });
      setDocRequests(refreshedReqs ?? []);
    }

    await refreshDocs();
    setUploading(false);
    e.target.value = '';
  };

  const handleDownload = async (path: string) => {
    const { data, error } = await supabase.storage.from('agent-documents').createSignedUrl(path, 60);
    if (data && !error) window.open(data.signedUrl, '_blank');
  };

  const sendMessage = async () => {
    if (!app || !messageText.trim() || !profile) return;
    setSendingMessage(true);

    const { data: existingConv } = await supabase.from('conversations').select('id').eq('application_id', app.id).maybeSingle();
    let convId = existingConv?.id;
    if (!convId) {
      const { data: newConv } = await supabase.from('conversations').insert({
        application_id: app.id,
        student_id: app.student_id || null,
        agent_id: profile.id,
        subject: `Re: Application - ${app.student_full_name}`,
        created_by: profile.id,
      }).select('id').single();
      convId = newConv?.id;
    }

    await supabase.from('conversation_messages').insert({
      conversation_id: convId,
      sender_id: profile.id,
      sender_role: 'agent',
      sender_name: profile.full_name,
      body: messageText,
    });

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', convId);

    // Notify admins
    const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin']);
    if (admins) {
      for (const admin of admins) {
        await supabase.from('agent_notifications').insert({
          user_id: admin.id,
          title: 'New message from agent',
          message: messageText.substring(0, 100),
          type: 'general',
        });
      }
    }

    setMessageText('');
    setSendingMessage(false);

    const { data: msgs } = await supabase.from('conversation_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    setMessages((msgs as ConversationMessage[]) ?? []);
  };

  const payInstallment = async (installmentId: string) => {
    setPaying(true);
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
    setPaying(false);
  };

  const uploadSignedOffer = async () => {
    if (!app || !signedOfferFile || !profile) return;
    setUploadingSignedOffer(true);
    try {
      const filePath = `offers/${app.id}/signed_${Date.now()}_${signedOfferFile.name}`;
      const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, signedOfferFile);
      if (uploadError) throw uploadError;

      await supabase.from('agent_applications').update({
        signed_offer_path: filePath,
        signed_offer_uploaded_at: new Date().toISOString(),
        offer_accepted: false,
        status: 'signed_offer_review',
        updated_at: new Date().toISOString(),
      }).eq('id', app.id);

      const { data: admins } = await supabase.from('profiles').select('id').in('role', ['admin', 'super_admin']);
      if (admins) {
        for (const admin of admins) {
          await supabase.from('agent_notifications').insert({
            user_id: admin.id,
            title: 'Signed Offer Uploaded — Review Required',
            message: `${app.student_full_name} has uploaded a signed offer letter. Please review and approve or reject it.`,
            type: 'offer',
          });
        }
      }

      setSignedOfferFile(null);
      setApp({ ...app, signed_offer_path: filePath, offer_accepted: false, status: 'signed_offer_review' });
    } catch (err: any) {
      alert(err.message || 'Failed to upload signed offer');
    }
    setUploadingSignedOffer(false);
  };

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>;

  if (!app) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Application not found</p>
        <Link to="/agent/applications" className="text-blue-700 font-semibold text-sm mt-2 inline-block">Back to applications</Link>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(app.status);
  const isRejected = app.status === 'rejected';
  const isCancelled = app.status === 'cancelled';
  const displayName = [app.student_first_name, app.student_middle_name, app.student_last_name].filter(Boolean).join(' ') || app.student_full_name;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={() => navigate('/agent/applications')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{displayName}</h1>
            <div className="flex-shrink-0"><AgentAppStatusBadge status={app.status} /></div>
          </div>
          <p className="text-slate-500 text-sm mt-1 truncate">Application ID: {app.application_id ?? '—'} • Created {new Date(app.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Progress tracker */}
      {!isRejected && !isCancelled && app.status !== 'draft' && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-4 sm:p-6">
          <h3 className="font-bold text-slate-900 mb-4">Application Progress</h3>
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex items-center justify-between min-w-[700px] sm:min-w-0">
              {statusOrder.map((s, i) => (
                <div key={s} className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                    i <= currentStepIndex ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i < currentStepIndex ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                  </div>
                  <span className={`text-[10px] sm:text-xs text-center whitespace-nowrap ${i <= currentStepIndex ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                    {AGENT_APP_STATUS_LABELS[s]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <CollapsibleCard title="Student Information" icon={User}>
            <div className="space-y-3 text-sm">
              <div><p className="text-xs text-slate-400">Full Name</p><p className="font-medium text-slate-800">{displayName || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Date of Birth</p><p className="font-medium text-slate-800">{app.student_dob ? new Date(app.student_dob).toLocaleDateString() : '—'}</p></div>
              <div><p className="text-xs text-slate-400">Email</p><p className="font-medium text-slate-800">{app.student_email || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Phone</p><p className="font-medium text-slate-800">{app.student_phone || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Nationality</p><p className="font-medium text-slate-800">{app.student_nationality || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Current Country</p><p className="font-medium text-slate-800">{app.student_current_country || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Passport Number</p><p className="font-medium text-slate-800">{app.student_passport_number || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Education Level</p><p className="font-medium text-slate-800">{app.student_education_level || '—'}</p></div>
              <div><p className="text-xs text-slate-400">English Test</p><p className="font-medium text-slate-800">{app.student_english_test_status || '—'}</p></div>
              <div><p className="text-xs text-slate-400">Preferred Intake</p><p className="font-medium text-slate-800">{app.preferred_intake || '—'}</p></div>
              {app.agent_notes && <div><p className="text-xs text-slate-400">Agent Notes</p><p className="font-medium text-slate-800">{app.agent_notes}</p></div>}
            </div>
          </CollapsibleCard>

          {/* Offer Letter */}
          {app.offer_letter_path && (
            <CollapsibleCard title="Offer Letter" icon={Award} defaultOpen={false}>
              <div className="space-y-3">
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <p className="text-sm font-semibold text-indigo-700">Offer Letter Issued</p>
                  </div>
                  <button onClick={() => handleDownload(app.offer_letter_path!)} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download Offer Letter
                  </button>
                  <p className="text-xs text-slate-400 mt-1">Issued: {app.offer_letter_uploaded_at ? new Date(app.offer_letter_uploaded_at).toLocaleDateString() : '—'}</p>
                </div>

                {app.offer_accepted && app.signed_offer_path ? (
                  <div className="p-3 bg-teal-50 rounded-xl border border-teal-100">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-teal-600" />
                      <p className="text-sm font-semibold text-teal-700">Signed Offer Approved</p>
                    </div>
                    <button onClick={() => handleDownload(app.signed_offer_path!)} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> Download Signed Offer
                    </button>
                    <p className="text-xs text-slate-400 mt-1">Accepted: {app.offer_accepted_at ? new Date(app.offer_accepted_at).toLocaleDateString() : '—'}</p>
                  </div>
                ) : app.signed_offer_path && app.status === 'signed_offer_review' ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-700">Signed Offer Under Review</p>
                    </div>
                    <p className="text-xs text-amber-600 mb-2">Your signed offer has been uploaded and is awaiting admin review. You'll be notified once it's approved or if you need to re-sign.</p>
                    <button onClick={() => handleDownload(app.signed_offer_path!)} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                      <Download className="w-3 h-3" /> View Uploaded Signed Offer
                    </button>
                  </div>
                ) : (app.status === 'offer_letter_sent' || app.status === 'waiting_for_signature') ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">To accept the offer, upload your signed offer letter:</p>
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => setSignedOfferFile(e.target.files?.[0] ?? null)} disabled={uploadingSignedOffer} />
                      <FileSignature className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 truncate">{signedOfferFile ? signedOfferFile.name : 'Choose signed offer…'}</span>
                    </label>
                    <Button size="sm" className="w-full" loading={uploadingSignedOffer} onClick={uploadSignedOffer} disabled={!signedOfferFile}>
                      <FileSignature className="w-4 h-4" /> Upload Signed Offer
                    </Button>
                  </div>
                ) : null}
              </div>
            </CollapsibleCard>
          )}

          {/* Payment Panel */}
          {(app.status === 'waiting_for_payment' || installments.length > 0) && !app.coe_path && (
            <CollapsibleCard title="Payment" icon={CreditCard}>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm font-semibold text-blue-700">Tuition Fee: ${app.tuition_fee ? parseFloat(app.tuition_fee.toString()).toLocaleString() : '—'}</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {app.payment_plan_type === 'emi' ? 'EMI Plan: Pay acceptance fee first, then remaining balance in 3 installments.' : 'Full payment required.'}
                  </p>
                </div>
                {installments.length > 0 && (
                  <div className="space-y-2">
                    {installments.map((inst) => {
                      const isOverdue = inst.status === 'pending' && new Date(inst.due_date) < new Date();
                      return (
                        <div key={inst.id} className={`p-3 rounded-xl border ${inst.status === 'paid' ? 'bg-green-50 border-green-200' : isOverdue ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
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
                              <Button size="sm" loading={paying} onClick={() => payInstallment(inst.id)}>
                                <CreditCard className="w-4 h-4" /> Pay Now
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {installments.every((i) => i.status === 'paid') && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-700">All payments complete! Your COE will be issued shortly.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleCard>
          )}

          {/* COE */}
          {app.coe_path && (
            <CollapsibleCard title="Confirmation of Enrolment" icon={CheckCircle} defaultOpen={false}>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">COE Issued</p>
                </div>
                <button onClick={() => handleDownload(app.coe_path!)} className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1">
                  <Download className="w-3 h-3" /> Download COE
                </button>
                <p className="text-xs text-slate-400 mt-1">Issued: {app.coe_issued_at ? new Date(app.coe_issued_at).toLocaleDateString() : '—'}</p>
              </div>
            </CollapsibleCard>
          )}

          {/* Enrollment Link */}
          {app.enrollment_url && (
            <CollapsibleCard title="Enrollment" icon={Link2} defaultOpen={false}>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-sm font-semibold text-blue-700 mb-2">You're enrolled! Click below to complete enrollment:</p>
                <a href={app.enrollment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-700 font-semibold hover:underline">
                  <ExternalLink className="w-4 h-4" /> Open Enrollment Link
                </a>
              </div>
            </CollapsibleCard>
          )}
        </div>

        {/* Right content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course */}
          <CollapsibleCard title="Course Details" icon={BookOpen}>
            {app.courses ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-800 text-base">{app.courses.title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="text-slate-400">CRICOS:</span> <span className="text-slate-700">{app.courses.cricos_code || '—'}</span></div>
                  <div><span className="text-slate-400">Level:</span> <span className="text-slate-700 capitalize">{app.courses.level.replace('_', ' ')}</span></div>
                  <div><span className="text-slate-400">Campus:</span> <span className="text-slate-700">{app.courses.campus}</span></div>
                  <div><span className="text-slate-400">Duration:</span> <span className="text-slate-700">{app.courses.duration}</span></div>
                  {app.courses.fees && <div><span className="text-slate-400">Int. Fee:</span> <span className="text-slate-700">${app.courses.fees.international?.toLocaleString()}</span></div>}
                  {app.courses.entry_requirements && <div className="col-span-2"><span className="text-slate-400">Entry Requirements:</span> <span className="text-slate-700">{app.courses.entry_requirements}</span></div>}
                </div>
              </div>
            ) : <p className="text-slate-400 text-sm">No course selected</p>}
          </CollapsibleCard>

          {/* GSA Summary */}
          <GSASummary app={app} defaultOpen={false} />

          {/* Public comment (visible) */}
          {app.public_comment && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-5 border-l-4 border-blue-400">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-500" /> Message from Admissions
              </h3>
              <p className="text-sm text-slate-700">{app.public_comment}</p>
            </motion.div>
          )}

          {/* Document Requests from Admin */}
          {docRequests.filter(r => r.status === 'pending').length > 0 && (
            <CollapsibleCard title="Document Requests from Admin" icon={Bell} badge={<span className="text-xs text-orange-600 font-semibold ml-2">{docRequests.filter(r => r.status === 'pending').length} pending</span>}>
              <div className="space-y-3">
                {docRequests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <p className="text-sm font-medium text-slate-800">{req.document_type}</p>
                    {req.description && <p className="text-xs text-slate-600 mt-0.5">{req.description}</p>}
                    <p className="text-xs text-slate-400 mt-1">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                    <label className="flex items-center gap-2 mt-2 p-2.5 border-2 border-dashed border-orange-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors bg-white">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => handleUpload(e, req.document_type, undefined, req.id)} disabled={uploading} />
                      {uploading ? (
                        <><div className="w-4 h-4 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /><span className="text-sm text-blue-700">Uploading…</span></>
                      ) : (
                        <><Upload className="w-4 h-4 text-orange-500" /><span className="text-sm text-slate-600">Upload {req.document_type}</span></>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}

          {/* Conversation Thread */}
          <CollapsibleCard title="Conversation with Admin" icon={MessageSquare} badge={messages.length > 0 ? <span className="text-xs text-slate-500 ml-2">{messages.length} messages</span> : undefined}>
            {messages.length > 0 && (
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'agent' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl ${msg.sender_role === 'agent' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <p className="text-xs font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p className="text-xs mt-1 opacity-50">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message to admin…" rows={3} className="input-field text-sm resize-none" />
              <Button size="sm" className="w-full" loading={sendingMessage} onClick={sendMessage} disabled={!messageText.trim()}>
                <Send className="w-4 h-4" /> {messages.length > 0 ? 'Reply' : 'Send Message'}
              </Button>
            </div>
          </CollapsibleCard>

          {/* Approval History */}
          {snapshots.length > 0 && (
            <CollapsibleCard title="Approval History" icon={History} defaultOpen={false}>
              <div className="space-y-2">
                {snapshots.map(snap => (
                  <div key={snap.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      snap.status === 'approved' ? 'bg-green-100' : snap.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {snap.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       snap.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
                       <Clock className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 capitalize">{snap.status.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">By {snap.approved_by_name || 'Admin'}</p>
                      {snap.comment && <p className="text-xs text-slate-600 mt-1">{snap.comment}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(snap.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleCard>
          )}

          {/* Documents */}
          <CollapsibleCard title={`Documents (${docs.length})`} icon={FileText}>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {app.status !== 'enrolled' && app.status !== 'cancelled' && (
              <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="label">Document Type</label>
                    <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="input-field">
                      {AGENT_DOC_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => handleUpload(e)} disabled={uploading} />
                      {uploading ? (
                        <><div className="w-4 h-4 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /><span className="text-sm text-blue-700">Uploading…</span></>
                      ) : (
                        <><Upload className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600">Upload Document</span></>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {docs.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">No documents uploaded yet</div>
            ) : (
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'approved' ? 'bg-green-100' :
                      doc.status === 'rejected' ? 'bg-red-100' :
                      doc.status === 'under_review' ? 'bg-amber-100' : 'bg-blue-50'
                    }`}>
                      {doc.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       doc.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
                       doc.status === 'under_review' ? <Clock className="w-4 h-4 text-amber-500" /> :
                       <FileText className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{doc.file_name}</p>
                      <p className="text-xs text-slate-400">{doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''}</p>
                      {doc.status === 'rejected' && (
                        <div className="flex items-center gap-1 mt-1">
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-xs text-red-600">Rejected — upload a new version</span>
                          <label className="ml-2 flex items-center gap-1 text-xs text-blue-700 font-semibold cursor-pointer hover:underline">
                            <Upload className="w-3 h-3" /> Replace
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => handleUpload(e, doc.document_type, doc.id)} disabled={uploading} />
                          </label>
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0"><DocStatusBadge status={doc.status} /></div>
                    <button onClick={() => handleDownload(doc.file_path)} className="p-2.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CollapsibleCard>
        </div>
      </div>
    </div>
  );
}
