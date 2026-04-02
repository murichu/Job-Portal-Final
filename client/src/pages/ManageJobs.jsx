import React, { useContext, useEffect, useState, useCallback } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

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
        setJobs((prev) =>
          prev.map((job) =>
            job._id === jobId ? { ...job, visible: !job.visible } : job
          )
        );
      } else {
        toast.error(data.message || "Failed to change visibility");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (companyToken) fetchCompanyJobs();
  }, [companyToken, fetchCompanyJobs]);

  const activeCount = jobs.filter((j) => j.visible).length;
  const totalApplicants = jobs.reduce((sum, j) => sum + (j.applicants || 0), 0);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {jobs.length} total &bull; {activeCount} active
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Active Listings</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-500 mb-1">Total Applicants</p>
          <p className="text-2xl font-bold text-blue-600">{totalApplicants}</p>
        </div>
      </div>

      {/* Table */}
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
            <button
              onClick={() => navigate("/dashboard/add-job")}
              className="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Post a Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left max-sm:hidden">#</th>
                  <th className="px-5 py-3 text-left">Job Title</th>
                  <th className="px-5 py-3 text-left max-sm:hidden">Date</th>
                  <th className="px-5 py-3 text-left max-sm:hidden">Location</th>
                  <th className="px-5 py-3 text-center">Applicants</th>
                  <th className="px-5 py-3 text-center">Visible</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job, index) => (
                  <tr key={job._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 max-sm:hidden text-gray-400 text-xs">{index + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{job.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 sm:hidden">
                        {moment(job.date).format("MMM D, YYYY")}
                      </p>
                    </td>
                    <td className="px-5 py-4 max-sm:hidden text-gray-500 text-sm">
                      {moment(job.date).format("MMM D, YYYY")}
                    </td>
                    <td className="px-5 py-4 max-sm:hidden">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {job.location}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="font-bold text-gray-700">{job.applicants || 0}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {updatingId === job._id ? (
                        <div className="flex justify-center">
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        </div>
                      ) : (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={job.visible || false}
                            onChange={() => changeJobVisibility(job._id)}
                          />
                          <div className="w-10 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      )}
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
