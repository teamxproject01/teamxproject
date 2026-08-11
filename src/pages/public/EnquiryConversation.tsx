import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, MessageSquare, ArrowLeft, Mail, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

interface EnquiryData {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  conversation_id: string | null;
}

export default function EnquiryConversation() {
  const { token } = useParams<{ token: string }>();
  const [enquiry, setEnquiry] = useState<EnquiryData | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadEnquiry = useCallback(async () => {
    if (!token) return;
    const { data, error: queryError } = await supabase
      .from('contact_enquiries')
      .select('id, name, email, subject, message, conversation_id')
      .eq('enquiry_token', token)
      .maybeSingle();

    if (queryError || !data) {
      setError('Conversation not found or the link is invalid.');
      setLoading(false);
      return;
    }

    setEnquiry(data as EnquiryData);
    if ((data as EnquiryData).conversation_id) {
      await loadMessages((data as EnquiryData).conversation_id!);
    }
    setLoading(false);
  }, [token]);

  const loadMessages = useCallback(async (convId: string) => {
    const { data: msgs } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(msgs ?? []);
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => { loadEnquiry(); }, [loadEnquiry]);

  const sendReply = async () => {
    if (!enquiry?.conversation_id || !replyText.trim()) return;
    setSending(true);

    await supabase.from('conversation_messages').insert({
      conversation_id: enquiry.conversation_id,
      sender_role: 'student',
      sender_name: enquiry.name,
      body: replyText,
    });

    await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', enquiry.conversation_id);

    setReplyText('');
    await loadMessages(enquiry.conversation_id);
    setSending(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Conversation Not Found</h1>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to="/contact">
            <Button variant="secondary" className="w-full">
              <ArrowLeft className="w-4 h-4" /> Back to Contact
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to site</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">MIHE</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 flex flex-col">
        {/* Enquiry info card */}
        {enquiry && (
          <div className="card p-5 mb-4">
            <h1 className="text-lg font-bold text-slate-900 mb-1">{enquiry.subject || 'Your Enquiry'}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> {enquiry.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Conversation with MIHE Admissions
              </span>
            </div>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl">
              <p className="text-xs font-semibold text-slate-400 mb-1">Your original enquiry:</p>
              <p className="text-sm text-slate-600 whitespace-pre-wrap">{enquiry.message}</p>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="card p-4 flex flex-col flex-1" style={{ minHeight: '300px' }}>
          <h2 className="text-sm font-bold text-slate-900 mb-3 pb-3 border-b border-slate-100">Conversation Thread</h2>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4" style={{ maxHeight: '500px' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No messages yet. When MIHE replies, the conversation will appear here.</p>
              </div>
            )}
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_role === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender_role === 'student' ? 'bg-blue-700 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                  <p className="text-xs font-medium opacity-70 mb-1">{msg.sender_name || msg.sender_role}</p>
                  <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
                  <p className={`text-xs mt-1 ${msg.sender_role === 'student' ? 'text-blue-200' : 'text-slate-400'}`}>
                    {new Date(msg.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply box */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !sending) sendReply(); }}
                placeholder="Type your reply…"
                className="input-field flex-1"
                disabled={sending}
              />
              <Button size="sm" onClick={sendReply} loading={sending} disabled={!replyText.trim()}>
                <Send className="w-4 h-4" /> Send
              </Button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              Your replies go directly to the MIHE Admissions team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
