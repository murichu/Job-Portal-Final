import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function AuditLogsViewer({ token }) {
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchLogs = async () => {
    const params = { q, action, from, to, page, limit };
    const res = await axios.get("/api/admin/audit-logs", { ...auth, params });
    setLogs(res.data.logs || []);
    setTotal(res.data.total || 0);
  };

  useEffect(() => { fetchLogs(); }, [q, action, from, to, page]);

  const exportCSV = () => {
    const headers = ["Date", "User", "Action", "IP", "Details"];
    const rows = logs.map(l => [
      new Date(l.createdAt).toISOString(),
      l.userId?.email || l.userId?.name || "",
      l.action,
      l.ip || "",
      JSON.stringify(l.metadata || {})
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">Compliance</p>
            <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
            <p className="text-slate-500">Filter, review, and export administrative activity.</p>
          </div>
          <button onClick={exportCSV} className="rounded-xl bg-slate-900 px-4 py-2 text-white">Export CSV</button>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-3 md:grid-cols-4">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search user/email/action" className="rounded-xl border px-3 py-2" />
            <select value={action} onChange={(e)=>setAction(e.target.value)} className="rounded-xl border px-3 py-2">
              <option value="all">All actions</option>
              <option value="REFUND_APPROVED">REFUND_APPROVED</option>
              <option value="REFUND_REJECTED">REFUND_REJECTED</option>
              <option value="LOGIN">LOGIN</option>
              <option value="INVITE_SENT">INVITE_SENT</option>
            </select>
            <input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} className="rounded-xl border px-3 py-2" />
            <input type="date" value={to} onChange={(e)=>setTo(e.target.value)} className="rounded-xl border px-3 py-2" />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-3">Date</th>
                <th>User</th>
                <th>Action</th>
                <th>IP</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map(l => (
                <tr key={l._id}>
                  <td className="py-3">{new Date(l.createdAt).toLocaleString()}</td>
                  <td>{l.userId?.email || l.userId?.name}</td>
                  <td className="font-medium">{l.action}</td>
                  <td>{l.ip}</td>
                  <td className="text-slate-500">{JSON.stringify(l.metadata || {})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="rounded-lg border px-3 py-1 disabled:opacity-50">Prev</button>
          <p className="text-sm text-slate-500">Page {page} / {totalPages}</p>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="rounded-lg border px-3 py-1 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
