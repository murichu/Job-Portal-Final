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
} from "lucide-react";

const LEVELS = [
  { label: "Beginner Level", value: "Beginner level" },
  { label: "Intermediate Level", value: "Intermediate level" },
  { label: "Senior Level", value: "Senior level" },
];

const AddJob = () => {
  const { backendUrl, companyToken, api } = useContext(AppContext);

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [salary, setSalary] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder:
          "Describe the role, responsibilities, requirements, and what makes this opportunity exciting...",
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
    setSalary("");
    setLocation("");
    setCategory("");
    setLevel("");
    setCharCount(0);
    if (quillRef.current) quillRef.current.root.innerHTML = "";
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!title.trim()) return toast.error("Job title is required");
    if (!location) return toast.error("Please select a location");
    if (!category) return toast.error("Please select a category");
    if (!level) return toast.error("Please select a level");
    if (!salary || Number(salary) <= 0)
      return toast.error("Please enter a valid salary");

    const description = quillRef.current?.root.innerHTML.trim();
    if (!description || description === "<p><br></p>") {
      return toast.error("Job description cannot be empty");
    }

    try {
      setLoading(true);
      const { data } = await api.post(
        `${backendUrl}/api/company/post-job`,
        {
          title,
          description,
          location,
          salary: Number(salary),
          category,
          level,
        },
        {
          headers: {
            Authorization: `Bearer ${companyToken}`,
          },
        }
      );

      if (data.success) {
        toast.success("Job posted successfully!");
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
    title || location || category || level || salary || charCount > 0;

  return (
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fill in the details below to attract the right candidates.
        </p>
      </div>

      <form onSubmit={onSubmitHandler} className="space-y-6">
        {/* Job Title */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-right">
            {title.length}/100
          </p>
        </div>

        {/* Job Description */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Job Description <span className="text-red-500">*</span>
          </label>
          <div ref={editorRef} className="rounded-lg min-h-[220px] text-sm" />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              Use headings and lists to make your description scannable.
            </p>
            <p
              className={`text-xs font-medium ${
                charCount < 100 ? "text-amber-500" : "text-green-600"
              }`}
            >
              {charCount < 100
                ? `${100 - charCount} more chars recommended`
                : `✓ ${charCount} characters`}
            </p>
          </div>
        </div>

        {/* Category, Location, Level */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Job Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Category{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow appearance-none"
              >
                <option value="" disabled>
                  Select category
                </option>
                {JobCategories.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Location{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow appearance-none"
              >
                <option value="" disabled>
                  Select location
                </option>
                {JobLocations.map((loc, i) => (
                  <option key={i} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" /> Experience Level{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-shadow appearance-none"
              >
                <option value="" disabled>
                  Select level
                </option>
                {LEVELS.map((l, i) => (
                  <option key={i} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Salary */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Annual Salary (USD) <span className="text-red-500">*</span>
          </label>
          <div className="relative w-full sm:w-56">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={0}
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. 75000"
              required
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            />
          </div>
          {salary && Number(salary) > 0 && (
            <p className="text-xs text-gray-400 mt-1.5">
              ≈ ${Math.round(Number(salary) / 12).toLocaleString()} / month
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pb-6">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Posting Job...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4" />
                Post Job
              </>
            )}
          </button>
          {isFormDirty && !loading && (
            <button
              type="button"
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              Clear Form
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddJob;
