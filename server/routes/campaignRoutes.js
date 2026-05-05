import express from "express";
import { createCampaign, sendCampaign } from "../controllers/campaignController.js";

const router = express.Router();

router.post("/create", createCampaign);
router.post("/send/:id", sendCampaign);

export default router;
