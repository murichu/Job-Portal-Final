import { useEffect } from "react";
import { io } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

export default function useLiveDashboard() {
  const qc = useQueryClient();

  useEffect(() => {
    const socket = io("/");

    socket.on("connect", () => {
      console.log("Dashboard socket connected");
    });

    socket.on("payment_update", () => {
      qc.invalidateQueries(["dashboard-admin"]);
    });

    socket.on("invoice_update", () => {
      qc.invalidateQueries(["dashboard-admin"]);
    });

    socket.on("refund_update", () => {
      qc.invalidateQueries(["dashboard-admin"]);
    });

    socket.on("alert", () => {
      qc.invalidateQueries(["dashboard-admin"]);
    });

    return () => socket.disconnect();
  }, [qc]);
}
