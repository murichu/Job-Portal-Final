import React, { useContext, useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import moment from "moment";
import { Loader2 } from "lucide-react";

const ViewApplications = () => {
  const { backendUrl, companyToken, api } = useContext(AppContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${backendUrl}/api/company/applications`);
      if (data.success) {
        setApplications(data.applications || []);
      } else {
        toast.error(data.message || "Failed to fetch applications");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      setUpdatingStatus(applicationId);
      const { data } = await api.post(`${backendUrl}/api/company/change-status`, { applicationId, status });
      if (data.success) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        setApplications((prev) =>
          prev.map((app) =>
            app._id === applicationId ? { ...app, status } : app
          )
        );
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const scheduleInterview = async (applicationId) => {
    const scheduledAt = window.prompt("Enter interview datetime (YYYY-MM-DDTHH:mm):");
    if (!scheduledAt) return;
    const modeInput = window.prompt("Interview mode? Type 'virtual' for Google Meet or 'physical' for onsite:", "virtual");
    const mode = modeInput === "physical" ? "physical" : "virtual";
    let location = "";
    if (mode === "physical") {
      location = window.prompt("Enter interview location (leave empty to use company location):", "") || "";
    }
    try {
      const { data } = await api.post(`${backendUrl}/api/company/schedule-interview`, {
        applicationId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        notes: "Scheduled from dashboard",
        mode,
        location,
      });
      if (data.success) {
        toast.success("Interview scheduled");
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to schedule interview");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule interview");
    }
  };

  const submitFeedback = async (applicationId) => {
    const interviewerName = window.prompt("Interviewer name:");
    if (!interviewerName) return;
    try {
      const payload = {
        applicationId,
        interviewerName,
        satisfaction: 4,
        candidateScore: 4,
        communication: 4,
        technical: 4,
        recommendation: "Yes",
        notes: "Structured feedback submitted from dashboard.",
      };
      const { data } = await api.post(`${backendUrl}/api/company/feedback`, payload);
      if (data.success) {
        toast.success("Feedback submitted");
        fetchApplications();
      } else {
        toast.error(data.message || "Failed to submit feedback");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    }
  };

  useEffect(() => {
    if (companyToken) fetchApplications();
  }, [companyToken]);

  const pending = applications.filter((a) => a.status === "Pending").length;
  const accepted = applications.filter((a) => a.status === "Accepted").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;

  const getStatusBadge = (status) => {
    switch (status) {
      case "Longlisted":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "Accepted":
      case "Shortlisted":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Loading applications...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Job Applications</h2>
        <p className="text-sm text-gray-500 mt-0.5">Review and manage candidate applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: applications.length, color: "text-gray-900", bg: "bg-gray-50 border-gray-200" },
          { label: "Pending", value: pending, color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
          { label: "Accepted", value: accepted, color: "text-green-600", bg: "bg-green-50 border-green-200" },
          { label: "Rejected", value: rejected, color: "text-red-600", bg: "bg-red-50 border-red-200" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`border rounded-xl p-4 shadow-sm ${bg}`}>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {applications.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📨</div>
            <h3 className="font-semibold text-gray-700 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-500">Applications will appear here once candidates apply.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Applicant</th>
                  <th className="px-5 py-3 text-left max-sm:hidden">Job Title</th>
                  <th className="px-5 py-3 text-left max-sm:hidden">Applied</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Resume</th>
                  <th className="px-5 py-3 text-left">Action</th>
                  <th className="px-5 py-3 text-left">Interview</th>
                  <th className="px-5 py-3 text-left">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((application, index) => (
                  <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 text-xs">{index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={application.userId?.image || assets.profile_img}
                          alt={application.userId?.name || "User"}
                          className="w-9 h-9 rounded-full object-cover border border-gray-100 max-sm:hidden"
                          onError={(e) => { e.target.src = assets.profile_img; }}
                        />
                        <div>
                          <p className="font-medium text-gray-800">
                            {application.userId?.name || "Unknown User"}
                          </p>
                          <p className="text-xs text-gray-400 max-sm:hidden">
                            {application.userId?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-sm:hidden">
                      <span className="text-gray-700 font-medium">
                        {application.jobId?.title || "N/A"}
                      </span>
                    </td>
                    <td className="px-5 py-4 max-sm:hidden text-gray-500 text-xs">
                      {moment(application.date).format("MMM D, YYYY")}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {application.userId?.resume ? (
                        <a
                          href={application.userId.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                        >
                          View PDF
                          <img src={assets.resume_download_icon} alt="Download" className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">None</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {updatingStatus === application._id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      ) : application.status === "Shortlisted" ? (
                        <span className="text-xs text-green-600 font-semibold">Final shortlist</span>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateApplicationStatus(application._id, "Longlisted")}
                            className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Longlist
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, "Shortlisted")}
                            className="text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application._id, "Rejected")}
                            className="text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => scheduleInterview(application._id)}
                          className="text-xs text-indigo-700 border border-indigo-200 bg-indigo-50 px-2 py-1 rounded"
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => submitFeedback(application._id)}
                          className="text-xs text-purple-700 border border-purple-200 bg-purple-50 px-2 py-1 rounded"
                        >
                          Feedback
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[260px]">
                      <div className="text-xs text-gray-500 space-y-1">
                        {(application.timeline || []).slice(-2).map((event, idx) => (
                          <p key={idx}>
                            {event.stage}: {event.note}
                          </p>
                        ))}
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

export default ViewApplications;
