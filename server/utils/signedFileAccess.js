import crypto from "crypto";

const DEFAULT_TTL_SECONDS = 5 * 60;

const getSigningSecret = () => {
  const secret = process.env.FILE_ACCESS_SECRET || process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("FILE_ACCESS_SECRET or JWT_SECRET must be configured.");
  }

  return secret;
};

const base64UrlEncode = (value) =>
  Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

const base64UrlDecode = (value) => {
  const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
  return Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
};

const signPayload = (encodedPayload) =>
  crypto
    .createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

export const createSignedFileToken = ({ userId, fileUrl, ttlSeconds = DEFAULT_TTL_SECONDS }) => {
  if (!userId || !fileUrl) {
    throw new Error("userId and fileUrl are required to create a signed file token.");
  }

  const payload = {
    userId: String(userId),
    fileUrl,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };

  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
};

export const verifySignedFileToken = (token) => {
  if (!token || typeof token !== "string") {
    throw new Error("Missing signed file token.");
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Invalid signed file token format.");
  }

  const expectedSignature = signPayload(encodedPayload);

  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
    throw new Error("Invalid signed file token signature.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));

  if (!payload.exp || Date.now() / 1000 > payload.exp) {
    throw new Error("Signed file token has expired.");
  }

  return payload;
};
