import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext";

const QUICK_TAGS = ["Full Stack", "Data Science", "UI/UX Design", "DevOps", "Senior Level"];

const Hero = () => {
  const { setSearchFilter, setIsSearched } = useContext(AppContext);

  // Controlled state — fixes the uncontrolled/ref sync bug from the original
  const [titleInput, setTitleInput]       = useState("");
  const [locationInput, setLocationInput] = useState("");

  const triggerSearch = (title = titleInput, location = locationInput) => {
    setSearchFilter({ title: title.trim(), location: location.trim() });
    setIsSearched(true);
    setTimeout(() => {
      document.getElementById("job-list")?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") triggerSearch();
  };

  const handleQuickTag = (tag) => {
    setTitleInput(tag);
    setLocationInput("");
    triggerSearch(tag, "");
  };

  return (
    <div className="container 2xl:px-20 mx-auto my-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-16 sm:py-24 text-center mx-2 rounded-2xl">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative z-10 px-4 sm:px-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            10,000+ active listings updated daily
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight tracking-tight max-w-2xl mx-auto">
            Find Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Dream Job
            </span>
          </h1>
          <p className="mb-10 max-w-md mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
            Explore thousands of opportunities from top companies.
            Your career move starts here.
          </p>

          {/* Search bar */}
          <div
            role="search"
            className="flex flex-col sm:flex-row bg-white rounded-2xl max-w-2xl mx-auto shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)] overflow-hidden"
          >
            <div className="flex items-center flex-1 px-4 py-3.5 sm:border-r border-gray-100 gap-2.5">
              <img className="h-4 flex-shrink-0 opacity-40" src={assets.search_icon} alt="" aria-hidden="true" />
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Job title or keywords"
                aria-label="Search by job title"
                className="outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              />
              {titleInput && (
                <button onClick={() => setTitleInput("")} className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0" aria-label="Clear title">×</button>
              )}
            </div>

            <div className="flex items-center flex-1 px-4 py-3.5 border-t sm:border-t-0 gap-2.5">
              <img className="h-4 flex-shrink-0 opacity-40" src={assets.location_icon} alt="" aria-hidden="true" />
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="City or location"
                aria-label="Search by location"
                className="outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
              />
              {locationInput && (
                <button onClick={() => setLocationInput("")} className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0" aria-label="Clear location">×</button>
              )}
            </div>

            <button
              onClick={() => triggerSearch()}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 px-8 py-3.5 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 min-w-[120px] flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          {/* Quick tags */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <span className="text-xs text-slate-500 self-center mr-1">Trending:</span>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleQuickTag(tag)}
                className="text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-blue-500 bg-slate-800/40 hover:bg-blue-600/20 px-3 py-1.5 rounded-full transition-all"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trusted by */}
      <div className="border border-gray-200 shadow-card mx-2 mt-4 px-6 py-5 rounded-xl bg-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-medium text-gray-400 text-xs uppercase tracking-widest whitespace-nowrap">
            Trusted by
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap flex-1">
            {[
              { src: assets.microsoft_logo, alt: "Microsoft" },
              { src: assets.walmart_logo,   alt: "Walmart"   },
              { src: assets.accenture_logo, alt: "Accenture" },
              { src: assets.samsung_logo,   alt: "Samsung"   },
              { src: assets.amazon_logo,    alt: "Amazon"    },
              { src: assets.adobe_logo,     alt: "Adobe"     },
            ].map(({ src, alt }) => (
              <img
                key={alt}
                className="h-5 opacity-50 hover:opacity-100 transition-opacity duration-300 grayscale hover:grayscale-0"
                src={src}
                alt={alt}
                title={alt}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
