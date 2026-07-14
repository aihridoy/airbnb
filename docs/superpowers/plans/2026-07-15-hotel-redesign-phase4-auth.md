# Hotel Redesign — Phase 4: Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the login/register pages and their intercepted-route modal counterparts to the luxury-minimal design system, and fix a real bug: the register modal's close button does nothing (no `onClick`, and its icon class isn't even loaded), and the login modal has no close button at all.

**Architecture:** This app has 4 independent auth surfaces — `app/login/page.js` and `app/register/page.js` (full-page routes, reached directly or on refresh) and `app/@modal/(.)login/page.jsx` / `app/@modal/(.)register/page.js` (the same forms rendered as an overlay when navigated to via client-side `<Link>`, per Next.js intercepting-routes convention). Each is a separate, nearly-duplicate implementation (pre-existing pattern in this codebase, not introduced by this phase) — all 4 tasks are independent of each other and of any other file. `app/@modal/default.js` (returns `null`) needs no change.

**Tech Stack:** Next.js 14 (app router, intercepting routes), Tailwind CSS 3.4 (Phase 0 tokens), framer-motion 12, lucide-react, `lib/motion.js`, next-auth (Google OAuth), react-toastify.

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — spec §7 Phase 4.

## Bug Found While Reading These Files (fixed as part of this phase)

The two full-page routes (`app/login/page.js`, `app/register/page.js`) have no close/dismiss control (expected — they're standalone pages, not overlays). But the two **modals** are supposed to be dismissible overlays and are broken:
- `app/@modal/(.)login/page.jsx` (`LoginModal`) has **no close button at all** — a user who opens it via client-side navigation has no way to dismiss it except the browser back button, which isn't a visible affordance.
- `app/@modal/(.)register/page.js` (`RegistrationModal`) has a close button (`id="closeModalBtn"`) but it has **no `onClick` handler** — clicking it does nothing. Its icon (`<i className="ph-x">`) is also a Phosphor Icons class with no Phosphor stylesheet loaded anywhere in this app (same class of bug already fixed once in Phase 3's `Hotel.jsx` `ph-bed` icon), so the icon doesn't even render.

Both are fixed in Tasks 3 and 4 by adding a real `lucide-react` `X` button wired to `router.back()` — the standard dismiss pattern for a Next.js intercepting-route modal (returning to whatever route was underneath).

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`. `brass` decorative-only; text/icon contrast uses `brass-dark`.
- No emoji/Phosphor/Font Awesome icon classes — lucide-react only. The Google "G" logo SVGs are kept as-is in all 4 files (official multi-color brand mark, not a decorative icon needing migration).
- `app/template.js` (Phase 1, already merged) already wraps every route's page content with a fade+slide-up entrance — this covers `app/login/page.js` and `app/register/page.js` automatically. Do **not** add a second entrance animation in those two files; that would stack two entrance animations and exceed the "max 1-2 animated elements" cap.
- The two modals (`app/@modal/(.)login/page.jsx`, `app/@modal/(.)register/page.js`) are rendered through the `{modal}` slot in `app/layout.js`, which is a sibling to `{children}` — `app/template.js` does **not** wrap them. They need their own entrance motion, which is why Tasks 3 and 4 add a one-time backdrop-fade + card-scale-in (gated by `useReducedMotion()`), the only place in this phase that adds new motion.
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.
- All demo-credential buttons, Google OAuth wiring, form validation, `toast` calls, and redirect logic are preserved byte-identical in every task — only markup/classes/icons change (plus the two close-button fixes noted above).

---

### Task 1: Restyle `app/login/page.js`

**Files:**
- Modify: `app/login/page.js`

**Interfaces:**
- No exports change — same default export `LoginPage`.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import { signIn } from "next-auth/react";
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
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary\|bg-gray-100" app/login/page.js
grep -q 'Loader2 } from "lucide-react"' app/login/page.js && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/login/page.js
git commit -m "feat: restyle login page with luxury tokens"
```

---

### Task 2: Restyle `app/register/page.js`

**Files:**
- Modify: `app/register/page.js`

**Interfaces:**
- No exports change — same default export `RegistrationPage`.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";

const RegistrationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      await response.json();
      toast.success("Registration successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 1200,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e) => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center py-5">
        <div className="bg-surface rounded-2xl border border-hairline shadow-luxe w-full max-w-md p-8">
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl text-ink">Register for Hotel Booking</h2>
            <p className="text-muted text-sm mt-2">Join us and enjoy seamless bookings.</p>
          </div>
          <div className="space-y-4 mb-6">
            <button
              onClick={handleAuth}
              className="w-full flex items-center justify-center border border-hairline rounded-full py-3 hover:bg-surface-alt transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" className="mr-3">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Sign up with Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-hairline"></div>
              <span className="mx-4 text-muted text-sm">or</span>
              <div className="flex-grow border-t border-hairline"></div>
            </div>
            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="text"
                name="location"
                id="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brass-dark text-cream rounded-full py-3 hover:bg-brass transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing Up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            {error && <p className="text-red-600 text-center">{error}</p>}
          </div>
          <div className="text-center text-sm text-muted">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-brass-dark hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default RegistrationPage;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary\|bg-gray-100" app/register/page.js
grep -q 'Loader2 } from "lucide-react"' app/register/page.js && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/register/page.js
git commit -m "feat: restyle register page with luxury tokens"
```

---

### Task 3: Restyle `app/@modal/(.)login/page.jsx` (and add a working close button)

**Files:**
- Modify: `app/@modal/(.)login/page.jsx`

**Interfaces:**
- Consumes: `luxeEase` from `lib/motion.js` (Phase 0).
- No exports change — same default export `LoginModal`.
- **Bug fix:** this modal previously had no close/dismiss button at all. Adds a `lucide-react` `X` button wired to `router.back()` (the `useRouter` instance already exists in this file for the post-login redirect).

- [ ] **Step 1: Replace the file contents**

```jsx
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
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { luxeEase } from "@/lib/motion";

const LoginModal = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const prefersReducedMotion = useReducedMotion();

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
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: luxeEase }}
          className="bg-surface rounded-2xl border border-hairline shadow-luxe w-full max-w-md p-8 relative"
        >
          <button
            onClick={() => router.back()}
            aria-label="Close"
            className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl text-ink tracking-tight">
              Welcome to Hotel Booking
            </h2>
            <p className="text-muted text-sm mt-2">Sign in to access your account</p>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleAuth}
              className="w-full flex items-center justify-center gap-2 border border-hairline rounded-lg py-3 bg-surface hover:bg-surface-alt transition duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4.01 20.49 7.73 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.73 1 4.01 3.51 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-hairline" />
              <span className="mx-4 text-muted text-sm">OR</span>
              <div className="flex-grow border-t border-hairline" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass transition"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass transition"
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
                  "Sign In"
                )}
              </button>
            </form>

            {error && (
              <p className="text-center text-red-500 text-sm font-medium">{error}</p>
            )}
          </div>

          <div className="text-center text-sm text-muted mt-6">
            <p>
              Don't have an account?{" "}
              <Link href="/register" className="text-brass-dark hover:underline font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
      <ToastContainer />
    </>
  );
};

export default LoginModal;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'X } from "lucide-react"' "app/@modal/(.)login/page.jsx" && echo OK
grep -q "router.back()" "app/@modal/(.)login/page.jsx" && echo CLOSE_OK
grep -q 'from "@/lib/motion"' "app/@modal/(.)login/page.jsx" && echo MOTION_OK
```
Expected:
```
OK
CLOSE_OK
MOTION_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/@modal/(.)login/page.jsx"
git commit -m "fix: add missing close button to login modal, restyle with luxury tokens"
```

---

### Task 4: Restyle `app/@modal/(.)register/page.js` (and fix the broken close button)

**Files:**
- Modify: `app/@modal/(.)register/page.js`

**Interfaces:**
- Consumes: `luxeEase` from `lib/motion.js` (Phase 0).
- No exports change — same default export `RegistrationModal`.
- **Bug fix:** the old close button (`id="closeModalBtn"`, `<i className="ph-x">`) had no `onClick` and an unloaded icon font class, so it was completely non-functional. Replaced with a working `lucide-react` `X` button wired to `router.back()`.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { luxeEase } from "@/lib/motion";

const RegistrationModal = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      await response.json();

      toast.success("Registration successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 1200,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);

      toast.error("Registration failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = (e) => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <>
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: luxeEase }}
          className="bg-surface rounded-2xl border border-hairline shadow-luxe w-full max-w-md p-8 relative"
        >
          <button
            onClick={() => router.back()}
            aria-label="Close"
            className="absolute top-4 right-4 text-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl text-ink">Register for Hotel Booking</h2>
            <p className="text-muted text-sm mt-2">Join us and enjoy seamless bookings.</p>
          </div>
          <div className="space-y-4 mb-4">
            <button
              onClick={handleAuth}
              className="w-full flex items-center justify-center border border-hairline rounded-full py-3 hover:bg-surface-alt transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48" className="mr-3">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
              Sign up with Google
            </button>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-hairline"></div>
              <span className="mx-4 text-muted text-sm">or</span>
              <div className="flex-grow border-t border-hairline"></div>
            </div>
            <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
                required
              />
              <input
                type="text"
                name="location"
                id="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full border border-hairline rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brass"
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-brass-dark text-cream rounded-full py-3 transition ${
                  loading ? "opacity-60 cursor-not-allowed" : "hover:bg-brass"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Signing Up...
                  </span>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>
            {error && (
              <p className="text-center text-red-600 text-sm font-medium">{error}</p>
            )}
          </div>
          <div className="text-center text-sm text-muted">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="text-brass-dark hover:underline">Log in</Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
      <ToastContainer />
    </>
  );
};

export default RegistrationModal;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "ph-x\|closeModalBtn" "app/@modal/(.)register/page.js"
grep -q "router.back()" "app/@modal/(.)register/page.js" && echo CLOSE_OK
grep -q 'from "@/lib/motion"' "app/@modal/(.)register/page.js" && echo MOTION_OK
```
Expected:
```
0
CLOSE_OK
MOTION_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/@modal/(.)register/page.js"
git commit -m "fix: register modal close button had no handler, wire it to router.back()"
```

---

### Task 5: Restyle both login/register `error.js` files

**Files:**
- Modify: `app/login/error.js`
- Modify: `app/register/error.js`

**Interfaces:**
- No exports change — both remain `export default function Error({ error, reset })`.
- Both files are currently byte-identical (and identical to the `error.js` files restyled in Phase 3); this task applies the same replacement to both.

- [ ] **Step 1: Replace both files' contents with this (same content for both paths)**

```jsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="font-serif text-lg text-ink mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-4">{error?.message || "Please try again."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-brass-dark text-cream hover:bg-brass transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary" app/login/error.js app/register/error.js
```
Expected:
```
app/login/error.js:0
app/register/error.js:0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/login/error.js app/register/error.js
git commit -m "feat: restyle login and register error boundaries with luxury tokens"
```

---

### Task 6: Restyle both login/register `loading.js` files

**Files:**
- Modify: `app/login/loading.js`
- Modify: `app/register/loading.js`

**Interfaces:**
- No exports change — both remain `export default function Loading()`.
- Both files are currently byte-identical; this task applies the same replacement to both. These are simple, fast client-rendered routes/modals — a full composed skeleton is unnecessary (YAGNI); this just re-tokens the existing spinner.

- [ ] **Step 1: Replace both files' contents with this (same content for both paths)**

```jsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-hairline border-t-brass-dark" />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "border-t-primary" app/login/loading.js app/register/loading.js
```
Expected:
```
app/login/loading.js:0
app/register/loading.js:0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/login/loading.js app/register/loading.js
git commit -m "feat: restyle login and register loading spinners with luxury tokens"
```

---

## Self-Review

**Spec coverage:** §7 Phase 4 lists `app/login`, `app/register`, `app/@modal` intercepted modals — all 4 surfaces (2 pages + 2 modals) covered across Tasks 1-4, plus their `error.js`/`loading.js` (Tasks 5-6). `app/@modal/default.js` correctly needs no change (returns `null`, nothing to restyle).

**Bug-fix scope check:** Both close-button fixes (Tasks 3-4) are narrowly scoped to the two modal files already being restyled — no speculative fixes elsewhere.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected output.

**Type/name consistency:** `luxeEase` imported from `@/lib/motion` exactly as Phase 0 exports it, used identically in both modal tasks. `router.back()` is the same dismiss pattern in both Task 3 and Task 4.

**Motion-cap check:** Confirmed `app/template.js` (Phase 1) does not wrap the `{modal}` slot, so the entrance motion added in Tasks 3-4 is not a duplicate of the page-level transition — it's the only motion this phase adds, and each modal has exactly one entrance moment (backdrop fade + card scale, counted together as it's a single compound "modal opening" event, not two independent animated elements).

---

## Next Phases

Phase 5 (User flows: `app/bookings`, `app/wishlists`, `app/profile/[id]`, `app/add-hotel`, `app/manage-hotels` + related components + `loading.js` for each) gets its own plan, written next.
