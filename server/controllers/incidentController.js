import Incident from "../models/Incident.js";

export const createIncident = async (req, res) => {
  const incident = await Incident.create(req.body);
  res.json({ success: true, incident });
};

export const getIncidents = async (req, res) => {
  const incidents = await Incident.find().sort({ createdAt: -1 });
  res.json({ success: true, incidents });
};

export const updateIncident = async (req, res) => {
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
};
