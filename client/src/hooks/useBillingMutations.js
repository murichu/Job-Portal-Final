import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

export const useInitializePaystack = () => {
  return useMutation({
    mutationFn: async ({ email, amount }) => {
      const res = await axios.post("/api/paystack/initialize", { email, amount });
      return res.data.data;
    },
    onSuccess: (data) => {
      window.location.href = data.authorization_url;
    },
    onError: () => toast.error("Paystack initialization failed"),
  });
};

export const useMpesaSTK = () => {
  return useMutation({
    mutationFn: async ({ phone, amount }) => {
      const res = await axios.post("/api/mpesa/stk-push", { phone, amount });
      return res.data;
    },
    onSuccess: () => toast.success("M-Pesa prompt sent"),
    onError: () => toast.error("M-Pesa request failed"),
  });
};

export const useRequestRefund = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ invoiceId }) => {
      const res = await axios.post("/api/billing/refund", { invoiceId });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Refund requested");
      qc.invalidateQueries(["invoices"]);
    },
    onError: () => toast.error("Refund failed"),
  });
};

export const useEmailInvoice = () => {
  return useMutation({
    mutationFn: async (invoiceId) => {
      await axios.post(`/api/billing/invoice/${invoiceId}/email`);
    },
    onSuccess: () => toast.success("Invoice emailed"),
    onError: () => toast.error("Email failed"),
  });
};

export const useDownloadInvoice = () => {
  return (invoiceId) => {
    window.open(`/api/billing/invoice/${invoiceId}/pdf`);
  };
};
