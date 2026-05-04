import express from "express";
import Incident from "../models/Incident.js";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";

const router = express.Router();

router.post("/", protectUser, requirePermission("write:tenant"), async (req, res) => {
  const incident = await Incident.create(req.body);
  res.json({ success: true, incident });
});

router.get("/", async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json({ success: true, incidents });
});

router.patch("/:id/update", protectUser, requirePermission("write:tenant"), async (req, res) => {
  const { status, message } = req.body;

  const incident = await Incident.findById(req.params.id);
  if (!incident) return res.status(404).json({ message: "Not found" });

  incident.status = status;
  incident.updates.push({ status, message, createdBy: req.user._id });

  if (status === "resolved") {
    incident.resolvedAt = new Date();
  }

  await incident.save();

  res.json({ success: true, incident });
});

export default router;
