import { useEffect, useState } from "react";
import axios from "axios";

export default function IncidentDashboard({ token }) {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    axios.get("/api/incidents").then(res => setIncidents(res.data.incidents));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Incident Dashboard</h1>
      {incidents.map(i => (
        <div key={i._id} className="bg-yellow-100 p-3 mt-2">
          <p>{i.title} - {i.status}</p>
          <p>{i.message}</p>
        </div>
      ))}
    </div>
  );
}
