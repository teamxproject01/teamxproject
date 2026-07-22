import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, FileText, FolderOpen,
  MessageSquare, User, LogOut, Menu, X, ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
  { icon: FileText, label: 'Applications', href: '/student/applications' },
  { icon: FileText, label: 'My Forms', href: '/student/forms' },
  { icon: FolderOpen, label: 'Documents', href: '/student/documents' },
  { icon: MessageSquare, label: 'Messages', href: '/student/messages' },
  { icon: User, label: 'Profile', href: '/student/profile' },
];

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-slate-900/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-30 w-64 bg-white border-r border-slate-100 shadow-card flex flex-col flex-shrink-0
          transform transition-transform duration-300
          lg:relative lg:translate-x-0 lg:h-auto lg:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center">
            <img src="/Gemini_Generated_Image_wn7wp2wn7wp2wn7w-removebg-preview copy.png" alt="MIHE logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <span className="text-base font-bold text-slate-900">MIHE</span>
            <p className="text-xs text-slate-400">Student Portal</p>
          </div>
        </Link>

        {/* Profile */}
        <div className="px-4 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || 'S'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{profile?.full_name || 'Student'}</p>
              <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, href }) => (
            <NavLink
              key={href}
              to={href}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} style={{ width: 18, height: 18 }} />
                  <span className="flex-1">{label}</span>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-60 text-white' : 'text-slate-400'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 h-14 flex items-center gap-4 sticky top-0 z-10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center justify-between">
            <div className="hidden sm:block text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-800">{profile?.full_name || 'Student'}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
