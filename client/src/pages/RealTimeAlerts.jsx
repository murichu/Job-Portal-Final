import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

export default function RealTimeAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    socket.on("alert", (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => socket.off("alert");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Real-Time Alerts</h1>
      {alerts.map((a, i) => (
        <div key={i} className="bg-red-100 p-2 mt-2">
          {a.message}
        </div>
      ))}
    </div>
  );
}
