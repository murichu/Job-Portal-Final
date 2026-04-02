import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { assets, JobCategories, JobLocations } from "../assets/assets";
import JobCard from "../components/JobCard";
import { SkeletonGrid } from "../components/SkeletonCard";

const JobListings = () => {
  const {
    isSearched,
    searchFilter,
    setSearchFilter,
    jobs,
    jobsLoading,
    userData,
    api,
    backendUrl,
  } = useContext(AppContext);

  const [showFilter, setShowFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);

  const JOBS_PER_PAGE = 6;

  const toggleSelection = (setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const fetchUserApplications = async () => {
    if (!userData) return;
    try {
      const { data } = await api.get(`${backendUrl}/api/user/applications`);
      if (data.success) {
        setUserApplications(data.applications.map((app) => app.jobId._id));
      }
    } catch (error) {
      console.error("Error fetching user applications:", error);
    }
  };

  useEffect(() => {
    const filtered = jobs
      .slice()
      .reverse()
      .filter((job) => {
        const matchCat =
          selectedCategories.length === 0 ||
          selectedCategories.includes(job.category);
        const matchLoc =
          selectedLocations.length === 0 ||
          selectedLocations.includes(job.location);
        const matchTitle =
          !searchFilter.title ||
          job.title.toLowerCase().includes(searchFilter.title.toLowerCase());
        const matchSearchLoc =
          !searchFilter.location ||
          job.location.toLowerCase().includes(searchFilter.location.toLowerCase());
        return matchCat && matchLoc && matchTitle && matchSearchLoc;
      });

    setFilteredJobs(filtered);
    setCurrentPage(1);
  }, [jobs, selectedCategories, selectedLocations, searchFilter]);

  useEffect(() => {
    fetchUserApplications();
  }, [userData]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const activeFiltersCount = selectedCategories.length + selectedLocations.length;
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  const scrollToList = () =>
    document.getElementById("job-list")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="container 2xl:px-20 mx-auto flex flex-col lg:flex-row max-lg:space-y-8 py-8 gap-6">

      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-card sticky top-20">
          {/* Active search pills */}
          {isSearched && (searchFilter.title || searchFilter.location) && (
            <div className="mb-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Active Search
              </p>
              <div className="flex flex-wrap gap-2">
                {searchFilter.title && (
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                    {searchFilter.title}
                    <button
                      onClick={() => setSearchFilter((p) => ({ ...p, title: "" }))}
                      aria-label="Clear title filter"
                    >
                      <img src={assets.cross_icon} className="w-2.5 h-2.5" alt="" />
                    </button>
                  </span>
                )}
                {searchFilter.location && (
                  <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-1.5 rounded-full">
                    {searchFilter.location}
                    <button
                      onClick={() => setSearchFilter((p) => ({ ...p, location: "" }))}
                      aria-label="Clear location filter"
                    >
                      <img src={assets.cross_icon} className="w-2.5 h-2.5" alt="" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold leading-none">
                  {activeFiltersCount}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => { setSelectedCategories([]); setSelectedLocations([]); }}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowFilter((p) => !p)}
                className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg lg:hidden"
              >
                {showFilter ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className={showFilter ? "" : "max-lg:hidden"}>
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                Category
              </p>
              <ul className="space-y-2.5">
                {JobCategories.map((cat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id={`cat-${i}`}
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleSelection(setSelectedCategories, cat)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <label htmlFor={`cat-${i}`} className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                      {cat}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b border-gray-100">
                Location
              </p>
              <ul className="space-y-2.5">
                {JobLocations.map((loc, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id={`loc-${i}`}
                      checked={selectedLocations.includes(loc)}
                      onChange={() => toggleSelection(setSelectedLocations, loc)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                    />
                    <label htmlFor={`loc-${i}`} className="text-sm text-gray-600 cursor-pointer hover:text-gray-900 select-none">
                      {loc}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Job Grid ─────────────────────────────────────────────────── */}
      <section className="flex-1 text-gray-800 max-lg:px-4" id="job-list">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-2xl text-gray-900 tracking-tight">Latest Jobs</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              {jobsLoading
                ? "Loading opportunities..."
                : filteredJobs.length > 0
                ? `${filteredJobs.length.toLocaleString()} job${filteredJobs.length !== 1 ? "s" : ""} found`
                : "No jobs match your criteria"}
            </p>
          </div>
          {totalPages > 1 && (
            <p className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hidden sm:block">
              Page {currentPage} / {totalPages}
            </p>
          )}
        </div>

        {jobsLoading ? (
          <SkeletonGrid count={6} />
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="text-5xl mb-4 select-none">🔍</div>
            <h4 className="text-base font-semibold text-gray-700 mb-1">No jobs found</h4>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-4">
              Try clearing some filters or searching with different keywords.
            </p>
            {(activeFiltersCount > 0 || searchFilter.title || searchFilter.location) && (
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedLocations([]);
                  setSearchFilter({ title: "", location: "" });
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                hasApplied={userApplications.includes(job._id)}
              />
            ))}
          </div>
        )}

        {/* Smart Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-10">
            <button
              onClick={() => { setCurrentPage((p) => Math.max(p - 1, 1)); scrollToList(); }}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <img src={assets.left_arrow_icon} alt="" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => {
              const page = i + 1;
              const isFirst = page === 1;
              const isLast = page === totalPages;
              const nearCurrent = Math.abs(page - currentPage) <= 1;

              if (!isFirst && !isLast && !nearCurrent) {
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={i} className="text-gray-400 text-sm w-4 text-center">…</span>;
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(page); scrollToList(); }}
                  aria-current={currentPage === page ? "page" : undefined}
                  className={`w-9 h-9 flex items-center justify-center border rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => { setCurrentPage((p) => Math.min(p + 1, totalPages)); scrollToList(); }}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <img src={assets.right_arrow_icon} alt="" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default JobListings;
