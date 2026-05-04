import { useEffect, useState } from "react";
import axios from "axios";

export default function FraudDashboard({ token }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/fraud", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data.payments));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Fraud Dashboard</h1>
      {data.map(p => (
        <div key={p._id} className="bg-red-100 p-3 mt-2">
          {p.phone} — {p.fraudReason}
        </div>
      ))}
    </div>
  );
}
