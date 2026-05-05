import express from "express";
import {
  accessResume,
  applyForJob,
  getUserData,
  getUserJobApplications,
  loginUser,
  logoutUser,
  registerUser,
  updateUserResume,
  getResumeAnalytics,
  getResumeSignedUrl,
  getUserProfileCompleteness,
  authRateLimit,
} from "../controllers/userController.js";
import upload, { handleUploadError } from "../config/multer.js";
import { protectUser, protectedRouteRateLimit } from "../middleware/userAuth.js";
import { validateRequest } from "../middleware/validation.js";
import { userRegistrationSchema, userLoginSchema, jobApplicationSchema } from "../utils/validation.js";

const userRouter = express.Router();

userRouter.post("/register", authRateLimit, upload.single("image"), validateRequest(userRegistrationSchema), handleUploadError, registerUser);
userRouter.post("/login", authRateLimit, validateRequest(userLoginSchema), loginUser);

userRouter.get("/user", protectedRouteRateLimit, protectUser, getUserData);

userRouter.post("/apply", protectedRouteRateLimit, protectUser, validateRequest(jobApplicationSchema), applyForJob);
userRouter.get("/applications", protectedRouteRateLimit, protectUser, getUserJobApplications);
userRouter.get("/profile-completeness", protectedRouteRateLimit, protectUser, getUserProfileCompleteness);

userRouter.post("/update-resume", protectedRouteRateLimit, protectUser, upload.single("resume"), handleUploadError, updateUserResume);

// Generate signed URL
userRouter.get("/resume/signed-url", protectedRouteRateLimit, protectUser, getResumeSignedUrl);

// Access with tracking
userRouter.get("/resume/access", accessResume);

// Analytics
userRouter.get("/resume/analytics", protectedRouteRateLimit, protectUser, getResumeAnalytics);

userRouter.post("/logout", protectedRouteRateLimit, protectUser, logoutUser);

export default userRouter;
