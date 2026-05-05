import PDFDocument from "pdfkit";
import Invoice from "../models/Invoice.js";

export const getMonthlyFinanceReport = async (req, res) => {
  const { month, year } = req.query;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  const invoices = await Invoice.find({
    tenantId: req.user.tenantId,
    createdAt: { $gte: start, $lte: end },
    status: "paid",
  });

  const total = invoices.reduce((sum, i) => sum + i.amount, 0);
  const tax = invoices.reduce((sum, i) => sum + i.taxAmount, 0);

  const doc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=report-${month}-${year}.pdf`);

  doc.pipe(res);

  doc.fontSize(18).text("Monthly Financial Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Month: ${month}/${year}`);
  doc.text(`Total Revenue: KES ${total}`);
  doc.text(`Total Tax (VAT): KES ${tax}`);
  doc.text(`Net Revenue: KES ${total - tax}`);

  doc.moveDown();

  invoices.forEach((inv) => {
    doc.text(`Invoice ${inv.invoiceNumber} - ${inv.amount} (${inv.taxAmount} VAT)`);
  });

  doc.end();
};
