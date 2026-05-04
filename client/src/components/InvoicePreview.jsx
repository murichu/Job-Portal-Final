export default function InvoicePreview({ invoice }) {
  const handlePrint = () => window.print();

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold">Invoice</h1>
      <p>Amount: {invoice.amount} KES</p>
      <p>Status: {invoice.status}</p>

      <div className="mt-4 space-x-2">
        <button onClick={handlePrint} className="bg-blue-500 text-white px-3 py-1">Print</button>
        <button className="bg-green-500 text-white px-3 py-1">Download</button>
        <button className="bg-purple-500 text-white px-3 py-1">Share</button>
      </div>
    </div>
  );
}
