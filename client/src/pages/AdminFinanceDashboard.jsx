import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminFinanceDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/finance/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setStats(res.data.stats));

    axios.get("/api/admin/finance/audit-logs", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setLogs(res.data.logs));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const chartData = [
    { name: "Revenue", value: stats.totalRevenue },
    { name: "Tax", value: stats.totalTax },
    { name: "Refunded", value: stats.refunded }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Finance Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">Revenue: {stats.totalRevenue}</div>
        <div className="bg-white p-4 rounded shadow">Tax: {stats.totalTax}</div>
        <div className="bg-white p-4 rounded shadow">Net: {stats.netRevenue}</div>
      </div>

      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <h2 className="text-xl font-semibold">Audit Logs</h2>
      <div className="bg-white p-4 rounded shadow space-y-2 max-h-80 overflow-y-auto">
        {logs.map(log => (
          <div key={log._id} className="text-sm">
            {log.action} - {log.amount} - {new Date(log.createdAt).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  );
}
