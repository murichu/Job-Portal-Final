import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Number illustration */}
        <div className="relative mb-8 select-none">
          <span className="text-[10rem] font-black text-gray-100 leading-none tracking-tighter">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">🔍</span>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 text-base max-w-sm mx-auto mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or the
          link may be broken.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-button"
          >
            Browse Jobs
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
