import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RevenueTrendChart({ data = [] }) {
  return (
    <div className="h-80 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Revenue Trend</h3>
        <p className="text-sm text-slate-500">Monthly paid invoice revenue.</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip formatter={(value) => [`KES ${value}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FinanceBreakdownChart({ stats = {} }) {
  const data = [
    { name: "Gross", value: Number(stats.totalRevenue || 0) },
    { name: "Tax", value: Number(stats.totalTax || 0) },
    { name: "Net", value: Number(stats.netRevenue || 0) },
    { name: "Refunds", value: Number(stats.refunded || 0) },
  ];

  return (
    <div className="h-80 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Finance Breakdown</h3>
        <p className="text-sm text-slate-500">Gross revenue, VAT, net, and refunds.</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" stroke="#64748b" />
          <YAxis stroke="#64748b" />
          <Tooltip formatter={(value) => [`KES ${value}`, "Amount"]} />
          <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0f172a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PaymentHealthChart({ stats = {} }) {
  const data = [
    { name: "Paid invoices", value: Number(stats.paidInvoices || 0) },
    { name: "Pending invoices", value: Number(stats.pendingInvoices || 0) },
    { name: "Failed invoices", value: Number(stats.failedInvoices || 0) },
    { name: "Suspicious payments", value: Number(stats.suspiciousPayments || 0) },
  ];

  return (
    <div className="h-80 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Payment Health</h3>
        <p className="text-sm text-slate-500">Invoice and payment risk distribution.</p>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>
            {data.map((entry) => (
              <Cell key={entry.name} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
