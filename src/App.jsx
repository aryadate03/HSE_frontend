import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import WorkerLayout from './components/layout/WorkerLayout';

// Auth Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import EmailVerification from './pages/auth/EmailVerification';
import NotFound from './pages/NotFound';

// Worker Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import IncidentReportForm from './pages/worker/IncidentReportForm';
import MyReports from './pages/worker/MyReports';
import Notifications from './pages/worker/Notifications';
import Profile from './pages/worker/Profile';
import SafetyBuddy from './pages/worker/SafetyBuddy';
import Leaderboard from './pages/worker/Leaderboard';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import IncidentsPage from './pages/supervisor/IncidentsPage';
import IncidentDetailPage from './pages/supervisor/IncidentDetailPage';
import StatisticsPage from './pages/supervisor/StatisticsPage';
import TeamPage from './pages/supervisor/TeamPage';
import SupervisorProfile from './pages/supervisor/ProfilePage';
import { ToastProvider } from './context/ToastContext';
import BuddyPairsPage from './pages/supervisor/BuddyPairsPage';

// Safety Officer Pages
import SafetyOfficerDashboard from './pages/safety-officer/SafetyOfficerDashboard';
import CasesList from './pages/safety-officer/CasesList';
import InvestigationPanel from './pages/safety-officer/InvestigationPanel';
import SafetyOfficerProfile from './pages/safety-officer/ProfilePage'; //

// Management Pages
import ManagementDashboard from './pages/management/ManagementDashboard';
import AllIncidents from './pages/management/AllIncidents';
import Analytics from './pages/management/Analytics';
import Reports from './pages/management/Reports';
import Compliance from './pages/management/Compliance';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
        <Toaster position="top-right" />
        <Routes>

          {/* ── Public Routes ─────────────────────────────────────────────── */}
          <Route path="/"                       element={<LandingPage />} />
          <Route path="/login"                  element={<Login />} />
          <Route path="/register"               element={<Register />} />
          <Route path="/forgot-password"        element={<ForgotPassword />} />
          <Route path="/reset-password/:token"  element={<ResetPassword />} />
          <Route path="/verify-email/:token"    element={<EmailVerification />} />

          {/* ── Worker Routes (only worker role) ──────────────────────────── */}
          <Route path="/worker" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerLayout />
            </ProtectedRoute>
          }>
            <Route index                        element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"             element={<WorkerDashboard />} />
            <Route path="report"                element={<IncidentReportForm />} />
            <Route path="reports"               element={<MyReports />} />
            <Route path="notifications"         element={<Notifications />} />
            <Route path="profile"               element={<Profile />} />
            <Route path="buddy"                 element={<SafetyBuddy />} />
            <Route path="leaderboard"           element={<Leaderboard />} />
          </Route>

          {/* ── Safety Officer Routes (only safety_officer role) ───────────── */}
          <Route path="/safety-officer" element={
            <ProtectedRoute allowedRoles={['safety_officer']}>
              <WorkerLayout />
            </ProtectedRoute>
          }>
            <Route index                        element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"             element={<SafetyOfficerDashboard />} />
            <Route path="cases"                 element={<CasesList />} />
            <Route path="investigation/:id"     element={<InvestigationPanel />} />
             <Route path="profile"               element={<SafetyOfficerProfile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

         {/* ── Supervisor Routes (only supervisor role) ──────────────────────── */}
            <Route path="/supervisor" element={
              <ProtectedRoute allowedRoles={['supervisor']}>
                <WorkerLayout />
              </ProtectedRoute>
            }>
              <Route index                        element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"             element={<SupervisorDashboard />} />
              <Route path="incidents"             element={<IncidentsPage />} />
              <Route path="incidents/:id"         element={<IncidentDetailPage />} />
              <Route path="statistics"            element={<StatisticsPage />} />
              <Route path="team"                  element={<TeamPage />} />
              <Route path="profile"               element={<SupervisorProfile />} />
              <Route path="buddy-pairs" element={<BuddyPairsPage />} />
            </Route>

          {/* ── Management Routes (only management role) ──────────────────── */}
          <Route path="/management" element={
            <ProtectedRoute allowedRoles={['management']}>
              <WorkerLayout />
            </ProtectedRoute>
          }>
            <Route index                        element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"             element={<ManagementDashboard />} />
            <Route path="incidents"             element={<AllIncidents />} />
            <Route path="analytics"             element={<Analytics />} />
            <Route path="reports"               element={<Reports />} />
            <Route path="compliance"            element={<Compliance />} />
          </Route>

          {/* ── 404 ───────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;