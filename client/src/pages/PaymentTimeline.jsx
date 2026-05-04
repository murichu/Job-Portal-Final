import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentTimeline({ token }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/reconciliation", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setEvents(res.data.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Payment Timeline</h1>
      {events.map(e => (
        <div key={e._id} className="border-l-2 pl-4 mt-2">
          <p>{new Date(e.createdAt).toLocaleString()}</p>
          <p>{e.status} - {e.amount} KES</p>
        </div>
      ))}
    </div>
  );
}
