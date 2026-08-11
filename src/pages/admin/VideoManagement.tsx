import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, X, Video, Power, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface TalkVideo {
  id: string;
  youtube_id: string;
  title: string;
  duration: string;
  is_enabled: boolean;
  sort_order: number;
}

const emptyForm = { youtube_id: '', title: '', duration: '' };

export default function VideoManagement() {
  const [videos, setVideos] = useState<TalkVideo[]>([]);
  const [sectionEnabled, setSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [{ data: vids }, { data: cfg }] = await Promise.all([
      supabase.from('featured_talks_videos').select('*').order('sort_order'),
      supabase.from('featured_talks_config').select('section_enabled').eq('id', 1).maybeSingle(),
    ]);
    setVideos(vids ?? []);
    if (cfg) setSectionEnabled(cfg.section_enabled);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleSection = async () => {
    setSavingConfig(true);
    const next = !sectionEnabled;
    const { error } = await supabase.from('featured_talks_config').update({ section_enabled: next }).eq('id', 1);
    if (!error) setSectionEnabled(next);
    setSavingConfig(false);
  };

  const toggleVideo = async (v: TalkVideo) => {
    await supabase.from('featured_talks_videos').update({ is_enabled: !v.is_enabled }).eq('id', v.id);
    setVideos(prev => prev.map(x => x.id === v.id ? { ...x, is_enabled: !x.is_enabled } : x));
  };

  const handleAdd = async () => {
    if (!form.youtube_id.trim() || !form.title.trim()) {
      setError('YouTube ID and title are required.');
      return;
    }
    setSaving(true);
    setError('');
    const maxOrder = videos.length ? Math.max(...videos.map(v => v.sort_order)) : 0;
    const { error } = await supabase.from('featured_talks_videos').insert({
      youtube_id: form.youtube_id.trim(),
      title: form.title.trim(),
      duration: form.duration.trim() || '0:00',
      is_enabled: true,
      sort_order: maxOrder + 1,
    });
    if (error) { setError(error.message); setSaving(false); return; }
    setSaving(false);
    setShowForm(false);
    setForm(emptyForm);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this video from the Featured Talks section?')) return;
    await supabase.from('featured_talks_videos').delete().eq('id', id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-700" /> Video Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage the Featured Talks section on the homepage</p>
        </div>
        <Button onClick={() => { setShowForm(true); setForm(emptyForm); setError(''); }}>
          <Plus className="w-4 h-4" /> Add Video
        </Button>
      </div>

      {/* Section toggle */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${sectionEnabled ? 'bg-blue-50' : 'bg-slate-100'}`}>
            <Power className={`w-5 h-5 ${sectionEnabled ? 'text-blue-700' : 'text-slate-400'}`} />
          </div>
          <div>
            <p className="font-bold text-slate-900">Featured Talks Section</p>
            <p className="text-sm text-slate-500">
              {sectionEnabled ? 'Visible on homepage' : 'Hidden from homepage'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${sectionEnabled ? 'text-green-700' : 'text-slate-400'}`}>
            {sectionEnabled ? 'ON' : 'OFF'}
          </span>
          <button
            type="button"
            onClick={toggleSection}
            disabled={savingConfig}
            className={`relative w-12 h-6 rounded-full transition-colors ${sectionEnabled ? 'bg-blue-700' : 'bg-slate-300'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${sectionEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>
      </motion.div>

      {/* Add video form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card p-6 border-2 border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">Add New Video</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 mb-4">{error}</p>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">YouTube Video ID *</label>
              <input
                type="text"
                value={form.youtube_id}
                onChange={e => setForm({ ...form, youtube_id: e.target.value })}
                className="input-field font-mono"
                placeholder="e.g. qp0HIF3SfI4"
              />
              <p className="text-xs text-slate-400 mt-1">The part after youtube.com/watch?v=</p>
            </div>
            <div>
              <label className="label">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
                className="input-field"
                placeholder="e.g. 18:01"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Video Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                className="input-field"
                placeholder="e.g. How Great Leaders Inspire Action | Simon Sinek"
              />
            </div>
          </div>

          {form.youtube_id && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-500 mb-2 font-medium">Preview</p>
              <img
                src={`https://img.youtube.com/vi/${form.youtube_id}/mqdefault.jpg`}
                alt="thumbnail"
                className="rounded-lg w-40 h-24 object-cover"
              />
            </div>
          )}

          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-200">
            <Button onClick={handleAdd} loading={saving}>
              <Save className="w-4 h-4" /> Add Video
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </motion.div>
      )}

      {/* Video list */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {videos.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <Video className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No videos yet. Add one above.</p>
            </div>
          )}
          {videos.map((v) => (
            <motion.div
              key={v.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <img
                src={`https://img.youtube.com/vi/${v.youtube_id}/mqdefault.jpg`}
                alt={v.title}
                className="w-16 h-10 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm leading-snug truncate">{v.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">ID: {v.youtube_id} • {v.duration}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => toggleVideo(v)}
                  title={v.is_enabled ? 'Hide video' : 'Show video'}
                  className={`p-2 rounded-lg transition-colors ${v.is_enabled ? 'text-blue-700 bg-blue-50 hover:bg-blue-100' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  {v.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
