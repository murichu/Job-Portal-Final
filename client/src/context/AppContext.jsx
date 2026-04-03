import { createContext, useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// ─── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  timeout: 15000,
});

const resolveAuthToken = (url) => {
  const userToken = localStorage.getItem("Token");
  const companyToken = localStorage.getItem("companyToken");

  if (url?.includes("/api/company/")) return companyToken;
  if (url?.includes("/api/user/")) return userToken;

  return userToken || companyToken;
};

// Attach auth token on every request
api.interceptors.request.use(
  (config) => {
    const alreadyHasAuthHeader =
      Boolean(config.headers?.Authorization) || Boolean(config.headers?.authorization);

    if (alreadyHasAuthHeader) {
      return config;
    }

    const token = resolveAuthToken(config.url);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally — clear tokens and redirect once
let isRedirecting = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("Token");
      localStorage.removeItem("companyToken");
      // Reset flag after navigation settles
      setTimeout(() => { isRedirecting = false; }, 3000);
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const AppContext = createContext();

const resolveBackendUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL?.trim();

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const csbMatch = host.match(/^(.*)-\d+\.csb\.app$/);

    if (csbMatch?.[1]) {
      return `https://${csbMatch[1]}-5000.csb.app`;
    }
  }

  return envUrl || "http://localhost:4000";
};

export const AppContextProvider = ({ children }) => {
  const backendUrl = resolveBackendUrl();

  // ── Search ──────────────────────────────────────────────────────────────
  const [searchFilter, setSearchFilter] = useState({ title: "", location: "" });
  const [isSearched, setIsSearched] = useState(false);

  // ── Jobs ────────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────
  const [token, setToken] = useState(null);
  const [companyToken, setCompanyToken] = useState(null);

  // ── Modals ──────────────────────────────────────────────────────────────
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [showRecruiterLogin, setShowRecruiterLogin] = useState(false);

  // ── Data ────────────────────────────────────────────────────────────────
  const [userData, setUserData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [userApplications, setUserApplications] = useState(null);

  // Track in-flight fetches to prevent duplicates
  const fetchingRef = useRef({ jobs: false, user: false, company: false });

  // ─── Jobs ──────────────────────────────────────────────────────────────
  const JOBS_CACHE_KEY = "jp_jobs_v2";
  const JOBS_CACHE_TS_KEY = "jp_jobs_ts_v2";
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const fetchJobs = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current.jobs) return;

    // Serve from cache when fresh
    if (!forceRefresh) {
      try {
        const raw = localStorage.getItem(JOBS_CACHE_KEY);
        const ts = localStorage.getItem(JOBS_CACHE_TS_KEY);
        if (raw && ts && Date.now() - parseInt(ts, 10) < CACHE_TTL) {
          setJobs(JSON.parse(raw));
          return;
        }
      } catch {
        // ignore corrupt cache
      }
    }

    fetchingRef.current.jobs = true;
    setJobsLoading(true);
    try {
      const { data } = await api.get(`${backendUrl}/api/jobs`);
      if (data.success) {
        setJobs(data.jobs);
        localStorage.setItem(JOBS_CACHE_KEY, JSON.stringify(data.jobs));
        localStorage.setItem(JOBS_CACHE_TS_KEY, Date.now().toString());
      } else {
        toast.error(data.message || "Failed to fetch jobs.");
      }
    } catch (error) {
      const isNetwork = !error.response || error.response.status >= 500;
      if (isNetwork) {
        toast.error("Network error — please check your connection.");
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch jobs.");
      }
    } finally {
      fetchingRef.current.jobs = false;
      setJobsLoading(false);
    }
  }, [backendUrl]);

  // ─── User ──────────────────────────────────────────────────────────────
  const fetchUserData = useCallback(async () => {
    if (fetchingRef.current.user) return;
    fetchingRef.current.user = true;
    try {
      const { data } = await api.get(`${backendUrl}/api/user/user`);
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message || "Failed to fetch user data.");
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("fetchUserData error:", error.message);
      }
    } finally {
      fetchingRef.current.user = false;
    }
  }, [backendUrl]);

  const fetchUserApplications = useCallback(async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/user/applications`);
      if (data.success) {
        setUserApplications(data.applications);
      }
    } catch (error) {
      console.error("fetchUserApplications error:", error.message);
    }
  }, [backendUrl]);

  // ─── Company ───────────────────────────────────────────────────────────
  const fetchCompanyData = useCallback(async () => {
    if (fetchingRef.current.company) return;
    fetchingRef.current.company = true;
    try {
      const { data } = await api.get(`${backendUrl}/api/company/company`);
      if (data.success) {
        setCompanyData(data.company);
      } else {
        toast.error(data.message || "Failed to fetch company data.");
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || "Failed to fetch company data.");
      }
    } finally {
      fetchingRef.current.company = false;
    }
  }, [backendUrl]);

  // ─── Logout ────────────────────────────────────────────────────────────
  // Log out the job-seeker user
  const logout = useCallback(() => {
    setToken(null);
    setUserData(null);
    setUserApplications(null);
    localStorage.removeItem("Token");
    localStorage.removeItem(JOBS_CACHE_KEY);
    localStorage.removeItem(JOBS_CACHE_TS_KEY);
    toast.success("Logged out successfully");
  }, []);

  // Log out the recruiter / company account
  const logoutCompany = useCallback(() => {
    setCompanyToken(null);
    setCompanyData(null);
    localStorage.removeItem("companyToken");
    toast.success("Signed out successfully");
  }, []);

  // ─── Bootstrap ────────────────────────────────────────────────────────
  useEffect(() => {
    fetchJobs();

    const storedCompanyToken = localStorage.getItem("companyToken");
    if (storedCompanyToken) setCompanyToken(storedCompanyToken);

    const storedUserToken = localStorage.getItem("Token");
    if (storedUserToken) setToken(storedUserToken);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (companyToken) fetchCompanyData();
  }, [companyToken, fetchCompanyData]);

  useEffect(() => {
    if (token) {
      fetchUserData();
      fetchUserApplications();
    }
  }, [token, fetchUserData, fetchUserApplications]);

  // ─── Context value ─────────────────────────────────────────────────────
  const value = {
    backendUrl,
    // Search
    searchFilter,
    setSearchFilter,
    isSearched,
    setIsSearched,
    // Jobs
    jobs,
    setJobs,
    jobsLoading,
    fetchJobs,
    // Auth
    token,
    setToken,
    companyToken,
    setCompanyToken,
    // Modals
    showUserLogin,
    setShowUserLogin,
    showRecruiterLogin,
    setShowRecruiterLogin,
    // Data
    userData,
    setUserData,
    fetchUserData,
    companyData,
    setCompanyData,
    userApplications,
    setUserApplications,
    fetchUserApplications,
    // Actions
    logout,
    logoutCompany,
    // Axios instance
    api,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
