import React, { useContext, useEffect, useState, useCallback } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

const statusClasses = {
  active: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
  draft: "bg-yellow-100 text-yellow-700",
};

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const { backendUrl, companyToken, api } = useContext(AppContext);

  const fetchCompanyJobs = useCallback(async () => {
    if (!backendUrl || !companyToken) return;
    setLoading(true);
    try {
      const { data } = await api.get(`${backendUrl}/api/company/list-jobs`);
      if (data.success && Array.isArray(data.jobsData)) {
        setJobs([...data.jobsData].reverse());
      } else {
        setJobs([]);
        toast.error(data.message || "Failed to load jobs");
      }
    } catch (error) {
      setJobs([]);
      toast.error(error.response?.data?.message || "Error fetching jobs");
    } finally {
      setLoading(false);
    }
  }, [backendUrl, companyToken]);

  const changeJobVisibility = async (jobId) => {
    if (updatingId) return;
    setUpdatingId(jobId);
    try {
      const { data } = await api.post(`${backendUrl}/api/company/change-visibility`, { id: jobId });
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      } else {
        toast.error(data.message || "Failed to change visibility");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const repostJob = async (jobId) => {
    if (updatingId) return;
    setUpdatingId(jobId);
    try {
      const { data } = await api.post(`${backendUrl}/api/company/repost-job`, { id: jobId });
      if (data.success) {
        toast.success(data.message || "Job reposted successfully");
        fetchCompanyJobs();
      } else {
        toast.error(data.message || "Failed to repost job");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to repost job");
    } finally {
      setUpdatingId(null);
    }
  };

  const moderateJob = async (jobId, decision) => {
    if (updatingId) return;
    setUpdatingId(jobId);
    try {
      const { data } = await api.post(`${backendUrl}/api/company/moderate-job`, {
        id: jobId,
        decision,
      });
      if (data.success) {
        toast.success(data.message);
        fetchCompanyJobs();
      } else {
        toast.error(data.message || "Failed to update approval");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update approval");
    } finally {
      setUpdatingId(null);
    }
  };

  const softDeleteJob = async (jobId) => {
    if (updatingId) return;
    setUpdatingId(jobId);
    try {
      const { data } = await api.post(`${backendUrl}/api/company/delete-job`, { id: jobId });
      if (data.success) {
        toast.success(data.message || "Job deleted successfully");
        setJobs((prev) => prev.filter((job) => job._id !== jobId));
      } else {
        toast.error(data.message || "Failed to delete job");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete job");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (companyToken) fetchCompanyJobs();
  }, [companyToken, fetchCompanyJobs]);

  const activeCount = jobs.filter((j) => j.jobStatus === "active").length;
  const pendingCount = jobs.filter((j) => j.approvalStatus === "pending").length;
  const draftCount = jobs.filter((j) => j.approvalStatus === "draft").length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs.length} total &bull; {activeCount} active &bull; {pendingCount} pending &bull; {draftCount} drafts
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/add-job")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <span className="text-lg leading-none">+</span>
          Post New Job
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Loading your jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="font-semibold text-gray-700 mb-1">No jobs posted yet</h3>
            <p className="text-sm text-gray-500 mb-4">Create your first job listing to start receiving applications.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Deadline</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Approval</th>
                  <th className="px-4 py-3 text-center">Applicants</th>
                  <th className="px-4 py-3 text-center">Visible</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{job.location} • {moment(job.date).format("MMM D, YYYY")}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{moment(job.deadline).format("MMM D, YYYY")}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusClasses[job.jobStatus] || statusClasses.draft}`}>
                        {job.jobStatus || "draft"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {job.approvalStatus === "pending" ? (
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => moderateJob(job._id, "approved")} className="text-xs px-2 py-1 rounded border border-green-200 text-green-700">Approve</button>
                          <button onClick={() => moderateJob(job._id, "rejected")} className="text-xs px-2 py-1 rounded border border-red-200 text-red-700">Reject</button>
                        </div>
                      ) : (
                        <span className={`text-xs px-2 py-1 rounded-full ${job.approvalStatus === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {job.approvalStatus}
                        </span>
                      )}
                      {job.approvalStatus === "pending" && (
                        <p className="mt-1 text-[11px] text-amber-600">Awaiting review</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-gray-700">{job.applicants || 0}</td>
                    <td className="px-4 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={job.visible || false}
                          onChange={() => changeJobVisibility(job._id)}
                          disabled={job.approvalStatus !== "approved" || updatingId === job._id}
                        />
                        <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
                      </label>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={!job.canRepost || updatingId === job._id}
                          onClick={() => repostJob(job._id)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-blue-200 text-blue-700 disabled:opacity-40"
                        >
                          Repost
                        </button>
                        {(job.approvalStatus === "draft" || job.approvalStatus === "rejected") && (
                          <button
                            disabled={updatingId === job._id}
                            onClick={async () => {
                              setUpdatingId(job._id);
                              try {
                                const { data } = await api.post(`${backendUrl}/api/company/submit-for-approval`, { id: job._id });
                                if (data.success) {
                                  toast.success(data.message);
                                  fetchCompanyJobs();
                                } else {
                                  toast.error(data.message || "Failed to submit for approval");
                                }
                              } catch (error) {
                                toast.error(error.response?.data?.message || "Failed to submit for approval");
                              } finally {
                                setUpdatingId(null);
                              }
                            }}
                            className="text-xs px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 disabled:opacity-40"
                          >
                            Submit
                          </button>
                        )}
                        <button
                          disabled={updatingId === job._id}
                          onClick={() => softDeleteJob(job._id)}
                          className="text-xs px-2.5 py-1 rounded-lg border border-red-200 text-red-700 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageJobs;
