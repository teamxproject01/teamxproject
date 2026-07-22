import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import Button from '../../components/ui/Button';

const STAFF_ROLES = ['admin', 'super_admin', 'admissions', 'finance', 'marketing', 'support', 'agent'];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setLoading(false);
      setError(
        authError.message.includes('Invalid login credentials')
          ? 'Invalid email or password. Please try again.'
          : authError.message
      );
      return;
    }

    // Fetch profile directly to know the role before navigating
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      const role = profile?.role ?? 'student';
      if (role === 'agent') {
        navigate('/agent/dashboard');
      } else if (STAFF_ROLES.includes(role)) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      navigate('/student/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-32 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-72 h-72 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo — matches navbar */}
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
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to your student or staff portal</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl mb-5">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <a href="#" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" style={{ width: 17, height: 17 }} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                Apply Now
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Protected by SSL encryption. Your information is safe.
        </p>
      </motion.div>
    </div>
  );
}
