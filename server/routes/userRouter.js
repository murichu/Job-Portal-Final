import express from "express";
import {
  applyForJob,
  getUserData,
  getUserJobApplications,
  loginUser,
  registerUser,
  updateUserResume,
  getUserProfileCompleteness,
  authRateLimit,
} from "../controllers/userController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectUser, protectedRouteRateLimit } from "../middleware/userAuth.js";
import { validateRequest } from "../middleware/validation.js";
import { userRegistrationSchema, userLoginSchema, jobApplicationSchema } from "../utils/validation.js";
import { createSignedFileToken, verifySignedFileToken } from "../utils/signedFileAccess.js";

const userRouter = express.Router();

// Register a user
userRouter.post(
  "/register",
  authRateLimit,
  upload.single("image"),
  validateRequest(userRegistrationSchema),
  handleUploadError,
  registerUser
);

// Login
userRouter.post("/login", authRateLimit, validateRequest(userLoginSchema), loginUser);

// Profile
userRouter.get("/user", protectedRouteRateLimit, protectUser, getUserData);

// Applications
userRouter.post("/apply", protectedRouteRateLimit, protectUser, validateRequest(jobApplicationSchema), applyForJob);
userRouter.get("/applications", protectedRouteRateLimit, protectUser, getUserJobApplications);
userRouter.get("/profile-completeness", protectedRouteRateLimit, protectUser, getUserProfileCompleteness);

// Upload resume
userRouter.post(
  "/update-resume",
  protectedRouteRateLimit,
  protectUser,
  upload.single("resume"),
  handleUploadError,
  updateUserResume
);

// 🔐 Generate signed resume access URL
userRouter.get("/resume/signed-url", protectedRouteRateLimit, protectUser, (req, res) => {
  try {
    const resumeUrl = req.user?.resume;

    if (!resumeUrl) {
      return res.status(404).json({ success: false, message: "No resume found" });
    }

    const token = createSignedFileToken({
      userId: req.userId,
      fileUrl: resumeUrl,
    });

    return res.json({
      success: true,
      url: `/api/user/resume/access?token=${token}`,
    });
  } catch (error) {
    console.error("Signed URL error:", error);
    res.status(500).json({ success: false, message: "Failed to generate URL" });
  }
});

// 🔐 Secure file access endpoint
userRouter.get("/resume/access", async (req, res) => {
  try {
    const { token } = req.query;

    const payload = verifySignedFileToken(token);

    // Optional: enforce ownership
    // (you could also re-fetch user if needed)

    return res.redirect(payload.fileUrl);
  } catch (error) {
    console.error("Access error:", error.message);
    return res.status(403).json({ success: false, message: "Invalid or expired link" });
  }
});

// Logout
userRouter.post("/logout", protectedRouteRateLimit, protectUser, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default userRouter;
