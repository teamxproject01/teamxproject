import { useState, useEffect } from 'react';
import { FileText, Download, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PublicDocument {
  id: string;
  title: string;
  category: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_size: number | null;
  file_type: string | null;
  is_published: boolean;
  sort_order: number;
}

interface DocumentListProps {
  category: string;
  emptyMessage?: string;
}

export default function DocumentList({ category, emptyMessage = 'No documents available yet. Please check back soon.' }: DocumentListProps) {
  const [docs, setDocs] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('public_documents')
        .select('id, title, category, description, file_path, file_name, file_size, file_type, is_published, sort_order')
        .eq('category', category)
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (cancelled) return;
      if (error) {
        setError(true);
      } else {
        setDocs((data as PublicDocument[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [category]);

  const handleDownload = async (doc: PublicDocument) => {
    setDownloadingId(doc.id);
    const { data } = await supabase.storage.from('public-documents').createSignedUrl(doc.file_path, 60);
    if (data) window.open(data.signedUrl, '_blank');
    setDownloadingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
        <p className="text-slate-500 text-sm">Unable to load documents. Please try again later.</p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {docs.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            {downloadingId === doc.id ? (
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            ) : (
              <FileCheck className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate">{doc.title}</p>
            {doc.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{doc.description}</p>
            )}
            <p className="text-xs text-slate-400 mt-0.5">
              {doc.file_name}
              {doc.file_size ? ` • ${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : ''}
            </p>
          </div>
          <button
            onClick={() => handleDownload(doc)}
            disabled={downloadingId === doc.id}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors flex-shrink-0 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      ))}
    </div>
  );
}
