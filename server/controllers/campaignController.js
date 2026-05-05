import Campaign from "../models/Campaign.js";
import { emailQueue } from "../queues/emailQueue.js";

export const createCampaign = async (req, res) => {
  const campaign = await Campaign.create(req.body);
  res.json({ success: true, campaign });
};

export const sendCampaign = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);

  for (const email of campaign.recipients) {
    await emailQueue.add("sendEmail", {
      to: email,
      subject: campaign.subject,
      html: campaign.content,
    });
  }

  campaign.status = "sent";
  await campaign.save();

  res.json({ success: true });
};
