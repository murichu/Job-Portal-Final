import { useEffect, useState } from "react";
import axios from "axios";

export default function CompanyDashboard({ token }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Company Dashboard</h1>
      <p>Total Downloads: {data.total}</p>
    </div>
  );
}
