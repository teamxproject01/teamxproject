import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import ResetPassword from './pages/auth/ResetPassword';
import ForgotPassword from './pages/auth/ForgotPassword';

// Agent portal
import AgentDashboard from './pages/agent/Dashboard';
import NewApplication from './pages/agent/NewApplication';
import MyApplications from './pages/agent/MyApplications';
import ApplicationDetail from './pages/agent/ApplicationDetail';
import AgentAnalytics from './pages/agent/Analytics';
import AgentNotifications from './pages/agent/Notifications';
import AgentProfile from './pages/agent/Profile';
import AgentCalendar from './pages/agent/Calendar';

// Student portal
import StudentDashboard from './pages/student/Dashboard';
import StudentNewApplication from './pages/student/NewApplication';
import Applications from './pages/student/Applications';
import Forms from './pages/student/Forms';
import Documents from './pages/student/Documents';
import Messages from './pages/student/Messages';
import StudentProfile from './pages/student/Profile';
import StudentCalendar from './pages/student/Calendar';

// Admin portal
import AdminDashboard from './pages/admin/Dashboard';
import AdminApplications from './pages/admin/Applications';
import ContentManagement from './pages/admin/ContentManagement';
import Reports from './pages/admin/Reports';
import AuditLog from './pages/admin/AuditLog';
import AdminSettings from './pages/admin/Settings';
import ManageAgents from './pages/admin/ManageAgents';
import ManageStudents from './pages/admin/ManageStudents';
import AgentApplications from './pages/admin/AgentApplications';
import VideoManagement from './pages/admin/VideoManagement';
import HeroBanner from './pages/admin/HeroBanner';
import DocumentLibrary from './pages/admin/DocumentLibrary';
import GSAAdmin from './pages/admin/GSA';
import ContactEnquiries from './pages/admin/ContactEnquiries';
import AcademicCalendar from './pages/admin/AcademicCalendar';

// Student Information pages
import Orientation from './pages/public/student-info/Orientation';
import CampusFacilities from './pages/public/student-info/CampusFacilities';
import StudentHandbook from './pages/public/student-info/StudentHandbook';
import ComplaintsAppeals from './pages/public/student-info/ComplaintsAppeals';
import StudentWelfare from './pages/public/student-info/StudentWelfare';
import PolicyProcedure from './pages/public/student-info/PolicyProcedure';
import StudentForms from './pages/public/student-info/Forms';
import Governance from './pages/public/governance/Governance';
import EnquiryConversation from './pages/public/EnquiryConversation';
import PaymentResult from './pages/public/PaymentResult';

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
  if (profile.suspended) return <Navigate to="/login" replace />;
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
  const { profile, loading, isAgent, agent } = useAuth();
  if (loading) return <PageLoader />;
  if (!isAgent) {
    if (profile?.role === 'student') return <Navigate to="/student/dashboard" replace />;
    if (profile && ['admin', 'super_admin', 'admissions', 'finance', 'marketing', 'support'].includes(profile.role)) return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }
  if (agent?.approval_status === 'suspended' || agent?.approval_status === 'rejected') return <Navigate to="/login" replace />;
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

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
    <ScrollToTop />
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
          <Route path="governance" element={<PageTransition><Governance /></PageTransition>} />
          <Route path="student-info/orientation" element={<PageTransition><Orientation /></PageTransition>} />
          <Route path="student-info/campus-facilities" element={<PageTransition><CampusFacilities /></PageTransition>} />
          <Route path="student-info/handbook" element={<PageTransition><StudentHandbook /></PageTransition>} />
          <Route path="student-info/complaints-appeals" element={<PageTransition><ComplaintsAppeals /></PageTransition>} />
          <Route path="student-info/welfare" element={<PageTransition><StudentWelfare /></PageTransition>} />
          <Route path="student-info/policy-procedure" element={<PageTransition><PolicyProcedure /></PageTransition>} />
          <Route path="student-info/forms" element={<PageTransition><StudentForms /></PageTransition>} />
          <Route path="enquiry/:token" element={<PageTransition><EnquiryConversation /></PageTransition>} />
          <Route path="payment/success" element={<PaymentResult success />} />
          <Route path="payment/cancelled" element={<PaymentResult success={false} />} />
        </Route>

        {/* Auth */}
        <Route path="login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="signup" element={<PageTransition><SignUp /></PageTransition>} />
        <Route path="become-agent" element={<PageTransition><BecomeAgent /></PageTransition>} />
        <Route path="reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

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
          <Route path="new-application/:id" element={<PageTransition><StudentNewApplication /></PageTransition>} />
          <Route path="applications" element={<PageTransition><Applications /></PageTransition>} />
          <Route path="applications/:id" element={<PageTransition><ApplicationDetail /></PageTransition>} />
          <Route path="forms" element={<PageTransition><Forms /></PageTransition>} />
          <Route path="documents" element={<PageTransition><Documents /></PageTransition>} />
          <Route path="messages" element={<PageTransition><Messages /></PageTransition>} />
          <Route path="profile" element={<PageTransition><StudentProfile /></PageTransition>} />
          <Route path="calendar" element={<PageTransition><StudentCalendar /></PageTransition>} />
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
          <Route path="new-application/:id" element={<PageTransition><NewApplication /></PageTransition>} />
          <Route path="applications" element={<PageTransition><MyApplications /></PageTransition>} />
          <Route path="applications/:id" element={<PageTransition><ApplicationDetail /></PageTransition>} />
          <Route path="analytics" element={<PageTransition><AgentAnalytics /></PageTransition>} />
          <Route path="notifications" element={<PageTransition><AgentNotifications /></PageTransition>} />
          <Route path="profile" element={<PageTransition><AgentProfile /></PageTransition>} />
          <Route path="calendar" element={<PageTransition><AgentCalendar /></PageTransition>} />
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
          <Route path="gsa" element={<PageTransition><GSAAdmin /></PageTransition>} />
          <Route path="students" element={<PageTransition><ManageStudents /></PageTransition>} />
          <Route path="enquiries" element={<PageTransition><ContactEnquiries /></PageTransition>} />
          <Route path="content" element={<PageTransition><ContentManagement /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="audit" element={<PageTransition><AuditLog /></PageTransition>} />
          <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
          <Route path="agents" element={<PageTransition><ManageAgents /></PageTransition>} />
          <Route path="agent-applications" element={<PageTransition><AgentApplications /></PageTransition>} />
          <Route path="video-management" element={<PageTransition><VideoManagement /></PageTransition>} />
          <Route path="hero-banner" element={<PageTransition><HeroBanner /></PageTransition>} />
          <Route path="document-library" element={<PageTransition><DocumentLibrary /></PageTransition>} />
          <Route path="calendar" element={<PageTransition><AcademicCalendar /></PageTransition>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
    </>
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
