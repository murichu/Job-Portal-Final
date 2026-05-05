import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requireAdmin } from "../middleware/adminAuth.js";
import { getGlobalAnalytics } from "../controllers/adminController.js";

const router = express.Router();

// Global analytics
router.get("/analytics", protectUser, requireAdmin, getGlobalAnalytics);

export default router;
