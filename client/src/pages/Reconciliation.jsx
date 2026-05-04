import { useEffect, useState } from "react";
import axios from "axios";

export default function Reconciliation({ token }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/reconciliation", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setItems(res.data.data));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Reconciliation</h1>
      {items.map(i => (
        <div key={i._id} className="border-b py-2">
          {i.amount} — {i.status}
        </div>
      ))}
    </div>
  );
}
