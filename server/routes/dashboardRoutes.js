import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import {
  getAdminFinanceDashboard,
  getCompanyDashboard,
  getPlatformDashboard,
} from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/admin-finance", protectUser, getAdminFinanceDashboard);
router.get("/company", protectUser, getCompanyDashboard);
router.get("/platform", protectUser, getPlatformDashboard);

export default router;
