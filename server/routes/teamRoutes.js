import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requirePermission } from "../middleware/permissions.js";
import { acceptTeamInvite, createTeamInvite } from "../controllers/teamController.js";

const router = express.Router();

router.post("/invite", protectUser, requirePermission("write:tenant"), createTeamInvite);
router.post("/accept/:token", acceptTeamInvite);

export default router;
