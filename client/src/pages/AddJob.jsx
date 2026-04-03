import React, { useEffect, useRef, useState, useContext } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { JobCategories, JobLocations } from "../assets/assets";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  Loader2,
  Briefcase,
  MapPin,
  BarChart2,
  DollarSign,
  Type,
  CalendarDays,
} from "lucide-react";

const LEVELS = [
  { label: "Beginner Level", value: "Beginner level" },
  { label: "Intermediate Level", value: "Intermediate level" },
  { label: "Senior Level", value: "Senior level" },
];

const formatKES = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(amount);
};

const AddJob = () => {
  const { backendUrl, companyToken, api } = useContext(AppContext);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [salaryMode, setSalaryMode] = useState("fixed");
  const [salaryAmount, setSalaryAmount] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [salaryVisible, setSalaryVisible] = useState(true);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const submitModeRef = useRef("approval");

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder:
          "Describe the role, responsibilities, requirements, and expectations...",
        modules: {
          toolbar: [
            [{ header: [2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      quillRef.current.on("text-change", () => {
        setCharCount(quillRef.current.getText().trim().length);
      });
    }
  }, []);

  const resetForm = () => {
    setTitle("");
    setSalaryMode("fixed");
    setSalaryAmount("");
    setSalaryMin("");
    setSalaryMax("");
    setSalaryVisible(true);
    setIsNegotiable(false);
    setLocation("");
    setCategory("");
    setLevel("");
    setDeadline("");
    setCharCount(0);
    setSaveAsDraft(false);
    if (quillRef.current) quillRef.current.root.innerHTML = "";
  };

  const getLegacySalary = () => {
    if (isNegotiable) return 0;
    if (salaryMode === "fixed") return Number(salaryAmount || 0);
    return Number(salaryMax || 0);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Job title is required");
    if (!location) return toast.error("Please select a location");
    if (!category) return toast.error("Please select a category");
    if (!level) return toast.error("Please select a level");

    if (!isNegotiable) {
      if (salaryMode === "fixed") {
        if (!salaryAmount || Number(salaryAmount) <= 0) {
          return toast.error("Please enter a valid fixed monthly salary");
        }
      } else {
        if (!salaryMin || Number(salaryMin) <= 0 || !salaryMax || Number(salaryMax) <= 0) {
          return toast.error("Please enter a valid salary range");
        }
        if (Number(salaryMax) < Number(salaryMin)) {
          return toast.error("Salary max must be greater than or equal to salary min");
        }
      }
    }

    if (!deadline) return toast.error("Please select a deadline");

    const description = quillRef.current?.root.innerHTML.trim();
    if (!description || description === "<p><br></p>") {
      return toast.error("Job description cannot be empty");
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        location,
        category,
        level,
        salaryMode,
        salaryVisible,
        isNegotiable,
        salary: getLegacySalary(),
        deadline: new Date(deadline).toISOString(),
      };

      if (!isNegotiable && salaryMode === "fixed") {
        payload.salaryAmount = Number(salaryAmount);
      }

      if (!isNegotiable && salaryMode === "range") {
        payload.salaryMin = Number(salaryMin);
        payload.salaryMax = Number(salaryMax);
      }

      const { data } = await api.post(`${backendUrl}/api/company/post-job`, payload, {
        headers: {
          Authorization: `Bearer ${companyToken}`,
        },
      });

      if (data.success) {
        toast.success(data.message || "Job saved successfully!");
        resetForm();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to post job"
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormDirty =
    title ||
    location ||
    category ||
    level ||
    salaryAmount ||
    salaryMin ||
    salaryMax ||
    deadline ||
    charCount > 0;

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the details below to attract the right candidates.
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job Title <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Senior Frontend Developer"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/100</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job Description <span className="text-red-500">*</span>
          </label>

          <div ref={editorRef} className="min-h-[220px] text-sm" />

          <div className="flex justify-between mt-2">
            <p className="text-xs text-gray-400">Use clear structure and bullet points</p>
            <p className="text-xs text-gray-500">{charCount} characters</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Job Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
              >
                <option value="">Select</option>
                {JobCategories.map((c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Location *
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
              >
                <option value="">Select</option>
                {JobLocations.map((l, i) => (
                  <option key={i} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" /> Level *
              </label>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
              >
                <option value="">Select</option>
                {LEVELS.map((l, i) => (
                  <option key={i} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Compensation & Deadline</h3>

          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Salary Mode</label>
              <div className="flex gap-2">
                {[
                  { value: "fixed", label: "Fixed" },
                  { value: "range", label: "Range" },
                ].map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setSalaryMode(mode.value)}
                    className={`px-3 py-2 rounded-lg text-sm border ${
                      salaryMode === mode.value
                        ? "bg-blue-50 text-blue-700 border-blue-300"
                        : "bg-white text-gray-600 border-gray-300"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={salaryVisible}
                  onChange={(e) => setSalaryVisible(e.target.checked)}
                />
                Salary visible to applicants
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                />
                Negotiable salary
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Deadline *</label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                  className="w-full pl-10 py-2.5 border rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              {salaryMode === "fixed" ? (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Fixed Salary (KES/month){!isNegotiable ? " *" : ""}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      value={salaryAmount}
                      onChange={(e) => setSalaryAmount(e.target.value)}
                      placeholder="e.g. 120000"
                      disabled={isNegotiable}
                      className="w-full pl-10 py-2.5 border rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>
                  {salaryAmount > 0 && (
                    <p className="text-xs text-gray-400 mt-1">{formatKES(salaryAmount)} monthly</p>
                  )}
                </>
              ) : (
                <>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Salary Range (KES){!isNegotiable ? " *" : ""}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      placeholder="Min"
                      disabled={isNegotiable}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm disabled:bg-gray-100"
                    />
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      placeholder="Max"
                      disabled={isNegotiable}
                      className="w-full px-3 py-2.5 border rounded-lg text-sm disabled:bg-gray-100"
                    />
                  </div>
                  {salaryMin > 0 && salaryMax > 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatKES(salaryMin)} - {formatKES(salaryMax)}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            onClick={() => { submitModeRef.current = "approval"; setSaveAsDraft(false); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
          >
            {loading && !saveAsDraft ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Submitting...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                Submit for Approval
              </>
            )}
          </button>

          <button
            type="submit"
            disabled={loading}
            onClick={() => { submitModeRef.current = "draft"; setSaveAsDraft(true); }}
            className="bg-gray-800 text-white px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
          >
            {loading && saveAsDraft ? (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                Saving...
              </>
            ) : (
              "Save Draft"
            )}
          </button>

          {isFormDirty && !loading && (
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 border rounded-lg text-sm text-gray-600"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddJob;
