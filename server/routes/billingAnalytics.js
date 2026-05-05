import express from "express";
import { getBillingAnalytics } from "../controllers/billingAnalyticsController.js";

const router = express.Router();

router.get("/analytics", getBillingAnalytics);

export default router;
