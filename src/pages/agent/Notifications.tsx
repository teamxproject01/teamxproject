import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, CheckCircle, Mail, MailOpen, FileText, Award, AlertCircle, TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { AgentNotification } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const typeIcons: Record<string, typeof Bell> = {
  general: Bell,
  status_change: TrendingUp,
  document_request: FileText,
  document_review: AlertCircle,
  offer: Award,
  enrolment: CheckCircle,
};

const typeColors: Record<string, string> = {
  general: 'bg-blue-100 text-blue-600',
  status_change: 'bg-purple-100 text-purple-600',
  document_request: 'bg-amber-100 text-amber-600',
  document_review: 'bg-orange-100 text-orange-600',
  offer: 'bg-green-100 text-green-600',
  enrolment: 'bg-emerald-100 text-emerald-600',
};

export default function Notifications() {
  const { profile } = useAuth();
  const [notifs, setNotifs] = useState<AgentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AgentNotification | null>(null);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('agent_notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setNotifs(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  const markAsRead = async (notif: AgentNotification) => {
    if (notif.is_read) { setSelected(notif); return; }
    await supabase.from('agent_notifications').update({ is_read: true }).eq('id', notif.id);
    setNotifs(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
    setSelected({ ...notif, is_read: true });
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('agent_notifications').update({ is_read: true }).eq('user_id', profile.id).eq('is_read', false);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifs.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-blue-600 font-semibold hover:text-blue-700">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : notifs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Notifications</h3>
          <p className="text-slate-500 text-sm">You'll be notified here when application statuses change or documents are reviewed</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-3 space-y-2">
            {notifs.map((n) => {
              const Icon = typeIcons[n.type] ?? Bell;
              return (
                <motion.div key={n.id} variants={fadeUp} initial="hidden" animate="visible">
                  <div
                    onClick={() => markAsRead(n)}
                    className={`card p-4 cursor-pointer transition-all ${
                      selected?.id === n.id ? 'ring-2 ring-blue-400' : 'hover:shadow-card-hover'
                    } ${!n.is_read ? 'border-l-4 border-l-blue-500' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[n.type] ?? 'bg-blue-100 text-blue-600'}`}>
                        <Icon className="" style={{ width: 18, height: 18 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm truncate ${n.is_read ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{n.title}</p>
                          {n.is_read ? <MailOpen className="w-4 h-4 text-slate-300 flex-shrink-0" /> : <Mail className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detail */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="card p-6 lg:sticky lg:top-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[selected.type] ?? 'bg-blue-100 text-blue-600'}`}>
                    {(() => { const Icon = typeIcons[selected.type] ?? Bell; return <Icon className="w-5 h-5" />; })()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{selected.title}</p>
                    <p className="text-xs text-slate-400 capitalize">{selected.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.message}</p>
                <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Select a notification to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
