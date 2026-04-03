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

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
