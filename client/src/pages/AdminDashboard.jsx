import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const socket = io(import.meta.env.VITE_API_URL);

export default function AdminDashboard({ token }) {
  const [downloads, setDownloads] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    axios.get("/api/user/resume/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setTotal(res.data.totalDownloads);
      setDownloads(res.data.recent.map(d => ({
        time: new Date(d.createdAt).toLocaleTimeString(),
        count: 1
      })));
    });
  }, []);

  useEffect(() => {
    socket.on("download", () => {
      setTotal(prev => prev + 1);
      setDownloads(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), count: 1 }
      ]);
    });

    return () => socket.off("download");
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-2">Total Downloads: {total}</p>

      <LineChart width={600} height={300} data={downloads}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" />
      </LineChart>
    </div>
  );
}
