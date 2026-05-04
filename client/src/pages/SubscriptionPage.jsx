import { useEffect, useState } from "react";
import axios from "axios";

export default function SubscriptionPage({ token }) {
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    axios.get("/api/billing/subscription", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setSubscription(res.data.subscription));
  }, []);

  if (!subscription) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Subscription</h1>

      <div className="bg-white p-4 rounded-xl shadow">
        <p className="font-semibold">Plan: {subscription.plan}</p>
        <p>Status: {subscription.status}</p>
        <p>Next billing: {new Date(subscription.nextInvoiceAt).toLocaleDateString()}</p>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Upgrade Plan
      </button>
    </div>
  );
}
