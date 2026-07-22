import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Settings,
  BarChart2, LogOut, Menu, ChevronRight, Shield, BookOpen, Users, FolderCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: FileText, label: 'Applications', href: '/admin/applications' },
  { icon: Users, label: 'Agents', href: '/admin/agents' },
  { icon: FileText, label: 'Agent Apps', href: '/admin/agent-applications' },
  { icon: FolderCheck, label: 'Doc Review', href: '/admin/document-review' },
  { icon: BookOpen, label: 'Content', href: '/admin/content' },
  { icon: BarChart2, label: 'Reports', href: '/admin/reports' },
  { icon: Shield, label: 'Audit Log', href: '/admin/audit' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    super_admin: 'Super Admin',
    admissions: 'Admissions Officer',
    finance: 'Finance Officer',
    marketing: 'Marketing Officer',
    support: 'Support Staff',
    agent: 'Agent',
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-64 bg-slate-900 flex flex-col flex-shrink-0
          transform transition-transform duration-300
          lg:relative lg:translate-x-0 lg:h-auto lg:flex-shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-700/50">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
            <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-base font-bold text-white">MIHE Admin</span>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
        </Link>

        <div className="px-4 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{roleLabel[profile?.role ?? ''] ?? profile?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon style={{ width: 18, height: 18 }} className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity ${isActive ? 'opacity-50 text-white' : ''}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center gap-4 sticky top-0 z-10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Admin Portal — <span className="font-semibold text-slate-800">{roleLabel[profile?.role ?? ''] ?? 'Staff'}</span>
            </p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
