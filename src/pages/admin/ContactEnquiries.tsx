import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, MailOpen, Search, Reply, Send, Clock, User, Phone, Trash2,
  Inbox, CheckCircle, AlertCircle, Link2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ContactEnquiry } from '../../types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ContactEnquiries() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<ContactEnquiry | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const { user, profile } = useAuth();

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('contact_enquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setEnquiries([]);
      setLoading(false);
      return;
    }
    setEnquiries(data as ContactEnquiry[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = enquiries.filter(e => {
    const matchSearch = (e.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.subject ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'unread' && !e.is_read) ||
      (statusFilter === 'replied' && e.is_replied) ||
      (statusFilter === 'pending' && e.is_read && !e.is_replied);
    return matchSearch && matchStatus;
  });

  const markRead = async (enquiry: ContactEnquiry) => {
    if (!enquiry.is_read) {
      await supabase.from('contact_enquiries').update({ is_read: true }).eq('id', enquiry.id);
      load();
    }
    setSelected(enquiry);
    setReplyText(enquiry.reply || '');
  };

  const sendReply = async () => {
    if (!selected || !replyText.trim()) return;
    setSending(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      const adminName = profile?.full_name || 'MIHE Admissions';

      // Create or reuse a conversation linked to this enquiry
      let conversationId = selected.conversation_id;
      if (!conversationId) {
        const { data: conv } = await supabase.from('conversations').insert({
          subject: `Enquiry: ${selected.subject || selected.message.slice(0, 50)}`,
          created_by: user?.id,
        }).select().single();
        conversationId = conv?.id;
      }

      if (conversationId) {
        // Insert the original enquiry as the first message (if new conversation)
        if (!selected.conversation_id) {
          await supabase.from('conversation_messages').insert({
            conversation_id: conversationId,
            sender_role: 'student',
            sender_name: selected.name,
            body: selected.message,
          });
        }
        // Insert the admin reply as a message
        await supabase.from('conversation_messages').insert({
          conversation_id: conversationId,
          sender_id: user?.id,
          sender_role: 'admin',
          sender_name: adminName,
          body: replyText,
        });
        await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
      }

      // Build the "Continue the Conversation" link
      const token = selected.enquiry_token || '';
      const continueLink = `${window.location.origin}/enquiry/${token}`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          to: selected.email,
          subject: `Re: ${selected.subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1e3a5f;">MIHE Admissions</h2>
              <p>Hi ${selected.name},</p>
              <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="color: #64748b; font-size: 13px; margin-bottom: 8px;">Your original enquiry:</p>
                <p style="color: #64748b; font-size: 13px; font-style: italic;">${selected.message}</p>
              </div>
              <div style="white-space: pre-wrap;">${replyText}</div>
              <br>
              <div style="margin: 24px 0;">
                <a href="${continueLink}" style="display: inline-block; background: #1e3a5f; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Continue the Conversation</a>
              </div>
              <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br><a href="${continueLink}" style="color: #1e3a5f;">${continueLink}</a></p>
              <br>
              <p>Best regards,<br>MIHE Admissions Team</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to send email');
      }

      await supabase.from('contact_enquiries').update({
        is_replied: true,
        reply: replyText,
        replied_at: new Date().toISOString(),
        replied_by: user?.id,
        conversation_id: conversationId,
      }).eq('id', selected.id);

      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'reply_contact_enquiry',
        target_table: 'contact_enquiries',
        target_id: selected.id,
        metadata: { enquiry_email: selected.email },
      });

      setReplyText('');
      load();
      setSelected({ ...selected, is_replied: true, reply: replyText, replied_at: new Date().toISOString(), conversation_id: conversationId });
    } catch (err: any) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const deleteEnquiry = async (enquiry: ContactEnquiry) => {
    if (!confirm(`Delete enquiry from ${enquiry.name}? This cannot be undone.`)) return;
    await supabase.from('contact_enquiries').delete().eq('id', enquiry.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'delete_contact_enquiry',
      target_table: 'contact_enquiries',
      target_id: enquiry.id,
    });
    if (selected?.id === enquiry.id) setSelected(null);
    load();
  };

  const stats = {
    total: enquiries.length,
    unread: enquiries.filter(e => !e.is_read).length,
    replied: enquiries.filter(e => e.is_replied).length,
    pending: enquiries.filter(e => e.is_read && !e.is_replied).length,
  };

  const statCards = [
    { label: 'Total Enquiries', value: stats.total, icon: Inbox, color: 'bg-blue-700' },
    { label: 'Unread', value: stats.unread, icon: Mail, color: 'bg-amber-500' },
    { label: 'Replied', value: stats.replied, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Awaiting Reply', value: stats.pending, icon: Clock, color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contact Enquiries</h1>
        <p className="text-slate-500 text-sm mt-1">All enquiries submitted through the Contact Us form</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center mb-2`}>
              <Icon className="text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="text-xl font-bold text-slate-900">{loading ? '—' : value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, or subject…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Enquiries</option>
          <option value="unread">Unread</option>
          <option value="pending">Awaiting Reply</option>
          <option value="replied">Replied</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No enquiries found</p>
            </div>
          ) : (
            filtered.map((enquiry) => (
              <motion.div
                key={enquiry.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => markRead(enquiry)}
                className={`card p-4 cursor-pointer transition-all ${selected?.id === enquiry.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${enquiry.is_read ? 'bg-slate-100' : 'bg-blue-700'}`}>
                    {enquiry.is_read ? <MailOpen className="w-5 h-5 text-slate-500" /> : <Mail className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-semibold text-sm truncate ${!enquiry.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{enquiry.name}</p>
                      <span className="text-xs text-slate-400 flex-shrink-0">{new Date(enquiry.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{enquiry.email}</p>
                    <p className="text-xs text-slate-500 truncate mt-1">{enquiry.subject || enquiry.message}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      {enquiry.is_replied ? (
                        <span className="badge text-xs bg-green-100 text-green-700"><CheckCircle className="w-3 h-3" /> Replied</span>
                      ) : !enquiry.is_read ? (
                        <span className="badge text-xs bg-blue-100 text-blue-700">New</span>
                      ) : (
                        <span className="badge text-xs bg-amber-100 text-amber-700">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="card p-6 lg:sticky lg:top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900">Enquiry Detail</h3>
                {selected.is_replied ? (
                  <span className="badge bg-green-100 text-green-700"><CheckCircle className="w-3.5 h-3.5" /> Replied</span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700">Awaiting Reply</span>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> Name</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Submitted</p>
                    <p className="text-sm text-slate-700 font-medium">{new Date(selected.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Subject</p>
                  <p className="text-sm text-slate-700 font-medium">{selected.subject || '—'}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Message</p>
                  <div className="p-3 bg-slate-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap">{selected.message}</div>
                </div>

                {selected.reply && (
                  <div>
                    <p className="text-xs text-slate-400">Your Reply</p>
                    <div className="p-3 bg-green-50 rounded-xl text-sm text-slate-700 whitespace-pre-wrap border border-green-100">{selected.reply}</div>
                    <p className="text-xs text-slate-400 mt-1">Replied on {selected.replied_at ? new Date(selected.replied_at).toLocaleString() : '—'}</p>
                  </div>
                )}
              </div>

              {/* Reply section */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 mb-2 block">Reply to {selected.name}</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply…"
                  rows={4}
                  className="input-field resize-none"
                />
                <div className="flex gap-2 mt-2">
                  <Button size="sm" className="flex-1" loading={sending} onClick={sendReply} disabled={!replyText.trim()}>
                    <Send className="w-4 h-4" /> Send Reply
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => deleteEnquiry(selected)}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select an enquiry to view details and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
