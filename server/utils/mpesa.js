import axios from "axios";
import Buffer from "buffer";

const getAccessToken = async () => {
  const auth = Buffer.Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  return res.data.access_token;
};

export const stkPush = async ({ phone, amount, accountReference }) => {
  const token = await getAccessToken();

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);

  const password = Buffer.Buffer.from(
    process.env.MPESA_SHORTCODE +
      process.env.MPESA_PASSKEY +
      timestamp
  ).toString("base64");

  const res = await axios.post(
    "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: "Subscription Payment",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return res.data;
};
