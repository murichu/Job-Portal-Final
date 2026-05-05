import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getSystemOverview } from "../controllers/superAdminController.js";

const router = express.Router();

// Super admin: global system overview
router.get("/overview", protectUser, getSystemOverview);

export default router;
