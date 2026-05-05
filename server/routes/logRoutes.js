import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";
import { getLogs } from "../controllers/logController.js";

const router = express.Router();

router.get("/logs", protectUser, requirePermission("read:tenant"), getLogs);

export default router;
