import { useEffect, useState } from "react";
import axios from "axios";

export default function BillingDashboard({ token }) {
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    axios.get("/api/billing/subscription", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSub(res.data.sub));

    axios.get("/api/billing/invoices", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setInvoices(res.data.invoices));
  }, []);

  if (!sub) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Billing</h1>

      <div className="bg-white p-4 rounded shadow">
        <p>Plan: {sub.plan}</p>
        <p>Status: {sub.status}</p>
        <p>Next Billing: {new Date(sub.nextInvoiceAt).toLocaleDateString()}</p>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold">Invoices</h2>
        {invoices.map(inv => (
          <div key={inv._id} className="border-b py-2">
            {inv.amount} KES — {inv.status}
          </div>
        ))}
      </div>
    </div>
  );
}
