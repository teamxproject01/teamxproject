import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, CalendarDays, ChevronLeft, ChevronRight,
  Save, AlertCircle, Eye, EyeOff,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CalendarView, { type CalendarEvent } from '../../components/ui/CalendarView';

const EVENT_TYPES = [
  { value: 'general', label: 'General' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'exam', label: 'Exam' },
  { value: 'orientation', label: 'Orientation' },
  { value: 'break', label: 'Break' },
  { value: 'deadline', label: 'Deadline' },
];

const TYPE_STYLES: Record<string, string> = {
  holiday: 'bg-red-100 text-red-700',
  exam: 'bg-amber-100 text-amber-700',
  orientation: 'bg-blue-100 text-blue-700',
  break: 'bg-green-100 text-green-700',
  deadline: 'bg-purple-100 text-purple-700',
  general: 'bg-slate-100 text-slate-600',
};

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface EditState {
  id?: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  event_type: string;
  is_active: boolean;
}

const emptyForm: EditState = {
  title: '', description: '', event_date: '', end_date: '', event_type: 'general', is_active: true,
};

export default function AcademicCalendar() {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<CalendarEvent | null>(null);
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('academic_calendar_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error) setAllEvents((data as CalendarEvent[]) ?? []);
    setLoading(false);
  };

  const years = useMemo(() => {
    const ys = [...new Set(allEvents.map(e => e.year))].sort((a, b) => b - a);
    return ys;
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    if (filterYear === 'all') return allEvents;
    return allEvents.filter(e => e.year === filterYear);
  }, [allEvents, filterYear]);

  const startEdit = (ev?: CalendarEvent) => {
    if (ev) {
      setEditing({
        id: ev.id,
        title: ev.title,
        description: ev.description ?? '',
        event_date: ev.event_date,
        end_date: ev.end_date ?? '',
        event_type: ev.event_type,
        is_active: ev.is_active,
      });
    } else {
      setEditing({ ...emptyForm });
    }
    setError('');
  };

  const saveEvent = async () => {
    if (!editing) return;
    if (!editing.title.trim()) { setError('Title is required.'); return; }
    if (!editing.event_date) { setError('Event date is required.'); return; }

    setSaving(true);
    setError('');

    const payload = {
      title: editing.title.trim(),
      description: editing.description.trim() || null,
      event_date: editing.event_date,
      end_date: editing.end_date || null,
      event_type: editing.event_type,
      is_active: editing.is_active,
    };

    try {
      if (editing.id) {
        const { error: updateError } = await supabase
          .from('academic_calendar_events')
          .update(payload)
          .eq('id', editing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('academic_calendar_events')
          .insert(payload);
        if (insertError) throw insertError;
      }
      setEditing(null);
      await loadEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to save event');
    }
    setSaving(false);
  };

  const deleteEvent = async (ev: CalendarEvent) => {
    const { error: deleteError } = await supabase
      .from('academic_calendar_events')
      .delete()
      .eq('id', ev.id);
    if (!deleteError) {
      setConfirmDelete(null);
      await loadEvents();
    }
  };

  const toggleActive = async (ev: CalendarEvent) => {
    await supabase
      .from('academic_calendar_events')
      .update({ is_active: !ev.is_active })
      .eq('id', ev.id);
    await loadEvents();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }} className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">Manage academic year events visible to students and agents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'calendar' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
            >
              Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
            >
              List
            </button>
          </div>
          <button onClick={() => startEdit()} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar view */}
      {view === 'calendar' && (
        <>
          <CalendarView readOnly />
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 mb-4">All Events ({filteredEvents.length})</h3>
            <EventList
              events={filteredEvents}
              loading={loading}
              onEdit={startEdit}
              onDelete={setConfirmDelete}
              onToggle={toggleActive}
              years={years}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
            />
          </div>
        </>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">All Events ({filteredEvents.length})</h3>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="input-field text-sm py-2 w-auto"
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <EventList
            events={filteredEvents}
            loading={loading}
            onEdit={startEdit}
            onDelete={setConfirmDelete}
            onToggle={toggleActive}
            years={years}
            filterYear={filterYear}
            setFilterYear={setFilterYear}
          />
        </div>
      )}

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <EditModal
            editing={editing}
            setEditing={setEditing}
            onSave={saveEvent}
            onClose={() => setEditing(null)}
            saving={saving}
            error={error}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <DeleteModal event={confirmDelete} onCancel={() => setConfirmDelete(null)} onConfirm={() => deleteEvent(confirmDelete)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function EventList({
  events, loading, onEdit, onDelete, onToggle, years, filterYear, setFilterYear,
}: {
  events: CalendarEvent[];
  loading: boolean;
  onEdit: (ev: CalendarEvent) => void;
  onDelete: (ev: CalendarEvent) => void;
  onToggle: (ev: CalendarEvent) => void;
  years: number[];
  filterYear: number | 'all';
  setFilterYear: (v: number | 'all') => void;
}) {
  if (loading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>;
  }
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <CalendarDays className="w-12 h-12 mb-3 opacity-40" />
        <p className="text-sm">No events yet. Click "Add Event" to create one.</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {events.map(ev => (
        <div
          key={ev.id}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ev.is_active ? 'border-slate-100 bg-white hover:shadow-sm' : 'border-slate-100 bg-slate-50 opacity-60'}`}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-slate-800 truncate">{ev.title}</p>
              <span className={`badge text-xs ${TYPE_STYLES[ev.event_type] ?? TYPE_STYLES.general}`}>{ev.event_type}</span>
              {!ev.is_active && <span className="badge text-xs bg-slate-200 text-slate-500">Hidden</span>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(ev.event_date)}{ev.end_date && ` — ${formatDate(ev.end_date)}`}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => onToggle(ev)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              title={ev.is_active ? 'Hide from calendar' : 'Show on calendar'}
            >
              {ev.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => onEdit(ev)}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(ev)}
              className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function EditModal({
  editing, setEditing, onSave, onClose, saving, error,
}: {
  editing: EditState;
  setEditing: (e: EditState | null) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  error: string;
}) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-900/40" onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[92%] max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto mx-2"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">{editing.id ? 'Edit Event' : 'Add Event'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="label">Event Title *</label>
            <input
              type="text"
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="input-field"
              placeholder="e.g. Semester 1 Orientation Week"
              autoFocus
            />
          </div>
          <div>
            <label className="label">Event Type</label>
            <select
              value={editing.event_type}
              onChange={(e) => setEditing({ ...editing, event_type: e.target.value })}
              className="input-field"
            >
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input
                type="date"
                value={editing.event_date}
                onChange={(e) => setEditing({ ...editing, event_date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">End Date (optional)</label>
              <input
                type="date"
                value={editing.end_date}
                onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              className="input-field min-h-[100px] resize-y"
              placeholder="Additional details shown when a student or agent clicks this event..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.is_active}
              onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-700 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">Visible on calendar</span>
          </label>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button onClick={onClose} className="btn-ghost text-sm w-full sm:w-auto">Cancel</button>
          <button onClick={onSave} disabled={saving} className="btn-primary text-sm w-full sm:w-auto">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Event'}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function DeleteModal({ event, onCancel, onConfirm }: { event: CalendarEvent; onCancel: () => void; onConfirm: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-slate-900/40" onClick={onCancel}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm bg-white rounded-2xl shadow-xl border border-slate-100 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete Event?</h3>
            <p className="text-xs text-slate-500">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mb-5">
          Are you sure you want to delete <span className="font-semibold">{event.title}</span>?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-red-600 transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </>
  );
}
