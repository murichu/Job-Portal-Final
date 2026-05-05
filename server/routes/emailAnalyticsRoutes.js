import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getEmailStats } from "../controllers/emailAnalyticsController.js";

const router = express.Router();

router.get("/stats", protectUser, getEmailStats);

export default router;
