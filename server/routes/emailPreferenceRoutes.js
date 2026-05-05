import express from "express";
import { unsubscribeEmail, updateEmailPreferences } from "../controllers/emailPreferenceController.js";

const router = express.Router();

router.get("/unsubscribe/:token", unsubscribeEmail);
router.post("/preferences", updateEmailPreferences);

export default router;
