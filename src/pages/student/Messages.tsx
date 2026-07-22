import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, MailOpen, Bell } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Message } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const load = () =>
    supabase.from('messages').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const markRead = async (msg: Message) => {
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
    setSelected(msg);
  };

  const unread = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <p className="text-slate-500 text-sm mt-1">
            {unread > 0 ? `${unread} unread message${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <Bell className="w-3.5 h-3.5" />
            {unread} unread
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : messages.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Messages</h3>
          <p className="text-slate-500 text-sm">Messages from MIHE staff will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* List */}
          <div className={`space-y-2 ${selected ? 'hidden md:block' : ''}`}>
            {messages.map((msg) => (
              <motion.button
                key={msg.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => markRead(msg)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected?.id === msg.id
                    ? 'border-blue-400 bg-blue-50'
                    : msg.is_read
                    ? 'card border-transparent hover:border-blue-200'
                    : 'card border-blue-200 bg-blue-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_read ? 'bg-slate-100' : 'bg-blue-600'}`}>
                    {msg.is_read
                      ? <MailOpen className="w-4 h-4 text-slate-400" />
                      : <Mail className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm truncate ${!msg.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {msg.subject || 'Notice'}
                      </p>
                      {!msg.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-slate-400 capitalize truncate">{msg.sender_role}</p>
                      <p className="text-xs text-slate-400 flex-shrink-0">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="card p-6">
              <button onClick={() => setSelected(null)} className="md:hidden flex items-center gap-2 text-sm text-blue-600 mb-4 font-medium">
                ← Back to messages
              </button>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h3 className="font-bold text-slate-900 text-lg">{selected.subject || 'Notice'}</h3>
                <p className="text-sm text-slate-500 mt-1 capitalize">
                  From: {selected.sender_role} • {new Date(selected.created_at).toLocaleString()}
                </p>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{selected.content}</p>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center hidden md:flex">
              <MessageSquare className="w-10 h-10 text-blue-300 mb-3" />
              <p className="text-slate-500 text-sm">Select a message to read</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
