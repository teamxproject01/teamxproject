import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function Profile() {
  const { profile, user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', profile!.id);
    setSaving(false);
    setProfileMsg('Profile updated successfully.');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (pwdNew !== pwdConfirm) { setPwdError('New passwords do not match.'); return; }
    if (pwdNew.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwdNew });
    setSavingPwd(false);
    if (error) { setPwdError(error.message); return; }
    setPwdMsg('Password changed successfully.');
    setPwdNew(''); setPwdConfirm('');
    setTimeout(() => setPwdMsg(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your personal details and account settings</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 flex items-center gap-4 sm:gap-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-2xl sm:text-3xl font-bold">
            {profile?.full_name?.charAt(0).toUpperCase() || 'S'}
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900 truncate">{profile?.full_name || 'Student'}</h2>
          <p className="text-slate-500 text-sm break-all">{profile?.email}</p>
          <span className="badge bg-blue-100 text-blue-700 mt-2 capitalize">{profile?.role}</span>
          <p className="text-xs text-slate-400 mt-1.5 font-mono">
            ID: MIHE-{profile?.id?.slice(0, 8).toUpperCase()}
          </p>
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
        <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" /> Personal Details
        </h2>

        {profileMsg && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" /> {profileMsg}
          </div>
        )}

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 16, height: 16 }} />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 16, height: 16 }} />
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="input-field pl-10 bg-slate-50 cursor-not-allowed text-slate-400"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed. Contact admin for assistance.</p>
          </div>
          <div>
            <label className="label">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 16, height: 16 }} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field pl-10"
                placeholder="+61 4xx xxx xxx"
              />
            </div>
          </div>
          <Button type="submit" loading={saving}>
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        </form>
      </motion.div>

      {/* Password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" /> Change Password
        </h2>

        {pwdError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" /> {pwdError}
          </div>
        )}
        {pwdMsg && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl mb-4 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" /> {pwdMsg}
          </div>
        )}

        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input
              type="password"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              className="input-field"
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              className="input-field"
            />
          </div>
          <Button type="submit" loading={savingPwd} variant="secondary">
            <Lock className="w-4 h-4" /> Update Password
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
