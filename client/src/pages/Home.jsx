import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import JobListings from "../components/JobListings";
import AppDownload from "../components/AppDownload";
import Footer from "../components/Footer";

const Home = () => {
  // Reset scroll position when navigating to home
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <JobListings />
        <AppDownload />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
