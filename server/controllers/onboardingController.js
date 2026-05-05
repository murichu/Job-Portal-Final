import bcrypt from "bcrypt";
import Company from "../models/Company.js";
import User from "../models/User.js";
import TenantSubscription from "../models/TenantSubscription.js";

export const onboardTenant = async (req, res) => {
  const { name, email, password, companyName } = req.body;

  const company = await Company.create({ name: companyName });

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
    tenantId: company._id,
  });

  await TenantSubscription.create({
    tenantId: company._id,
    monthlyAmount: 1000,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    nextInvoiceAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  res.json({ success: true, user });
};
