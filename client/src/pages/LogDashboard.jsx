import { useEffect, useState } from "react";
import axios from "axios";

export default function LogDashboard({ token }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    axios.get("/api/logs/logs", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setLogs(res.data.logs));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Log Monitoring</h1>
      <div className="mt-4 space-y-2">
        {logs.map((l, i) => (
          <div key={i} className="bg-black text-green-400 p-2 text-xs font-mono">
            {JSON.stringify(l)}
          </div>
        ))}
      </div>
    </div>
  );
}
