import React, { useContext, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const menuItems = [
  { label: "Add Job",      icon: assets.add_icon,         path: "/dashboard/add-job" },
  { label: "Manage Jobs",  icon: assets.home_icon,        path: "/dashboard/manage-jobs" },
  { label: "Applications", icon: assets.person_tick_icon, path: "/dashboard/view-applications" },
  { label: "Reports",      icon: assets.resume_download_icon, path: "/dashboard/reports" },
  { label: "Company Profile", icon: assets.person_icon, path: "/dashboard/company-profile" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companyData, logoutCompany } = useContext(AppContext);

  const handleLogout = () => {
    logoutCompany();
    navigate("/");
  };

  // Only redirect when sitting exactly at /dashboard
  useEffect(() => {
    if (companyData && location.pathname === "/dashboard") {
      navigate("/dashboard/manage-jobs", { replace: true });
    }
  }, [companyData, location.pathname, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Nav ─────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="px-5 flex justify-between items-center h-16">
          <img
            onClick={() => navigate("/")}
            className="max-sm:w-28 cursor-pointer hover:opacity-80 transition-opacity h-8"
            src={assets.logo}
            alt="JobBoard Logo"
          />

          {companyData && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 max-sm:hidden">
                <span className="text-gray-400">Welcome, </span>
                <span className="font-semibold text-gray-800">{companyData.name}</span>
              </span>
              <div className="relative group">
                <button
                  className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full pl-1 pr-3 py-1 transition-colors"
                  aria-label="Account menu"
                >
                  <img
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    src={companyData.image || assets.company_icon}
                    alt={companyData.name}
                    onError={(e) => { e.target.src = assets.company_icon; }}
                  />
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute hidden group-hover:block right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 min-w-[160px] z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{companyData.name}</p>
                  </div>
                  <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    View Job Board
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        {companyData && (
          <aside className="relative w-56 max-sm:w-16 min-h-[calc(100vh-64px)] bg-white border-r border-gray-200 sticky top-16 self-start flex-shrink-0">
            <nav className="py-4" aria-label="Dashboard navigation">
              <ul className="space-y-1 px-2">
                {menuItems.map(({ label, icon, path }) => (
                  <NavLink
                    key={path}
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`
                    }
                  >
                    <img
                      className="w-5 h-5 flex-shrink-0"
                      src={icon}
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="max-sm:hidden">{label}</span>
                  </NavLink>
                ))}
              </ul>
            </nav>

            {/* Sign-out shortcut at bottom of sidebar */}
            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100 bg-white">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="max-sm:hidden">Sign Out</span>
              </button>
            </div>
          </aside>
        )}

        {/* ── Main Content ─────────────────────────────────────────── */}
        <main className="flex-1 p-6 max-sm:p-4 min-h-[calc(100vh-64px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
