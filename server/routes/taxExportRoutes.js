import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { exportTaxReport } from "../controllers/taxExportController.js";

const router = express.Router();

router.get("/tax-report", protectUser, exportTaxReport);

export default router;
