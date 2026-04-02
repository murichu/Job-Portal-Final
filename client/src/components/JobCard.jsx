import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const JobCard = ({ job, hasApplied }) => {
  const navigate = useNavigate();

  const companyImage = job.companyId?.image || job.company?.image || assets.company_icon;
  const companyName = job.companyId?.name || job.company?.name || "Unknown Company";

  const sanitizedDescription = DOMPurify.sanitize(job.description || "");

  const getLevelColor = (level) => {
    const l = (level || "").toLowerCase();
    if (l.includes("senior")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (l.includes("intermediate")) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="group bg-white border border-gray-200 hover:border-blue-300 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <img
          className="h-10 w-10 rounded-lg object-contain border border-gray-100 p-1 bg-white"
          src={companyImage}
          alt={`${companyName} logo`}
          onError={(e) => { e.target.src = assets.company_icon; }}
        />
        {hasApplied && (
          <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
            ✓ Applied
          </span>
        )}
      </div>

      {/* Job Title */}
      <h4 className="font-semibold text-gray-900 text-base mt-1 mb-0.5 group-hover:text-blue-600 transition-colors line-clamp-1">
        {job.title}
      </h4>
      <p className="text-sm text-gray-500 mb-3">{companyName}</p>

      {/* Tags */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
          <img src={assets.location_icon} alt="" className="w-3 h-3" />
          {job.location}
        </span>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getLevelColor(job.level)}`}>
          {job.level}
        </span>
      </div>

      {/* Description */}
      <p
        className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4"
        dangerouslySetInnerHTML={{
          __html: sanitizedDescription.slice(0, 120) + "...",
        }}
      />

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {hasApplied ? (
          <button
            disabled
            className="flex-1 bg-green-600 text-white text-sm px-4 py-2 rounded-lg cursor-default font-medium"
          >
            Applied ✓
          </button>
        ) : (
          <button
            onClick={() => {
              navigate(`/apply-job/${job._id}`);
              window.scrollTo(0, 0);
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Apply Now
          </button>
        )}
        <button
          onClick={() => {
            navigate(`/apply-job/${job._id}`);
            window.scrollTo(0, 0);
          }}
          className="text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 text-sm px-4 py-2 rounded-lg transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  );
};

export default JobCard;
