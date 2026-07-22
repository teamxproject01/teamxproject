import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, CheckCircle, Clock, XCircle, AlertCircle, FolderOpen, Download, Trash2 } from 'lucide-react';
import { Document } from '../../types';
import { StatusBadge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const docTypes = [
  'Academic Transcript',
  'Passport / ID',
  'English Language Test',
  'Birth Certificate',
  'Visa / CoE',
  'Medical Certificate',
  'Supporting Evidence',
  'Other',
];

export default function Documents() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState(docTypes[0]);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () =>
    supabase.from('documents').select('*').order('uploaded_at', { ascending: false })
      .then(({ data }) => { setDocuments(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const MAX = 10 * 1024 * 1024;
    const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

    if (file.size > MAX) { setError('File size must be under 10 MB.'); return; }
    if (!ALLOWED.includes(file.type)) { setError('Only PDF, JPG, PNG, and WebP files are allowed.'); return; }

    setError('');
    setUploading(true);

    const filePath = `${profile.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('student-documents')
      .upload(filePath, file);

    if (uploadError) {
      setError('Upload failed. Please try again.');
      setUploading(false);
      e.target.value = '';
      return;
    }

    await supabase.from('documents').insert({
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      doc_type: docType,
      status: 'pending',
    });

    load();
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (doc: Document) => {
    setDeletingId(doc.id);
    await supabase.storage.from('student-documents').remove([doc.file_path]);
    await supabase.from('documents').delete().eq('id', doc.id);
    setDeletingId(null);
    load();
  };

  const handleDownload = async (doc: Document) => {
    const { data } = await supabase.storage.from('student-documents').createSignedUrl(doc.file_path, 60);
    if (data) window.open(data.signedUrl, '_blank');
  };

  const grouped = docTypes.reduce<Record<string, Document[]>>((acc, t) => {
    const items = documents.filter(d => d.doc_type === t);
    if (items.length > 0) acc[t] = items;
    return acc;
  }, {});

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
        <p className="text-slate-500 text-sm mt-1">Upload and manage your supporting documents</p>
      </div>

      {/* Upload card */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Upload a Document</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="sm:col-span-2">
            <label className="label">Document Type</label>
            <select value={docType} onChange={(e) => setDocType(e.target.value)} className="input-field">
              {docTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <label className={`flex flex-col items-center justify-center p-5 sm:p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
          uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'
        }`}>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={handleUpload} disabled={uploading} />
          {uploading ? (
            <>
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-blue-600 font-semibold text-sm">Uploading…</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-blue-400 mb-3" />
              <p className="font-semibold text-slate-700">Click to upload or drag & drop</p>
              <p className="text-slate-400 text-sm mt-1">PDF, JPG, PNG, WebP — max 10 MB</p>
            </>
          )}
        </label>
      </motion.div>

      {/* Documents list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Documents Uploaded</h3>
          <p className="text-slate-500 text-sm">Upload your supporting documents above</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([type, docs]) => (
            <motion.div key={type} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wider mb-2 px-1">{type}</h3>
              <div className="card divide-y divide-slate-100 overflow-hidden">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-2 sm:gap-4 p-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'verified' ? 'bg-green-100' :
                      doc.status === 'rejected' ? 'bg-red-100' :
                      doc.status === 'expired' ? 'bg-orange-100' : 'bg-blue-50'
                    }`}>
                      {doc.status === 'verified' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                       doc.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-500" /> :
                       doc.status === 'expired' ? <AlertCircle className="w-5 h-5 text-orange-500" /> :
                       <File className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{doc.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {formatSize(doc.file_size ?? undefined)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0"><StatusBadge status={doc.status} /></div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deletingId === doc.id}
                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletingId === doc.id ? (
                          <div className="w-4 h-4 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
