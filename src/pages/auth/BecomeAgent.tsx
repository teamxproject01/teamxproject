import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle, Building2, Phone, Globe } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

export default function BecomeAgent() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agencyName, setAgencyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPwd) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!agencyName || !contactPerson) { setError('Agency name and contact person are required.'); return; }
    if (!agreed) { setError('Please agree to the Terms and Privacy Policy.'); return; }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'agent' },
      },
    });

    if (authError) {
      setLoading(false);
      setError(
        authError.message.includes('already registered') || authError.message.includes('already been registered')
          ? 'An account with this email already exists. Try signing in.'
          : authError.message
      );
      return;
    }

    // Update profile role to agent
    if (data.user) {
      await supabase.from('profiles').update({ role: 'agent' }).eq('id', data.user.id);
      // Create agent record
      await supabase.from('agents').insert({
        user_id: data.user.id,
        agency_name: agencyName,
        contact_person: contactPerson,
        phone,
        country,
        city,
        approval_status: 'pending',
      });
    }

    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/login'), 4000);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl"
      >
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-blue flex-shrink-0">
            <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-8 h-8 object-contain" />
          </div>
          <div className="leading-[1.2]">
            <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Melbourne</span>
            <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Institute of</span>
            <span className="block text-sm font-extrabold text-blue-600 tracking-tight">Higher Education</span>
          </div>
        </Link>

        <div className="card p-5 sm:p-6 md:p-8">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                Your agent account has been created and is pending admin approval.
                You'll receive an email once approved. You can log in now to check your status.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Become an Agent</h1>
                <p className="text-slate-500 text-sm mt-1">Register your agency to manage student applications for MIHE</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Account Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field pl-10" placeholder="Jane Smith" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field pl-10" placeholder="you@agency.com" />
                      </div>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="label">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type={showPwd ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-10 pr-10" placeholder="Min. 8 characters" />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="label">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={`input-field pl-10 ${confirmPwd && confirmPwd !== password ? 'border-red-300' : ''}`} placeholder="Repeat password" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency section */}
                <div className="pt-2">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Agency Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Agency Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type="text" value={agencyName} onChange={(e) => setAgencyName(e.target.value)} className="input-field pl-10" placeholder="Global Education Partners" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Contact Person</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input required type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="input-field pl-10" placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field pl-10" placeholder="+61 400 000 000" />
                      </div>
                    </div>
                    <div>
                      <label className="label">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                        <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className="input-field pl-10" placeholder="Australia" />
                      </div>
                    </div>
                    <div>
                      <label className="label">City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-field" placeholder="Melbourne" />
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${agreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300 group-hover:border-blue-400'}`}>
                      {agreed && <CheckCircle className="w-3.5 h-3.5 text-white fill-white" />}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    I agree to MIHE's{' '}
                    <a href="#" className="text-blue-600 font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 font-medium">Privacy Policy</a>
                  </span>
                </label>

                <Button type="submit" loading={loading} className="w-full mt-2">
                  Register as Agent
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign In</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
