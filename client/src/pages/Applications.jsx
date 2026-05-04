import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { assets } from "../assets/assets";
import moment from "moment";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import { useEffect } from "react";

const Applications = () => {
  const {
    userApplications,
    backendUrl,
    fetchUserApplications,
    userData,
    api,
  } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);
  const [resume, setResume] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(null);

  const fetchCompleteness = async () => {
    try {
      const { data } = await api.get(`${backendUrl}/api/user/profile-completeness`);
      if (data.success) setProfileCompleteness(data.completeness);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleResumeUpdate = async () => {
    if (!resume) {
      toast.error("Please select a resume file");
      return;
    }
    if (resume.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    if (resume.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("resume", resume);

      const { data } = await api.post(
        `${backendUrl}/api/user/update-resume`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        setResume(null);
        fetchUserApplications();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-700 border border-green-200";
      case "Rejected":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-blue-50 text-blue-700 border border-blue-200";
    }
  };

  useEffect(() => {
    fetchCompleteness();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Navbar />
      <div className="container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10">
        {typeof profileCompleteness === "number" && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Profile Completeness: {profileCompleteness}%
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
          </div>
        )}
        {/* Resume Section */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block"></span>
            Your Resume
          </h2>
          <div className="flex gap-3 items-center">
            {isEdit ? (
              <>
                <label
                  className="flex items-center gap-2 cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  htmlFor="resumeUpload"
                >
                  <img src={assets.profile_upload_icon} alt="Upload" className="w-5 h-5" />
                  {resume ? resume.name : "Choose PDF File"}
                  <input
                    id="resumeUpload"
                    onChange={(e) => setResume(e.target.files[0])}
                    accept=".pdf"
                    type="file"
                    hidden
                  />
                </label>
                <button
                  onClick={handleResumeUpdate}
                  disabled={isUploading || !resume}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                >
                  {isUploading ? "Saving..." : "Save Resume"}
                </button>
                <button
                  onClick={() => { setIsEdit(false); setResume(null); }}
                  className="text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {userData?.resume ? (
                  <a
                    href={userData.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    <img src={assets.resume_download_icon} alt="Download" className="w-4 h-4" />
                    View Resume
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm italic">No resume uploaded yet</span>
                )}
                <button
                  onClick={() => setIsEdit(true)}
                  className="text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 rounded-lg px-4 py-2 text-sm transition-colors"
                >
                  {userData?.resume ? "Update Resume" : "Upload Resume"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-blue-500 rounded-full inline-block"></span>
              Jobs Applied
              {userApplications && (
                <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  {userApplications.length}
                </span>
              )}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="py-3 px-6 text-left">Company</th>
                  <th className="py-3 px-6 text-left">Job Title</th>
                  <th className="py-3 px-6 text-left max-sm:hidden">Location</th>
                  <th className="py-3 px-6 text-left max-sm:hidden">Date Applied</th>
                  <th className="py-3 px-6 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userApplications && userApplications.length > 0 ? (
                  userApplications.map((application, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            className="w-9 h-9 rounded-lg object-cover border border-gray-100"
                            src={application.organizationId?.image}
                            alt={application.organizationId?.name}
                            onError={(e) => { e.target.src = assets.company_icon; }}
                          />
                          <span className="font-medium text-gray-800 text-sm">
                            {application.organizationId?.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {application.jobId?.title}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 max-sm:hidden">
                        {application.jobId?.location}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 max-sm:hidden">
                        {moment(application.date).format("MMM D, YYYY")}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${getStatusStyles(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <img src={assets.resume_not_selected} alt="" className="w-16 opacity-40" />
                        <p className="text-sm">No applications yet. Start applying to jobs!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Applications;
