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

// Lazy Loaded Pages (for performance)
const UserProfilePage = lazy(() => import("./pages/UserProfile"));
const CompanyProfilePage = lazy(() => import("./pages/CompanyProfile"));

/* ─────────────────────────────────────────────
   Route Guards
───────────────────────────────────────────── */

// Protect normal users
const ProtectedUserRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  return token ? children : <Navigate to="/" replace />;
};

// Protect company/recruiter routes
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
      {/* Global Modals (Auth) */}
      {showUserLogin && <UserLogin />}
      {showRecruiterLogin && <RecruiterLogin />}

      {/* Global Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        pauseOnHover
        theme="light"
      />

      {/* Lazy Loading Wrapper */}
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Home />} />
          <Route path="/apply-job/:id" element={<ApplyJob />} />

          {/* ── User Routes ── */}
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

          {/* ── Company / Recruiter Routes ── */}
          <Route
            path="/dashboard"
            element={
              <ProtectedCompanyRoute>
                <Dashboard />
              </ProtectedCompanyRoute>
            }
          >
            {/* Default redirect */}
            <Route index element={<Navigate to="manage-jobs" replace />} />

            {/* Nested routes */}
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

          {/* ── Fallback (404) ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
