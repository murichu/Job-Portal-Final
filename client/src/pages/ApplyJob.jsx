import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import Navbar from "../components/Navbar";
import { assets } from "../assets/assets";
import kconvert from "k-convert";
import moment from "moment";
import JobCard from "../components/JobCard";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const ApplyJob = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { jobs, backendUrl, userData, api, setShowUserLogin } = useContext(AppContext);

  const [jobData, setJobData]               = useState(null);
  const [isApplying, setIsApplying]         = useState(false);
  const [hasApplied, setHasApplied]         = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [fetchError, setFetchError]         = useState(false);

  // Scroll to top whenever the job ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [id]);

  // Fetch the job details
  useEffect(() => {
    const fetchJob = async () => {
      setJobData(null);
      setFetchError(false);
      try {
        const { data } = await api.get(`${backendUrl}/api/jobs/${id}`);
        if (data.success) {
          setJobData(data.job);
        } else {
          toast.error(data.message || "Job not found");
          setFetchError(true);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load job details");
        setFetchError(true);
      }
    };
    fetchJob();
  }, [id, api, backendUrl]);

  // Fetch user's existing applications
  useEffect(() => {
    if (!userData) return;
    const fetchApplications = async () => {
      try {
        const { data } = await api.get(`${backendUrl}/api/user/applications`);
        if (data.success) {
          setUserApplications(data.applications);
          setHasApplied(data.applications.some((app) => app.jobId._id === id));
        }
      } catch {
        // non-critical — silently ignore
      }
    };
    fetchApplications();
  }, [userData, id, api, backendUrl]);

  const handleApplyJob = async () => {
    if (!userData) {
      setShowUserLogin(true);
      return;
    }
    if (hasApplied) return;

    try {
      setIsApplying(true);
      const { data } = await api.post(`${backendUrl}/api/user/apply`, { jobId: id });
      if (data.success) {
        toast.success("Application submitted successfully!");
        setHasApplied(true);
        setUserApplications((prev) => [...prev, { jobId: { _id: id } }]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  // Jobs from the same company (excluding current)
  const relatedJobs = jobs.filter(
    (j) => j._id !== id && j.companyId?._id === jobData?.companyId?._id
  ).slice(0, 4);

  // Error state
  if (fetchError) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Job not found</h2>
          <p className="text-gray-500 text-sm mb-6">This listing may have been removed or expired.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
        <Footer />
      </>
    );
  }

  if (!jobData) return <Loading />;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col py-8 container px-4 2xl:px-20 mx-auto">

        {/* ── Job Header ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-2xl px-8 sm:px-14 py-10 sm:py-14 mb-8">
          <div className="flex flex-col md:flex-row md:justify-between gap-6">
            {/* Left: company + title */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                className="w-20 h-20 bg-white rounded-xl p-3 border border-gray-200 object-contain shadow-sm flex-shrink-0"
                src={jobData.companyId.image}
                alt={jobData.companyId.name}
                onError={(e) => { e.target.src = assets.company_icon; }}
              />
              <div className="text-center sm:text-left">
                <p className="text-sm font-medium text-blue-600 mb-1">{jobData.companyId.name}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">
                  {jobData.title}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <img src={assets.location_icon} alt="" className="w-3.5 h-3.5" />
                    {jobData.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img src={assets.person_icon} alt="" className="w-3.5 h-3.5" />
                    {jobData.level}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img src={assets.money_icon} alt="" className="w-3.5 h-3.5" />
                    {kconvert.convertTo(jobData.salary)} / yr
                  </span>
                  <span className="flex items-center gap-1.5">
                    <img src={assets.suitcase_icon} alt="" className="w-3.5 h-3.5" />
                    {jobData.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: apply CTA */}
            <div className="flex flex-col items-center md:items-end justify-center gap-2 flex-shrink-0">
              <button
                onClick={handleApplyJob}
                disabled={isApplying || hasApplied}
                className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                  hasApplied
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:bg-blue-400 disabled:cursor-not-allowed text-white"
                }`}
              >
                {isApplying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Applying...
                  </span>
                ) : hasApplied ? (
                  "Applied ✓"
                ) : userData ? (
                  "Apply Now"
                ) : (
                  "Sign In to Apply"
                )}
              </button>
              <p className="text-xs text-gray-400">
                Posted {moment(jobData.date).fromNow()}
              </p>
              {!userData && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg max-w-[200px] text-center">
                  Create a free account to apply
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Description + Sidebar ──────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Description */}
          <article className="flex-1 min-w-0">
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-card mb-6">
              <h2 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full" />
                Job Description
              </h2>
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(jobData.description) }}
              />
            </div>

            {/* Bottom apply CTA */}
            <div className="flex gap-3">
              {hasApplied ? (
                <button disabled className="bg-green-600 text-white px-6 py-2.5 rounded-xl cursor-default font-semibold text-sm">
                  Applied ✓
                </button>
              ) : (
                <button
                  onClick={handleApplyJob}
                  disabled={isApplying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-button"
                >
                  {isApplying ? "Applying..." : userData ? "Apply for this Job" : "Sign In to Apply"}
                </button>
              )}
              <button
                onClick={() => navigate("/")}
                className="text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                ← Back to Jobs
              </button>
            </div>
          </article>

          {/* Sidebar: more from company */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card sticky top-24">
              <h3 className="font-semibold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <img
                  src={jobData.companyId.image}
                  alt=""
                  className="w-5 h-5 rounded object-contain"
                  onError={(e) => { e.target.src = assets.company_icon; }}
                />
                More from {jobData.companyId.name}
              </h3>
              {relatedJobs.length > 0 ? (
                <div className="space-y-3">
                  {relatedJobs.map((job) => (
                    <JobCard
                      key={job._id}
                      job={job}
                      hasApplied={userApplications.some((a) => a.jobId._id === job._id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-3xl mb-2">🏢</div>
                  <p className="text-sm">No other open positions at {jobData.companyId.name} right now.</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ApplyJob;
