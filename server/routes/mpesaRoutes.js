import express from "express";
import { protectUser } from "../middleware/userAuth.js";
import { requireMpesaCallbackAllowed } from "../middleware/mpesaSecurity.js";
import { createStkPush, getPaymentStatus, handleMpesaCallback } from "../controllers/mpesaController.js";

const router = express.Router();

router.post("/stk-push", protectUser, createStkPush);
router.get("/status/:checkoutRequestId", protectUser, getPaymentStatus);
router.post("/callback", requireMpesaCallbackAllowed, handleMpesaCallback);

export default router;
