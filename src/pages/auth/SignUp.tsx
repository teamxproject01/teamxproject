import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = (() => {
    if (password.length === 0) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return score;
  })();

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-blue-400', 'bg-green-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPwd) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agreed) {
      setError('Please agree to the Terms and Privacy Policy.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signUp(email, password, fullName);
    setLoading(false);

    if (authError) {
      setError(
        authError.message.includes('already registered') || authError.message.includes('already been registered')
          ? 'An account with this email already exists. Try signing in.'
          : authError.message
      );
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/student/dashboard'), 2000);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
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

        <div className="card p-6 sm:p-8">
          {done ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Account Created!</h2>
              <p className="text-slate-500 text-sm">Taking you to your student portal…</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Create Your Account</h1>
                <p className="text-slate-500 text-sm mt-1">Join MIHE — your higher education journey starts here</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                    <input
                      required
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Jane Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                    <input
                      required
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Min. 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              n <= passwordStrength ? strengthColors[passwordStrength] : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {strengthLabels[passwordStrength]} password
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                    <input
                      required
                      type="password"
                      value={confirmPwd}
                      onChange={(e) => setConfirmPwd(e.target.value)}
                      className={`input-field pl-10 ${confirmPwd && confirmPwd !== password ? 'border-red-300 focus:ring-red-300' : ''}`}
                      placeholder="Repeat password"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex-shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="sr-only"
                    />
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
                  Create Account
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
