import axios from "axios";
import crypto from "crypto";

const BASE_URL = "https://api.paystack.co";

const getSecret = () => {
  if (!process.env.PAYSTACK_SECRET) {
    throw new Error("PAYSTACK_SECRET is required.");
  }
  return process.env.PAYSTACK_SECRET;
};

export const initializePayment = async ({ email, amount, metadata = {}, callbackUrl }) => {
  const res = await axios.post(
    `${BASE_URL}/transaction/initialize`,
    {
      email,
      amount: Math.round(Number(amount) * 100),
      metadata,
      callback_url: callbackUrl || process.env.PAYSTACK_CALLBACK_URL,
    },
    {
      headers: {
        Authorization: `Bearer ${getSecret()}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data;
};

export const verifyPayment = async (reference) => {
  const res = await axios.get(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${getSecret()}` },
  });

  return res.data.data;
};

export const verifyPaystackSignature = (rawBody, signature) => {
  const hash = crypto.createHmac("sha512", getSecret()).update(rawBody).digest("hex");
  return hash === signature;
};
