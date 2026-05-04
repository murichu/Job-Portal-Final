import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function EmailAnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("/api/email-analytics/stats").then(res => setStats(res.data.stats));
  }, []);

  if (!stats) return <p>Loading...</p>;

  const data = [
    { name: "Sent", value: stats.sent },
    { name: "Opened", value: stats.opened },
    { name: "Clicked", value: stats.clicked },
    { name: "Failed", value: stats.failed }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Email Analytics</h1>
      <PieChart width={400} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={100}>
          {data.map((_, i) => (
            <Cell key={i} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
