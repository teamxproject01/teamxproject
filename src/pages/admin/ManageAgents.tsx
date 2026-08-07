import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, CheckCircle, XCircle, Building2, Clock, Ban, Users, AlertCircle,
  Phone, Globe, Mail, MapPin, FileText, Download, User, Briefcase, ClipboardCheck, PenLine, Trash2,
  Pencil, Save, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const QUALIFICATION_LABELS: { key: string; label: string }[] = [
  { key: 'q_eatc_completed', label: 'Completed AEI Education Agent Training Program (EATC)' },
  { key: 'q_monitor_home_affairs', label: 'Prepared to monitor Dept of Home Affairs website' },
  { key: 'q_monitor_education', label: 'Prepared to monitor Dept of Education / AEI website' },
  { key: 'q_read_code_of_ethics', label: 'Read Australian Intl Education Agent Code of Ethics' },
  { key: 'q_read_national_code', label: 'Read National Code of Practice for Overseas Students' },
  { key: 'q_understand_visa_fulltime', label: 'Understand student visa = full-time study' },
  { key: 'q_no_residency_guarantee', label: 'No guaranteeing residency outcomes' },
  { key: 'q_no_conflicts', label: 'Free from conflicts of interest' },
  { key: 'q_comply_mihe_requirements', label: 'Agree to comply with MIHE requirements' },
];

const DOC_FIELDS: { key: string; label: string }[] = [
  { key: 'doc_application_form_path', label: 'Agent Application Form' },
  { key: 'doc_reference_check_path', label: 'Agent Reference Check' },
  { key: 'doc_company_profile_path', label: 'Company Profile' },
  { key: 'doc_registration_cert_path', label: 'Business Registration Certificate' },
  { key: 'doc_memberships_path', label: 'Memberships / MARA Certificate' },
  { key: 'doc_agent_agreement_path', label: 'Agent Agreement' },
];

interface AgentWithProfile {
  id: string;
  user_id: string;
  agency_name: string;
  contact_person: string;
  phone?: string;
  country?: string;
  city?: string;
  approval_status: string;
  admin_notes?: string;
  created_at: string;
  profiles?: { full_name: string; email: string };
  // Section 1
  company_legal_entity?: string;
  company_trading_name?: string;
  business_registration_number?: string;
  abn?: string;
  business_address?: string;
  telephone?: string;
  fax_number?: string;
  website?: string;
  company_description?: string;
  industry_memberships?: string;
  // Section 2
  q_eatc_completed?: boolean;
  q_monitor_home_affairs?: boolean;
  q_monitor_education?: boolean;
  q_read_code_of_ethics?: boolean;
  q_read_national_code?: boolean;
  q_understand_visa_fulltime?: boolean;
  q_no_residency_guarantee?: boolean;
  q_no_conflicts?: boolean;
  q_comply_mihe_requirements?: boolean;
  // Section 3
  students_recruited_annually?: number;
  target_markets?: string[];
  has_australian_rep?: boolean;
  rep_organisation?: string;
  rep_contact_person?: string;
  rep_address?: string;
  rep_phone?: string;
  rep_email?: string;
  rep_website?: string;
  // Section 4
  key_personnel?: { name_title: string; background: string }[];
  // Section 5
  referees?: { full_name: string; legal_entity: string; address: string; phone: string; email: string; website: string }[];
  // Section 6
  declaration_print_name?: string;
  declaration_date?: string;
  declaration_signature?: string;
  // Documents
  doc_application_form_path?: string;
  doc_reference_check_path?: string;
  doc_company_profile_path?: string;
  doc_registration_cert_path?: string;
  doc_memberships_path?: string;
  doc_agent_agreement_path?: string;
  // Office use
  office_staff_name?: string;
  office_signature_date?: string;
  office_authorisation?: string;
  office_date_effective?: string;
  office_position?: string;
  office_print_name?: string;
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  const display = value && value.trim() ? value : '—';
  const isDash = display === '—';
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-sm ${isDash ? 'text-slate-300' : 'text-slate-700 font-medium'}`}>{display}</p>
    </div>
  );
}

function YesNoBadge({ value }: { value?: boolean | null }) {
  if (value === null || value === undefined) return <span className="text-xs text-slate-300">—</span>;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      {value ? 'Yes' : 'No'}
    </span>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2 pt-4 pb-2 border-t border-slate-100">
      <Icon className="w-4 h-4 text-blue-700" />
      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</h4>
    </div>
  );
}

export default function ManageAgents() {
  const [agents, setAgents] = useState<AgentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<AgentWithProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const [officeForm, setOfficeForm] = useState({ staff_name: '', signature_date: '', authorisation: '', date_effective: '', position: '', print_name: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { user } = useAuth();

  const load = async () => {
    const { data: agentsData, error } = await supabase
      .from('agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !agentsData || agentsData.length === 0) {
      setAgents(agentsData ?? []);
      setLoading(false);
      return;
    }

    const userIds = agentsData.map((a) => a.user_id);
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    const profileMap = new Map((profilesData ?? []).map((p: any) => [p.id, p]));
    const merged = agentsData.map((a) => ({
      ...a,
      profiles: profileMap.get(a.user_id) ?? { full_name: '', email: '' },
    }));

    setAgents(merged as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selected) {
      setOfficeForm({
        staff_name: selected.office_staff_name ?? '',
        signature_date: selected.office_signature_date ?? '',
        authorisation: selected.office_authorisation ?? '',
        date_effective: selected.office_date_effective ?? '',
        position: selected.office_position ?? '',
        print_name: selected.office_print_name ?? '',
      });
    }
  }, [selected?.id]);

  const filtered = agents.filter(a => {
    const matchSearch = (a.agency_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.contact_person ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (a.profiles?.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.approval_status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (agent: AgentWithProfile, status: string) => {
    setUpdating(true);
    await supabase.from('agents').update({ approval_status: status, updated_at: new Date().toISOString() }).eq('id', agent.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: `agent_${status}`,
      target_table: 'agents',
      target_id: agent.id,
      metadata: { agency_name: agent.agency_name },
    });
    await supabase.from('agent_notifications').insert({
      user_id: agent.user_id,
      title: status === 'approved' ? 'Account Approved' : status === 'rejected' ? 'Account Rejected' : 'Account Suspended',
      message: status === 'approved'
        ? 'Your agent account has been approved. You can now create and submit student applications.'
        : status === 'rejected'
        ? 'Your agent account application has been rejected. Please contact support for more information.'
        : 'Your agent account has been suspended. Please contact support.',
      type: 'general',
    });
    load();
    setSelected({ ...agent, approval_status: status });
    setUpdating(false);
  };

  const saveOfficeUse = async () => {
    if (!selected) return;
    setUpdating(true);
    await supabase.from('agents').update({
      office_staff_name: officeForm.staff_name,
      office_signature_date: officeForm.signature_date || null,
      office_authorisation: officeForm.authorisation,
      office_date_effective: officeForm.date_effective || null,
      office_position: officeForm.position,
      office_print_name: officeForm.print_name,
      updated_at: new Date().toISOString(),
    }).eq('id', selected.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: 'agent_office_use_updated',
      target_table: 'agents',
      target_id: selected.id,
      metadata: { agency_name: selected.agency_name, authorisation: officeForm.authorisation },
    });
    load();
    setSelected({ ...selected, ...officeForm, office_staff_name: officeForm.staff_name, office_signature_date: officeForm.signature_date, office_authorisation: officeForm.authorisation, office_date_effective: officeForm.date_effective, office_position: officeForm.position, office_print_name: officeForm.print_name });
    setUpdating(false);
  };

  const deleteAgent = async () => {
    if (!selected) return;
    setUpdating(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ userId: selected.user_id }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete agent');
      }
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'delete_agent',
        target_table: 'auth.users',
        target_id: selected.user_id,
        metadata: { agency_name: selected.agency_name },
      });
      setConfirmDelete(false);
      setSelected(null);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete agent');
    }
    setUpdating(false);
  };

  const startEditEmail = () => {
    setEmailValue(selected?.profiles?.email || '');
    setEmailError('');
    setEditingEmail(true);
  };

  const saveEmail = async () => {
    if (!selected) return;
    const trimmed = emailValue.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailSaving(true);
    setEmailError('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-user-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ userId: selected.user_id, newEmail: trimmed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update email');
      const updated = { ...selected, profiles: { ...selected.profiles, email: trimmed } };
      setSelected(updated);
      setAgents(prev => prev.map(a => a.id === selected.id ? updated : a));
      setEditingEmail(false);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email');
    }
    setEmailSaving(false);
  };

  const downloadDoc = async (path: string | undefined, filename: string) => {
    if (!path) return;
    const { data, error } = await supabase.storage.from('agent-documents').createSignedUrl(path, 60);
    if (error) return;
    window.open(data.signedUrl, '_blank');
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-slate-100 text-slate-600',
  };

  const statCards = [
    { label: 'Total Agents', value: agents.length, icon: Users, color: 'bg-blue-700' },
    { label: 'Pending', value: agents.filter(a => a.approval_status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Approved', value: agents.filter(a => a.approval_status === 'approved').length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Rejected/Suspended', value: agents.filter(a => ['rejected', 'suspended'].includes(a.approval_status)).length, icon: Ban, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Agents</h1>
        <p className="text-slate-500 text-sm mt-1">Review, approve, and manage agent accounts</p>
      </div>

      {/* Stats */}
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by agency, contact, or email…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            Array(5).fill(0).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)
          ) : filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No agents found</p>
            </div>
          ) : (
            filtered.map((agent) => (
              <motion.div
                key={agent.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => setSelected(agent)}
                className={`card p-4 cursor-pointer transition-all ${
                  selected?.id === agent.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{agent.agency_name || 'Unnamed Agency'}</p>
                      <span className={`badge text-xs flex-shrink-0 ${statusColors[agent.approval_status]}`}>{agent.approval_status}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{agent.contact_person} • {agent.profiles?.email}</p>
                    <p className="text-xs text-slate-400">{agent.country}, {agent.city} • {new Date(agent.created_at).toLocaleDateString()}</p>
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
                <h3 className="font-bold text-slate-900">Agent Detail</h3>
                <span className={`badge ${statusColors[selected.approval_status]}`}>{selected.approval_status}</span>
              </div>

              <div className="w-14 h-14 bg-slate-700 rounded-2xl flex items-center justify-center text-white mb-4">
                <Building2 className="w-7 h-7" />
              </div>

              <div className="space-y-3 text-sm">
                {/* Basic */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Agency Name" value={selected.agency_name} />
                  <InfoRow label="Contact Person" value={selected.contact_person} />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    {editingEmail ? (
                      <div className="mt-1 space-y-1.5">
                        <div className="flex gap-1.5">
                          <input
                            type="email"
                            value={emailValue}
                            onChange={(e) => { setEmailValue(e.target.value); setEmailError(''); }}
                            className="input-field text-sm py-1.5"
                            placeholder="new.email@example.com"
                            autoFocus
                          />
                          <button onClick={saveEmail} disabled={emailSaving} className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 flex-shrink-0">
                            <Save className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingEmail(false); setEmailError(''); }} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 flex-shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {emailError && <p className="text-xs text-red-600">{emailError}</p>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm text-slate-700 font-medium">{selected.profiles?.email}</p>
                        <button onClick={startEditEmail} className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors" title="Edit email">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <InfoRow label="Phone" value={selected.phone} />
                  <InfoRow label="Location" value={[selected.city, selected.country].filter(Boolean).join(', ')} />
                  <InfoRow label="Registered" value={new Date(selected.created_at).toLocaleDateString()} />
                </div>

                {/* Section 1: Company Profile */}
                <SectionHeader icon={Building2} title="Company Profile" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Legal Entity" value={selected.company_legal_entity} />
                  <InfoRow label="Trading Name" value={selected.company_trading_name} />
                  <InfoRow label="Business Registration No." value={selected.business_registration_number} />
                  <InfoRow label="ABN" value={selected.abn} />
                  <InfoRow label="Business Address" value={selected.business_address} />
                  <InfoRow label="Telephone" value={selected.telephone} />
                  <InfoRow label="Fax" value={selected.fax_number} />
                  <InfoRow label="Website" value={selected.website} />
                </div>
                <InfoRow label="Company Description" value={selected.company_description} />
                <InfoRow label="Industry Memberships" value={selected.industry_memberships} />

                {/* Section 2: Qualifications */}
                <SectionHeader icon={ClipboardCheck} title="Qualification & Responsibilities" />
                <div className="space-y-2">
                  {QUALIFICATION_LABELS.map(q => (
                    <div key={q.key} className="flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-600 flex-1">{q.label}</p>
                      <YesNoBadge value={(selected as any)[q.key]} />
                    </div>
                  ))}
                </div>

                {/* Section 3: Recruitment */}
                <SectionHeader icon={Briefcase} title="Student Recruitment & Representative" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Students Recruited Annually" value={selected.students_recruited_annually?.toString()} />
                  <div>
                    <p className="text-xs text-slate-400">Target Markets</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(selected.target_markets ?? []).length > 0 ? selected.target_markets!.map(m => (
                        <span key={m} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">{m}</span>
                      )) : <span className="text-sm text-slate-300">—</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400">Has Representative in Australia:</p>
                  <YesNoBadge value={selected.has_australian_rep} />
                </div>
                {selected.has_australian_rep && (
                  <div className="grid sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                    <InfoRow label="Rep Organisation" value={selected.rep_organisation} />
                    <InfoRow label="Rep Contact Person" value={selected.rep_contact_person} />
                    <InfoRow label="Rep Address" value={selected.rep_address} />
                    <InfoRow label="Rep Phone" value={selected.rep_phone} />
                    <InfoRow label="Rep Email" value={selected.rep_email} />
                    <InfoRow label="Rep Website" value={selected.rep_website} />
                  </div>
                )}

                {/* Section 4: Key Personnel */}
                <SectionHeader icon={Users} title="Key Personnel" />
                {(selected.key_personnel ?? []).length > 0 ? (
                  <div className="space-y-2">
                    {selected.key_personnel!.map((p, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl">
                        <p className="text-sm font-semibold text-slate-800">{p.name_title || `Person ${i + 1}`}</p>
                        {p.background && <p className="text-xs text-slate-500 mt-1">{p.background}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-300">No key personnel listed.</p>}

                {/* Section 5: Referees */}
                <SectionHeader icon={Users} title="Referees" />
                {(selected.referees ?? []).length > 0 ? (
                  <div className="space-y-2">
                    {selected.referees!.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-1">
                        <p className="text-sm font-semibold text-slate-800">{r.full_name}</p>
                        <p className="text-xs text-slate-500">{r.legal_entity}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-400">
                          {r.address && <span>{r.address}</span>}
                          {r.phone && <span>{r.phone}</span>}
                          {r.email && <span>{r.email}</span>}
                          {r.website && <span>{r.website}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-300">No referees listed.</p>}

                {/* Section 6: Declaration */}
                <SectionHeader icon={PenLine} title="Declaration" />
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow label="Print Name" value={selected.declaration_print_name} />
                  <InfoRow label="Date" value={selected.declaration_date} />
                  <InfoRow label="Signature" value={selected.declaration_signature} />
                </div>

                {/* Documents */}
                <SectionHeader icon={FileText} title="Supporting Documents" />
                <div className="space-y-2">
                  {DOC_FIELDS.map(d => {
                    const path = (selected as any)[d.key] as string | undefined;
                    return (
                      <div key={d.key} className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-600 truncate">{d.label}</span>
                        </div>
                        {path ? (
                          <button onClick={() => downloadDoc(path, d.label)} className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 flex-shrink-0">
                            <Download className="w-3.5 h-3.5" /> View
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300 flex-shrink-0">Not uploaded</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Office Use Only */}
                <SectionHeader icon={ClipboardCheck} title="Office Use Only" />
                <div className="grid sm:grid-cols-2 gap-3 p-3 bg-amber-50 rounded-xl">
                  <div>
                    <label className="label">Staff Name / Position</label>
                    <input type="text" value={officeForm.staff_name} onChange={(e) => setOfficeForm({ ...officeForm, staff_name: e.target.value })} className="input-field" placeholder="Staff name" />
                  </div>
                  <div>
                    <label className="label">Position</label>
                    <input type="text" value={officeForm.position} onChange={(e) => setOfficeForm({ ...officeForm, position: e.target.value })} className="input-field" placeholder="Position" />
                  </div>
                  <div>
                    <label className="label">Signature Date</label>
                    <input type="date" value={officeForm.signature_date} onChange={(e) => setOfficeForm({ ...officeForm, signature_date: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Authorisation</label>
                    <select value={officeForm.authorisation} onChange={(e) => setOfficeForm({ ...officeForm, authorisation: e.target.value })} className="input-field">
                      <option value="">Select…</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Date Effective</label>
                    <input type="date" value={officeForm.date_effective} onChange={(e) => setOfficeForm({ ...officeForm, date_effective: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="label">Print Name</label>
                    <input type="text" value={officeForm.print_name} onChange={(e) => setOfficeForm({ ...officeForm, print_name: e.target.value })} className="input-field" placeholder="Print name" />
                  </div>
                </div>
                <Button size="sm" variant="secondary" className="w-full" loading={updating} onClick={saveOfficeUse}>
                  Save Office Use Section
                </Button>

                {selected.admin_notes && (
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-xs text-amber-600">Admin Notes</p>
                    <p className="text-sm text-slate-700">{selected.admin_notes}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Approval Actions</p>
                {selected.approval_status !== 'approved' && (
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700" loading={updating} onClick={() => updateStatus(selected, 'approved')}>
                    <CheckCircle className="w-4 h-4" /> Approve Agent
                  </Button>
                )}
                {selected.approval_status !== 'rejected' && (
                  <Button size="sm" variant="danger" className="w-full" loading={updating} onClick={() => updateStatus(selected, 'rejected')}>
                    <XCircle className="w-4 h-4" /> Reject Agent
                  </Button>
                )}
                {selected.approval_status !== 'suspended' && (
                  <Button size="sm" variant="secondary" className="w-full" loading={updating} onClick={() => updateStatus(selected, 'suspended')}>
                    <Ban className="w-4 h-4" /> Suspend Agent
                  </Button>
                )}

                {confirmDelete ? (
                  <div className="space-y-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        This will permanently delete the agent's account and all associated data. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" className="flex-1" loading={updating} onClick={deleteAgent}>
                        <Trash2 className="w-4 h-4" /> Confirm Delete
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="w-4 h-4" /> Delete Agent
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select an agent to view details and manage their account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
