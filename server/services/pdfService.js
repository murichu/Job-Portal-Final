import PDFDocument from "pdfkit";

export const generateInvoicePDF = (invoice) => {
  const doc = new PDFDocument();

  const chunks = [];
  doc.on("data", chunk => chunks.push(chunk));

  doc.fontSize(18).text("Invoice", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
  doc.text(`Amount: ${invoice.amount} ${invoice.currency || "KES"}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Date: ${new Date(invoice.createdAt).toLocaleString()}`);

  doc.end();

  return new Promise(resolve => {
    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(chunks);
      resolve(pdfBuffer);
    });
  });
};
