import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/userStore";
import { Loader } from "lucide-react";
import Finding from "./pages/Finding";
import { useVideoStore } from "./store/videoStore";
import CallPage from "./pages/CallPage";
const App = () => {
  const { authUser, checkAuthDetails, isCheckingAuth } = useAuthStore();
  const { connectSocket } = useVideoStore();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthDetails();
  }, []);
  useEffect(() => {
    if (authUser) {
      connectSocket();
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [authUser]);
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin"></Loader>
      </div>
    );
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/video-share" element={<CallPage />} />
        <Route path="/finding-user" element={<Finding />} />
      </Routes>{" "}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default App;
