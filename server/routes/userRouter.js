import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  loginUser,
  registerUser,
  updateUserResume,
  authRateLimit,
} from "../controllers/userController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectUser, protectedRouteRateLimit, optionalAuth } from "../middleware/userAuth.js";
import { validateRequest } from "../middleware/validation.js";
import { userRegistrationSchema, userLoginSchema, jobApplicationSchema } from "../utils/validation.js";

const userRouter = express.Router();

// Register a user
userRouter.post(
  "/register",
  authRateLimit, // Apply rate limiting to registration
  upload.single("image"),
  validateRequest(userRegistrationSchema),
  handleUploadError,
  registerUser
);

// User login
userRouter.post("/login", authRateLimit, validateRequest(userLoginSchema), loginUser);

// @route   GET /user
// @desc    Get authenticated user's profile data
// @access  Private
userRouter.get("/user", protectedRouteRateLimit, protectUser, getUserData);

// @route   POST /apply
// @desc    Apply for a job
// @access  Private
userRouter.post("/apply", protectedRouteRateLimit, protectUser, validateRequest(jobApplicationSchema), applyForJob);

// @route   GET /applications
// @desc    Get all jobs the user has applied to
// @access  Private
userRouter.get("/applications", protectedRouteRateLimit, protectUser, getUserJobApplications);

// @route   POST /update-resume
// @desc    Update user's resume (uploaded via multipart/form-data)
// @access  Private
userRouter.post(
  "/update-resume",
  protectedRouteRateLimit,
  protectUser,
  upload.single("resume"), // Multer middleware for file upload
  handleUploadError, // Custom middleware to handle upload errors
  updateUserResume // Controller to save resume info
);

// @route   POST /logout
// @desc    Logout user (client-side mainly, but can be used for cleanup)
// @access  Private
userRouter.post("/logout", protectedRouteRateLimit, protectUser, (req, res) => {
  // Update last logout time or perform any server-side cleanup
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

export default userRouter;
