import { useEffect, useState } from "react";
import axios from "axios";
import KpiCard from "../components/dashboard/KpiCard";

export default function AdvancedAdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/dashboard/admin-finance").then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="p-6">Loading...</div>;

  const stats = data.stats;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Finance Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Revenue" value={`KES ${stats.totalRevenue}`} />
        <KpiCard title="Net" value={`KES ${stats.netRevenue}`} />
        <KpiCard title="Refunded" value={`KES ${stats.refunded}`} />
        <KpiCard title="Failed Payments" value={stats.failedPayments} />
      </div>

      <div>
        <h2 className="font-semibold">Recent Invoices</h2>
        <ul>
          {data.recentInvoices.map((inv) => (
            <li key={inv._id}>{inv.amount} - {inv.status}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
