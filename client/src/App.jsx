import React, { useContext, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppContext } from "./context/AppContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "quill/dist/quill.snow.css";

import ErrorBoundary from "./components/ErrorBoundary";
import Loading       from "./components/Loading";

import Home             from "./pages/Home";
import ApplyJob         from "./pages/ApplyJob";
import Applications     from "./pages/Applications";
import Dashboard        from "./pages/Dashboard";
import AddJob           from "./pages/AddJob";
import ManageJobs       from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import Reports          from "./pages/Reports";
import NotFound         from "./pages/NotFound";

import RecruiterLogin from "./components/RecruiterLogin";
import UserLogin      from "./components/UserLogin";

// ── Route guards ─────────────────────────────────────────────────────────────
const UserRoute = ({ children }) => {
  const { token } = useContext(AppContext);
  return token ? children : <Navigate to="/" replace />;
};

const CompanyRoute = ({ children }) => {
  const { companyToken } = useContext(AppContext);
  return companyToken ? children : <Navigate to="/" replace />;
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => {
  const { showRecruiterLogin, showUserLogin } = useContext(AppContext);

  return (
    <ErrorBoundary>
      {/* Auth modals — portal-like overlays above all content */}
      {showUserLogin     && <UserLogin />}
      {showRecruiterLogin && <RecruiterLogin />}

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/"              element={<Home />} />
          <Route path="/apply-job/:id" element={<ApplyJob />} />

          {/* User-protected */}
          <Route
            path="/applications"
            element={<UserRoute><Applications /></UserRoute>}
          />

          {/* Recruiter dashboard (company-protected) */}
          <Route
            path="/dashboard"
            element={<CompanyRoute><Dashboard /></CompanyRoute>}
          >
            <Route index                   element={<Navigate to="manage-jobs" replace />} />
            <Route path="add-job"          element={<AddJob />} />
            <Route path="manage-jobs"      element={<ManageJobs />} />
            <Route path="view-applications" element={<ViewApplications />} />
            <Route path="reports"          element={<Reports />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default App;
