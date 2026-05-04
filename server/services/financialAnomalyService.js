import Invoice from "../models/Invoice.js";
import MpesaPayment from "../models/MpesaPayment.js";
import SystemAlert from "../models/SystemAlert.js";
import { logger } from "../utils/logger.js";

const DEFAULT_HIGH_VALUE_THRESHOLD = Number(process.env.FINANCE_HIGH_VALUE_THRESHOLD || 100000);
const DEFAULT_FAILED_PAYMENT_THRESHOLD = Number(process.env.FINANCE_FAILED_PAYMENT_THRESHOLD || 5);

export const detectFinancialAnomalies = async ({ tenantId = null } = {}) => {
  const invoiceFilter = tenantId ? { tenantId } : {};
  const paymentFilter = tenantId ? { tenantId } : {};
  const alerts = [];

  const highValueInvoices = await Invoice.find({
    ...invoiceFilter,
    amount: { $gte: DEFAULT_HIGH_VALUE_THRESHOLD },
    status: "paid",
  }).limit(10);

  if (highValueInvoices.length) {
    alerts.push(await createFinanceAlert({
      type: "finance_high_value_invoice",
      severity: "high",
      message: `${highValueInvoices.length} high-value paid invoice(s) detected`,
      metadata: { count: highValueInvoices.length, threshold: DEFAULT_HIGH_VALUE_THRESHOLD },
    }));
  }

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const failedPayments = await MpesaPayment.countDocuments({
    ...paymentFilter,
    status: "failed",
    createdAt: { $gte: since },
  });

  if (failedPayments >= DEFAULT_FAILED_PAYMENT_THRESHOLD) {
    alerts.push(await createFinanceAlert({
      type: "finance_failed_payment_spike",
      severity: "critical",
      message: `${failedPayments} failed payment(s) detected in the last hour`,
      metadata: { failedPayments, windowMinutes: 60 },
    }));
  }

  const suspiciousPayments = await MpesaPayment.countDocuments({
    ...paymentFilter,
    suspicious: true,
    createdAt: { $gte: since },
  });

  if (suspiciousPayments > 0) {
    alerts.push(await createFinanceAlert({
      type: "finance_suspicious_payment",
      severity: "critical",
      message: `${suspiciousPayments} suspicious payment(s) detected in the last hour`,
      metadata: { suspiciousPayments, windowMinutes: 60 },
    }));
  }

  return alerts;
};

const createFinanceAlert = async ({ type, severity, message, metadata }) => {
  const alert = await SystemAlert.create({ type, severity, message, metadata });
  logger.warn({ type, severity, message, metadata });

  if (global.io) {
    global.io.emit("alert", { type, severity, message, metadata });
  }

  return alert;
};
