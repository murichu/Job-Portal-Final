import React from "react";
import { assets } from "../assets/assets";

const AppDownload = () => {
  return (
    <div className="container px-4 2xl:px-20 mx-auto my-20">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-2xl px-10 py-14 sm:px-16 sm:py-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        {/* Grid dots decoration */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left max-w-lg">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              Mobile App — Now Available
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
              Apply to jobs{" "}
              <span className="text-blue-400">on the go</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8">
              Get instant notifications, browse listings, and track your applications — right from your phone. Download the app and never miss an opportunity.
            </p>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl px-5 py-3 transition-all"
              >
                <img className="h-6 brightness-0 invert" src={assets.play_store} alt="Google Play" />
              </a>
              <a
                href="#"
                className="group inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white rounded-xl px-5 py-3 transition-all"
              >
                <img className="h-6 brightness-0 invert" src={assets.app_store} alt="App Store" />
              </a>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-7 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-slate-800 bg-gradient-to-br from-blue-400 to-blue-600"
                  />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 text-yellow-400 text-xs">
                  {"★★★★★"}
                </div>
                <p className="text-slate-400 text-xs mt-0.5">50k+ downloads</p>
              </div>
            </div>
          </div>

          {/* App mockup */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-75 pointer-events-none" />
            <img
              className="relative w-52 sm:w-64 drop-shadow-2xl"
              src={assets.app_main_img}
              alt="App screenshot"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;
