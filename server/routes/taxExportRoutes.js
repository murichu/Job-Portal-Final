import express from "express";
import Invoice from "../models/Invoice.js";
import { protectUser } from "../middleware/userAuth.js";
import * as XLSX from "xlsx";

const router = express.Router();

router.get("/tax-report", protectUser, async (req, res) => {
  const { month, year, format = "csv" } = req.query;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const invoices = await Invoice.find({
    tenantId: req.user.tenantId,
    createdAt: { $gte: start, $lte: end },
    status: "paid"
  });

  const rows = invoices.map(inv => ({
    InvoiceNumber: inv.invoiceNumber,
    Date: inv.createdAt.toISOString(),
    Subtotal: inv.subtotal,
    VAT: inv.taxAmount,
    Total: inv.amount,
    Currency: inv.currency
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tax Report");

  if (format === "xlsx") {
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=tax-report-${month}-${year}.xlsx`);
    return res.send(buffer);
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=tax-report-${month}-${year}.csv`);
  res.send(csv);
});

export default router;
