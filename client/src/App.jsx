import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./context/AppContext";

// UI / Utilities
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "quill/dist/quill.snow.css";

// Core Components
import ErrorBoundary from "./components/ErrorBoundary";
import Loading from "./components/Loading";

// Public Pages
import Home from "./pages/Home";
import ApplyJob from "./pages/ApplyJob";
import NotFound from "./pages/NotFound";

// User Pages
import Applications from "./pages/Applications";

// Company Pages
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import Reports from "./pages/Reports";

// Auth Components
import RecruiterLogin from "./components/RecruiterLogin";
import UserLogin from "./components/UserLogin";

// Lazy-loaded pages
const UserProfilePage = lazy(() => import("./pages/UserProfile"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfile"));
const BillingDashboard = lazy(() => import("./pages/BillingDashboard"));
const IncidentDashboard = lazy(() => import("./pages/IncidentDashboard"));
const FinancialAdminPanel = lazy(() => import("./pages/FinancialAdminPanel"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const TeamManagementDashboard = lazy(() => import("./pages/TeamManagementDashboard"));
const AdminFinanceDashboard = lazy(() => import("./pages/AdminFinanceDashboard"));
const PublicStatus = lazy(() => import("./pages/PublicStatus"));
const Reconciliation = lazy(() => import("./pages/Reconciliation"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const LogDashboard = lazy(() => import("./pages/LogDashboard"));
const AdvancedAdminDashboard = lazy(() => import("./pages/AdvancedAdminDashboard"));
const FraudDashboard = lazy(() => import("./pages/FraudDashboard"));
const EmailAnalyticsDashboard = lazy(() => import("./pages/EmailAnalyticsDashboard"));
const PaymentTimelinePage = lazy(() => import("./pages/PaymentTimeline"));
const RefundPage = lazy(() => import("./pages/RefundPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const StripeStyleBilling = lazy(() => import("./pages/StripeStyleBilling"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));
const CompanyDashboard = lazy(() => import("./pages/CompanyDashboard"));
const AuditLogsViewer = lazy(() => import("./pages/AuditLogsViewer"));

/* ─────────────────────────────────────────────
   Route Guards
───────────────────────────────────────────── */

const ProtectedUserRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  return token ? children : <Navigate to="/" replace />;
};

const ProtectedCompanyRoute = ({ children }) => {
  const { companyToken } = useContext(AppContext);
  return companyToken ? children : <Navigate to="/" replace />;
};

/* ─────────────────────────────────────────────
   App Component
───────────────────────────────────────────── */

const App = () => {
  const { showRecruiterLogin, showUserLogin } = useContext(AppContext);

  return (
    <ErrorBoundary>
      {/* Auth Modals */}
      {showUserLogin && <UserLogin />}
      {showRecruiterLogin && <RecruiterLogin />}

      {/* Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="light"
      />

      {/* Routes */}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/apply-job/:id" element={<ApplyJob />} />

          {/* User Protected */}
          <Route
            path="/applications"
            element={
              <ProtectedUserRoute>
                <Applications />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedUserRoute>
                <UserProfilePage />
              </ProtectedUserRoute>
            }
          />

          {/* Company Protected */}
          <Route
            path="/dashboard"
            element={
              <ProtectedCompanyRoute>
                <Dashboard />
              </ProtectedCompanyRoute>
            }
          >
            <Route index element={<Navigate to="manage-jobs" replace />} />
            <Route path="add-job" element={<AddJob />} />
            <Route path="manage-jobs" element={<ManageJobs />} />
            <Route path="view-applications" element={<ViewApplications />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route
            path="/company-profile"
            element={
              <ProtectedCompanyRoute>
                <CompanyProfilePage />
              </ProtectedCompanyRoute>
            }
          />
          <Route path="/status" element={<PublicStatus />} />
          <Route path="/onboarding" element={<ProtectedCompanyRoute><Onboarding /></ProtectedCompanyRoute>} />
          <Route path="/team" element={<ProtectedCompanyRoute><TeamManagementDashboard /></ProtectedCompanyRoute>} />
          <Route path="/billing" element={<ProtectedCompanyRoute><BillingDashboard /></ProtectedCompanyRoute>} />
          <Route path="/billing/subscription" element={<ProtectedCompanyRoute><SubscriptionPage /></ProtectedCompanyRoute>} />
          <Route path="/billing/history" element={<ProtectedCompanyRoute><PaymentHistory /></ProtectedCompanyRoute>} />
          <Route path="/billing/timeline" element={<ProtectedCompanyRoute><PaymentTimelinePage /></ProtectedCompanyRoute>} />
          <Route path="/billing/stripe" element={<ProtectedCompanyRoute><StripeStyleBilling /></ProtectedCompanyRoute>} />
          <Route path="/billing/refund" element={<ProtectedCompanyRoute><RefundPage /></ProtectedCompanyRoute>} />
          <Route path="/incidents" element={<ProtectedCompanyRoute><IncidentDashboard /></ProtectedCompanyRoute>} />
          <Route path="/logs" element={<ProtectedCompanyRoute><LogDashboard /></ProtectedCompanyRoute>} />
          <Route path="/analytics" element={<ProtectedCompanyRoute><AnalyticsDashboard /></ProtectedCompanyRoute>} />
          <Route path="/company-admin" element={<ProtectedCompanyRoute><CompanyDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin" element={<ProtectedCompanyRoute><AdminDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin/finance" element={<ProtectedCompanyRoute><AdminFinanceDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin/finance/panel" element={<ProtectedCompanyRoute><FinancialAdminPanel /></ProtectedCompanyRoute>} />
          <Route path="/admin/advanced" element={<ProtectedCompanyRoute><AdvancedAdminDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin/fraud" element={<ProtectedCompanyRoute><FraudDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin/email-analytics" element={<ProtectedCompanyRoute><EmailAnalyticsDashboard /></ProtectedCompanyRoute>} />
          <Route path="/admin/reconciliation" element={<ProtectedCompanyRoute><Reconciliation /></ProtectedCompanyRoute>} />
          <Route path="/admin/audit-logs" element={<ProtectedCompanyRoute><AuditLogsViewer /></ProtectedCompanyRoute>} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
