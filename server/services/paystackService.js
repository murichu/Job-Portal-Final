import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;
const BASE_URL = "https://api.paystack.co";

export const initializePayment = async ({ email, amount, metadata }) => {
  const res = await axios.post(
    `${BASE_URL}/transaction/initialize`,
    { email, amount: amount * 100, metadata },
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.data; // authorization_url, reference
};

export const verifyPayment = async (reference) => {
  const res = await axios.get(`${BASE_URL}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  });

  return res.data.data;
};
