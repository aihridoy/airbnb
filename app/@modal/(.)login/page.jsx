/* eslint-disable react/no-unescaped-entities */
"use client";

import { login } from "@/app/action";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const LoginModal = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = () => {
    signIn("google", { callbackUrl: "/" });
  };

  async function onSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData(event.currentTarget);
      const response = await login(formData);

      if (response?.error) {
        setError(response.error.message);
      } else {
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        setTimeout(() => {
          router.push("/");
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setError("Check your credentials");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl w-96 p-6 relative shadow-black/50">
          {/* ── close button ─────────────────────────── */}
          <button
            id="closeModalBtn"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          >
            <i className="ph-x text-2xl" />
          </button>

          {/* ── header ──────────────────────────────── */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Log in to Hotel Booking
            </h2>
            <p className="text-gray-600 text-sm mt-2">
              Welcome back! Let's get you signed in.
            </p>
          </div>

          {/* ── auth buttons / form ─────────────────── */}
          <div className="space-y-4 mb-4">
            {/* Google auth */}
            <button
              onClick={handleAuth}
              className="w-full flex items-center justify-center border border-gray-300 rounded-full py-3 hover:bg-gray-50 transition"
            >
              {/* (icon omitted for brevity) */}
              Continue with Google
            </button>

            {/* divider */}
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            {/* email/password form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-full border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-primary text-white rounded-full py-3 transition
                ${
                  isSubmitting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-primary"
                }
              `}
              >
                {/* spinner or label */}
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-white mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"
                      />
                    </svg>
                    Processing…
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {/* error message */}
            {error && (
              <p className="text-center text-red-600 text-sm font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default LoginModal;
