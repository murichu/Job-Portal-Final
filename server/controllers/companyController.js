import Company from "../models/Company.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import generateToken from "../utils/generateToken.js";
import validator from "validator";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import mongoose from "mongoose";

// Register a company
// Handles creating a new company account with provided details such as name, email, password, etc.
export const registerCompany = async (req, res) => {
  const {
    name,
    email,
    password,
    recruiterName,
    recruiterPosition,
    companyPhone,
    companyLocation,
  } = req.body;
  const imageFile = req.file;

  // Check for missing fields
  if (
    !name ||
    !email ||
    !password ||
    !recruiterName ||
    !recruiterPosition ||
    !companyPhone ||
    !companyLocation ||
    !imageFile
  ) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  /// Sanitize inputs
  const sanitizedName = name.trim();
  const sanitizedEmail = email.trim().toLowerCase();
  const sanitizedRecruiterName = recruiterName.trim();
  const sanitizedRecruiterPosition = recruiterPosition.trim();
  const sanitizedPhone = companyPhone.trim();
  const sanitizedLocation = companyLocation.trim();

  // Validate name
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 50 characters",
    });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Validate password strength
  if (
    !validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol",
    });
  }

  try {
    // Check if company already exists
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res.status(409).json({
        success: false,
        message: "Company already registered",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary with error handling
    let imageUpload;
    try {
      imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "company_profiles",
        transformation: [
          { width: 200, height: 200, crop: "fill", quality: "auto" },
        ],
      });
    } catch (cloudErr) {
      console.error("Cloudinary upload error:", cloudErr);
      return res.status(500).json({
        success: false,
        message: "Image upload failed. Please try again.",
      });
    }

    // Create new company
    const company = await Company.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashPassword,
      recruiterName: sanitizedRecruiterName,
      recruiterPosition: sanitizedRecruiterPosition,
      companyPhone: sanitizedPhone,
      companyLocation: sanitizedLocation,
      image: imageUpload.secure_url,
    });

    // Return success with token
    return res.status(201).json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
        recruiterName: company.recruiterName,
        recruiterPosition: company.recruiterPosition,
        companyPhone: company.companyPhone,
        companyLocation: company.companyLocation,
      },
      token: generateToken(company._id, "company"),
      message: "Company created successfully",
    });
  } catch (error) {
    console.error("Register Company error:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Company Login
// Authenticates a company using credentials (e.g., email and password) and returns a token/session
export const loginCompany = async (req, res) => {
  const { email, password } = req.body; // Extract login credentials from the request body

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    // Check if a company with the provided email exists
    const company = await Company.findOne({ email });

    if (!company) {
      // If no company is found, return an error response
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, company.password);

    if (!isMatch) {
      // If passwords don't match, return an error response
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // If authentication is successful, return company details and a JWT token
    res.json({
      success: true,
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        image: company.image,
      },
      token: generateToken(company._id, "company"), // Generate a token for the session
    });
  } catch (error) {
    // Log any unexpected server errors
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get company data
// Retrieves detailed information about the currently logged-in company (profile, settings, etc.)
// Controller to get authenticated company data
export const getCompanyData = async (req, res) => {
  try {
    // Access the authenticated company object attached to the request (set by auth middleware)
    const company = req.company;

    // Respond with the company data
    res.json({ success: true, company });

    // console.log(company);
  } catch (error) {
    // Log any unexpected server errors
    console.error("Login error:", error);

    // Return a 500 error response indicating a server error
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Post a new job
// Allows a company to create and post a new job listing with job description, requirements, etc.
export const postJob = async (req, res) => {
  // Destructure job details from request body
  const {
    title,
    description,
    location,
    level,
    category,
    deadline,
    salaryMode = "fixed",
    salaryAmount,
    salaryMin,
    salaryMax,
    salaryVisible = true,
    isNegotiable = false,
  } = req.body;

  if (!title || !description || !location || !level || !category || !deadline) {
    return res.status(400).json({
      success: false,
      message:
        "All required fields (title, description, location, level, category, deadline) must be provided.",
    });
  }

  if (!["fixed", "range"].includes(salaryMode)) {
    return res.status(400).json({ success: false, message: "Invalid salary mode." });
  }

  let normalizedSalaryAmount = null;
  let normalizedSalaryMin = null;
  let normalizedSalaryMax = null;
  let legacySalary = 0;

  if (!isNegotiable) {
    if (salaryMode === "fixed") {
      normalizedSalaryAmount = Number(salaryAmount);
      if (!Number.isFinite(normalizedSalaryAmount) || normalizedSalaryAmount <= 0) {
        return res.status(400).json({ success: false, message: "Fixed monthly salary must be greater than zero." });
      }
      legacySalary = normalizedSalaryAmount;
    }

    if (salaryMode === "range") {
      normalizedSalaryMin = Number(salaryMin);
      normalizedSalaryMax = Number(salaryMax);
      if (
        !Number.isFinite(normalizedSalaryMin) ||
        !Number.isFinite(normalizedSalaryMax) ||
        normalizedSalaryMin <= 0 ||
        normalizedSalaryMax <= 0 ||
        normalizedSalaryMax < normalizedSalaryMin
      ) {
        return res.status(400).json({ success: false, message: "Salary range is invalid." });
      }
      legacySalary = normalizedSalaryMax;
    }
  }

  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
    return res.status(400).json({
      success: false,
      message: "Deadline must be a valid future date.",
    });
  }

  // Get the company ID from the authenticated request (set in middleware)
  const companyId = req.company._id;

  try {
    // Create a new Job instance
    const newJob = await Job({
      title,
      description,
      location,
      salary: legacySalary,
      salaryMode,
      salaryAmount: normalizedSalaryAmount,
      salaryMin: normalizedSalaryMin,
      salaryMax: normalizedSalaryMax,
      salaryVisible,
      isNegotiable,
      level,
      category,
      companyId,
      date: Date.now(),
      deadline: parsedDeadline,
    });

    // Save the job to the database
    await newJob.save();

    // Respond with success
    res.json({ success: true, newJob });
  } catch (error) {
    console.error("postJob error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Get company job applicants
// Fetches a list of applicants who have applied to the company's job postings
export const getCompanyJobApplicants = async (req, res) => {
  try {
    const companyId = req.company._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      JobApplication.find({ companyId })
        .populate('userId', 'name email image resume')
        .populate('jobId', 'title location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ companyId })
    ]);

    res.json({
      success: true,
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: applications.length,
        totalApplications: total,
      }
    });
  } catch (error) {
    console.error('getCompanyJobApplicants error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

// Get company posted jobs
// Retrieves all jobs that the company has posted so far
export const getCompanyPostedJobs = async (req, res) => {
  try {
    // Get the company ID from the authenticated request (set by middleware)
    const companyId = req.company._id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID not found in request.",
      });
    }

    // Fetch all jobs posted by this company, sorted by newest first
    const jobs = await Job.find({ companyId }).sort({ createdAt: -1 }).lean();

    // Adding number of applicants for each job
    const jobsData = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.countDocuments({
          jobId: job._id,
        });
        const shortlistedCount = await JobApplication.countDocuments({
          jobId: job._id,
          status: "Shortlisted",
        });
        const isExpired = new Date(job.deadline) < new Date();
        const canRepost = isExpired && shortlistedCount === 0;

        // Spread job directly since .lean() returns plain objects
        return { ...job, applicants, shortlistedCount, isExpired, canRepost };
      })
    );

    // Send response with jobs
    return res.json({ success: true, jobsData });
  } catch (error) {
    // Handle unexpected server errors
    console.error("getCompanyPostedJobs error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// Change job application status
// Updates the status of a job application (e.g., pending → accepted/rejected) for a specific applicant
export const ChangeJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    const companyId = req.company._id;

    // Validate input
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Application ID and status are required.',
      });
    }

    if (!['Pending', 'Longlisted', 'Shortlisted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Longlisted, Shortlisted, or Rejected.',
      });
    }

    // Validate application ID format
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format.',
      });
    }

    // Find and update the application
    const statusStageMap = {
      Pending: "Applied",
      Longlisted: "Longlisted",
      Shortlisted: "Shortlisted",
      Rejected: "Rejected",
    };

    const application = await JobApplication.findOne({
      _id: applicationId,
      companyId,
    }).populate('userId', 'name email')
     .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to update it.',
      });
    }

    application.status = status;
    application.stage = statusStageMap[status] || application.stage;
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: application.stage,
      status,
      note: `Status updated to ${status}`,
      changedBy: req.company?.name || "Company",
      changedAt: new Date(),
    });
    await application.save();

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully.`,
      application,
    });
  } catch (error) {
    console.error('ChangeJobApplicationStatus error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
};

// Repost expired jobs if there are no shortlisted applications
export const repostJob = async (req, res) => {
  try {
    const { id, deadline } = req.body;
    const companyId = req.company._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Valid job ID is required." });
    }

    const originalJob = await Job.findById(id);
    if (!originalJob) {
      return res.status(404).json({ success: false, message: "Job not found." });
    }

    if (originalJob.companyId.toString() !== companyId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized action." });
    }

    if (new Date(originalJob.deadline) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "You can only repost after the current posting deadline.",
      });
    }

    const shortlistedCount = await JobApplication.countDocuments({
      jobId: originalJob._id,
      status: "Shortlisted",
    });

    if (shortlistedCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot repost because this job has shortlisted candidates.",
      });
    }

    const newDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (Number.isNaN(newDeadline.getTime()) || newDeadline <= new Date()) {
      return res.status(400).json({ success: false, message: "Repost deadline must be a future date." });
    }

    const repostedJob = await Job.create({
      title: originalJob.title,
      description: originalJob.description,
      location: originalJob.location,
      category: originalJob.category,
      level: originalJob.level,
      salary: originalJob.salary,
      salaryMode: originalJob.salaryMode || "fixed",
      salaryAmount: originalJob.salaryAmount ?? null,
      salaryMin: originalJob.salaryMin ?? null,
      salaryMax: originalJob.salaryMax ?? null,
      salaryVisible: typeof originalJob.salaryVisible === "boolean" ? originalJob.salaryVisible : true,
      isNegotiable: originalJob.isNegotiable || false,
      companyId: originalJob.companyId,
      visible: true,
      date: new Date(),
      deadline: newDeadline,
      repostedFrom: originalJob._id,
    });

    return res.json({ success: true, message: "Job reposted successfully.", job: repostedJob });
  } catch (error) {
    console.error("repostJob error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getCompanyStages = async (req, res) => {
  return res.json({
    success: true,
    stages: req.company.interviewStages || [],
  });
};

export const updateCompanyStages = async (req, res) => {
  try {
    const { stages } = req.body;
    const updated = await Company.findByIdAndUpdate(
      req.company._id,
      { interviewStages: stages },
      { new: true }
    ).lean();
    return res.json({ success: true, stages: updated.interviewStages });
  } catch (error) {
    console.error("updateCompanyStages error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, scheduledAt, notes = "" } = req.body;
    const application = await JobApplication.findOne({
      _id: applicationId,
      companyId: req.company._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    const meetToken = Math.random().toString(36).slice(2, 10);
    const meetLink = `https://meet.google.com/${meetToken}`;
    application.interview = {
      scheduledAt: new Date(scheduledAt),
      meetLink,
      reminderSent: false,
      notes,
    };
    application.stage = "Interview";
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: "Interview",
      status: application.status,
      note: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      changedBy: req.company?.name || "Company",
      changedAt: new Date(),
    });
    await application.save();

    return res.json({
      success: true,
      message: "Interview scheduled successfully.",
      interview: application.interview,
    });
  } catch (error) {
    console.error("scheduleInterview error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const submitInterviewFeedback = async (req, res) => {
  try {
    const { applicationId, ...feedback } = req.body;
    const application = await JobApplication.findOne({
      _id: applicationId,
      companyId: req.company._id,
    });
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found." });
    }

    application.feedback = application.feedback || [];
    application.feedback.push(feedback);
    application.timeline = application.timeline || [];
    application.timeline.push({
      stage: application.stage || "Interview",
      status: application.status,
      note: "Interview feedback submitted",
      changedBy: feedback.interviewerName || "Interviewer",
      changedAt: new Date(),
    });
    await application.save();

    return res.json({ success: true, message: "Feedback recorded successfully." });
  } catch (error) {
    console.error("submitInterviewFeedback error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getInterviewAnalytics = async (req, res) => {
  try {
    const applications = await JobApplication.find({ companyId: req.company._id }).lean();
    const feedbackRows = applications.flatMap((a) => a.feedback || []);
    const avg = (key) =>
      feedbackRows.length
        ? (
            feedbackRows.reduce((sum, row) => sum + (Number(row[key]) || 0), 0) /
            feedbackRows.length
          ).toFixed(2)
        : "0.00";

    return res.json({
      success: true,
      analytics: {
        feedbackCount: feedbackRows.length,
        interviewerSatisfaction: avg("satisfaction"),
        candidatePerformance: avg("candidateScore"),
        communication: avg("communication"),
        technical: avg("technical"),
      },
    });
  } catch (error) {
    console.error("getInterviewAnalytics error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const sendInterviewReminders = async (req, res) => {
  try {
    const now = new Date();
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const applications = await JobApplication.find({
      companyId: req.company._id,
      "interview.scheduledAt": { $gte: now, $lte: in24Hours },
      "interview.reminderSent": false,
    });

    for (const application of applications) {
      application.interview.reminderSent = true;
      application.timeline = application.timeline || [];
      application.timeline.push({
        stage: "Interview",
        status: application.status,
        note: "Automated interview reminder sent",
        changedBy: "System",
        changedAt: new Date(),
      });
      await application.save();
    }

    return res.json({
      success: true,
      message: `${applications.length} interview reminder(s) processed.`,
      count: applications.length,
    });
  } catch (error) {
    console.error("sendInterviewReminders error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getCompanyNotifications = async (req, res) => {
  try {
    const applications = await JobApplication.find({ companyId: req.company._id })
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const notifications = applications
      .flatMap((app) =>
        (app.timeline || []).map((event) => ({
          applicationId: app._id,
          stage: event.stage,
          status: event.status,
          note: event.note,
          changedAt: event.changedAt,
          changedBy: event.changedBy,
        }))
      )
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt))
      .slice(0, 20);

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("getCompanyNotifications error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const updateCompanyRichProfile = async (req, res) => {
  try {
    const { website = "", about = "", culture = "", benefits = [], teamHighlights = [] } = req.body;
    const updated = await Company.findByIdAndUpdate(
      req.company._id,
      { website, about, culture, benefits, teamHighlights },
      { new: true }
    ).lean();
    return res.json({ success: true, company: updated });
  } catch (error) {
    console.error("updateCompanyRichProfile error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getCompanyProfileCompleteness = async (req, res) => {
  const company = req.company;
  const checks = [
    Boolean(company.image),
    Boolean(company.companyLocation),
    Boolean(company.companyPhone),
    Boolean(company.recruiterName),
    Boolean(company.website),
    Boolean(company.about),
    Boolean(company.culture),
    Array.isArray(company.benefits) && company.benefits.length > 0,
    Array.isArray(company.teamHighlights) && company.teamHighlights.length > 0,
  ];
  const completed = checks.filter(Boolean).length;
  const percent = Math.round((completed / checks.length) * 100);
  return res.json({ success: true, completeness: percent, totalChecks: checks.length, completed });
};

// Change job visibility
// Toggles the visibility of a job posting (e.g., make a job visible or hidden from job seekers)
export const ChangeJobVisibility = async (req, res) => {
  try {
    // Extract the job ID from the request body
    const { id } = req.body;

    // Validate job ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid job ID is required.",
      });
    }

    // Get the authenticated company's ID from the request (assumed set by auth middleware)
    const companyId = req.company._id;

    // Find the job by its ID
    const job = await Job.findById(id);

    // If job doesn't exist, return a 404 error
    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    // Check if the job belongs to the authenticated company
    if (companyId.toString() !== job.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this job.",
      });
    }

    const nextVisibility = !job.visible;

    // Prevent hiding jobs that already have applications.
    if (!nextVisibility) {
      const applicationsCount = await JobApplication.countDocuments({ jobId: job._id });
      if (applicationsCount > 0) {
        return res.status(400).json({
          success: false,
          message: "Jobs with applications cannot be hidden.",
        });
      }
    }

    // Update only visibility to avoid re-validating legacy fields on full document save.
    const updatedJob = await Job.findByIdAndUpdate(
      job._id,
      { $set: { visible: nextVisibility } },
      { new: true }
    );

    // Respond with a success message and the updated job
    res.json({
      success: true,
      message: "Job visibility updated successfully.",
      job: updatedJob,
    });
  } catch (error) {
    // Log any unexpected server errors
    console.error("ChangeJobVisibility error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

const buildCompanyReport = async (companyId) => {
  const [jobs, applications] = await Promise.all([
    Job.find({ companyId }).sort({ createdAt: -1 }).lean(),
    JobApplication.find({ companyId })
      .populate("jobId", "title")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  const statusCounts = applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    { Pending: 0, Longlisted: 0, Shortlisted: 0, Rejected: 0 }
  );

  return {
    jobs,
    applications,
    statusCounts,
    totals: {
      jobs: jobs.length,
      applications: applications.length,
      longlisted: statusCounts.Longlisted,
      shortlisted: statusCounts.Shortlisted,
      pending: statusCounts.Pending,
      rejected: statusCounts.Rejected,
    },
  };
};

export const getCompanyReportsSummary = async (req, res) => {
  try {
    const company = req.company;
    const report = await buildCompanyReport(company._id);
    return res.json({
      success: true,
      company,
      ...report,
    });
  } catch (error) {
    console.error("getCompanyReportsSummary error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const downloadCompanyReportExcel = async (req, res) => {
  try {
    const company = req.company;
    const report = await buildCompanyReport(company._id);
    const csvLines = [];

    csvLines.push("Office Details");
    csvLines.push("Company Name,Office Location,Office Phone,Recruiter,Recruiter Position,Company Email,Logo URL");
    csvLines.push(
      `"${company.name}","${company.companyLocation}","${company.companyPhone}","${company.recruiterName}","${company.recruiterPosition}","${company.email}","${company.image || ""}"`
    );
    csvLines.push("");
    csvLines.push("Summary");
    csvLines.push("Total Jobs,Total Applications,Longlisted,Shortlisted,Pending,Rejected");
    csvLines.push(
      `${report.totals.jobs},${report.totals.applications},${report.totals.longlisted},${report.totals.shortlisted},${report.totals.pending},${report.totals.rejected}`
    );
    csvLines.push("");
    csvLines.push("Jobs");
    csvLines.push("Title,Category,Level,Location,Salary Mode,Salary,Visible,Posted Date");
    report.jobs.forEach((job) => {
      csvLines.push(
        `"${job.title}","${job.category}","${job.level}","${job.location}","${job.salaryMode || 'fixed'}",${job.salary || 0},${
          job.visible ? "Yes" : "No"
        },"${new Date(job.date).toLocaleDateString()}"`
      );
    });
    csvLines.push("");
    csvLines.push("Applications");
    csvLines.push("Candidate Name,Candidate Email,Job Title,Status,Applied Date");
    report.applications.forEach((app) => {
      csvLines.push(
        `"${app.userId?.name || "N/A"}","${app.userId?.email || "N/A"}","${
          app.jobId?.title || "N/A"
        }","${app.status}","${new Date(app.date).toLocaleDateString()}"`
      );
    });

    const buffer = Buffer.from(csvLines.join("\n"), "utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${company.name.replace(/\s+/g, "_")}_report.csv`
    );
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    return res.send(buffer);
  } catch (error) {
    console.error("downloadCompanyReportExcel error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const downloadCompanyReportPDF = async (req, res) => {
  try {
    const company = req.company;
    const report = await buildCompanyReport(company._id);
    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>${company.name} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
          .logo { width: 72px; height: 72px; object-fit: contain; border: 1px solid #ddd; border-radius: 8px; }
          h1,h2 { margin: 0 0 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #f6f7fb; }
        </style>
      </head>
      <body>
        <div class="header">
          <img class="logo" src="${company.image || ""}" alt="Company Logo" />
          <div>
            <h1>${company.name} Report</h1>
            <div>Office: ${company.companyLocation}</div>
            <div>Phone: ${company.companyPhone}</div>
            <div>Recruiter: ${company.recruiterName} (${company.recruiterPosition})</div>
            <div>Email: ${company.email}</div>
          </div>
        </div>
        <h2>Summary</h2>
        <table>
          <tr><th>Total Jobs</th><th>Total Applications</th><th>Longlisted</th><th>Shortlisted</th><th>Pending</th><th>Rejected</th></tr>
          <tr><td>${report.totals.jobs}</td><td>${report.totals.applications}</td><td>${report.totals.longlisted}</td><td>${report.totals.shortlisted}</td><td>${report.totals.pending}</td><td>${report.totals.rejected}</td></tr>
        </table>
      </body>
      </html>
    `;
    res.setHeader(
      "Content-Disposition",
      `inline; filename=${company.name.replace(/\s+/g, "_")}_report.html`
    );
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (error) {
    console.error("downloadCompanyReportPDF error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
