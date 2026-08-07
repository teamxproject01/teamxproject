import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, BookOpen, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Course } from '../../types';
import Button from '../../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const emptyForm = {
  title: '',
  cricos_code: '',
  level: 'undergraduate',
  duration: '3 years',
  campus: 'Melbourne CBD',
  fees_domestic: '',
  fees_international: '',
  overview: '',
  entry_requirements_domestic: '',
  entry_requirements_international: '',
  career_outcomes: '',
  intake_dates: '',
  is_featured: false,
  image_url: '' as string,
};

export default function ContentManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    supabase.from('courses').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCourses(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (course: Course) => {
    setForm({
      title: course.title,
      cricos_code: course.cricos_code ?? '',
      level: course.level,
      duration: course.duration,
      campus: course.campus,
      fees_domestic: String(course.fees?.domestic ?? ''),
      fees_international: String(course.fees?.international ?? ''),
      overview: course.overview ?? '',
      entry_requirements_domestic: course.entry_requirements_domestic ?? course.entry_requirements ?? '',
      entry_requirements_international: course.entry_requirements_international ?? course.entry_requirements ?? '',
      career_outcomes: (course.career_outcomes ?? []).join(', '),
      intake_dates: (course.intake_dates ?? []).join(', '),
      is_featured: course.is_featured,
      image_url: course.image_url ?? '',
    });
    setEditId(course.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      cricos_code: form.cricos_code || null,
      level: form.level,
      duration: form.duration,
      campus: form.campus,
      fees: {
        domestic: Number(form.fees_domestic) || null,
        international: Number(form.fees_international) || null,
      },
      overview: form.overview || null,
      entry_requirements_domestic: form.entry_requirements_domestic || null,
      entry_requirements_international: form.entry_requirements_international || null,
      career_outcomes: form.career_outcomes.split(',').map(s => s.trim()).filter(Boolean),
      intake_dates: form.intake_dates.split(',').map(s => s.trim()).filter(Boolean),
      is_featured: form.is_featured,
      image_url: form.image_url || null,
      updated_at: new Date().toISOString(),
    };

    if (editId) {
      await supabase.from('courses').update(payload).eq('id', editId);
    } else {
      await supabase.from('courses').insert(payload);
    }

    setSaving(false);
    setShowForm(false);
    load();
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5 MB.'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('course-images').upload(path, file, { cacheControl: '3600', upsert: false });
    if (error) {
      alert('Upload failed. Please try again.');
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('course-images').getPublicUrl(path);
    setForm(prev => ({ ...prev, image_url: pub.publicUrl }));
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    await supabase.from('courses').delete().eq('id', id);
    load();
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Content Management</h1>
          <p className="text-slate-500 text-sm mt-1">Manage courses and programme information</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" /> Add Course
        </Button>
      </div>

      {/* Course form */}
      {showForm && (
        <div className="card p-6 border-2 border-blue-200 bg-blue-50/20">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">{editId ? 'Edit Course' : 'New Course'}</h2>
            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Course image upload */}
            <div className="sm:col-span-2">
              <label className="label">Course Image</label>
              <div className="flex items-center gap-4">
                <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center">
                  {form.image_url ? (
                    <img src={form.image_url} alt="Course preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-7 h-7 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = ''; }}
                  />
                  <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading}>
                    <Upload className="w-4 h-4" /> {form.image_url ? 'Replace Image' : 'Upload Image'}
                  </Button>
                  {form.image_url && (
                    <button onClick={() => setForm({ ...form, image_url: '' })} className="block text-xs text-red-500 hover:text-red-600 font-medium">
                      Remove image
                    </button>
                  )}
                  <p className="text-xs text-slate-400">Used on homepage, courses page, and course detail. Falls back to a default if left empty. Max 5 MB.</p>
                </div>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Course Title *</label>
              <input type="text" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" placeholder="Bachelor of Business Administration" />
            </div>
            <div>
              <label className="label">CRICOS Code</label>
              <input type="text" value={form.cricos_code} onChange={e => setForm({ ...form, cricos_code: e.target.value })} className="input-field" placeholder="0101234A" />
            </div>
            <div>
              <label className="label">Level</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="input-field">
                <option value="undergraduate">Undergraduate</option>
                <option value="postgraduate">Postgraduate</option>
                <option value="graduate_certificate">Graduate Certificate</option>
                <option value="diploma">Diploma</option>
              </select>
            </div>
            <div>
              <label className="label">Duration</label>
              <input type="text" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-field" placeholder="3 years" />
            </div>
            <div>
              <label className="label">Campus</label>
              <input type="text" value={form.campus} onChange={e => setForm({ ...form, campus: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label">Domestic Fees (AUD/yr)</label>
              <input type="number" value={form.fees_domestic} onChange={e => setForm({ ...form, fees_domestic: e.target.value })} className="input-field" placeholder="28000" />
            </div>
            <div>
              <label className="label">International Fees (AUD/yr)</label>
              <input type="number" value={form.fees_international} onChange={e => setForm({ ...form, fees_international: e.target.value })} className="input-field" placeholder="32000" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Overview</label>
              <textarea rows={3} value={form.overview} onChange={e => setForm({ ...form, overview: e.target.value })} className="input-field resize-none" placeholder="Program description…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Entry Requirements — Domestic Students</label>
              <textarea rows={3} value={form.entry_requirements_domestic} onChange={e => setForm({ ...form, entry_requirements_domestic: e.target.value })} className="input-field resize-none" placeholder="e.g. Year 12 completion (ATAR 65+), etc." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Entry Requirements — International Students</label>
              <textarea rows={3} value={form.entry_requirements_international} onChange={e => setForm({ ...form, entry_requirements_international: e.target.value })} className="input-field resize-none" placeholder="e.g. Year 12 equivalent, IELTS 6.0 (no band below 5.5), etc." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Career Outcomes (comma-separated)</label>
              <input type="text" value={form.career_outcomes} onChange={e => setForm({ ...form, career_outcomes: e.target.value })} className="input-field" placeholder="Business Analyst, Project Manager, Consultant" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Intake Dates (comma-separated)</label>
              <input type="text" value={form.intake_dates} onChange={e => setForm({ ...form, intake_dates: e.target.value })} className="input-field" placeholder="February, July, November" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${form.is_featured ? 'bg-blue-700 border-blue-700' : 'border-slate-300'}`}>
                {form.is_featured && <div className="w-2 h-2 bg-white rounded" />}
              </div>
              <input type="checkbox" className="sr-only" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
              <span className="text-sm text-slate-700 font-medium">Featured on homepage</span>
            </label>
          </div>
          <div className="flex gap-3 mt-5 pt-4 border-t border-slate-200 flex-wrap">
            <Button onClick={handleSave} loading={saving}>
              <Save className="w-4 h-4" /> {editId ? 'Save Changes' : 'Create Course'}
            </Button>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Course list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {courses.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p>No courses yet. Add one above.</p>
            </div>
          )}
          {courses.map((course) => (
            <motion.div
              key={course.id}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 flex items-center justify-center">
                {course.image_url ? (
                  <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-800">{course.title}</p>
                  <span className="badge bg-blue-100 text-blue-700 text-xs capitalize">{course.level.replace('_', ' ')}</span>
                  {course.is_featured && <span className="badge bg-amber-100 text-amber-700 text-xs">Featured</span>}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {course.cricos_code && `CRICOS ${course.cricos_code} • `}{course.duration} • {course.campus}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(course)}
                  className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
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
