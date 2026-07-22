import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/ui/LoadingSpinner';
import Navbar, { LangProvider } from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import AgentLayout from './components/layout/AgentLayout';

// Public pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Courses from './pages/public/Courses';
import CourseDetail from './pages/public/CourseDetail';
import Admissions from './pages/public/Admissions';
import Contact from './pages/public/Contact';

// Auth pages
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import BecomeAgent from './pages/auth/BecomeAgent';

// Agent portal
import AgentDashboard from './pages/agent/Dashboard';
import NewApplication from './pages/agent/NewApplication';
import MyApplications from './pages/agent/MyApplications';
import ApplicationDetail from './pages/agent/ApplicationDetail';
import AgentAnalytics from './pages/agent/Analytics';
import AgentNotifications from './pages/agent/Notifications';
import AgentProfile from './pages/agent/Profile';

// Student portal
import StudentDashboard from './pages/student/Dashboard';
import StudentNewApplication from './pages/student/NewApplication';
import Applications from './pages/student/Applications';
import Forms from './pages/student/Forms';
import Documents from './pages/student/Documents';
import Messages from './pages/student/Messages';
import Profile from './pages/student/Profile';

// Admin portal
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import ContentManagement from './pages/admin/ContentManagement';
import Reports from './pages/admin/Reports';
import AuditLog from './pages/admin/AuditLog';
import AdminSettings from './pages/admin/Settings';
import ManageAgents from './pages/admin/ManageAgents';
import AgentApplications from './pages/admin/AgentApplications';
import DocumentReview from './pages/admin/DocumentReview';

// ── Layout wrapper for public pages ──────────────────────────────────────────

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// ── Route guards ──────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const { profile, loading, isStaff } = useAuth();
  if (loading) return <PageLoader />;
  if (isStaff) return <Navigate to="/admin/dashboard" replace />;
  if (!profile) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireStaff({ children }: { children: React.ReactNode }) {
  const { profile, loading, isStaff } = useAuth();
  if (loading) return <PageLoader />;
  if (!isStaff) {
    if (profile?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function RequireAgent({ children }: { children: React.ReactNode }) {
  const { profile, loading, isAgent } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAgent) {
    if (profile?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (profile && ['admin', 'super_admin', 'admissions', 'finance', 'marketing', 'support'].includes(profile.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// ── Page transition wrapper ───────────────────────────────────────────────────

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route index element={<PageTransition><Home /></PageTransition>} />
          <Route path="about" element={<PageTransition><About /></PageTransition>} />
          <Route path="courses" element={<PageTransition><Courses /></PageTransition>} />
          <Route path="courses/:id" element={<PageTransition><CourseDetail /></PageTransition>} />
          <Route path="admissions" element={<PageTransition><Admissions /></PageTransition>} />
          <Route path="contact" element={<PageTransition><Contact /></PageTransition>} />
        </Route>

        {/* Auth */}
        <Route path="login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="become-agent" element={<PageTransition><BecomeAgent /></PageTransition>} />

        {/* Student portal */}
        <Route
          path="student"
          element={
            <RequireAuth>
              <RequireStudent>
                <StudentLayout />
              </RequireStudent>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><StudentDashboard /></PageTransition>} />
          <Route path="new-application" element={<PageTransition><StudentNewApplication /></PageTransition>} />
          <Route path="applications" element={<PageTransition><Applications /></PageTransition>} />
          <Route path="forms" element={<PageTransition><Forms /></PageTransition>} />
          <Route path="documents" element={<PageTransition><Documents /></PageTransition>} />
          <Route path="messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
        </Route>

        {/* Agent portal */}
        <Route
          path="agent"
          element={
            <RequireAuth>
              <RequireAgent>
                <AgentLayout />
              </RequireAgent>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><AgentDashboard /></PageTransition>} />
          <Route path="new-application" element={<PageTransition><NewApplication /></PageTransition>} />
          <Route path="applications" element={<PageTransition><MyApplications /></PageTransition>} />
          <Route path="applications/:id" element={<PageTransition><ApplicationDetail /></PageTransition>} />
          <Route path="analytics" element={<PageTransition><AgentAnalytics /></PageTransition>} />
          <Route path="notifications" element={<PageTransition><AgentNotifications /></PageTransition>} />
          <Route path="profile" element={<PageTransition><AgentProfile /></PageTransition>} />
        </Route>

        {/* Admin portal */}
        <Route
          path="admin"
          element={
            <RequireAuth>
              <RequireStaff>
                <AdminLayout />
              </RequireStaff>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="applications" element={<PageTransition><AdminApplications /></PageTransition>} />
          <Route path="content" element={<PageTransition><ContentManagement /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="audit" element={<PageTransition><AuditLog /></PageTransition>} />
          <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
          <Route path="agents" element={<PageTransition><ManageAgents /></PageTransition>} />
          <Route path="agent-applications" element={<PageTransition><AgentApplications /></PageTransition>} />
          <Route path="document-review" element={<PageTransition><DocumentReview /></PageTransition>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <AppRoutes />
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
