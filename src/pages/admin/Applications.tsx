import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, CheckCircle, XCircle, Eye, FileText, Download, Paperclip,
  AlertCircle, ArrowLeft, MessageSquare, FilePlus, Send, History, UserPlus, Clock,
  ShieldCheck, MapPin, GraduationCap, ChevronDown, ChevronUp, Upload, Award, FileSignature, Link2, ExternalLink, PenLine,
  CreditCard, DollarSign, CalendarClock, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ApplicationDocument, DocumentRequest, ApprovalSnapshot, ConversationMessage } from '../../types';
import { computeGSAStatus } from '../../lib/gsa';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

const docStatusColors: Record<string, string> = {
  uploaded: 'bg-blue-100 text-blue-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  required: 'bg-orange-100 text-orange-700',
  missing: 'bg-red-100 text-red-700',
};

const ALL_STATUSES = [
  'all', 'submitted', 'under_review', 'documents_required',
  'approved', 'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled', 'rejected', 'cancelled',
];

const STATUS_LABELS: Record<string, string> = {
  all: 'All Status', submitted: 'Submitted', under_review: 'Under Review',
  documents_required: 'Documents Required',
  approved: 'Approved', offer_letter_sent: 'Offer Letter Sent',
  waiting_for_signature: 'Waiting for Signature', signed_offer_review: 'Signed Offer Under Review',
  offer_accepted: 'Offer Accepted',
  waiting_for_payment: 'Waiting for Payment', paid_coe_issued: 'Paid / COE Issued',
  enrolled: 'Enrolled', rejected: 'Rejected', cancelled: 'Cancelled',
};

const UPDATEABLE_STATUSES = [
  'under_review', 'documents_required', 'approved',
  'offer_letter_sent', 'waiting_for_signature', 'signed_offer_review', 'offer_accepted',
  'waiting_for_payment', 'paid_coe_issued', 'enrolled', 'rejected', 'cancelled',
];

export default function AdminApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);
  const [docs, setDocs] = useState<ApplicationDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [publicComment, setPublicComment] = useState('');
  const [savingComment, setSavingComment] = useState(false);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [uploadingOffer, setUploadingOffer] = useState(false);
  const [coeFile, setCoeFile] = useState<File | null>(null);
  const [uploadingCoe, setUploadingCoe] = useState(false);
  const [enrollmentUrl, setEnrollmentUrl] = useState('');
  const [savingEnrollmentUrl, setSavingEnrollmentUrl] = useState(false);
  const [docRequests, setDocRequests] = useState<DocumentRequest[]>([]);
  const [newDocType, setNewDocType] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [sendingRequest, setSendingRequest] = useState(false);
  const [snapshots, setSnapshots] = useState<ApprovalSnapshot[]>([]);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([]);
  const [reviewingOffer, setReviewingOffer] = useState(false);
  const [addingApproval, setAddingApproval] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [approvalPrintName, setApprovalPrintName] = useState('');
  const [approvalDate, setApprovalDate] = useState('');
  const [approvalSignature, setApprovalSignature] = useState('');
  const [installments, setInstallments] = useState<any[]>([]);
  const [tuitionFee, setTuitionFee] = useState('');
  const [offerAcceptanceFee, setOfferAcceptanceFee] = useState('');
  const [paymentPlanType, setPaymentPlanType] = useState<'full' | 'emi'>('full');
  const [courseDurationMonths, setCourseDurationMonths] = useState('6');
  const [savingPaymentPlan, setSavingPaymentPlan] = useState(false);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [paymentPlanConfigured, setPaymentPlanConfigured] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const load = useCallback(async () => {
    const { data: apps, error } = await supabase
      .from('agent_applications')
      .select('*, courses(title, level, campus)')
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error || !apps) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const agentIds = [...new Set(apps.map(a => a.agent_id).filter(Boolean))] as string[];
    let agentMap: Record<string, { agency_name: string; contact_person: string }> = {};
    if (agentIds.length > 0) {
      const { data: agents } = await supabase
        .from('agents')
        .select('user_id, agency_name, contact_person')
        .in('user_id', agentIds);
      agentMap = Object.fromEntries((agents ?? []).map(a => [a.user_id, a]));
    }

    setApplications(apps.map(a => ({ ...a, agent_info: agentMap[a.agent_id] ?? null })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadDocs = useCallback((appId: string) => {
    setDocsLoading(true);
    supabase.from('application_documents').select('*').eq('application_id', appId).order('uploaded_at', { ascending: false })
      .then(({ data }) => { setDocs((data as ApplicationDocument[]) ?? []); setDocsLoading(false); });
  }, []);

  const loadDocRequests = useCallback(async (appId: string) => {
    const { data } = await supabase.from('document_requests').select('*').eq('application_id', appId).order('created_at', { ascending: false });
    setDocRequests((data as DocumentRequest[]) ?? []);
  }, []);

  const loadSnapshots = useCallback(async (appId: string) => {
    const { data } = await supabase.from('approval_snapshots').select('*').eq('application_id', appId).order('created_at', { ascending: false });
    setSnapshots((data as ApprovalSnapshot[]) ?? []);
  }, []);

  useEffect(() => {
    if (selected) {
      loadDocs(selected.id);
      loadDocRequests(selected.id);
      loadSnapshots(selected.id);
      setAdminComment(selected.admin_comment || '');
      setPublicComment(selected.public_comment || '');
      setEnrollmentUrl(selected.enrollment_url || '');
      setTuitionFee(selected.tuition_fee?.toString() || '');
      setOfferAcceptanceFee(selected.offer_acceptance_fee?.toString() || '');
      setPaymentPlanType(selected.payment_plan_type || 'full');
      setCourseDurationMonths(selected.course_duration_months?.toString() || '6');
      setPaymentPlanConfigured(!!selected.payment_plan_configured_at);
      loadInstallments(selected.id);
      // Load conversation messages
      supabase.from('conversations').select('id').eq('application_id', selected.id).maybeSingle().then(async ({ data: conv }) => {
        if (conv) {
          const { data: msgs } = await supabase.from('conversation_messages').select('*').eq('conversation_id', conv.id).order('created_at', { ascending: true });
          setConversationMessages((msgs as ConversationMessage[]) ?? []);
        } else {
          setConversationMessages([]);
        }
      });
    } else {
      setDocs([]); setDocRequests([]); setSnapshots([]); setConversationMessages([]); setInstallments([]);
    }
  }, [selected, loadDocs, loadDocRequests, loadSnapshots]);

  const filtered = applications.filter((a) => {
    const name = a.student_full_name ?? '';
    const course = a.courses?.title ?? '';
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) ||
      course.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const loadInstallments = useCallback(async (appId: string) => {
    setLoadingInstallments(true);
    const { data } = await supabase
      .from('payment_installments')
      .select('*')
      .eq('application_id', appId)
      .order('installment_number', { ascending: true });
    setInstallments(data ?? []);
    setLoadingInstallments(false);
  }, []);

  const savePaymentPlan = async () => {
    if (!selected) return;
    const fee = parseFloat(tuitionFee);
    if (!fee || fee <= 0) { alert('Please enter a valid tuition fee.'); return; }
    setSavingPaymentPlan(true);
    try {
      await supabase.from('agent_applications').update({
        tuition_fee: fee,
        offer_acceptance_fee: paymentPlanType === 'emi' ? parseFloat(offerAcceptanceFee) || 0 : fee,
        payment_plan_type: paymentPlanType,
        course_duration_months: parseInt(courseDurationMonths) || 6,
        payment_plan_configured_at: new Date().toISOString(),
        payment_plan_configured_by: user?.id,
        status: 'waiting_for_payment',
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      }).eq('id', selected.id);

      await supabase.from('payment_installments').delete().eq('application_id', selected.id);

      const newInstallments: any[] = [];
      if (paymentPlanType === 'full') {
        newInstallments.push({
          application_id: selected.id, installment_number: 1, label: 'Full Tuition Fee',
          amount: fee, due_date: new Date().toISOString().split('T')[0], status: 'pending',
        });
      } else {
        const acceptanceFee = parseFloat(offerAcceptanceFee) || 0;
        const remaining = fee - acceptanceFee;
        const durationMonths = parseInt(courseDurationMonths) || 6;
        const installmentCount = 3;
        const perInstallment = Math.round((remaining / installmentCount) * 100) / 100;
        newInstallments.push({
          application_id: selected.id, installment_number: 1, label: 'Offer Acceptance Fee',
          amount: acceptanceFee, due_date: new Date().toISOString().split('T')[0], status: 'pending',
        });
        const intervalMonths = Math.floor(durationMonths / installmentCount);
        for (let i = 1; i <= installmentCount; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i * intervalMonths);
          newInstallments.push({
            application_id: selected.id, installment_number: i + 1, label: `Installment ${i} of ${installmentCount}`,
            amount: i === installmentCount ? Math.round((remaining - perInstallment * (installmentCount - 1)) * 100) / 100 : perInstallment,
            due_date: dueDate.toISOString().split('T')[0], status: 'pending',
          });
        }
      }
      await supabase.from('payment_installments').insert(newInstallments);

      if (selected.agent_id) {
        await supabase.from('agent_notifications').insert({
          user_id: selected.agent_id, title: 'Payment Plan Set Up',
          message: `A payment plan has been configured for ${selected.student_full_name}. Total: ${fee.toLocaleString()}${paymentPlanType === 'emi' ? ` (${paymentPlanType.toUpperCase()})` : ' (Full payment)'}.`,
          type: 'status_change',
        });
      }
      if (selected.student_id) {
        await supabase.from('messages').insert({
          student_id: selected.student_id, sender_role: 'admin', subject: 'Payment Plan Set Up',
          content: `Your payment plan has been configured. Total tuition fee: ${fee.toLocaleString()}.${paymentPlanType === 'emi' ? ' You can pay the offer acceptance fee first, then the remaining balance in installments.' : ' Please pay the full amount to proceed.'}`,
        });
      }

      await loadInstallments(selected.id);
      setPaymentPlanConfigured(true);
      load();
      setSelected({ ...selected, tuition_fee: fee, payment_plan_type: paymentPlanType, status: 'waiting_for_payment', payment_status: 'pending' });
    } catch (err: any) {
      alert(err.message || 'Failed to save payment plan');
    }
    setSavingPaymentPlan(false);
  };

  const markInstallmentPaid = async (instId: string) => {
    setUpdating(true);
    await supabase.from('payment_installments').update({
      status: 'paid', paid_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', instId);
    if (selected) {
      await loadInstallments(selected.id);
      const { data: allInst } = await supabase.from('payment_installments').select('status').eq('application_id', selected.id);
      const allPaid = (allInst ?? []).every(i => i.status === 'paid');
      if (allPaid) {
        await supabase.from('agent_applications').update({
          payment_status: 'paid', payment_completed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }).eq('id', selected.id);
        load();
        setSelected({ ...selected, payment_status: 'paid' });
      }
    }
    setUpdating(false);
  };

  const updateStatus = async (id: string, status: string) => {
    // If approving via dropdown, redirect to the approval form instead
    if (status === 'approved') {
      setApprovalPrintName(profile?.full_name || '');
      setApprovalDate(new Date().toISOString().split('T')[0]);
      setApprovalSignature(profile?.signature || '');
      setShowApprovalForm(true);
      return;
    }
    setUpdating(true);
    await supabase.from('agent_applications').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, action: `update_application_status_${status}`, target_table: 'agent_applications', target_id: id });

    // Create approval snapshot for significant status changes
    if (['approved', 'rejected', 'enrolled', 'offer_letter_sent', 'paid_coe_issued'].includes(status)) {
      const app = applications.find(a => a.id === id);
      const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();
      await supabase.from('approval_snapshots').insert({
        application_id: id,
        status,
        approved_by: user?.id,
        approved_by_name: profileData?.full_name || 'Admin',
        signature: profile?.signature || null,
        snapshot: app || {},
        comment: adminComment || '',
      });
    }

    // Notify agent if application is from an agent
    const app = applications.find(a => a.id === id);
    if (app?.agent_id) {
      await supabase.from('agent_notifications').insert({
        user_id: app.agent_id,
        title: `Application status changed to ${status.replace('_', ' ')}`,
        message: `Application for ${app.student_full_name} has been updated to ${status.replace('_', ' ')}.`,
        type: 'status_change',
      });
    }

    // Notify student if they have an account
    if (app?.student_id) {
      await supabase.from('messages').insert({
        student_id: app.student_id,
        sender_role: 'admin',
        subject: `Application Status Update`,
        content: `Your application for ${app.courses?.title ?? 'your course'} has been updated to: ${status.replace('_', ' ')}.${publicComment ? `\n\nNote: ${publicComment}` : ''}`,
      });
    }

    load();
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev);
    setUpdating(false);
  };

  const updateDocStatus = async (docId: string, status: 'approved' | 'rejected') => {
    setUpdating(true);
    await supabase.from('application_documents').update({ status }).eq('id', docId);
    await supabase.from('audit_logs').insert({ user_id: user?.id, action: `update_document_status_${status}`, target_table: 'application_documents', target_id: docId });
    if (selected) loadDocs(selected.id);
    setUpdating(false);
  };

  const saveAdminComment = async () => {
    if (!selected) return;
    setSavingComment(true);
    await supabase.from('agent_applications').update({ admin_comment: adminComment, public_comment: publicComment }).eq('id', selected.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, action: 'update_admin_comment', target_table: 'agent_applications', target_id: selected.id });
    setSelected({ ...selected, admin_comment: adminComment, public_comment: publicComment });
    setSavingComment(false);
  };

  const uploadOfferLetter = async () => {
    if (!selected || !offerFile) return;
    setUploadingOffer(true);
    try {
      const filePath = `offers/${selected.id}/${Date.now()}_${offerFile.name}`;
      const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, offerFile);
      if (uploadError) throw uploadError;
      await supabase.from('agent_applications').update({
        offer_letter_path: filePath,
        offer_letter_uploaded_at: new Date().toISOString(),
        status: 'offer_letter_sent',
        updated_at: new Date().toISOString(),
      }).eq('id', selected.id);
      if (selected.agent_id) {
        await supabase.from('agent_notifications').insert({
          user_id: selected.agent_id,
          title: 'Offer Letter Ready',
          message: `An offer letter has been issued for ${selected.student_full_name}. Please review and accept.`,
          type: 'offer',
        });
      }
      if (selected.student_id) {
        await supabase.from('messages').insert({
          student_id: selected.student_id,
          sender_role: 'admin',
          subject: 'Offer Letter Ready',
          content: `An offer letter has been issued for your application. Please review and accept.`,
        });
      }
      setOfferFile(null);
      load();
      setSelected({ ...selected, offer_letter_path: filePath, status: 'offer_letter_sent' });
    } catch (err: any) {
      alert(err.message || 'Failed to upload offer letter');
    }
    setUploadingOffer(false);
  };

  const uploadCoe = async () => {
    if (!selected || !coeFile) return;
    setUploadingCoe(true);
    try {
      const filePath = `coe/${selected.id}/${Date.now()}_${coeFile.name}`;
      const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, coeFile);
      if (uploadError) throw uploadError;
      await supabase.from('agent_applications').update({
        coe_path: filePath,
        coe_issued_at: new Date().toISOString(),
        status: 'paid_coe_issued',
        updated_at: new Date().toISOString(),
      }).eq('id', selected.id);
      if (selected.agent_id) {
        await supabase.from('agent_notifications').insert({
          user_id: selected.agent_id,
          title: 'COE Issued',
          message: `A Confirmation of Enrolment has been issued for ${selected.student_full_name}.`,
          type: 'enrolment',
        });
      }
      if (selected.student_id) {
        await supabase.from('messages').insert({
          student_id: selected.student_id,
          sender_role: 'admin',
          subject: 'COE Issued',
          content: `A Confirmation of Enrolment has been issued for your application.`,
        });
      }
      setCoeFile(null);
      load();
      setSelected({ ...selected, coe_path: filePath, status: 'paid_coe_issued' });
    } catch (err: any) {
      alert(err.message || 'Failed to upload COE');
    }
    setUploadingCoe(false);
  };

  const saveEnrollmentUrl = async () => {
    if (!selected) return;
    setSavingEnrollmentUrl(true);
    await supabase.from('agent_applications').update({
      enrollment_url: enrollmentUrl || null,
      status: 'enrolled',
      enrolled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', selected.id);
    if (selected.agent_id) {
      await supabase.from('agent_notifications').insert({
        user_id: selected.agent_id,
        title: 'Enrollment Link Ready',
        message: `An enrollment link has been provided for ${selected.student_full_name}.`,
        type: 'enrolment',
      });
    }
    if (selected.student_id) {
      await supabase.from('messages').insert({
        student_id: selected.student_id,
        sender_role: 'admin',
        subject: 'Enrollment Link Ready',
        content: `An enrollment link has been provided for your application. Please complete your enrollment.`,
      });
    }
    load();
    setSelected({ ...selected, enrollment_url, status: 'enrolled' });
    setSavingEnrollmentUrl(false);
  };

  const addApproval = async () => {
    if (!selected || !approvalPrintName.trim() || !approvalSignature.trim()) return;
    setAddingApproval(true);
    await supabase.from('approval_snapshots').insert({
      application_id: selected.id,
      status: 'approved',
      approved_by: user?.id,
      approved_by_name: approvalPrintName.trim(),
      signature: approvalSignature.trim(),
      snapshot: { ...selected, approval_date: approvalDate, approval_print_name: approvalPrintName.trim() },
      comment: `${approvalComment ? approvalComment + ' | ' : ''}Approved on ${approvalDate}`,
    });
    await supabase.from('agent_applications').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', selected.id);
    await supabase.from('audit_logs').insert({ user_id: user?.id, action: 'approve_application', target_table: 'agent_applications', target_id: selected.id });
    if (selected.agent_id) {
      await supabase.from('agent_notifications').insert({
        user_id: selected.agent_id,
        title: 'Application Approved',
        message: `Application for ${selected.student_full_name} has been approved by ${approvalPrintName.trim()}.`,
        type: 'status_change',
      });
    }
    setApprovalComment('');
    setApprovalPrintName('');
    setApprovalDate('');
    setApprovalSignature('');
    setShowApprovalForm(false);
    await loadSnapshots(selected.id);
    load();
    setSelected({ ...selected, status: 'approved' });
    setAddingApproval(false);
  };

  const handleDownload = async (doc: ApplicationDocument) => {
    setDownloadingId(doc.id);
    const { data } = await supabase.storage.from('agent-documents').createSignedUrl(doc.file_path, 60);
    if (data) window.open(data.signedUrl, '_blank');
    setDownloadingId(null);
  };

  const sendDocRequest = async () => {
    if (!selected || !newDocType.trim()) return;
    setSendingRequest(true);
    await supabase.from('document_requests').insert({
      application_id: selected.id,
      requested_by: user?.id,
      document_type: newDocType,
      description: newDocDesc || null,
    });

    // Update application status to documents_required
    await supabase.from('agent_applications').update({ status: 'documents_required' }).eq('id', selected.id);

    // Notify agent
    if (selected.agent_id) {
      await supabase.from('agent_notifications').insert({
        user_id: selected.agent_id,
        title: 'Document Request',
        message: `Document requested: ${newDocType}. ${newDocDesc || ''}`,
        type: 'document_request',
      });
    }

    // Notify student
    if (selected.student_id) {
      await supabase.from('messages').insert({
        student_id: selected.student_id,
        sender_role: 'admin',
        subject: 'Document Request',
        content: `Please upload the following document: ${newDocType}. ${newDocDesc || ''}`,
      });
    }

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'request_document',
      target_table: 'agent_applications',
      target_id: selected.id,
      metadata: { document_type: newDocType },
    });

    setNewDocType(''); setNewDocDesc('');
    loadDocRequests(selected.id);
    load();
    setSelected({ ...selected, status: 'documents_required' });
    setSendingRequest(false);
  };

  const createStudentAccount = async () => {
    if (!selected) return;
    setCreatingAccount(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ applicationId: selected.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create account');

      if (result.tempPassword) {
        alert(`Student account created!\n\nEmail: ${result.email || selected.student_email}\nTemporary Password: ${result.tempPassword}\n\nThe student will be required to set a new password on first login. Please share these credentials with the student securely.`);
      } else {
        alert(`Student account created! Login credentials sent to ${result.email || selected.student_email}`);
      }
      load();
      loadSnapshots(selected.id);
    } catch (err: any) {
      alert(err.message || 'Failed to create student account');
    }
    setCreatingAccount(false);
  };

  const sendMessage = async () => {
    if (!selected || !messageText.trim()) return;
    setSendingMessage(true);

    // Create or find conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('application_id', selected.id)
      .maybeSingle();

    let convId = existingConv?.id;
    if (!convId) {
      const { data: newConv } = await supabase.from('conversations').insert({
        application_id: selected.id,
        student_id: selected.student_id || null,
        agent_id: selected.agent_id || null,
        subject: `Re: Application - ${selected.student_full_name}`,
        created_by: user?.id,
      }).select('id').single();
      convId = newConv?.id;
    }

    const { data: profileData } = await supabase.from('profiles').select('full_name').eq('id', user?.id).maybeSingle();

    await supabase.from('conversation_messages').insert({
      conversation_id: convId,
      sender_id: user?.id,
      sender_role: 'admin',
      sender_name: profileData?.full_name || 'Admin',
      body: messageText,
    });

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', convId);

    // Reload conversation messages
    const { data: msgs } = await supabase.from('conversation_messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    setConversationMessages((msgs as ConversationMessage[]) ?? []);

    // Also create a notification
    if (selected.agent_id) {
      await supabase.from('agent_notifications').insert({
        user_id: selected.agent_id,
        title: 'New message from admin',
        message: messageText.substring(0, 100),
        type: 'general',
      });
    }
    if (selected.student_id) {
      await supabase.from('messages').insert({
        student_id: selected.student_id,
        sender_role: 'admin',
        subject: 'New message from admin',
        content: messageText,
      });
    }

    setMessageText('');
    setShowMessageForm(false);
    setSendingMessage(false);
  };

  const approvedCount = docs.filter(d => d.status === 'approved').length;
  const rejectedCount = docs.filter(d => d.status === 'rejected').length;
  const pendingCount = docs.filter(d => !['approved', 'rejected'].includes(d.status)).length;
  const hasUnreviewedDocs = pendingCount > 0;

  // Full-page detail view
  if (selected) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{selected.student_full_name}</h1>
              <p className="text-slate-500 text-sm">{selected.courses?.title} • <span className="capitalize">{selected.status.replace('_', ' ')}</span></p>
            </div>
          </div>
          <StatusBadge status={selected.status} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content - 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Student info */}
            <div className="card overflow-hidden">
              <button onClick={() => {}} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-slate-900">Application Details</h3>
                </div>
                <ChevronUp className="w-5 h-5 text-slate-400" />
              </button>
              <div className="px-5 pb-5 space-y-5">

              {/* Source & Course */}
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Source</p>
                  <div className="flex items-center gap-2">
                    <span className={`badge text-xs ${selected.source === 'student' ? 'bg-teal-100 text-teal-700' : 'bg-violet-100 text-violet-700'}`}>
                      {selected.source === 'student' ? 'Direct Student' : 'Via Agent'}
                    </span>
                    {selected.source !== 'student' && selected.agent_info && (
                      <span className="text-xs text-slate-600">{selected.agent_info.agency_name}</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Course</p>
                  <p className="text-slate-700">{selected.courses?.title || '—'}</p>
                  {selected.courses && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{selected.courses.level?.replace('_', ' ')}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selected.courses.campus}</span>
                      <span>{selected.courses.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Personal Details</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Full Name</p><p className="text-slate-700">{selected.student_full_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Title</p><p className="text-slate-700">{selected.student_title || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">First Name</p><p className="text-slate-700">{selected.student_first_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Middle Name</p><p className="text-slate-700">{selected.student_middle_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Last Name</p><p className="text-slate-700">{selected.student_last_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Gender</p><p className="text-slate-700">{selected.student_gender || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Date of Birth</p><p className="text-slate-700">{selected.student_dob ? new Date(selected.student_dob).toLocaleDateString('en-AU') : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Country of Birth</p><p className="text-slate-700">{selected.student_country_of_birth || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Nationality</p><p className="text-slate-700">{selected.student_nationality || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Marital Status</p><p className="text-slate-700">{selected.student_marital_status || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Passport Number</p><p className="text-slate-700">{selected.student_passport_number || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Passport Expiry</p><p className="text-slate-700">{selected.student_passport_expiry ? new Date(selected.student_passport_expiry).toLocaleDateString('en-AU') : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Email Address</p><p className="text-slate-700">{selected.student_email || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Mobile Number</p><p className="text-slate-700">{selected.student_mobile_number || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Phone Number</p><p className="text-slate-700">{selected.student_phone || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Currently in Australia</p><p className="text-slate-700">{selected.student_in_australia === true ? 'Yes' : selected.student_in_australia === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Current Location</p><p className="text-slate-700">{selected.student_current_location || '—'}</p></div>
                </div>
              </div>

              {/* Residential Address */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Residential Address</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Street Number</p><p className="text-slate-700">{selected.residential_street_number || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Street Name</p><p className="text-slate-700">{selected.residential_street_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Suburb</p><p className="text-slate-700">{selected.residential_suburb || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">City</p><p className="text-slate-700">{selected.residential_city || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">State</p><p className="text-slate-700">{selected.residential_state || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Country</p><p className="text-slate-700">{selected.residential_country || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Postcode</p><p className="text-slate-700">{selected.residential_post_code || '—'}</p></div>
                </div>
              </div>

              {/* Postal Address (if different) */}
              {selected.postal_same_as_residential === false && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Postal Address (different from residential)</p>
                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    <div><p className="text-xs text-slate-400">Street Number</p><p className="text-slate-700">{selected.postal_street_number || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Street Name</p><p className="text-slate-700">{selected.postal_street_name || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Suburb</p><p className="text-slate-700">{selected.postal_suburb || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">City</p><p className="text-slate-700">{selected.postal_city || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">State</p><p className="text-slate-700">{selected.postal_state || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Country</p><p className="text-slate-700">{selected.postal_country || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Postcode</p><p className="text-slate-700">{selected.postal_post_code || '—'}</p></div>
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Emergency Contact</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Full Name</p><p className="text-slate-700">{selected.emergency_full_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Relationship</p><p className="text-slate-700">{selected.emergency_relationship || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Address</p><p className="text-slate-700">{selected.emergency_address || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Mobile</p><p className="text-slate-700">{selected.emergency_mobile || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Phone</p><p className="text-slate-700">{selected.emergency_phone || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Email</p><p className="text-slate-700">{selected.emergency_email || '—'}</p></div>
                </div>
              </div>

              {/* Education & Qualification */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Education & Qualification</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Current Education Level</p><p className="text-slate-700">{selected.student_education_level || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Qualification Level</p><p className="text-slate-700">{selected.qualification_level || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Qualification Name</p><p className="text-slate-700">{selected.qualification_name || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Qualification Year</p><p className="text-slate-700">{selected.qualification_year || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Institution</p><p className="text-slate-700">{selected.qualification_institution || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Institution Country</p><p className="text-slate-700">{selected.qualification_country || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Institution Phone</p><p className="text-slate-700">{selected.qualification_institution_phone || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Institution Contact Email</p><p className="text-slate-700">{selected.qualification_contact_email || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Applying for RPL</p><p className="text-slate-700">{selected.applying_rpl === true ? 'Yes' : selected.applying_rpl === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Applying for Credit Transfer</p><p className="text-slate-700">{selected.applying_credit_transfer === true ? 'Yes' : selected.applying_credit_transfer === false ? 'No' : '—'}</p></div>
                </div>
              </div>

              {/* English Proficiency */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">English Proficiency</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">English Test</p><p className="text-slate-700">{selected.student_english_test_status || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">First Language</p><p className="text-slate-700">{selected.first_language || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">English Speaking Level</p><p className="text-slate-700">{selected.english_speaking_level || '—'}</p></div>
                </div>
                {selected.english_overall != null && (
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 mt-3">
                    <p className="text-xs text-slate-400 font-medium">{selected.student_english_test_status || 'English'} Scores</p>
                    <div className="grid grid-cols-5 gap-2 text-center text-xs">
                      <div><p className="text-slate-400">Reading</p><p className="font-semibold text-slate-800">{selected.english_reading ?? '—'}</p></div>
                      <div><p className="text-slate-400">Writing</p><p className="font-semibold text-slate-800">{selected.english_writing ?? '—'}</p></div>
                      <div><p className="text-slate-400">Speaking</p><p className="font-semibold text-slate-800">{selected.english_speaking ?? '—'}</p></div>
                      <div><p className="text-slate-400">Listening</p><p className="font-semibold text-slate-800">{selected.english_listening ?? '—'}</p></div>
                      <div><p className="text-slate-400">Overall</p><p className="font-semibold text-slate-800">{selected.english_overall ?? '—'}</p></div>
                    </div>
                    {selected.english_meets_standard != null && (
                      <p className={`text-xs font-medium ${selected.english_meets_standard ? 'text-green-600' : 'text-red-600'}`}>
                        {selected.english_meets_standard ? 'Meets minimum requirements' : 'Below minimum requirements'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Visa & Immigration */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Visa & Immigration</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Currently Holds Visa</p><p className="text-slate-700">{selected.visa_held === true ? 'Yes' : selected.visa_held === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Previously Held Visa</p><p className="text-slate-700">{selected.visa_previously_held === true ? 'Yes' : selected.visa_previously_held === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Visa Application Status</p><p className="text-slate-700">{selected.visa_application_status || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Meets GTE Requirements</p><p className="text-slate-700">{selected.gte_meets === true ? 'Yes' : selected.gte_meets === false ? 'No' : '—'}</p></div>
                </div>
              </div>

              {/* Employment & Purpose of Study */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Employment & Purpose of Study</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Employment Status</p><p className="text-slate-700">{selected.employment_status || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Purpose of Study</p><p className="text-slate-700">{selected.purpose_of_study || '—'}{selected.purpose_other ? ` (${selected.purpose_other})` : ''}</p></div>
                </div>
              </div>

              {/* Funds & Services */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Funds & Services</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Funds for First Year</p><p className="text-slate-700">{selected.funds_first_year === true ? 'Yes' : selected.funds_first_year === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Funds for Living Expenses</p><p className="text-slate-700">{selected.funds_living === true ? 'Yes' : selected.funds_living === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">OSHC Arranged by MIHE</p><p className="text-slate-700">{selected.oshc_arrange === true ? 'Yes' : selected.oshc_arrange === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Airport Pickup</p><p className="text-slate-700">{selected.airport_pickup === true ? 'Yes' : selected.airport_pickup === false ? 'No' : '—'}</p></div>
                </div>
              </div>

              {/* Disability & Additional Support */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Disability & Additional Support</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Has Disability</p><p className="text-slate-700">{selected.disability_has === true ? 'Yes' : selected.disability_has === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Disability Details</p><p className="text-slate-700">{selected.disability_details || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Additional Support Required</p><p className="text-slate-700">{selected.additional_support_required === true ? 'Yes' : selected.additional_support_required === false ? 'No' : '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Additional Support Details</p><p className="text-slate-700">{selected.additional_support_details || '—'}</p></div>
                </div>
              </div>

              {/* Course & Intake */}
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">Course & Intake</p>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><p className="text-xs text-slate-400">Preferred Intake</p><p className="text-slate-700">{selected.preferred_intake || '—'}</p></div>
                  <div><p className="text-xs text-slate-400">Course</p><p className="text-slate-700">{selected.courses?.title || '—'}</p></div>
                </div>
              </div>

              {/* Notes */}
              {(selected.agent_notes || selected.notes) && (
                <div>
                  <p className="text-xs text-slate-400">{selected.source === 'student' ? 'Additional Notes' : 'Agent Notes'}</p>
                  <p className="text-slate-700 text-sm mt-1">{selected.agent_notes || selected.notes}</p>
                </div>
              )}

              {/* Student Declaration */}
              {selected.student_decl_name && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Student Declaration</p>
                  <div className="grid sm:grid-cols-3 gap-4 text-sm">
                    <div><p className="text-xs text-slate-400">Print Name</p><p className="text-slate-700">{selected.student_decl_name || '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Date</p><p className="text-slate-700">{selected.student_decl_date ? new Date(selected.student_decl_date).toLocaleDateString('en-AU') : '—'}</p></div>
                    <div><p className="text-xs text-slate-400">Signature</p><p className="text-slate-700">{selected.student_decl_signature || '—'}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {Array.from({ length: 14 }, (_, i) => i + 1).map(n => (
                      <span key={n} className={`badge text-xs ${selected[`student_decl_${n}`] ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                        Decl {n}: {selected[`student_decl_${n}`] ? '✓' : '✗'}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>App ID: {selected.application_id || selected.id.substring(0, 8)}</span>
                <span>Applied: {new Date(selected.created_at).toLocaleString()}</span>
              </div>
            </div></div>

            {/* GSA — Genuine Student Assessment */}
            {selected.gsa_status && selected.gsa_status !== 'not_started' && (() => {
              const gsa = computeGSAStatus(selected);
              const gsaColor = gsa.status === 'green' ? 'bg-green-100 text-green-700' : gsa.status === 'yellow' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
              return (
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-700" /> Genuine Student Assessment (GSA)
                    </h3>
                    <span className={`badge text-xs ${gsaColor}`}>{gsa.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{gsa.reason}</p>

                  <div className="space-y-4">
                    {/* Section 1: Immigration History */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-semibold text-slate-500 mb-1">Section 1: Immigration History</p>
                      <p className="text-xs text-slate-400 mb-2">Have you ever had a visa refused, cancelled, or been deported from any country?</p>
                      <p className="text-sm text-slate-800">
                        {selected.gsa_immigration_history_has === true ? 'Yes' : selected.gsa_immigration_history_has === false ? 'No' : 'Not answered'}
                      </p>
                      {selected.gsa_immigration_history_details && (
                        <div className="mt-2">
                          <p className="text-xs text-slate-400 mb-0.5">Details:</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.gsa_immigration_history_details}</p>
                        </div>
                      )}
                    </div>

                    {/* Section 2: Choice of Course */}
                    {selected.gsa_choice_reason && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Section 2: Choice of Course</p>
                        <p className="text-xs text-slate-400 mb-2">Why did you choose this course and MIHE? What are your study and career goals?</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.gsa_choice_reason}</p>
                      </div>
                    )}

                    {/* Section 3: Previous CoE */}
                    {selected.gsa_has_previous_coe !== null && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Section 3: Previous CoE from Another Institution</p>
                        <p className="text-xs text-slate-400 mb-2">Have you held a CoE (Confirmation of Enrolment) from another institution?</p>
                        <p className="text-sm text-slate-800 mb-2">
                          {selected.gsa_has_previous_coe ? 'Yes' : 'No'}
                        </p>
                        {selected.gsa_previous_coes && selected.gsa_previous_coes.length > 0 && (
                          <div className="space-y-2">
                            {selected.gsa_previous_coes.map((coe, i) => (
                              <div key={i} className="p-2 bg-white rounded-lg border border-slate-100 text-xs">
                                <p className="font-medium text-slate-700">{coe.institution} — {coe.course}</p>
                                <p className="text-slate-500">{coe.start_date} to {coe.end_date}</p>
                                <p className="text-slate-600 mt-1">Reason for withdrawing: {coe.reason_for_withdrawing}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 4: Previous Study in Australia */}
                    {selected.gsa_studied_in_australia !== null && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Section 4: Previous Study in Australia</p>
                        <p className="text-xs text-slate-400 mb-2">Have you previously studied in Australia?</p>
                        <p className="text-sm text-slate-800 mb-2">
                          {selected.gsa_studied_in_australia ? 'Yes' : 'No'}
                        </p>
                        {selected.gsa_previous_australia_study && selected.gsa_previous_australia_study.length > 0 && (
                          <div className="space-y-2">
                            {selected.gsa_previous_australia_study.map((s, i) => (
                              <div key={i} className="p-2 bg-white rounded-lg border border-slate-100 text-xs">
                                <p className="font-medium text-slate-700">{s.institution} — {s.course}</p>
                                <p className="text-slate-500">{s.start_date} to {s.end_date}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 5: Gaps in Studies */}
                    {selected.gsa_has_study_gaps !== null && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Section 5: Gaps in Studies</p>
                        <p className="text-xs text-slate-400 mb-2">Have there been any gaps in your studies?</p>
                        <p className="text-sm text-slate-800 mb-2">
                          {selected.gsa_has_study_gaps ? 'Yes' : 'No'}
                        </p>
                        {selected.gsa_study_gaps && selected.gsa_study_gaps.length > 0 && (
                          <div className="space-y-2">
                            {selected.gsa_study_gaps.map((g, i) => (
                              <div key={i} className="p-2 bg-white rounded-lg border border-slate-100 text-xs">
                                <p className="text-slate-500">{g.start_date} to {g.end_date}</p>
                                <p className="text-slate-600 mt-1">{g.details_of_gap}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Section 6: Current Circumstances */}
                    {selected.gsa_current_circumstances && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Section 6: Current Circumstances</p>
                        <p className="text-xs text-slate-400 mb-2">Describe your current circumstances (employment, study, living situation)</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.gsa_current_circumstances}</p>
                      </div>
                    )}

                    {/* Section 7: Ability to Afford */}
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Section 7: Ability to Afford</p>
                      <div className="grid sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-slate-400 text-xs">Funding Source:</span> <p className="text-slate-700">{selected.gsa_funding_source || '—'}</p></div>
                        <div><span className="text-slate-400 text-xs">Estimated Tuition Funds (AUD):</span> <p className="text-slate-700">{selected.gsa_estimated_tuition || '—'}</p></div>
                        <div><span className="text-slate-400 text-xs">Estimated Living Funds (AUD):</span> <p className="text-slate-700">{selected.gsa_estimated_living || '—'}</p></div>
                      </div>
                      {selected.gsa_financial_details && (
                        <div className="pt-1">
                          <p className="text-xs text-slate-400 mb-0.5">Additional Financial Details:</p>
                          <p className="text-sm text-slate-600 whitespace-pre-wrap">{selected.gsa_financial_details}</p>
                        </div>
                      )}
                    </div>

                    {/* Section 8: Student Declaration */}
                    <div className="p-3 bg-slate-50 rounded-xl">
                      <p className="text-xs font-semibold text-slate-500 mb-2">Section 8: Student Declaration</p>
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start gap-1.5 text-xs">
                          {selected.gsa_student_decl_1 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                          <span className="text-slate-600">I understand my obligations under the Australian student visa conditions.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs">
                          {selected.gsa_student_decl_2 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                          <span className="text-slate-600">I understand I must maintain enrollment and satisfactory academic progress.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs">
                          {selected.gsa_student_decl_3 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                          <span className="text-slate-600">I understand I must have sufficient funds to cover tuition and living expenses.</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-xs">
                          {selected.gsa_student_decl_4 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                          <span className="text-slate-600">I understand I must notify MIHE of any change in my circumstances.</span>
                        </div>
                        {selected.gsa_student_decl_guardian != null && (
                          <div className="flex items-start gap-1.5 text-xs">
                            {selected.gsa_student_decl_guardian ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                            <span className="text-slate-600">I confirm I am the parent or legal guardian of the student and am signing on their behalf.</span>
                          </div>
                        )}
                      </div>
                      <div className="grid sm:grid-cols-3 gap-2 text-xs">
                        <div><span className="text-slate-400">Print Name:</span> <span className="text-slate-700">{selected.gsa_student_decl_name || '—'}</span></div>
                        <div><span className="text-slate-400">Date:</span> <span className="text-slate-700">{selected.gsa_student_decl_date || '—'}</span></div>
                        <div><span className="text-slate-400">Signature:</span> <span className="text-slate-700">{selected.gsa_student_decl_signature || '—'}</span></div>
                      </div>
                    </div>

                    {/* Section 9: Agent Declaration */}
                    {selected.source === 'agent' && (selected.gsa_agent_decl_1 != null || selected.gsa_agent_decl_name) && (
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-xs font-semibold text-slate-500 mb-2">Section 9: Agent Declaration</p>
                        <div className="space-y-1.5 mb-3">
                          <div className="flex items-start gap-1.5 text-xs">
                            {selected.gsa_agent_decl_1 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                            <span className="text-slate-600">I confirm that the information provided in this application is accurate to the best of my knowledge.</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs">
                            {selected.gsa_agent_decl_2 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                            <span className="text-slate-600">I have not provided false or misleading information.</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-xs">
                            {selected.gsa_agent_decl_3 ? <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 text-slate-300 flex-shrink-0 mt-0.5" />}
                            <span className="text-slate-600">I understand my obligations as an education agent under the National Code of Practice.</span>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2 text-xs">
                          <div><span className="text-slate-400">Print Name:</span> <span className="text-slate-700">{selected.gsa_agent_decl_name || '—'}</span></div>
                          <div><span className="text-slate-400">Date:</span> <span className="text-slate-700">{selected.gsa_agent_decl_date || '—'}</span></div>
                          <div><span className="text-slate-400">Signature:</span> <span className="text-slate-700">{selected.gsa_agent_decl_signature || '—'}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Admin Notes */}
                    {selected.gsa_admin_notes && (
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">GSA Admin Notes</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.gsa_admin_notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Documents */}
            <CollapsibleCard title="Documents" icon={Paperclip} badge={docs.length > 0 ? <span className="text-xs text-slate-500 ml-2">{approvedCount}/{docs.length} approved</span> : undefined}>
              {docsLoading ? (
                <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />)}</div>
              ) : docs.length === 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl text-center">
                  <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-400">No documents attached</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-3 text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">{approvedCount} Approved</span>
                    {pendingCount > 0 && <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">{pendingCount} Pending</span>}
                    {rejectedCount > 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">{rejectedCount} Rejected</span>}
                  </div>
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${docStatusColors[doc.status] ?? 'bg-slate-100'}`}>
                          {doc.status === 'approved' ? <CheckCircle className="text-white" style={{ width: 16, height: 16 }} /> :
                           doc.status === 'rejected' ? <XCircle className="text-white" style={{ width: 16, height: 16 }} /> :
                           <FileText className="text-white" style={{ width: 16, height: 16 }} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{doc.file_name}</p>
                          <p className="text-xs text-slate-400">{doc.document_type} • {doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : '—'}</p>
                        </div>
                        {doc.status !== 'approved' && (
                          <button onClick={() => updateDocStatus(doc.id, 'approved')} disabled={updating} title="Approve" className="p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors flex-shrink-0 disabled:opacity-50">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {doc.status !== 'rejected' && (
                          <button onClick={() => updateDocStatus(doc.id, 'rejected')} disabled={updating} title="Reject" className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors flex-shrink-0 disabled:opacity-50">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDownload(doc)} disabled={downloadingId === doc.id} title="Download" className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors flex-shrink-0 disabled:opacity-50">
                          {downloadingId === doc.id ? <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-700 rounded-full animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CollapsibleCard>

            {/* Document Requests */}
            <CollapsibleCard title="Document Requests" icon={FilePlus} defaultOpen={false}>
              {docRequests.length > 0 && (
                <div className="space-y-2 mb-4">
                  {docRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{req.document_type}</p>
                        {req.description && <p className="text-xs text-slate-500">{req.description}</p>}
                        <p className="text-xs text-slate-400 mt-1">Requested: {new Date(req.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className={`badge text-xs ${req.status === 'fulfilled' ? 'bg-green-100 text-green-700' : req.status === 'cancelled' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'}`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-xs font-semibold text-slate-600">Request a new document</p>
                <input type="text" value={newDocType} onChange={(e) => setNewDocType(e.target.value)} placeholder="Document type (e.g. Passport copy, Bank statement)" className="input-field text-sm" />
                <textarea value={newDocDesc} onChange={(e) => setNewDocDesc(e.target.value)} placeholder="Instructions (optional)" rows={2} className="input-field text-sm resize-none" />
                <Button size="sm" className="w-full" loading={sendingRequest} onClick={sendDocRequest} disabled={!newDocType.trim()}>
                  <Send className="w-4 h-4" /> Send Request
                </Button>
              </div>
            </CollapsibleCard>

            {/* Approval History */}
            <CollapsibleCard title="Approval History" icon={History} defaultOpen={false}>
              <div className="space-y-3">
                {snapshots.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">No approvals recorded yet.</p>
                )}
                {snapshots.map((snap) => (
                  <div key={snap.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${snap.status === 'approved' ? 'bg-green-100' : snap.status === 'rejected' ? 'bg-red-100' : 'bg-blue-100'}`}>
                      {snap.status === 'approved' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                       snap.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-500" /> :
                       <Clock className="w-4 h-4 text-blue-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800 capitalize">{snap.status.replace('_', ' ')}</p>
                      <p className="text-xs text-slate-500">By {snap.approved_by_name || 'Admin'}</p>
                      {snap.signature && (
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-slate-200">
                          <PenLine className="w-3 h-3 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700 italic" style={{ fontFamily: 'Georgia, serif' }}>{snap.signature}</span>
                        </div>
                      )}
                      {snap.comment && <p className="text-xs text-slate-600 mt-1">{snap.comment}</p>}
                      <p className="text-xs text-slate-400 mt-1">{new Date(snap.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Approve Application */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {!showApprovalForm ? (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" onClick={() => {
                    setApprovalPrintName(profile?.full_name || '');
                    setApprovalDate(new Date().toISOString().split('T')[0]);
                    setApprovalSignature(profile?.signature || '');
                    setShowApprovalForm(true);
                  }}>
                    <CheckCircle className="w-4 h-4" /> Approve the Application
                  </Button>
                ) : (
                  <div className="space-y-3 p-3 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-xs font-semibold text-green-700 flex items-center gap-1.5">
                      <PenLine className="w-3.5 h-3.5" /> Approval Confirmation
                    </p>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Print Name</label>
                      <input type="text" value={approvalPrintName} onChange={(e) => setApprovalPrintName(e.target.value)} className="input-field text-sm" placeholder="Enter your full name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Date</label>
                      <input type="date" value={approvalDate} onChange={(e) => setApprovalDate(e.target.value)} className="input-field text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Signature</label>
                      <input type="text" value={approvalSignature} onChange={(e) => setApprovalSignature(e.target.value)} className="input-field text-sm" placeholder="Type your signature" style={{ fontFamily: 'Georgia, serif' }} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1 block">Comment (optional)</label>
                      <textarea value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Optional comment about this approval…" rows={2} className="input-field text-sm resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" loading={addingApproval} onClick={addApproval} disabled={!approvalPrintName.trim() || !approvalSignature.trim()}>
                        <CheckCircle className="w-4 h-4" /> Confirm Approval
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => { setShowApprovalForm(false); setApprovalComment(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleCard>
          </div>

          {/* Sidebar - 1 col */}
          <div className="space-y-5">
            {/* Status actions */}
            <div className="card p-5 lg:sticky lg:top-4">
              <h3 className="font-bold text-slate-900 mb-3">Status Actions</h3>

              {hasUnreviewedDocs && docs.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">{pendingCount} document(s) need review.</p>
                </div>
              )}

              <div className="space-y-2">
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected.id, e.target.value)}
                  disabled={updating}
                  className="input-field cursor-pointer"
                >
                  <option value={selected.status} disabled>{STATUS_LABELS[selected.status] || selected.status}</option>
                  {UPDATEABLE_STATUSES.filter(s => s !== selected.status).map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>

                {selected.status === 'approved' && !selected.student_id && (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" loading={creatingAccount} onClick={createStudentAccount}>
                    <UserPlus className="w-4 h-4" /> Create Student Account
                  </Button>
                )}

                {selected.status === 'approved' && selected.student_id && (
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-green-700">Student account created</p>
                  </div>
                )}
              </div>

              {/* Offer Letter Upload */}
              {selected.status === 'approved' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">Issue Offer Letter</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => setOfferFile(e.target.files?.[0] ?? null)} />
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 truncate">{offerFile ? offerFile.name : 'Choose offer letter PDF…'}</span>
                    </label>
                    <Button size="sm" className="w-full" loading={uploadingOffer} onClick={uploadOfferLetter} disabled={!offerFile}>
                      <Award className="w-4 h-4" /> Upload & Send Offer
                    </Button>
                  </div>
                </div>
              )}

              {/* Offer letter download */}
              {selected.offer_letter_path && (
                <div className="mt-3 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSignature className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs font-semibold text-indigo-700">Offer Letter Issued</p>
                  </div>
                  <button
                    onClick={async () => {
                      const { data } = await supabase.storage.from('agent-documents').createSignedUrl(selected.offer_letter_path, 60);
                      if (data) window.open(data.signedUrl, '_blank');
                    }}
                    className="text-xs text-blue-700 font-semibold hover:underline"
                  >
                    Download Offer Letter
                  </button>
                  {selected.signed_offer_path && (
                    <div className="mt-2 pt-2 border-t border-indigo-100">
                      <p className="text-xs font-semibold text-teal-700">Signed Offer Received</p>
                      <button
                        onClick={async () => {
                          const { data } = await supabase.storage.from('agent-documents').createSignedUrl(selected.signed_offer_path, 60);
                          if (data) window.open(data.signedUrl, '_blank');
                        }}
                        className="text-xs text-blue-700 font-semibold hover:underline"
                      >
                        Download Signed Offer
                      </button>

                      {selected.status === 'signed_offer_review' && (
                        <div className="mt-2 space-y-2">
                          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200">
                            <p className="text-xs text-amber-700 font-semibold">Review Required</p>
                            <p className="text-xs text-amber-600">Please review the signed offer and approve or reject it.</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              loading={reviewingOffer}
                              onClick={async () => {
                                setReviewingOffer(true);
                                await supabase.from('agent_applications').update({
                                  offer_accepted: true,
                                  offer_accepted_at: new Date().toISOString(),
                                  status: 'offer_accepted',
                                  updated_at: new Date().toISOString(),
                                }).eq('id', selected.id);
                                await supabase.from('audit_logs').insert({ user_id: user?.id, action: 'approve_signed_offer', target_table: 'agent_applications', target_id: selected.id });
                                if (selected.agent_id) {
                                  await supabase.from('agent_notifications').insert({
                                    user_id: selected.agent_id,
                                    title: 'Signed Offer Approved',
                                    message: `The signed offer for ${selected.student_full_name} has been approved.`,
                                    type: 'offer',
                                  });
                                }
                                setReviewingOffer(false);
                                setSelected({ ...selected, offer_accepted: true, offer_accepted_at: new Date().toISOString(), status: 'offer_accepted' });
                              }}
                            >
                              <CheckCircle className="w-4 h-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="flex-1"
                              loading={reviewingOffer}
                              onClick={async () => {
                                setReviewingOffer(true);
                                await supabase.from('agent_applications').update({
                                  signed_offer_path: null,
                                  signed_offer_uploaded_at: null,
                                  offer_accepted: false,
                                  status: 'offer_letter_sent',
                                  public_comment: (selected.public_comment ? selected.public_comment + '\n\n' : '') + 'Your signed offer letter was rejected. Please review, re-sign, and upload again.',
                                  updated_at: new Date().toISOString(),
                                }).eq('id', selected.id);
                                await supabase.from('audit_logs').insert({ user_id: user?.id, action: 'reject_signed_offer', target_table: 'agent_applications', target_id: selected.id });
                                if (selected.agent_id) {
                                  await supabase.from('agent_notifications').insert({
                                    user_id: selected.agent_id,
                                    title: 'Signed Offer Rejected — Please Re-sign',
                                    message: `The signed offer for ${selected.student_full_name} was rejected. Please review the comments, re-sign the offer letter, and upload it again.`,
                                    type: 'offer',
                                  });
                                }
                                setReviewingOffer(false);
                                setSelected({ ...selected, signed_offer_path: null, signed_offer_uploaded_at: null, offer_accepted: false, status: 'offer_letter_sent', public_comment: (selected.public_comment ? selected.public_comment + '\n\n' : '') + 'Your signed offer letter was rejected. Please review, re-sign, and upload again.' });
                              }}
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Payment Plan Setup — after offer accepted */}
              {(selected.status === 'offer_accepted' || selected.status === 'waiting_for_payment') && !selected.coe_path && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="w-4 h-4 text-blue-700" />
                    <h4 className="text-sm font-bold text-slate-800">Payment Plan</h4>
                  </div>

                  {!paymentPlanConfigured ? (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                      <p className="text-xs text-slate-500">Set up the tuition fee and payment plan for this student. Once configured, the student/agent will see a "Pay Now" button.</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="label">Total Tuition Fee (AUD) *</label>
                          <input type="number" value={tuitionFee} onChange={(e) => setTuitionFee(e.target.value)} className="input-field" placeholder="8000" />
                        </div>
                        <div>
                          <label className="label">Payment Plan Type *</label>
                          <select value={paymentPlanType} onChange={(e) => setPaymentPlanType(e.target.value as 'full' | 'emi')} className="input-field">
                            <option value="full">Full Payment (pay all at once)</option>
                            <option value="emi">EMI (acceptance fee + installments)</option>
                          </select>
                        </div>
                      </div>
                      {paymentPlanType === 'emi' && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="label">Offer Acceptance Fee (AUD) *</label>
                            <input type="number" value={offerAcceptanceFee} onChange={(e) => setOfferAcceptanceFee(e.target.value)} className="input-field" placeholder="2000" />
                            <p className="text-xs text-slate-400 mt-1">Remaining ${(parseFloat(tuitionFee || '0') - parseFloat(offerAcceptanceFee || '0')).toLocaleString()} will be split into 3 installments</p>
                          </div>
                          <div>
                            <label className="label">Course Duration (months) *</label>
                            <input type="number" value={courseDurationMonths} onChange={(e) => setCourseDurationMonths(e.target.value)} className="input-field" placeholder="6" />
                            <p className="text-xs text-slate-400 mt-1">Installments spread evenly across this period</p>
                          </div>
                        </div>
                      )}
                      <Button size="sm" className="w-full" loading={savingPaymentPlan} onClick={savePaymentPlan}>
                        <DollarSign className="w-4 h-4" /> Configure Payment Plan
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <div>
                          <p className="text-sm font-semibold text-blue-700">Payment Plan Active</p>
                          <p className="text-xs text-blue-600">
                            {paymentPlanType === 'full' ? 'Full payment' : 'EMI plan'} — Total: ${parseFloat(tuitionFee || '0').toLocaleString()}
                            {paymentPlanType === 'emi' && parseFloat(offerAcceptanceFee) ? ` · Acceptance: ${parseFloat(offerAcceptanceFee).toLocaleString()}` : ''}
                          </p>
                        </div>
                        <button onClick={() => setPaymentPlanConfigured(false)} className="text-xs text-blue-700 font-semibold hover:underline">Edit Plan</button>
                      </div>

                      {loadingInstallments ? (
                        <p className="text-xs text-slate-400">Loading installments…</p>
                      ) : installments.length > 0 ? (
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
                                      {isOverdue && ` · ${Math.floor((Date.now() - new Date(inst.due_date).getTime()) / 86400000)} days overdue`}
                                    </p>
                                  </div>
                                  {inst.status === 'pending' && (
                                    <Button size="sm" variant="secondary" onClick={() => markInstallmentPaid(inst.id)} loading={updating}>
                                      Mark Paid
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                          {installments.every(i => i.status === 'paid') && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <p className="text-sm font-semibold text-green-700">All payments complete! You can now upload the COE below.</p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}

              {/* COE Upload — after all payments complete */}
              {selected.status === 'waiting_for_payment' && installments.length > 0 && installments.every(i => i.status === 'paid') && !selected.coe_path && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">Upload COE (all payments received)</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(e) => setCoeFile(e.target.files?.[0] ?? null)} />
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 truncate">{coeFile ? coeFile.name : 'Choose COE document…'}</span>
                    </label>
                    <Button size="sm" className="w-full" loading={uploadingCoe} onClick={uploadCoe} disabled={!coeFile}>
                      <FileText className="w-4 h-4" /> Upload COE
                    </Button>
                  </div>
                </div>
              )}

              {/* COE download */}
              {selected.coe_path && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <p className="text-xs font-semibold text-emerald-700">COE Issued</p>
                  </div>
                  <button
                    onClick={async () => {
                      const { data } = await supabase.storage.from('agent-documents').createSignedUrl(selected.coe_path, 60);
                      if (data) window.open(data.signedUrl, '_blank');
                    }}
                    className="text-xs text-blue-700 font-semibold hover:underline"
                  >
                    Download COE
                  </button>
                </div>
              )}

              {/* Enrollment Link — after COE */}
              {selected.status === 'paid_coe_issued' && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">Enrollment Link</label>
                  <input type="url" value={enrollmentUrl} onChange={(e) => setEnrollmentUrl(e.target.value)} placeholder="https://…" className="input-field text-sm" />
                  <Button size="sm" className="w-full mt-2" loading={savingEnrollmentUrl} onClick={saveEnrollmentUrl} disabled={!enrollmentUrl.trim()}>
                    <Link2 className="w-4 h-4" /> Save & Mark Enrolled
                  </Button>
                </div>
              )}

              {/* Admin comment (private) */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Admin Comment (Private — admin only)</label>
                <textarea value={adminComment} onChange={(e) => setAdminComment(e.target.value)} placeholder="Private note for admin only…" rows={2} className="input-field text-sm resize-none" />
              </div>

              {/* Public comment (visible to agent/student) */}
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Public Comment (Visible to Agent/Student)</label>
                <textarea value={publicComment} onChange={(e) => setPublicComment(e.target.value)} placeholder="Note visible to agent/student…" rows={2} className="input-field text-sm resize-none" />
                <Button size="sm" variant="secondary" className="w-full mt-2" loading={savingComment} onClick={saveAdminComment} disabled={adminComment === (selected.admin_comment || '') && publicComment === (selected.public_comment || '')}>
                  Save Comments
                </Button>
              </div>

              {/* Message */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-semibold text-slate-500 mb-2">Conversation</h4>
                {conversationMessages.length > 0 && (
                  <div className="space-y-2 mb-3 max-h-48 overflow-y-auto scrollbar-hide">
                    {conversationMessages.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender_role === 'admin' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-2.5 rounded-2xl ${msg.sender_role === 'admin' ? 'bg-blue-700 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                          <p className="text-[10px] font-medium opacity-70 mb-0.5">{msg.sender_name}</p>
                          <p className="text-xs whitespace-pre-wrap">{msg.body}</p>
                          <p className={`text-[9px] mt-1 ${msg.sender_role === 'admin' ? 'text-blue-200' : 'text-slate-400'}`}>{new Date(msg.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {showMessageForm ? (
                  <div className="space-y-2">
                    <textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type a message to the student/agent…" rows={3} className="input-field text-sm resize-none" />
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" loading={sendingMessage} onClick={sendMessage} disabled={!messageText.trim()}>
                        <Send className="w-4 h-4" /> Send
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setShowMessageForm(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" className="w-full" onClick={() => setShowMessageForm(true)}>
                    <MessageSquare className="w-4 h-4" /> {conversationMessages.length > 0 ? 'Reply' : 'Send Message'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Review and process all student applications</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by student or course…" className="input-field pl-10" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field pl-10 pr-8 cursor-pointer appearance-none min-w-40">
            {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="card p-10 text-center lg:col-span-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No applications found</p>
          </div>
        ) : (
          filtered.map((app) => (
            <motion.div
              key={app.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              onClick={() => setSelected(app)}
              className="card p-4 cursor-pointer transition-all hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(app.student_full_name ?? 'U').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-800 text-sm truncate">{app.student_full_name ?? 'Unknown'}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className={`badge text-[10px] ${app.source === 'student' ? 'bg-teal-100 text-teal-700' : 'bg-violet-100 text-violet-700'}`}>
                        {app.source === 'student' ? 'Student' : 'Agent'}
                      </span>
                      <StatusBadge status={app.status} />
                      {app.gsa_status && app.gsa_status !== 'not_started' && (() => {
                        const gsa = computeGSAStatus(app);
                        return (
                          <button onClick={(e) => { e.stopPropagation(); navigate('/admin/gsa'); }} title={gsa.reason} className="flex-shrink-0">
                            {gsa.status === 'green' && <CheckCircle className="w-4 h-4 text-green-600" />}
                            {gsa.status === 'yellow' && <AlertCircle className="w-4 h-4 text-amber-500" />}
                            {gsa.status === 'red' && <XCircle className="w-4 h-4 text-red-500" />}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{app.courses?.title ?? 'Unknown Course'}</p>
                  <p className="text-xs text-slate-400">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
