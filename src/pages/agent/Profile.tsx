import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, User, Phone, Globe, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function AgentProfile() {
  const { profile, agent } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
    setAgencyName(agent?.agency_name ?? '');
    setContactPerson(agent?.contact_person ?? '');
    setCountry(agent?.country ?? '');
    setCity(agent?.city ?? '');
  }, [profile, agent]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingProfile(true);
    setProfileMsg(null);

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', profile.id);

    if (profileError) {
      setProfileMsg({ type: 'error', text: profileError.message });
      setSavingProfile(false);
      return;
    }

    if (agent) {
      const { error: agentError } = await supabase
        .from('agents')
        .update({ agency_name: agencyName, contact_person: contactPerson, country, city, phone, updated_at: new Date().toISOString() })
        .eq('id', agent.id);

      if (agentError) {
        setProfileMsg({ type: 'error', text: agentError.message });
        setSavingProfile(false);
        return;
      }
    }

    setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    setSavingProfile(false);
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword.length < 8) { setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' }); return; }
    if (newPassword !== confirmPassword) { setPasswordMsg({ type: 'error', text: 'Passwords do not match.' }); return; }

    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setPasswordMsg({ type: 'error', text: error.message });
    } else {
      setPasswordMsg({ type: 'success', text: 'Password updated successfully.' });
      setNewPassword('');
      setConfirmPassword('');
    }
    setSavingPassword(false);
    setTimeout(() => setPasswordMsg(null), 3000);
  };

  const approvalBadge = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    suspended: 'bg-slate-100 text-slate-600',
  };

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your agent profile and account security</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 sm:gap-6 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-bold flex-shrink-0">
            {(agencyName || profile?.full_name || 'A').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 text-lg break-words">{agencyName || profile?.full_name || 'Agent'}</p>
            <p className="text-sm text-slate-500 break-all">{profile?.email}</p>
            <span className={`badge mt-1 ${approvalBadge[agent?.approval_status ?? 'pending']}`}>
              {agent?.approval_status ?? 'pending'} agent
            </span>
          </div>
        </div>

        {profileMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
            profileMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {profileMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Personal Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Email (read-only)</label>
              <input type="email" value={profile?.email ?? ''} disabled className="input-field bg-slate-50 text-slate-400" />
            </div>
            <div>
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
          </div>

          <h3 className="font-bold text-slate-900 text-sm pt-2">Agency Details</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Agency Name</label>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Contact Person</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label">Country</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field pl-10" />
              </div>
            </div>
            <div>
              <label className="label">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" />
            </div>
          </div>

          <Button type="submit" loading={savingProfile} className="mt-2">Save Changes</Button>
        </form>
      </div>

      {/* Password card */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-blue-600" /> Change Password
        </h3>

        {passwordMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
            passwordMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {passwordMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {passwordMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field pl-10" placeholder="Min. 8 characters" />
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`input-field pl-10 ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300' : ''}`} placeholder="Repeat password" />
              </div>
            </div>
          </div>
          <Button type="submit" variant="secondary" loading={savingPassword}>Update Password</Button>
        </form>
      </div>
    </motion.div>
  );
}
