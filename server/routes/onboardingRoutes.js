import express from "express";
import { onboardTenant } from "../controllers/onboardingController.js";

const router = express.Router();

router.post("/", onboardTenant);

export default router;
