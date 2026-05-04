import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentHistory({ token }) {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get("/api/billing/history", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setPayments(res.data.payments));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Payment History</h1>
      {payments.map(p => (
        <div key={p._id} className="bg-white p-4 rounded-xl shadow">
          <p className="font-semibold">KES {p.amount}</p>
          <p className="text-sm text-gray-500">{p.status}</p>
          <p className="text-xs">{new Date(p.createdAt).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
