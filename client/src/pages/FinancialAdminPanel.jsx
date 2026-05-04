import { useEffect, useState } from "react";
import axios from "axios";

export default function FinancialAdminPanel({ token }) {
  const [refunds, setRefunds] = useState([]);

  const fetchData = async () => {
    const res = await axios.get("/api/refund", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setRefunds(res.data.requests);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, action) => {
    await axios.patch(`/api/refund/${id}/${action}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Financial Admin Panel</h1>

      {refunds.map(r => (
        <div key={r._id} className="bg-white p-4 shadow rounded">
          <p><strong>User:</strong> {r.userId?.name}</p>
          <p><strong>Amount:</strong> {r.amount} KES</p>
          <p><strong>Status:</strong> {r.status}</p>
          <p><strong>Reason:</strong> {r.reason}</p>

          <div className="mt-2 space-x-2">
            {r.status === "pending_review" && (
              <>
                <button onClick={() => updateStatus(r._id, "approve")} className="bg-green-500 text-white px-2 py-1">Approve</button>
                <button onClick={() => updateStatus(r._id, "reject")} className="bg-red-500 text-white px-2 py-1">Reject</button>
              </>
            )}

            {r.status === "approved" && (
              <button onClick={() => updateStatus(r._id, "mark-processed")} className="bg-blue-500 text-white px-2 py-1">Mark Processed</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
