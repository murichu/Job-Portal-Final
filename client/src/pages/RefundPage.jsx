import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RefundPage({ token }) {
  const [invoiceId, setInvoiceId] = useState("");

  const requestRefund = async () => {
    try {
      await axios.post("/api/billing/refund", { invoiceId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Refund request submitted");
    } catch (err) {
      toast.error("Refund failed");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Request Refund</h1>
      <input
        value={invoiceId}
        onChange={(e) => setInvoiceId(e.target.value)}
        placeholder="Invoice ID"
        className="border p-2 w-full"
      />
      <button onClick={requestRefund} className="bg-red-500 text-white px-4 py-2 rounded">
        Request Refund
      </button>
    </div>
  );
}
