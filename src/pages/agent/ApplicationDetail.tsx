import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, User, BookOpen, FileText, Upload, CheckCircle, XCircle,
  Clock, AlertCircle, Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentAppStatusBadge, DocStatusBadge } from '../../components/ui/AgentStatusBadge';
import Button from '../../components/ui/Button';
import { AgentApplication, ApplicationDocument, AGENT_APPLICATION_STATUSES, AGENT_APP_STATUS_LABELS, AGENT_DOC_TYPES, AgentApplicationStatus } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const statusOrder: AgentApplicationStatus[] = [
  'draft', 'submitted', 'under_review', 'documents_required', 'documents_approved',
  'sent_to_college', 'offer_pending', 'offer_received', 'enrolled',
];

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

  useEffect(() => {
    if (!id || !profile) return;
    Promise.all([
      supabase.from('agent_applications').select('*, courses(*)').eq('id', id).maybeSingle(),
      supabase.from('application_documents').select('*').eq('application_id', id).order('uploaded_at', { ascending: false }),
    ]).then(([appRes, docRes]) => {
      setApp(appRes.data);
      setDocs(docRes.data ?? []);
      setLoading(false);
    });
  }, [id, profile]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id || !profile || !app) return;

    const MAX = 10 * 1024 * 1024;
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (file.size > MAX) { setError('File size must be under 10 MB.'); return; }
    if (!ALLOWED.includes(file.type)) { setError('Only PDF, JPG, PNG, and WebP files are allowed.'); return; }

    setError('');
    setUploading(true);

    const filePath = `${profile.id}/${id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('agent-documents').upload(filePath, file);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    await supabase.from('application_documents').insert({
      application_id: id,
      agent_id: profile.id,
      document_type: newDocType,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      status: 'uploaded',
    });

    const { data: refreshed } = await supabase.from('application_documents').select('*').eq('application_id', id).order('uploaded_at', { ascending: false });
    setDocs(refreshed ?? []);
    setUploading(false);
    e.target.value = '';
  };

  const handleDownload = async (doc: ApplicationDocument) => {
    const { data, error } = await supabase.storage.from('agent-documents').createSignedUrl(doc.file_path, 60);
    if (data && !error) {
      window.open(data.signedUrl, '_blank');
    }
  };

  if (loading) return <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}</div>;

  if (!app) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">Application not found</p>
        <Link to="/agent/applications" className="text-blue-600 font-semibold text-sm mt-2 inline-block">Back to applications</Link>
      </div>
    );
  }

  const currentStepIndex = statusOrder.indexOf(app.status);
  const isRejected = app.status === 'rejected';
  const isCancelled = app.status === 'cancelled';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 sm:gap-4">
        <button onClick={() => navigate('/agent/applications')} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{app.student_full_name}</h1>
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
            <div className="flex items-center justify-between min-w-[600px] sm:min-w-0">
            {statusOrder.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1.5 flex-1">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all ${
                  i <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
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
        {/* Student info */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-6 lg:col-span-1">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Student Information
          </h3>
          <div className="space-y-3 text-sm">
            <div><p className="text-xs text-slate-400">Full Name</p><p className="font-medium text-slate-800">{app.student_full_name || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Date of Birth</p><p className="font-medium text-slate-800">{app.student_dob ? new Date(app.student_dob).toLocaleDateString() : '—'}</p></div>
            <div><p className="text-xs text-slate-400">Email</p><p className="font-medium text-slate-800">{app.student_email || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Phone</p><p className="font-medium text-slate-800">{app.student_phone || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Nationality</p><p className="font-medium text-slate-800">{app.student_nationality || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Current Country</p><p className="font-medium text-slate-800">{app.student_current_country || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Passport Number</p><p className="font-medium text-slate-800">{app.student_passport_number || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Education Level</p><p className="font-medium text-slate-800">{app.student_education_level || '—'}</p></div>
            <div><p className="text-xs text-slate-400">English Test</p><p className="font-medium text-slate-800">{app.student_english_test_status || '—'}</p></div>
            <div><p className="text-xs text-slate-400">Preferred Intake</p><p className="font-medium text-slate-800">{app.preferred_intake || '—'}</p></div>
            {app.agent_notes && (
              <div><p className="text-xs text-slate-400">Agent Notes</p><p className="font-medium text-slate-800">{app.agent_notes}</p></div>
            )}
          </div>
        </motion.div>

        {/* Course + Documents */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Course Details
            </h3>
            {app.courses ? (
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-slate-800 text-base">{app.courses.title}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div><span className="text-slate-400">CRICOS:</span> <span className="text-slate-700">{app.courses.cricos_code || '—'}</span></div>
                  <div><span className="text-slate-400">Level:</span> <span className="text-slate-700 capitalize">{app.courses.level.replace('_', ' ')}</span></div>
                  <div><span className="text-slate-400">Campus:</span> <span className="text-slate-700">{app.courses.campus}</span></div>
                  <div><span className="text-slate-400">Duration:</span> <span className="text-slate-700">{app.courses.duration}</span></div>
                  {app.courses.fees && (
                    <div><span className="text-slate-400">Int. Fee:</span> <span className="text-slate-700">${app.courses.fees.international?.toLocaleString()}</span></div>
                  )}
                  {app.courses.entry_requirements && (
                    <div className="col-span-2"><span className="text-slate-400">Entry Requirements:</span> <span className="text-slate-700">{app.courses.entry_requirements}</span></div>
                  )}
                </div>
              </div>
            ) : <p className="text-slate-400 text-sm">No course selected</p>}
          </motion.div>

          {/* Admin comment */}
          {app.admin_comment && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-5 border-l-4 border-amber-400">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" /> Admin Comment
              </h3>
              <p className="text-sm text-slate-700">{app.admin_comment}</p>
            </motion.div>
          )}

          {/* Documents */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Documents ({docs.length})
            </h3>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Upload */}
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
                      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={handleUpload} disabled={uploading} />
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                          <span className="text-sm text-blue-600">Uploading…</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600">Upload Document</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Document list */}
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
                      {doc.admin_comment && <p className="text-xs text-amber-600 mt-0.5">Admin: {doc.admin_comment}</p>}
                    </div>
                    <div className="flex-shrink-0"><DocStatusBadge status={doc.status} /></div>
                    <button onClick={() => handleDownload(doc)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
