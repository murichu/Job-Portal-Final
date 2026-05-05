import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";
import { createIncident, getIncidents, updateIncident } from "../controllers/incidentController.js";

const router = express.Router();

router.post("/", protectUser, requirePermission("write:tenant"), createIncident);
router.get("/", getIncidents);
router.patch("/:id/update", protectUser, requirePermission("write:tenant"), updateIncident);

export default router;
