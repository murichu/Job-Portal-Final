import { useEffect, useState } from "react";
import axios from "axios";

export default function AnalyticsDashboard({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/insights/kpis", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  const { kpis, monthlyRevenue } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics & KPIs</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow">Revenue: {kpis.revenue} KES</div>
        <div className="bg-white p-4 shadow">Users: {kpis.users}</div>
        <div className="bg-white p-4 shadow">Active Sessions: {kpis.activeSessions}</div>
      </div>

      <div className="bg-white p-4 shadow">
        <h2>Monthly Revenue</h2>
        {monthlyRevenue.map(m => (
          <p key={m._id.month}>{m._id.month}/{m._id.year} — {m.revenue}</p>
        ))}
      </div>
    </div>
  );
}
