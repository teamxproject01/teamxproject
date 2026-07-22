import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { t } from '../../lib/i18n';

// ── Language context ──────────────────────────────────────────────────────────

type Lang = 'en' | 'zh';
const LangContext = createContext<{ lang: Lang; toggle: () => void }>({ lang: 'en', toggle: () => {} });

export function useLang() { return useContext(LangContext); }

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('mihe_lang') as Lang) ?? 'en');
  const toggle = () => setLang(l => {
    const next = l === 'en' ? 'zh' : 'en';
    localStorage.setItem('mihe_lang', next);
    return next;
  });
  return <LangContext.Provider value={{ lang, toggle }}>{children}</LangContext.Provider>;
}

// ── Nav items ─────────────────────────────────────────────────────────────────

const navItems: { labelKey: 'nav_about' | 'nav_courses' | 'nav_admissions' | 'nav_contact'; href: string }[] = [
  { labelKey: 'nav_about',      href: '/about' },
  { labelKey: 'nav_courses',    href: '/courses' },
  { labelKey: 'nav_admissions', href: '/admissions' },
  { labelKey: 'nav_contact',    href: '/contact' },
];

// ── Navbar ────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, profile, signOut, isStaff, isStudent, isAgent } = useAuth();
  const navigate = useNavigate();
  const { lang, toggle } = useLang();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setProfileOpen(false);
  };

  const portalLink = isAgent ? '/agent/dashboard' : isStaff ? '/admin/dashboard' : '/student/dashboard';
  const scrolledCls = scrolled
    ? 'bg-white border-b border-blue-100/60'
    : 'bg-white/95 backdrop-blur-xl border-b border-slate-100';

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolledCls}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-105 transition-all duration-200 flex-shrink-0">
              <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-8 h-8 object-contain" />
            </div>
            <div className="leading-[1.2]">
              <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Melbourne</span>
              <span className="block text-sm font-extrabold text-slate-900 tracking-tight">Institute of</span>
              <span className="block text-sm font-extrabold text-blue-600 tracking-tight">Higher Education</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map(({ labelKey, href }) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `relative px-4 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {t(labelKey, lang)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-blue-600"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggle}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-transparent hover:border-blue-100"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'en' ? 'ZH' : 'EN'}</span>
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 hover:bg-blue-50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {profile?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-card-hover border border-slate-100/80 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-gradient-to-br from-blue-50 to-sky-50 border-b border-blue-100">
                        <p className="text-sm font-bold text-slate-900">{profile?.full_name}</p>
                        <p className="text-xs text-blue-600 font-medium capitalize mt-0.5">{profile?.role}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={() => { navigate(portalLink); setProfileOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-500" />
                          {t('nav_dashboard', lang)}
                        </button>
                        {isStudent && (
                          <button
                            onClick={() => { navigate('/student/profile'); setProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            {t('nav_profile', lang)}
                          </button>
                        )}
                        {isAgent && (
                          <button
                            onClick={() => { navigate('/agent/profile'); setProfileOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50 rounded-xl transition-colors font-medium"
                          >
                            <User className="w-4 h-4 text-blue-500" />
                            {t('nav_profile', lang)}
                          </button>
                        )}
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('nav_signout', lang)}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold px-4 py-2.5 rounded-xl transition-all duration-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50">
                  {t('nav_signin', lang)}
                </Link>
                <Link to="/signup" className="btn-primary text-sm px-5 py-2.5">
                  {t('nav_apply', lang)}
                </Link>
              </>
            )}
          </div>

          {/* Mobile: lang toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-200"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'en' ? 'ZH' : 'EN'}
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-xl transition-colors text-slate-700 hover:bg-blue-50"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {open ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-white/98 backdrop-blur-xl border-t border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map(({ labelKey, href }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                >
                  <NavLink
                    to={href}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`
                    }
                  >
                    {t(labelKey, lang)}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-3 border-t border-slate-100 space-y-2"
              >
                {user ? (
                  <>
                    <button
                      onClick={() => { navigate(portalLink); setOpen(false); }}
                      className="w-full btn-primary text-sm"
                    >
                      <LayoutDashboard className="w-4 h-4" /> {t('nav_dashboard', lang)}
                    </button>
                    <button onClick={() => { handleSignOut(); setOpen(false); }} className="w-full btn-secondary text-sm">
                      {t('nav_signout', lang)}
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setOpen(false)} className="flex btn-secondary text-center text-sm justify-center">
                      {t('nav_signin', lang)}
                    </Link>
                    <Link to="/signup" onClick={() => setOpen(false)} className="flex btn-primary text-center text-sm justify-center">
                      {t('nav_apply', lang)}
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
