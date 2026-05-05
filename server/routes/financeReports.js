import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getMonthlyFinanceReport } from "../controllers/financeReportController.js";

const router = express.Router();

router.get("/monthly", protectUser, getMonthlyFinanceReport);

export default router;
