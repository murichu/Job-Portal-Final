import express from "express";
import User from "../models/User.js";
import FileDownload from "../models/FileDownload.js";
import { protectUser } from "../middleware/userAuth.js";

const router = express.Router();

// Super admin: global system overview
router.get("/overview", protectUser, async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const users = await User.countDocuments();
  const downloads = await FileDownload.countDocuments({ status: "success" });

  res.json({ success: true, users, downloads });
});

export default router;
