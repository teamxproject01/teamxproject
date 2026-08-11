import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Upload, FileCheck, Loader2, Library, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const categories = [
  { value: 'handbook', label: 'Student Handbook' },
  { value: 'policy_procedure', label: 'Policy & Procedure' },
  { value: 'forms', label: 'Forms' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'campus', label: 'Campus & Facilities' },
  { value: 'complaints', label: 'Complaints & Appeals' },
  { value: 'welfare', label: 'Student Welfare' },
];

interface DocRow {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export default function DocumentLibrary() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'handbook', description: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const load = () => {
    supabase
      .from('public_documents')
      .select('*')
      .order('category', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDocs((data as DocRow[]) ?? []);
        setLoading(false);
      });
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!selectedFile || !form.title) return;
    setSaving(true);
    setUploading(true);

    const ext = selectedFile.name.split('.').pop()?.toLowerCase() ?? 'pdf';
    const path = `${form.category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('public-documents')
      .upload(path, selectedFile, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      alert('Upload failed. Please try again.');
      setUploading(false);
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from('public_documents').insert({
      title: form.title,
      category: form.category,
      description: form.description || null,
      file_path: path,
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      file_type: selectedFile.type,
      is_published: true,
      sort_order: 0,
      created_by: user?.id,
    });

    if (insertError) {
      alert('Failed to save document record. Please try again.');
    }

    setUploading(false);
    setSaving(false);
    setShowForm(false);
    setForm({ title: '', category: 'handbook', description: '' });
    setSelectedFile(null);
    load();
  };

  const togglePublish = async (doc: DocRow) => {
    await supabase.from('public_documents').update({ is_published: !doc.is_published }).eq('id', doc.id);
    load();
  };

  const handleDelete = async (doc: DocRow) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;
    await supabase.storage.from('public-documents').remove([doc.file_path]);
    await supabase.from('public_documents').delete().eq('id', doc.id);
    load();
  };

  const grouped = categories.map(c => ({
    ...c,
    items: docs.filter(d => d.category === c.value),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Document Library</h1>
          <p className="text-slate-500 text-sm mt-1">Upload and manage public documents for students (handbook, policies, forms, etc.)</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4" /> Upload Document
        </Button>
      </div>

      {/* Upload form */}
      {showForm && (
        <div className="card p-6 border-2 border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">Upload New Document</h2>
            <button onClick={() => { setShowForm(false); setSelectedFile(null); }} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
              Cancel
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="label">Document Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="e.g. Student Handbook 2025"
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="input-field"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="input-field resize-none"
                placeholder="Short summary shown to students"
              />
            </div>
            <div>
              <label className="label">File *</label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setSelectedFile(f); e.target.value = ''; }}
              />
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
                <Upload className="w-4 h-4" /> {selectedFile ? selectedFile.name : 'Choose File'}
              </Button>
              {selectedFile && (
                <p className="text-xs text-slate-400 mt-2">
                  {selectedFile.name} • {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              )}
            </div>
            <div className="pt-3 border-t border-slate-200">
              <Button onClick={handleUpload} loading={saving} disabled={!selectedFile || !form.title}>
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Publish Document'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Document list grouped by category */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-10 text-center">
          <Library className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">No documents yet. Upload your first document above.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(group => (
            <div key={group.value}>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-1 h-4 bg-blue-700 rounded-full" />
                {group.label}
                <span className="text-xs text-slate-400 font-normal">({group.items.length})</span>
              </h3>
              <div className="card divide-y divide-slate-100 overflow-hidden">
                {group.items.map((doc) => (
                  <motion.div
                    key={doc.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{doc.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {doc.file_name}
                        {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
                      </p>
                    </div>
                    <span className={`badge text-xs flex-shrink-0 ${doc.is_published ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {doc.is_published ? 'Published' : 'Hidden'}
                    </span>
                    <button
                      onClick={() => togglePublish(doc)}
                      title={doc.is_published ? 'Hide from public' : 'Publish'}
                      className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition-colors flex-shrink-0"
                    >
                      {doc.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      title="Delete document"
                      className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
