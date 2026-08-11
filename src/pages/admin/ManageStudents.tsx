import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Users, Ban, Trash2, CheckCircle, User, Mail, Phone, Calendar,
  AlertCircle, ShieldCheck, XCircle, FileText, Pencil, Save, X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  suspended: boolean;
  created_at: string;
  app_count?: number;
}

export default function ManageStudents() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<StudentProfile | null>(null);
  const [updating, setUpdating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailError, setEmailError] = useState('');
  const { user } = useAuth();

  const load = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, suspended, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error || !data) {
      setStudents([]);
      setLoading(false);
      return;
    }

    const studentIds = data.map(s => s.id);
    const { data: appsData } = await supabase
      .from('agent_applications')
      .select('student_id')
      .in('student_id', studentIds);

    const appCounts: Record<string, number> = {};
    (appsData ?? []).forEach(a => {
      if (a.student_id) appCounts[a.student_id] = (appCounts[a.student_id] ?? 0) + 1;
    });

    setStudents(data.map(s => ({ ...s, app_count: appCounts[s.id] ?? 0 })) as StudentProfile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s => {
    const matchSearch = (s.full_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && !s.suspended) ||
      (statusFilter === 'suspended' && s.suspended);
    return matchSearch && matchStatus;
  });

  const toggleSuspend = async (student: StudentProfile) => {
    setUpdating(true);
    const newSuspended = !student.suspended;
    await supabase.from('profiles').update({ suspended: newSuspended }).eq('id', student.id);
    await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action: newSuspended ? 'suspend_student' : 'unsuspend_student',
      target_table: 'profiles',
      target_id: student.id,
      metadata: { student_name: student.full_name },
    });
    load();
    setSelected({ ...student, suspended: newSuspended });
    setUpdating(false);
  };

  const deleteStudent = async () => {
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
        body: JSON.stringify({ userId: selected.id }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete user');
      }
      await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: 'delete_student',
        target_table: 'auth.users',
        target_id: selected.id,
        metadata: { student_name: selected.full_name },
      });
      setConfirmDelete(false);
      setSelected(null);
      load();
    } catch (err: any) {
      alert(err.message || 'Failed to delete student');
    }
    setUpdating(false);
  };

  const handleResetPassword = async (student: StudentProfile) => {
    if (!confirm(`Reset password for ${student.full_name} (${student.email})? A new temporary password will be generated and they will be required to set a new password on next login.`)) return;
    setResetting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-student-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ action: 'resetPassword', studentId: student.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to reset password');
      alert(`Password reset successfully!\n\nEmail: ${result.email}\nNew Temporary Password: ${result.tempPassword}\n\nThe student will be required to set a new password on next login. Please share these credentials with the student securely.`);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
    setResetting(false);
  };

  const startEditEmail = () => {
    setEmailValue(selected?.email || '');
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
        body: JSON.stringify({ userId: selected.id, newEmail: trimmed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update email');
      const updated = { ...selected, email: trimmed };
      setSelected(updated);
      setStudents(prev => prev.map(s => s.id === selected.id ? updated : s));
      setEditingEmail(false);
    } catch (err: any) {
      setEmailError(err.message || 'Failed to update email');
    }
    setEmailSaving(false);
  };

  const statCards = [
    { label: 'Total Students', value: students.length, icon: Users, color: 'bg-blue-700' },
    { label: 'Active', value: students.filter(s => !s.suspended).length, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Suspended', value: students.filter(s => s.suspended).length, icon: Ban, color: 'bg-amber-500' },
    { label: 'With Applications', value: students.filter(s => (s.app_count ?? 0) > 0).length, icon: FileText, color: 'bg-sky-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Students</h1>
        <p className="text-slate-500 text-sm mt-1">View, suspend, and delete student accounts</p>
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
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email…" className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field cursor-pointer min-w-40">
          <option value="all">All Students</option>
          <option value="active">Active</option>
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
              <p className="text-slate-500">No students found</p>
            </div>
          ) : (
            filtered.map((student) => (
              <motion.div
                key={student.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                onClick={() => { setSelected(student); setConfirmDelete(false); }}
                className={`card p-4 cursor-pointer transition-all ${selected?.id === student.id ? 'ring-2 ring-blue-400 bg-blue-50/30' : 'hover:shadow-card-hover'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${student.suspended ? 'bg-amber-500' : 'bg-blue-700'}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800 text-sm truncate">{student.full_name || 'Unnamed'}</p>
                      {student.suspended && <span className="badge text-xs bg-amber-100 text-amber-700 flex-shrink-0">Suspended</span>}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    <p className="text-xs text-slate-400">{student.app_count ?? 0} application(s) • Joined {new Date(student.created_at).toLocaleDateString()}</p>
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
                <h3 className="font-bold text-slate-900">Student Detail</h3>
                {selected.suspended ? (
                  <span className="badge bg-amber-100 text-amber-700">Suspended</span>
                ) : (
                  <span className="badge bg-green-100 text-green-700">Active</span>
                )}
              </div>

              <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center text-white mb-4">
                <User className="w-7 h-7" />
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Full Name</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.full_name || '—'}</p>
                  </div>
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
                        <p className="text-sm text-slate-700 font-medium">{selected.email}</p>
                        <button onClick={startEditEmail} className="p-1 rounded text-slate-400 hover:text-blue-700 hover:bg-blue-50 transition-colors" title="Edit email">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Joined</p>
                    <p className="text-sm text-slate-700 font-medium">{new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Applications</p>
                    <p className="text-sm text-slate-700 font-medium">{selected.app_count ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Account Status</p>
                    <p className={`text-sm font-medium ${selected.suspended ? 'text-amber-600' : 'text-green-600'}`}>
                      {selected.suspended ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-slate-100 mt-4">
                <p className="text-xs font-semibold text-slate-500 mb-2">Account Actions</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={updating}
                  onClick={() => toggleSuspend(selected)}
                >
                  {selected.suspended ? (
                    <><CheckCircle className="w-4 h-4" /> Unsuspend Account</>
                  ) : (
                    <><Ban className="w-4 h-4" /> Suspend Account</>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  className="w-full"
                  loading={resetting}
                  onClick={() => handleResetPassword(selected)}
                >
                  <><ShieldCheck className="w-4 h-4" /> Reset Password</>
                </Button>

                {confirmDelete ? (
                  <div className="space-y-2 p-3 bg-red-50 rounded-xl border border-red-100">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">
                        This will permanently delete the student's account and all associated data. This cannot be undone.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" className="flex-1" loading={updating} onClick={deleteStudent}>
                        <Trash2 className="w-4 h-4" /> Confirm Delete
                      </Button>
                      <Button size="sm" variant="secondary" className="flex-1" onClick={() => setConfirmDelete(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Select a student to view details and manage their account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
