import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Mail, MailOpen, Bell, Send, ArrowLeft, Reply } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Message, ConversationMessage } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);
  const [activeTab, setActiveTab] = useState<'notices' | 'conversations'>('notices');
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [convMessages, setConvMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const { profile } = useAuth();

  const load = useCallback(() => {
    if (!profile?.id) return;
    supabase.from('messages').select('*').eq('student_id', profile.id).order('created_at', { ascending: false })
      .then(({ data }) => { setMessages((data as Message[]) ?? []); setLoading(false); });
  }, [profile?.id]);

  const loadConversations = useCallback(async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('conversations')
      .select('*, agent_applications(student_full_name, courses(title))')
      .or(`student_id.eq.${profile.id}`)
      .order('last_message_at', { ascending: false });
    setConversations(data ?? []);
  }, [profile?.id]);

  const loadConvMessages = useCallback(async (convId: string) => {
    const { data } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setConvMessages((data as ConversationMessage[]) ?? []);

    // Mark unread messages as read
    const unread = (data ?? []).filter((m: any) => !m.is_read && m.sender_role !== 'student');
    if (unread.length > 0) {
      for (const msg of unread) {
        await supabase.from('conversation_messages').update({ is_read: true, read_at: new Date().toISOString() }).eq('id', msg.id);
      }
    }
  }, []);

  useEffect(() => {
    load();
    loadConversations();
  }, [load, loadConversations]);

  useEffect(() => {
    if (messages.length === 0) return;
    const unread = messages.filter(m => !m.is_read);
    if (unread.length === 0) return;
    const unreadIds = unread.map(m => m.id);
    supabase.from('messages').update({ is_read: true }).in('id', unreadIds)
      .then(() => setMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m)));
  }, [messages.length]);

  const markRead = async (msg: Message) => {
    if (!msg.is_read) {
      await supabase.from('messages').update({ is_read: true }).eq('id', msg.id);
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_read: true } : m));
    }
    setSelected(msg);
  };

  const sendReply = async () => {
    if (!activeConv || !replyText.trim() || !profile?.id) return;
    setSending(true);

    await supabase.from('conversation_messages').insert({
      conversation_id: activeConv.id,
      sender_id: profile.id,
      sender_role: 'student',
      sender_name: profile.full_name,
      body: replyText,
    });

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', activeConv.id);

    setReplyText('');
    loadConvMessages(activeConv.id);
    loadConversations();
    setSending(false);
  };

  const unread = messages.filter(m => !m.is_read).length;
  const unreadConvs = conversations.filter(c => {
    // Simplified: any conversation with recent activity
    return true;
  }).length;

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

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('notices')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notices' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Notices ({messages.length})
        </button>
        <button
          onClick={() => setActiveTab('conversations')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'conversations' ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          Conversations ({conversations.length})
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse" />)}</div>
      ) : activeTab === 'notices' ? (
        messages.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Messages</h3>
            <p className="text-slate-500 text-sm">Messages from MIHE staff will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.is_read ? 'bg-slate-100' : 'bg-blue-700'}`}>
                      {msg.is_read ? <MailOpen className="w-4 h-4 text-slate-400" /> : <Mail className="w-4 h-4 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm truncate ${!msg.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {msg.subject || 'Notice'}
                        </p>
                        {!msg.is_read && <div className="w-2 h-2 bg-blue-700 rounded-full flex-shrink-0" />}
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

            {selected ? (
              <div className="card p-6">
                <button onClick={() => setSelected(null)} className="md:hidden flex items-center gap-2 text-sm text-blue-700 mb-4 font-medium">
                  <ArrowLeft className="w-4 h-4" /> Back to messages
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
        )
      ) : conversations.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Reply className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Conversations</h3>
          <p className="text-slate-500 text-sm">Two-way conversations with admin will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`space-y-2 ${activeConv ? 'hidden md:block' : ''}`}>
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => { setActiveConv(conv); loadConvMessages(conv.id); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  activeConv?.id === conv.id ? 'border-blue-400 bg-blue-50' : 'card border-transparent hover:border-blue-200'
                }`}
              >
                <p className="text-sm font-medium text-slate-800 truncate">{conv.subject || 'Conversation'}</p>
                <p className="text-xs text-slate-400 truncate">
                  {conv.agent_applications?.student_full_name || '—'} • {new Date(conv.last_message_at || conv.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          {activeConv ? (
            <div className="card p-4 flex flex-col" style={{ minHeight: '400px' }}>
              <button onClick={() => setActiveConv(null)} className="md:hidden flex items-center gap-2 text-sm text-blue-700 mb-3 font-medium">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h3 className="font-bold text-slate-900 mb-3 pb-3 border-b border-slate-100">{activeConv.subject || 'Conversation'}</h3>

              <div className="flex-1 overflow-y-auto space-y-3 mb-3" style={{ maxHeight: '350px' }}>
                {convMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_role === 'student' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender_role === 'student' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-800'}`}>
                      <p className="text-xs opacity-70 mb-1">{msg.sender_name || msg.sender_role}</p>
                      <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                      <p className={`text-xs mt-1 ${msg.sender_role === 'student' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !sending) sendReply(); }}
                  placeholder="Type a reply…"
                  className="input-field flex-1"
                  disabled={sending}
                />
                <Button size="sm" onClick={sendReply} loading={sending} disabled={!replyText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center hidden md:flex">
              <Reply className="w-10 h-10 text-blue-300 mb-3" />
              <p className="text-slate-500 text-sm">Select a conversation to view messages</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
