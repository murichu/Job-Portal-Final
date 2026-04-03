import Job from "../models/Job.js"; // Import the Job model
import mongoose from "mongoose";

// Controller: Get all visible jobs
export const getJobs = async (req, res) => {
  try {
    // Find jobs that are marked as visible, populate related company data (excluding password),
    // and sort them by creation date in descending order (newest first)
    const jobs = await Job.find({
      visible: true,
      deadline: { $gte: new Date() },
      isDeleted: { $ne: true },
      approvalStatus: "approved",
      jobStatus: "active",
    })
      .populate({
        path: "companyId",
        select: "-password", // Exclude password field from populated company data
      })
      .sort({ createdAt: -1 }); // Sort jobs by most recent

    // Return the list of jobs as JSON
    res.json({ success: true, jobs });
  } catch (error) {
    // Log any unexpected server error to the console
    console.error("getJobs error:", error);

    // Send back a 500 Internal Server Error response
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Controller: Get a single job by ID
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params; // Extract job ID from request parameters

    // Validate job ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid job ID format" 
      });
    }

    // Find the job by ID and populate company data (excluding password)
    const job = await Job.findOne({
      _id: id,
      isDeleted: { $ne: true },
      approvalStatus: "approved",
      jobStatus: "active",
    }).populate({
      path: "companyId",
      select: "-password",
    });

    // If job not found, return a not-found response
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Return the found job as JSON
    res.json({ success: true, job });
  } catch (error) {
    // Log the error for debugging
    console.error("getJobById error:", error);

    // Return a generic server error response
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
