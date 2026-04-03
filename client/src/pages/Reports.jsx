import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { Loader2, Download, FileSpreadsheet, Printer } from "lucide-react";

const Reports = () => {
  const { backendUrl, api } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stagesInput, setStagesInput] = useState("");
  const [companyCompleteness, setCompanyCompleteness] = useState(null);
  const [richProfile, setRichProfile] = useState({
    website: "",
    about: "",
    culture: "",
    benefits: "",
    teamHighlights: "",
  });

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${backendUrl}/api/company/reports/summary`);
      if (data.success) setReport(data);
      if (data.success) {
        const c = data.company || {};
        setRichProfile({
          website: c.website || "",
          about: c.about || "",
          culture: c.culture || "",
          benefits: Array.isArray(c.benefits) ? c.benefits.join(", ") : "",
          teamHighlights: Array.isArray(c.teamHighlights) ? c.teamHighlights.join(", ") : "",
        });
      }
      else toast.error(data.message || "Failed to load report");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalytics = async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/company/analytics/interviews`);
      if (data.success) setAnalytics(data.analytics);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/company/notifications`);
      if (data.success) setNotifications(data.notifications || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchStages = async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/company/stages`);
      if (data.success) setStagesInput((data.stages || []).join(", "));
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchCompanyCompleteness = async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/company/profile-completeness`);
      if (data.success) setCompanyCompleteness(data.completeness);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchNotifications();
    fetchStages();
    fetchCompanyCompleteness();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const officeDetails = useMemo(() => report?.company || {}, [report]);

  const downloadExcel = async () => {
    try {
      const response = await api.get(`${backendUrl}/api/company/reports/excel`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${officeDetails.name || "company"}_report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || "Excel export failed");
    }
  };

  const exportPdf = async () => {
    try {
      const response = await api.get(`${backendUrl}/api/company/reports/pdf`, {
        responseType: "text",
      });
      const popup = window.open("", "_blank");
      if (!popup) {
        toast.error("Please allow pop-ups to export PDF");
        return;
      }
      popup.document.open();
      popup.document.write(response.data);
      popup.document.close();
      popup.focus();
      popup.print();
    } catch (error) {
      toast.error(error.response?.data?.message || "PDF export failed");
    }
  };

  const saveStages = async () => {
    const stages = stagesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const { data } = await api.put(`${backendUrl}/api/company/stages`, { stages });
      if (data.success) toast.success("Hiring stages updated");
      else toast.error(data.message || "Failed to update stages");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update stages");
    }
  };

  const sendReminders = async () => {
    try {
      const { data } = await api.post(`${backendUrl}/api/company/reminders/interviews`);
      if (data.success) toast.success(data.message);
      else toast.error(data.message || "Failed to send reminders");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reminders");
    }
  };

  const saveRichProfile = async () => {
    try {
      const payload = {
        website: richProfile.website,
        about: richProfile.about,
        culture: richProfile.culture,
        benefits: richProfile.benefits.split(",").map((s) => s.trim()).filter(Boolean),
        teamHighlights: richProfile.teamHighlights.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const { data } = await api.put(`${backendUrl}/api/company/rich-profile`, payload);
      if (data.success) {
        toast.success("Company profile updated");
        fetchReport();
        fetchCompanyCompleteness();
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-3" /> Loading report...
      </div>
    );
  }

  return (
    <div className="max-w-6xl print:p-0" id="report-area">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 print:hidden">
        <h1 className="text-xl font-bold text-gray-900">Company Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={downloadExcel}
            className="inline-flex items-center gap-2 border border-emerald-300 text-emerald-700 px-3 py-2 rounded-lg text-sm hover:bg-emerald-50"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={exportPdf}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <img
            src={officeDetails.image}
            alt={officeDetails.name}
            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
          />
          <div>
            <h2 className="text-lg font-semibold">{officeDetails.name}</h2>
            <p className="text-sm text-gray-600">{officeDetails.companyLocation}</p>
            <p className="text-sm text-gray-600">{officeDetails.companyPhone}</p>
            <p className="text-sm text-gray-600">
              {officeDetails.recruiterName} ({officeDetails.recruiterPosition})
            </p>
          </div>
        </div>
        {typeof companyCompleteness === "number" && (
          <div className="mt-4">
            <p className="text-xs text-gray-600 mb-1">
              Company Profile Completeness: {companyCompleteness}%
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{ width: `${companyCompleteness}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          ["Jobs", report?.totals?.jobs || 0],
          ["Applications", report?.totals?.applications || 0],
          ["Longlisted", report?.totals?.longlisted || 0],
          ["Shortlisted", report?.totals?.shortlisted || 0],
          ["Pending", report?.totals?.pending || 0],
          ["Rejected", report?.totals?.rejected || 0],
        ].map(([label, value]) => (
          <div key={label} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Stage Management</h3>
          <p className="text-xs text-gray-500 mb-2">
            Customize stages (comma separated): Applied, Longlisted, Interview, Offer...
          </p>
          <textarea
            value={stagesInput}
            onChange={(e) => setStagesInput(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
          />
          <button
            onClick={saveStages}
            className="mt-3 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
          >
            Save Stages
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Interview Analytics</h3>
            <button
              onClick={sendReminders}
              className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded"
            >
              Send Reminders
            </button>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>Feedback Count: {analytics?.feedbackCount || 0}</p>
            <p>Interviewer Satisfaction: {analytics?.interviewerSatisfaction || "0.00"}/5</p>
            <p>Candidate Performance: {analytics?.candidatePerformance || "0.00"}/5</p>
            <p>Communication: {analytics?.communication || "0.00"}/5</p>
            <p>Technical: {analytics?.technical || "0.00"}/5</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Rich Company Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={richProfile.website}
            onChange={(e) => setRichProfile((p) => ({ ...p, website: e.target.value }))}
            placeholder="Website"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={richProfile.culture}
            onChange={(e) => setRichProfile((p) => ({ ...p, culture: e.target.value }))}
            placeholder="Culture"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <textarea
            value={richProfile.about}
            onChange={(e) => setRichProfile((p) => ({ ...p, about: e.target.value }))}
            placeholder="About company"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm sm:col-span-2"
            rows={3}
          />
          <input
            value={richProfile.benefits}
            onChange={(e) => setRichProfile((p) => ({ ...p, benefits: e.target.value }))}
            placeholder="Benefits (comma separated)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={richProfile.teamHighlights}
            onChange={(e) => setRichProfile((p) => ({ ...p, teamHighlights: e.target.value }))}
            placeholder="Team highlights (comma separated)"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={saveRichProfile}
          className="mt-3 text-sm bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-black"
        >
          Save Company Profile
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Recent Applications</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Candidate</th>
                <th className="text-left px-4 py-3">Job</th>
                <th className="text-left px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {(report?.applications || []).slice(0, 10).map((app) => (
                <tr key={app._id} className="border-t border-gray-100">
                  <td className="px-4 py-3">{app.userId?.name || "N/A"}</td>
                  <td className="px-4 py-3">{app.jobId?.title || "N/A"}</td>
                  <td className="px-4 py-3">{app.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-800">Status Notifications</div>
        <div className="p-4 text-sm text-gray-600 space-y-2">
          {notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            notifications.map((n, idx) => (
              <p key={idx}>
                [{new Date(n.changedAt).toLocaleString()}] {n.stage} - {n.note}
              </p>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
