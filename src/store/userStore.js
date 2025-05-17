import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isCheckingAuth: false,
  isLoggingOut: false,
  isLoggingUp: false,
  signUp: async (details) => {
    try {
      set({ isSigningUp: true });
      const response = await axiosInstance.post("/user/signup", { details });
      if (response.status == 201) {
        set({ authUser: response.data });
        toast.success("User registered successfully");
        localStorage.setItem("token", JSON.stringify(response.data.token));
        return true;
      }
    } catch (error) {
      toast.error("something went wrong!");
      console.log(error);
    } finally {
      set({ isSigningUp: false });
    }
  },
  login: async (details) => {
    try {
      set({ isLoggingUp: true });
      const response = await axiosInstance.post("/user/login", { details });
      if (response.status == 201) {
        set({ authUser: response.data });
        toast.success("User loggedIn successfully");
        localStorage.setItem("token", JSON.stringify(response.data.token));
        return true;
      }
    } catch (error) {
      toast.error("something went wrong!");
      console.log(error);
    } finally {
      set({ isLoggingUp: false });
    }
  },
  logout: async () => {
    try {
      set({ isLoggingOut: true });
      const response = await axiosInstance.post("/user/logout");
      if (response.status == 201) {
        set({ authUser: null });
        toast.success("User logged out successfully");
        return true;
      }
    } catch (error) {
      toast.error("something went wrong!");
      console.log(error);
    } finally {
      set({ isLoggingOut: false });
    }
  },
  checkAuthDetails: async () => {
    try {
      set({ isCheckingAuth: true });
      const response = await axiosInstance.get("/user/check-auth");
      if (response.status === 200) {
        set({ authUser: response.data });
      }
    } catch (error) {
      set({ authUser: null });
      console.log(error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },
}));
