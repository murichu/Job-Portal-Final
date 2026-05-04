import { Link } from "react-router-dom";

export default function SaaSLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow p-4 space-y-4">
        <h2 className="font-bold text-xl">Medicore</h2>
        <nav className="space-y-2">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/analytics">Analytics</Link>
          <Link to="/billing">Billing</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
