import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { getAlerts } from "../controllers/monitorController.js";

const router = express.Router();

router.get("/alerts", protectUser, getAlerts);

export default router;
