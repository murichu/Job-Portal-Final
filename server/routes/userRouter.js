import express from "express";
import crypto from "crypto";
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
import FileDownload from "../models/FileDownload.js";

const userRouter = express.Router();

const hashUrl = (url) => crypto.createHash("sha256").update(url).digest("hex");

userRouter.post("/register", authRateLimit, upload.single("image"), validateRequest(userRegistrationSchema), handleUploadError, registerUser);
userRouter.post("/login", authRateLimit, validateRequest(userLoginSchema), loginUser);

userRouter.get("/user", protectedRouteRateLimit, protectUser, getUserData);

userRouter.post("/apply", protectedRouteRateLimit, protectUser, validateRequest(jobApplicationSchema), applyForJob);
userRouter.get("/applications", protectedRouteRateLimit, protectUser, getUserJobApplications);
userRouter.get("/profile-completeness", protectedRouteRateLimit, protectUser, getUserProfileCompleteness);

userRouter.post("/update-resume", protectedRouteRateLimit, protectUser, upload.single("resume"), handleUploadError, updateUserResume);

// Generate signed URL
userRouter.get("/resume/signed-url", protectedRouteRateLimit, protectUser, (req, res) => {
  try {
    const resumeUrl = req.user?.resume;
    if (!resumeUrl) return res.status(404).json({ success: false, message: "No resume found" });

    const token = createSignedFileToken({ userId: req.userId, fileUrl: resumeUrl });
    return res.json({ success: true, url: `/api/user/resume/access?token=${token}` });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Access with tracking
userRouter.get("/resume/access", async (req, res) => {
  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "";

  try {
    const payload = verifySignedFileToken(req.query.token);

    await FileDownload.create({
      ownerUserId: payload.userId,
      fileType: "resume",
      fileUrlHash: hashUrl(payload.fileUrl),
      status: "success",
      ipAddress: ip,
      userAgent,
    });

    return res.redirect(payload.fileUrl);
  } catch (error) {
    await FileDownload.create({
      ownerUserId: null,
      fileType: "resume",
      fileUrlHash: "invalid",
      status: "invalid",
      ipAddress: ip,
      userAgent,
      reason: error.message,
    });

    return res.status(403).json({ success: false, message: "Invalid or expired link" });
  }
});

// Analytics
userRouter.get("/resume/analytics", protectedRouteRateLimit, protectUser, async (req, res) => {
  const userId = req.userId;

  const totalDownloads = await FileDownload.countDocuments({ ownerUserId: userId, status: "success" });

  const recent = await FileDownload.find({ ownerUserId: userId }).sort({ createdAt: -1 }).limit(10);

  const byStatus = await FileDownload.aggregate([
    { $match: { ownerUserId: userId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  res.json({ success: true, totalDownloads, recent, byStatus });
});

userRouter.post("/logout", protectedRouteRateLimit, protectUser, (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

export default userRouter;
