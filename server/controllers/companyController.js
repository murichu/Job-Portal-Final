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
  const { title, description, location, salary, level, category } = req.body;

  // Check if any required field is missing
  if (!title || !description || !location || !salary || !level || !category) {
    return res.status(400).json({
      success: false,
      message:
        "All fields (title, description, location, salary, level, category) are required.",
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
      salary,
      level,
      category,
      companyId,
      date: Date.now(),
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

        // Spread job directly since .lean() returns plain objects
        return { ...job, applicants };
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

    if (!['Pending', 'Accepted', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Pending, Accepted, or Rejected.',
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
    const application = await JobApplication.findOneAndUpdate(
      { _id: applicationId, companyId },
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('jobId', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or you are not authorized to update it.',
      });
    }

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

    // Toggle the job's visibility status (true → false or false → true)
    job.visible = !job.visible;

    // Save the updated job to the database
    await job.save();

    // Respond with a success message and the updated job
    res.json({
      success: true,
      message: "Job visibility updated successfully.",
      job,
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
