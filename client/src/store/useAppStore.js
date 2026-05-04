import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAppStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      paymentStatus: null,

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setPaymentStatus: (paymentStatus) => set({ paymentStatus }),
      logout: () => set({ user: null, token: null, paymentStatus: null }),
    }),
    {
      name: "job-portal-app-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
