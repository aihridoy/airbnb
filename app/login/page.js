/* eslint-disable react/no-unescaped-entities */
"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { login } from "../action";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

const LoginPage = () => {
  const router = useRouter();
  const { update } = useSession();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuth = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleDemoCredentials = (type) => {
    if (type === "user") {
      setEmail("abul@gmail.com");
      setPassword("abul123");
    } else if (type === "admin") {
      setEmail("admin@gmail.com");
      setPassword("admin123");
    }
  };

  async function onSubmit(event) {
    event.preventDefault();

    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      const response = await login(formData);

      if (response?.error) {
        setError(response.error.message);
      } else {
        await update();
        toast.success("Login successful!", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
        });
        router.push("/");
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
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
        <div className="bg-surface rounded-2xl border border-hairline shadow-luxe w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-ink tracking-tight">
              Log in to Hotel Booking
            </h2>
            <p className="text-muted text-sm mt-2">
              Welcome back! Let's get you signed in.
            </p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleAuth}
              className="w-full flex items-center justify-center gap-2 border border-hairline rounded-full py-3 hover:bg-surface-alt transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.49 7.73 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.73 1 4.01 3.51 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-hairline" />
              <span className="mx-4 text-muted text-sm">or</span>
              <div className="flex-grow border-t border-hairline" />
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoCredentials("user")}
                  className="flex-1 bg-surface-alt text-ink rounded-lg py-2 text-sm hover:bg-hairline transition"
                >
                  Demo User
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoCredentials("admin")}
                  className="flex-1 bg-surface-alt text-ink rounded-lg py-2 text-sm hover:bg-hairline transition"
                >
                  Demo Admin
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-brass-dark text-cream rounded-full py-3 transition
                  ${isSubmitting ? "opacity-60 cursor-not-allowed" : "hover:bg-brass"}`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Processing…
                  </span>
                ) : (
                  "Continue"
                )}
              </button>
            </form>

            {error && (
              <p className="text-center text-red-600 text-sm font-medium">
                {error}
              </p>
            )}
          </div>

          <div className="text-center text-sm text-muted mt-6">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-brass-dark hover:underline">
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

export default LoginPage;
