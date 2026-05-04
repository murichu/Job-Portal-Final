import express from "express";
import Campaign from "../models/Campaign.js";
import { emailQueue } from "../queues/emailQueue.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  const campaign = await Campaign.create(req.body);
  res.json({ success: true, campaign });
});

router.post("/send/:id", async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  for (const email of campaign.recipients) {
    await emailQueue.add("sendEmail", {
      to: email,
      subject: campaign.subject,
      html: campaign.content
    });
  }

  campaign.status = "sent";
  await campaign.save();

  res.json({ success: true });
});

export default router;
