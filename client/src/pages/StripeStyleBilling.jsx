import { useEffect, useState } from "react";
import axios from "axios";

export default function StripeStyleBilling({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/billing/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold">Billing Overview</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2>Total Revenue</h2>
          <p className="text-xl font-bold">{data.revenue[0]?.total || 0} KES</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2>Monthly Revenue</h2>
          {data.monthly.map(m => (
            <p key={m._id.month}>Month {m._id.month}: {m.total}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
