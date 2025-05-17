import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/userStore";
const SignUp = () => {
  const { signUp, authUser } = useAuthStore();
  const signupRef = useRef(null);
  const Navigate = useNavigate();
  const imageRef = useRef(null);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  useEffect(() => {
    if (authUser) {
      Navigate("/");
    } else {
      Navigate("/signup");
    }
  }, [authUser]);
  useGSAP(() => {
    // First animate the login box
    gsap.fromTo(
      signupRef.current,
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
    if (
      !details.name ||
      !details.email ||
      !details.password ||
      !details.phoneNumber
    ) {
      toast.error("All fields are required");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = validation();
    if (result) {
      const res = await signUp(details);
      if (res) {
        Navigate("/");
      }
    }
  };
  return (
    <div
      className="h-screen flex flex-col relative  items-center "
      ref={signupRef}
    >
      <img
        ref={imageRef}
        className="w-[50%] sm:w-[10%] mt-5"
        src="https://st5.depositphotos.com/20923550/70475/v/450/depositphotos_704757774-stock-illustration-cute-boy-laptop-cup-coffee.jpg"
        alt=""
      />
      <div className=" flex flex-col justify-center items-center">
        <h1 className="text-center font-bold text-3xl mb-5">
          Create Free Account
        </h1>{" "}
        <p className="relative  mb-5 text-sm">
          Already have an account?{" "}
          <span className="text-blue-500 underline underline-offset-4 decoration-1  ">
            <Link to="/login"> Sign in</Link>
          </span>
        </p>
        <p className="mx-auto  mb-5 justify-center items-center font-semibold">
          Enter your details here
        </p>
      </div>

      <form onSubmit={(e) => handleSubmit(e)}>
        {" "}
        <div className="flex flex-col w-[300px] sm:w-[500px] h-[40vh] ">
          {" "}
          <div className="flex flex-col gap-3 mb-5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 tracking-wide"
            >
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={details.name}
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, name: e.target.value }));
              }}
              className="border rounded p-2"
              placeholder="username"
            />
          </div>
          <div className="flex flex-col gap-3 mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 tracking-wide"
            >
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={details.email}
              id="email"
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, email: e.target.value }));
              }}
              className="border rounded p-2"
              placeholder="abc@example.com"
            />
          </div>{" "}
          <div className="flex flex-col gap-3 mb-5">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 tracking-wide"
            >
              Phone number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={details.phoneNumber}
              inputMode="numeric"
              maxLength="10"
              id="phoneNumber"
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  setDetails({ ...details, phoneNumber: value });
                }
              }}
              className="border rounded p-2"
              placeholder="Enter your phone number"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 tracking-wide"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={details.password}
              id="password"
              onChange={(e) => {
                setDetails((prev) => ({ ...prev, password: e.target.value }));
              }}
              className="border rounded p-2 mb-5"
              placeholder="••••••••"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-950 *:hover:shadow-xl transition-transform duration-300 font-semibold tracking-wide cursor-pointer mb-10"
            >
              Sign in
            </button>
          </div>
        </div>
      </form>
      <footer className="text-center text-sm text-gray-500 mt-10 pb-5 relative -bottom-40">
        © {new Date().getFullYear()} Devendra • All rights reserved
      </footer>
    </div>
  );
};

export default SignUp;
