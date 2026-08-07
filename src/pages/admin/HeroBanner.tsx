import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, GripVertical, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

interface ChipData {
  icon: string;
  value: string;
  label: string;
  pos: string;
  enter: { x: number; y: number };
}

interface HeroSlide {
  id: string;
  sort_order: number;
  is_enabled: boolean;
  tag: string;
  heading: string;
  heading_accent: string;
  sub: string;
  cta_label: string;
  cta_href: string;
  cta2_label: string;
  cta2_href: string;
  image_url: string;
  chips: ChipData[];
}

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const emptyForm: Omit<HeroSlide, 'id'> = {
  sort_order: 0,
  is_enabled: true,
  tag: '',
  heading: '',
  heading_accent: '',
  sub: '',
  cta_label: '',
  cta_href: '/courses',
  cta2_label: '',
  cta2_href: '/about',
  image_url: '',
  chips: [],
};

const ICON_OPTIONS = [
  'Calendar', 'MapPin', 'Users', 'Building2', 'TrendingUp', 'BookOpen',
  'Globe', 'Award', 'Star', 'GraduationCap', 'Briefcase', 'CheckCircle',
];

export default function HeroBanner() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<HeroSlide, 'id'>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    supabase.from('hero_slides').select('*').order('sort_order', { ascending: true })
      .then(({ data }) => { setSlides(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, sort_order: slides.length });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (slide: HeroSlide) => {
    setForm({
      sort_order: slide.sort_order,
      is_enabled: slide.is_enabled,
      tag: slide.tag,
      heading: slide.heading,
      heading_accent: slide.heading_accent,
      sub: slide.sub,
      cta_label: slide.cta_label,
      cta_href: slide.cta_href,
      cta2_label: slide.cta2_label,
      cta2_href: slide.cta2_href,
      image_url: slide.image_url,
      chips: slide.chips ?? [],
    });
    setEditId(slide.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      chips: form.chips,
      updated_at: new Date().toISOString(),
    };
    if (editId) {
      await supabase.from('hero_slides').update(payload).eq('id', editId);
    } else {
      await supabase.from('hero_slides').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this hero slide? This cannot be undone.')) return;
    await supabase.from('hero_slides').delete().eq('id', id);
    load();
  };

  const toggleEnabled = async (slide: HeroSlide) => {
    await supabase.from('hero_slides').update({ is_enabled: !slide.is_enabled }).eq('id', slide.id);
    load();
  };

  const updateChip = (idx: number, field: keyof ChipData, value: string) => {
    const chips = [...form.chips];
    if (field === 'enter') return;
    (chips[idx] as any)[field] = value;
    setForm({ ...form, chips });
  };

  const addChip = () => {
    setForm({
      ...form,
      chips: [...form.chips, { icon: 'Star', value: '', label: '', pos: 'top-5 left-5', enter: { x: 0, y: 0 } }],
    });
  };

  const removeChip = (idx: number) => {
    setForm({ ...form, chips: form.chips.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Hero Banner</h1>
          <p className="text-slate-500 text-sm mt-1">Manage the homepage hero carousel slides</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Slide
        </Button>
      </div>

      {/* Slide form */}
      {showForm && (
        <div className="card p-6 border-2 border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editId ? 'Edit Slide' : 'New Slide'}</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Tag / Badge Text</label>
              <input type="text" value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} className="input-field" placeholder="WORLD-CLASS EDUCATION" />
            </div>
            <div>
              <label className="label">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label className="label">Heading (top line)</label>
              <input type="text" value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} className="input-field" placeholder="Your Pathway to" />
            </div>
            <div>
              <label className="label">Heading Accent (bold line)</label>
              <input type="text" value={form.heading_accent} onChange={e => setForm({ ...form, heading_accent: e.target.value })} className="input-field" placeholder="Excellence Starts Here" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Subtitle</label>
              <textarea rows={2} value={form.sub} onChange={e => setForm({ ...form, sub: e.target.value })} className="input-field resize-none" placeholder="Industry-aligned programmes designed to launch your career." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Background Image URL</label>
              <input type="text" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://images.pexels.com/..." />
              {form.image_url && (
                <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 h-24">
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="label">Primary Button Label</label>
              <input type="text" value={form.cta_label} onChange={e => setForm({ ...form, cta_label: e.target.value })} className="input-field" placeholder="Explore Courses" />
            </div>
            <div>
              <label className="label">Primary Button Link</label>
              <input type="text" value={form.cta_href} onChange={e => setForm({ ...form, cta_href: e.target.value })} className="input-field" placeholder="/courses" />
            </div>
            <div>
              <label className="label">Secondary Button Label</label>
              <input type="text" value={form.cta2_label} onChange={e => setForm({ ...form, cta2_label: e.target.value })} className="input-field" placeholder="Apply Now" />
            </div>
            <div>
              <label className="label">Secondary Button Link</label>
              <input type="text" value={form.cta2_href} onChange={e => setForm({ ...form, cta2_href: e.target.value })} className="input-field" placeholder="/signup" />
            </div>
          </div>

          {/* Chips editor */}
          <div className="mt-5 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="label !mb-0">Floating Badge Chips</label>
              <button onClick={addChip} className="text-sm text-blue-700 font-semibold flex items-center gap-1 hover:text-blue-800">
                <Plus className="w-3.5 h-3.5" /> Add Chip
              </button>
            </div>
            <div className="space-y-3">
              {form.chips.map((chip, idx) => (
                <div key={idx} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-slate-50 rounded-xl">
                  <select value={chip.icon} onChange={e => updateChip(idx, 'icon', e.target.value)} className="input-field !py-2 text-xs">
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                  <input type="text" value={chip.value} onChange={e => updateChip(idx, 'value', e.target.value)} className="input-field !py-2 text-xs" placeholder="96%" />
                  <input type="text" value={chip.label} onChange={e => updateChip(idx, 'label', e.target.value)} className="input-field !py-2 text-xs" placeholder="Employment" />
                  <input type="text" value={chip.pos} onChange={e => updateChip(idx, 'pos', e.target.value)} className="input-field !py-2 text-xs" placeholder="top-5 left-5" />
                  <button onClick={() => removeChip(idx)} className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {form.chips.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No chips added. Chips are the small floating badges on the hero image.</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_enabled ? 'bg-blue-700 border-blue-700' : 'border-slate-300'}`}>
              {form.is_enabled && <div className="w-2 h-2 bg-white rounded" />}
            </div>
            <input type="checkbox" className="sr-only" checked={form.is_enabled} onChange={e => setForm({ ...form, is_enabled: e.target.checked })} />
            <span className="text-sm text-slate-700 font-medium">Enabled (visible on homepage)</span>
          </label>

          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-200 flex-wrap">
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" /> {editId ? 'Save Changes' : 'Create Slide'}
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Slide list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {slides.length === 0 && (
            <div className="card p-10 text-center text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No hero slides yet. Add one above.</p>
            </div>
          )}
          {slides.map((slide) => (
            <motion.div
              key={slide.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="card p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                {slide.image_url ? (
                  <img src={slide.image_url} alt={slide.heading_accent} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-slate-400">#{slide.sort_order}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{slide.tag}</span>
                  {!slide.is_enabled && (
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Hidden</span>
                  )}
                </div>
                <p className="font-semibold text-slate-800 text-sm mt-1 truncate">
                  {slide.heading} <span className="text-blue-700">{slide.heading_accent}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{slide.sub}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleEnabled(slide)}
                  className={`p-2 rounded-lg transition-colors ${slide.is_enabled ? 'text-green-600 hover:bg-green-50' : 'text-slate-300 hover:bg-slate-100'}`}
                  title={slide.is_enabled ? 'Hide slide' : 'Show slide'}
                >
                  {slide.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(slide)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(slide.id)}
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
