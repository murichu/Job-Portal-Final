import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const roles = [
  { value: "support_agent", label: "Support Agent" },
  { value: "finance_viewer", label: "Finance Viewer" },
  { value: "finance_admin", label: "Finance Admin" },
  { value: "admin", label: "Company Admin" },
];

export default function TeamManagementDashboard({ token }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("finance_viewer");
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);

  const auth = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchTeam = async () => {
    const [membersRes, invitesRes] = await Promise.all([
      axios.get("/api/team/members", auth),
      axios.get("/api/team/invites", auth),
    ]);
    setMembers(membersRes.data.members || []);
    setInvites(invitesRes.data.invites || []);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const inviteMember = async () => {
    setLoading(true);
    try {
      await axios.post("/api/team/invite", { email, role }, auth);
      setEmail("");
      await fetchTeam();
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, nextRole) => {
    await axios.patch(`/api/team/members/${userId}/role`, { role: nextRole }, auth);
    await fetchTeam();
  };

  const removeMember = async (userId) => {
    await axios.patch(`/api/team/members/${userId}/remove`, {}, auth);
    await fetchTeam();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-blue-600">Team & Access</p>
          <h1 className="text-3xl font-bold text-slate-900">Team Management</h1>
          <p className="text-slate-500">Invite finance users, assign roles, and manage tenant access.</p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Invite teammate</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px_140px]">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="finance@company.com"
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
            <button
              onClick={inviteMember}
              disabled={loading || !email}
              className="rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send invite"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Members</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-3">Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m._id}>
                      <td className="py-3 font-medium text-slate-900">{m.name}</td>
                      <td className="text-slate-600">{m.email}</td>
                      <td>
                        <select
                          value={m.role}
                          onChange={(e) => updateRole(m._id, e.target.value)}
                          className="rounded-lg border border-slate-300 px-2 py-1"
                        >
                          {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                      <td className="text-right">
                        <button onClick={() => removeMember(m._id)} className="rounded-lg px-3 py-1 text-red-600 hover:bg-red-50">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">Pending invites</h2>
            <div className="mt-4 space-y-3">
              {invites.map((i) => (
                <div key={i._id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{i.email}</p>
                  <p className="text-sm text-slate-500">{i.role} · {i.status}</p>
                </div>
              ))}
              {!invites.length && <p className="text-sm text-slate-500">No pending invites.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
