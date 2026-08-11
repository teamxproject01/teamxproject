import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, CalendarDays, X, Clock, FileText,
  GraduationCap, Plane, BookOpen, AlertCircle, Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  event_type: string;
  year: number;
  is_active: boolean;
}

const EVENT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string; icon: typeof Info }> = {
  holiday: { label: 'Holiday', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', icon: Plane },
  exam: { label: 'Exam', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', icon: AlertCircle },
  orientation: { label: 'Orientation', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', icon: GraduationCap },
  break: { label: 'Break', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', icon: Clock },
  deadline: { label: 'Deadline', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', icon: AlertCircle },
  general: { label: 'General', color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', dot: 'bg-slate-500', icon: Info },
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function CalendarView({ readOnly = false }: { readOnly?: boolean }) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  useEffect(() => {
    supabase
      .from('academic_calendar_events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEvents((data as CalendarEvent[]) ?? []);
        setLoading(false);
      });
  }, []);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const start = new Date(ev.event_date + 'T00:00:00');
      const end = ev.end_date ? new Date(ev.end_date + 'T00:00:00') : start;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        if (!map[key]) map[key] = [];
        map[key].push(ev);
      }
    }
    return map;
  }, [events]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();

    const cells: (string | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      cells.push(dateStr);
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events
      .filter(e => e.event_date >= today)
      .slice(0, 6);
  }, [events]);

  const prevMonth = () => setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">
                {MONTHS[viewMonth]} {viewYear}
              </h2>
              <button
                onClick={goToday}
                className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dateStr, i) => {
              if (!dateStr) return <div key={i} className="aspect-square" />;
              const dayEvents = eventsByDate[dateStr] ?? [];
              const isToday = dateStr === todayStr;
              const dayNum = parseInt(dateStr.slice(8));
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`aspect-square p-1.5 rounded-lg border text-left transition-all duration-200 flex flex-col gap-0.5
                    ${isToday ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                  `}
                >
                  <span className={`text-xs font-semibold ${isToday ? 'text-blue-700' : 'text-slate-600'}`}>
                    {dayNum}
                  </span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {dayEvents.slice(0, 3).map((ev, j) => {
                      const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.general;
                      return <span key={j} className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />;
                    })}
                    {dayEvents.length > 3 && (
                      <span className="text-[9px] text-slate-400 font-medium">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-100">
            {Object.entries(EVENT_CONFIG).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-xs text-slate-500">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events sidebar */}
        <div className="card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-700" />
            Upcoming Events
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400">
              <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
              <p className="text-sm">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(ev => {
                const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.general;
                const Icon = cfg.icon;
                return (
                  <button
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className={`w-full text-left p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:shadow-sm transition-all duration-200 group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${cfg.dot} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700">
                          {ev.title}
                        </p>
                        <p className={`text-xs ${cfg.color} mt-0.5`}>
                          {formatDate(ev.event_date)}
                          {ev.end_date && ` — ${formatDate(ev.end_date)}`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Day detail modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetailModal
            dateStr={selectedDay}
            events={eventsByDate[selectedDay] ?? []}
            onClose={() => setSelectedDay(null)}
            onEventClick={(ev) => { setSelectedDay(null); setSelectedEvent(ev); }}
          />
        )}
      </AnimatePresence>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DayDetailModal({
  dateStr, events, onClose, onEventClick,
}: {
  dateStr: string;
  events: CalendarEvent[];
  onClose: () => void;
  onEventClick: (ev: CalendarEvent) => void;
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">{formatDate(dateStr)}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <CalendarDays className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No events on this day</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map(ev => {
              const cfg = EVENT_CONFIG[ev.event_type] ?? EVENT_CONFIG.general;
              const Icon = cfg.icon;
              return (
                <button
                  key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className={`w-full text-left p-3 rounded-xl border ${cfg.border} ${cfg.bg} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg ${cfg.dot} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{ev.title}</p>
                      <p className={`text-xs ${cfg.color} mt-0.5`}>{cfg.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}

function EventDetailModal({ event, onClose }: { event: CalendarEvent; onClose: () => void }) {
  const cfg = EVENT_CONFIG[event.event_type] ?? EVENT_CONFIG.general;
  const Icon = cfg.icon;
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
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className={`${cfg.bg} ${cfg.border} border-b px-6 py-5`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${cfg.dot} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className={`badge ${cfg.bg} ${cfg.color} mb-1`}>{cfg.label}</span>
                <h3 className="text-lg font-bold text-slate-900">{event.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/60 text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {formatDate(event.event_date)}
              {event.end_date && ` — ${formatDate(event.end_date)}`}
            </span>
          </div>
          {event.description ? (
            <div className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
              <FileText className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <p>{event.description}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">No additional details available.</p>
          )}
        </div>
      </motion.div>
    </>
  );
}
