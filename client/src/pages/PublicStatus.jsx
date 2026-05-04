import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicStatus() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get("/api/incidents").then(res => setIncidents(res.data.incidents));
  }, []);

  const active = incidents.filter(i => i.status !== "resolved");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">System Status</h1>

      {active.length === 0 ? (
        <p className="text-green-600">All systems operational ✅</p>
      ) : (
        <div className="mt-4 space-y-2">
          {active.map(i => (
            <div key={i._id} className="bg-red-100 p-3">
              <p className="font-bold">{i.title}</p>
              <p>{i.message}</p>
              <p>Status: {i.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
