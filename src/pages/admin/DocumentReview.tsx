import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle, XCircle, Eye, Download, Search, FolderCheck, MessageSquare,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DocStatusBadge } from '../../components/ui/AgentStatusBadge';
import Button from '../../components/ui/Button';
import { ApplicationDocument } from '../../types';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface DocWithApp extends ApplicationDocument {
  agent_applications?: { student_full_name: string; application_id: string };
}

export default function DocumentReview() {
  const [docs, setDocs] = useState<DocWithApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<DocWithApp | null>(null);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState('');
  const { user } = useAuth();

  const load = () => {
    supabase
      .from('application_documents')
      .select('*, agent_applications!inner(student_full_name, application_id)')
      .order('uploaded_at', { ascending: false })
      .then(({ data }) => {
        setDocs((data as any) ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const filtered = docs.filter(d => {
    const matchSearch = (d.file_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (d.document_type ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (d.agent_applications?.student_full_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateDocStatus = async (doc: DocWithApp, status: string) => {
    setUpdating(true);
    await supabase.from('application_documents').update({
      status,
      admin_comment: comment || doc.admin_comment,
    }).eq('id', doc.id);

    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: `doc_${status}`,
      target_table: 'application_documents',
      target_id: doc.id,
      metadata: { file_name: doc.file_name, comment },
    });

    // Notify agent
    await supabase.from('agent_notifications').insert({
      user_id: doc.agent_id,
      title: status === 'approved' ? 'Document Approved' : status === 'rejected' ? 'Document Rejected' : 'Document Under Review',
      message: `Document "${doc.file_name}" for ${doc.agent_applications?.student_full_name ?? 'student'} has been ${status}.${comment ? ` Comment: ${comment}` : ''}`,
      type: 'document_review',
    });

    load();
    setSelected({ ...doc, status, admin_comment: comment || doc.admin_comment });
    setComment('');
    setUpdating(false);
  };

  const handleDownload = async (doc: DocWithApp) => {
    const { data } = await supabase.storage.from('agent-documents').createSignedUrl(doc.file_path, 60);
    if (data) window.open(data.signedUrl, '_blank');
  };

  const statusColors: Record<string, string> = {
    uploaded: 'bg-blue-100 text-blue-700',
    under_review: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    required: 'bg-orange-100 text-orange-700',
    missing: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document Review</h1>
        <p className="text-slate-500 text-sm mt-1">Review and verify documents uploaded by agents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mb-2"><FileText className="text-white" style={{ width: 18, height: 18 }} /></div>
          <div className="text-xl font-bold text-slate-900">{docs.length}</div>
          <div className="text-xs text-slate-500">Total Documents</div>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center mb-2"><Eye className="text-white" style={{ width: 18, height: 18 }} /></div>
          <div className="text-xl font-bold text-slate-900">{docs.filter(d => d.status === 'uploaded' || d.status === 'under_review').length}</div>
          <div className="text-xs text-slate-500">Pending Review</div>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center mb-2"><CheckCircle className="text-white" style={{ width: 18, height: 18 }} /></div>
          <div className="text-xl font-bold text-slate-900">{docs.filter(d => d.status === 'approved').length}</div>
          <div className="text-xs text-slate-500">Approved</div>
        </div>
        <div className="card p-4">
          <div className="w-9 h-9 bg-red-500 rounded-xl flex items-center justify-center mb-2"><XCircle className="text-white" style={{ width: 18, height: 18 }} /></div>
          <div className="text-xl font-bold text-slate-900">{docs.filter(d => d.status === 'rejected').length}</div>
          <div className="text-xs text-slate-500">Rejected</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by file, type, or student…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Status</option>
          <option value="uploaded">Uploaded</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-3 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <FolderCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No documents found</p>
            </div>
          ) : (
            filtered.map((doc) => (
              <motion.div
                key={doc.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => { setSelected(doc); setComment(''); }}
                className={`card p-4 cursor-pointer transition-all ${
                  selected?.id === doc.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[doc.status] ?? 'bg-slate-100'}`}>
                    {doc.status === 'approved' ? <CheckCircle className="text-white" style={{ width: 18, height: 18 }} /> :
                     doc.status === 'rejected' ? <XCircle className="text-white" style={{ width: 18, height: 18 }} /> :
                     <FileText className="text-white" style={{ width: 18, height: 18 }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{doc.file_name}</p>
                      <div className="flex-shrink-0"><DocStatusBadge status={doc.status} /></div>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{doc.document_type} • {doc.agent_applications?.student_full_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{doc.agent_applications?.application_id ?? '—'} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Document Detail</h3>
                <DocStatusBadge status={selected.status} />
              </div>

              <div className="space-y-3 text-sm mb-5">
                <div><p className="text-xs text-slate-400">File Name</p><p className="font-semibold text-slate-800">{selected.file_name}</p></div>
                <div><p className="text-xs text-slate-400">Document Type</p><p className="text-slate-700">{selected.document_type}</p></div>
                <div><p className="text-xs text-slate-400">Student</p><p className="text-slate-700">{selected.agent_applications?.student_full_name ?? '—'}</p></div>
                <div><p className="text-xs text-slate-400">Application ID</p><p className="text-slate-700 font-mono">{selected.agent_applications?.application_id ?? '—'}</p></div>
                <div><p className="text-xs text-slate-400">Size</p><p className="text-slate-700">{selected.file_size ? `${(selected.file_size / 1024 / 1024).toFixed(1)} MB` : '—'}</p></div>
                <div><p className="text-xs text-slate-400">Uploaded</p><p className="text-slate-700">{new Date(selected.uploaded_at).toLocaleString()}</p></div>
                {selected.admin_comment && <div className="p-3 bg-amber-50 rounded-xl"><p className="text-xs text-amber-600">Current Comment</p><p className="text-sm text-slate-700">{selected.admin_comment}</p></div>}
              </div>

              <Button size="sm" variant="secondary" className="w-full mb-4" onClick={() => handleDownload(selected)}>
                <Download className="w-4 h-4" /> Download Document
              </Button>

              {!['approved', 'rejected'].includes(selected.status) && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div>
                    <label className="label flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Admin Comment</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field min-h-[60px] resize-y" placeholder="Add a comment…" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateDocStatus(selected, 'approved')}>
                      <CheckCircle className="w-4 h-4" /> Approve
                    </Button>
                    <Button size="sm" variant="danger" className="flex-1" loading={updating} onClick={() => updateDocStatus(selected, 'rejected')}>
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                  </div>
                  {selected.status !== 'under_review' && (
                    <Button size="sm" variant="secondary" className="w-full" loading={updating} onClick={() => updateDocStatus(selected, 'under_review')}>
                      <Eye className="w-4 h-4" /> Mark Under Review
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <FolderCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a document to review</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
