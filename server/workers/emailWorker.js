import { Worker } from "bullmq";
import IORedis from "ioredis";
import { sendEmail } from "../services/emailService.js";

const connection = new IORedis(process.env.REDIS_URL);

new Worker("emailQueue", async job => {
  const { to, subject, html } = job.data;
  await sendEmail({ to, subject, html });
}, { connection });
