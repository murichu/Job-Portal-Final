import { initializePayment, verifyPayment, verifyPaystackSignature } from "../services/paystackService.js";

export const initializePaystackPayment = async (req, res) => {
  const { email, amount } = req.body;
  const data = await initializePayment({ email, amount });
  res.json({ success: true, data });
};

export const verifyPaystackPayment = async (req, res) => {
  const data = await verifyPayment(req.params.reference);
  res.json({ success: true, data });
};

export const handlePaystackWebhook = async (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  if (!verifyPaystackSignature(req.body, signature)) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "charge.success") {
    // TODO: mark invoice as paid
    console.log("Payment success:", event.data.reference);
  }

  res.sendStatus(200);
};
