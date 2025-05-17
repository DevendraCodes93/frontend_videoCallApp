import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuthStore } from "../store/userStore";
import toast from "react-hot-toast";
const LoginPage = () => {
  const { login, authUser } = useAuthStore();
  const Navigate = useNavigate();
  const loginRef = useRef(null);
  const imageRef = useRef(null);
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (authUser) {
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [authUser]);
  useGSAP(() => {
    // First animate the login box
    gsap.fromTo(
      loginRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        onComplete: () => {
          // Blink effect for the image (fade out and in quickly)
          gsap.to(imageRef.current, {
            opacity: 0.2,
            yoyo: true,
            repeat: 1,
            duration: 0.2,
            ease: "power1.inOut",
          });
        },
      }
    );
  }, []);
  const validation = () => {
    if (!details.email || !details.password) {
      toast.error("All fields are required");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validation();
    if (result) {
      const res = await login(details);
      if (res) {
        Navigate("/");
      }
    }
  };
  return (
    <div
      className="h-screen flex flex-col relative  items-center "
      ref={loginRef}
    >
      <img
        ref={imageRef}
        className="w-[70%] sm:w-[10%] sm:mt-10 mt-5"
        src="https://png.pngtree.com/png-clipart/20230929/original/pngtree-teenage-video-call-3d-cartoon-character-illustration-png-image_13016335.png"
        alt=""
      />
      <div className=" flex flex-col justify-center items-center">
        <h1 className="mx-auto  font-bold text-3xl justify-center items-center mb-5">
          Welcome back
        </h1>
        <p className="mx-auto  mb-10 justify-center items-center">
          Please enter your details here
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        {" "}
        <div className="flex flex-col w-[300px] sm:w-[500px] h-[40vh] ">
          <div className="flex flex-col gap-3 mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 tracking-wide mb-1"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={details.email}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, email: e.target.value }));
              }}
              className="border rounded p-2"
              placeholder="abc@example.com"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 tracking-wide mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={details.password}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, password: e.target.value }));
              }}
              id="password"
              className="border rounded p-2"
              placeholder="••••••••"
            />
            <button className="bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-950 *:hover:shadow-xl transition-transform duration-300 font-semibold tracking-wide cursor-pointer">
              Sign in
            </button>
          </div>
        </div>
      </form>
      <p>
        Don't have an account?{" "}
        <span className="text-blue-500 underline underline-offset-4 decoration-1">
          <Link to="/signup"> Sign up</Link>
        </span>
      </p>
      <footer className="text-center text-sm text-gray-500 mt-10 pb-5 relative bottom-7">
        © {new Date().getFullYear()} Devendra • All rights reserved
      </footer>
    </div>
  );
};

export default LoginPage;
