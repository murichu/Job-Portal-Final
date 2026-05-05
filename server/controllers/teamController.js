import crypto from "crypto";
import TeamInvite from "../models/TeamInvite.js";
import User from "../models/User.js";

export const createTeamInvite = async (req, res) => {
  const { email, role } = req.body;

  const token = crypto.randomUUID();

  const invite = await TeamInvite.create({
    email,
    role,
    tenantId: req.user.tenantId,
    token,
  });

  res.json({ success: true, invite });
};

export const acceptTeamInvite = async (req, res) => {
  const invite = await TeamInvite.findOne({ token: req.params.token });
  if (!invite || invite.status !== "pending") return res.status(400).json({ message: "Invalid invite" });

  const user = await User.findOne({ email: invite.email });
  if (!user) return res.status(404).json({ message: "User not found" });

  user.role = invite.role;
  user.tenantId = invite.tenantId;
  await user.save();

  invite.status = "accepted";
  await invite.save();

  res.json({ success: true });
};
