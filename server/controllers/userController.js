import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import validator from "validator";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { v2 as cloudinary } from "cloudinary";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

// Rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register a user
// Handles creating a new user account with provided details such as name, email, password, etc.
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const imageFile = req.file;

  // Check for missing fields
  if (!name || !email || !password || !imageFile) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  // Sanitize inputs
  const sanitizedName = name.trim();
  const sanitizedEmail = email.trim().toLowerCase();

  // Validate name
  if (sanitizedName.length < 2 || sanitizedName.length > 50) {
    return res.status(400).json({
      success: false,
      message: "Name must be between 2 and 50 characters",
    });
  }

  // Validate email format
  if (!validator.isEmail(sanitizedEmail)) {
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
    // Check if user already exists
    const userAlreadyExists = await User.findOne({ email: sanitizedEmail });
    if (userAlreadyExists) {
      return res.status(409).json({
        success: false,
        message: "User already registered",
      });
    }

    // Hash password with higher salt rounds for better security
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // Upload image to Cloudinary with error handling
    let imageUpload;
    try {
      imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        folder: "user_profiles",
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

    // Create new user
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashPassword,
      image: imageUpload.secure_url,
    });

    // Return success with token
    return res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token: generateToken(user._id, "user"),
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Register User error:", error);

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

// User Login
// Authenticates a user using credentials (e.g., email and password) and returns a token/session
export const loginUser = async (req, res) => {
  const { email, password } = req.body; // Extract login credentials from the request body

  // Input validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const sanitizedEmail = email.trim().toLowerCase();

  // Validate email format
  if (!validator.isEmail(sanitizedEmail)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  try {
    // Check if a user with the provided email exists
    const user = await User.findOne({ email: sanitizedEmail }).select(
      "+password"
    );

    if (!user) {
      // If no user is found, return an error response
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // If passwords don't match, return an error response
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Update last login time
    try {
      user.lastLogin = new Date();
      await user.save();
    } catch (saveError) {
      // Log but don't fail login for this
      console.error("Failed to update last login:", saveError);
    }

    // If authentication is successful, return user details and a JWT token
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
      token: generateToken(user._id, "user"), // Generate a token for the session
      message: "Login successful",
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

// Get user data
// Retrieves detailed information about the currently logged-in user (profile, settings, etc.)
// Controller to get authenticated user data
export const getUserData = async (req, res) => {
  try {
    // Access the authenticated user object attached to the request (set by auth middleware)
    const user = req.user;

    // Respond with the user data
    res.json({ success: true, user });
    //console.log(user);
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

// Apply for Job
export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user._id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Validate jobId format
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID format",
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Check if job exists
    const jobData = await Job.findById(jobId);
    if (!jobData) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Check if job is visible
    if (!jobData.visible) {
      return res.status(400).json({
        success: false,
        message: "This job is no longer available",
      });
    }

    if (new Date(jobData.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Application deadline has passed for this job",
      });
    }

    // Check if already applied (with better error handling)
    const existingApplication = await JobApplication.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }

    // Create application
    await JobApplication.create({
      companyId: jobData.companyId,
      userId,
      jobId,
      date: Date.now(),
    });

    res
      .status(201)
      .json({ success: true, message: "Job applied successfully" });
  } catch (error) {
    if (error.code === 11000) {
      // MongoDB duplicate key error from unique index
      return res.status(400).json({
        success: false,
        message: "You have already applied for this job",
      });
    }
    console.error("applyForJob Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get user applied applications
export const getUserJobApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const [applications, total] = await Promise.all([
      JobApplication.find({ userId })
        .populate("companyId", "name email image")
        .populate("jobId", "title description location category level salary")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobApplication.countDocuments({ userId }),
    ]);

    res.status(200).json({
      success: true,
      applications,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: applications.length,
        totalApplications: total,
      },
    });
  } catch (error) {
    console.error("getUserJobApplications Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update user profile (Resume)
export const updateUserResume = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const resumeFile = req.file; // Changed from req.resumeFile to req.file

    const userData = await User.findById(userId);
    if (!userData) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (resumeFile?.path) {
      // Allow only PDF files
      const allowedTypes = ["application/pdf"];
      const allowedExtensions = [".pdf"];
      const fileExtension = resumeFile.originalname.toLowerCase().slice(-4);

      if (
        !allowedTypes.includes(resumeFile.mimetype) ||
        !allowedExtensions.includes(fileExtension)
      ) {
        return res.status(400).json({
          success: false,
          message: "Only PDF documents are allowed",
        });
      }

      // Upload to Cloudinary (PDF requires resource_type: "raw")
      const resumeUpload = await cloudinary.uploader.upload(resumeFile.path, {
        resource_type: "raw", // Needed for non-image files like PDFs
        folder: "resumes",
      });

      userData.resume = resumeUpload.secure_url;
      await userData.save();
    }

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("updateUserResume Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUserProfileCompleteness = async (req, res) => {
  try {
    const user = req.user;
    const checks = [
      Boolean(user.name),
      Boolean(user.email),
      Boolean(user.image),
      Boolean(user.resume),
    ];
    const completed = checks.filter(Boolean).length;
    const percent = Math.round((completed / checks.length) * 100);
    return res.json({
      success: true,
      completeness: percent,
      completed,
      totalChecks: checks.length,
    });
  } catch (error) {
    console.error("getUserProfileCompleteness error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
