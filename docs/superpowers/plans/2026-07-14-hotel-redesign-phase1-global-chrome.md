# Hotel Redesign — Phase 1: Global Chrome Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the site-wide chrome — Navbar, Footer, AnnounceBar — to the luxury-minimal design system landed in Phase 0, and add a route-transition wrapper so every page navigation gets a consistent enter animation.

**Architecture:** Each of the 4 files in this phase is touched independently and can be built/reviewed in any order (no task depends on another's output beyond the shared Phase 0 foundation). Navbar and AnnounceBar keep their existing state/logic and behavior contracts — only markup, classes, and icon set change. Footer is a full rewrite (previous version was a one-line stub). `app/template.js` is a new file with no prior version.

**Tech Stack:** Next.js 14 (app router), Tailwind CSS 3.4 (with Phase 0 tokens), framer-motion 12, lucide-react (already a dependency, not yet used anywhere in the app before this phase).

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — this plan implements spec §7 Phase 1 (Navbar, Footer, AnnounceBar, `app/template.js`) and draws on §4 (motion inventory: navbar scroll-shrink, route transitions) and §6 (footer column structure).

## Global Constraints

- Color tokens (from Phase 0, already in `tailwind.config.js`): `cream #FAF7F2`, `surface #FFFFFF`, `surface-alt #F5F1EA`, `ink #1C1A17`, `muted #6B6459`, `brass #B08D57`, `brass-dark #8C6D3F`, `brass-light #D9C6A0`, `hairline #E8E1D5`. `font-sans` → Geist Sans, `font-serif` → Fraunces. `shadow-luxe` and `animate-shimmer` also available.
- `brass` is decorative/background/badge use only. Any text, icon, or link needing 4.5:1 contrast on `cream`/`surface`/`ink` backgrounds uses `brass-dark` (on light backgrounds) or `brass-light` (on the dark `ink` footer/announce-bar backgrounds) instead — never plain `brass` for text/icon color.
- No emoji as icons anywhere in this phase — use `lucide-react` (already an installed dependency, not yet used anywhere in the app). This phase is lucide-react's first use in the codebase.
- No more than 1–2 animated elements active in any single viewport at once (spec §8 / ui-ux-pro-max finding). AnnounceBar's rewrite must drop its current sparkle loop, bell pulse loop, and badge pulse loop — only the text crossfade and its linear progress bar remain.
- All entrance/scroll motion must respect `prefers-reduced-motion` via framer-motion's `useReducedMotion()` hook — every task below shows exactly where this applies.
- Import shared variants from `lib/motion.js` (`fadeUp`, `stagger`, `scaleIn`, `luxeEase`) rather than redefining variant objects inline — Footer uses this; Navbar/AnnounceBar/template use direct framer-motion props since their animations are one-off, not shared list/grid reveals.
- Do not touch the Font Awesome CDN `<link>` in `app/layout.js` — 16 other files (e.g. `components/BookingsList.jsx`, `app/details/[id]/page.js`) still use `fas fa-*` classes and are out of scope for this phase. Only `components/Navbar.jsx` migrates off Font Awesome in this phase.
- No test framework exists in this repo — verification uses lint + targeted `grep`, same as Phase 0.
- **Known environment issue:** if you are working from a git worktree nested inside this repo's directory tree (e.g. under `.claude/worktrees/` or `.worktrees/`), `npm run lint` (next lint) fails with a false "Plugin @next/next was conflicted" error caused by ESLint picking up a second `.eslintrc.json` several directories up. This is pre-existing and not fixable within this phase's scope. Use this instead in that situation: `npx eslint --no-eslintrc -c .eslintrc.json <file>`. If working directly in the main checkout (not a nested worktree), plain `npm run lint` is fine.

---

### Task 1: Restyle `Navbar.jsx`

**Files:**
- Modify: `components/Navbar.jsx` (currently Font Awesome CDN icons, `bg-white`/`border-b`, no scroll behavior)

**Interfaces:**
- Consumes: `bg-cream`, `bg-surface`, `bg-surface-alt`, `text-ink`, `border-hairline`, `shadow-luxe`, `bg-brass-dark`, `hover:text-brass-dark` from Phase 0 tokens.
- No new exports — same default export `Navbar`, same behavior contract (search debounce via `useSearch`/`useDebounce`, session fetch via `session()`, popup menu open/close). Later phases do not import anything new from this file.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Search,
  Globe,
  Menu,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Hotel,
  Wrench,
  BookOpen,
  Heart,
  UserCircle,
  PlusCircle,
  Users,
  CalendarCheck,
} from "lucide-react";
import SignOutButton from "./SignOutButton";
import { session } from "@/app/action";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";

const Navbar = () => {
  const { setSearchQuery } = useSearch();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const dummyImg =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_hybrid&w=740";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await session();
        if (userData?.user) {
          setUser({
            ...userData.user,
            role: userData.user.role || "user",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Failed to fetch user session:", error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const hidePopup = (e) => {
    if (e.target.closest(".popup-container") === null) {
      setIsPopupVisible(false);
    }
  };

  useEffect(() => {
    if (isPopupVisible) {
      document.addEventListener("click", hidePopup);
    }
    return () => {
      document.removeEventListener("click", hidePopup);
    };
  }, [isPopupVisible]);

  const debouncedHandleSearchChange = useDebounce((value) => {
    setSearchQuery(value);
  }, 800);

  const handleSearchChange = (e) => {
    debouncedHandleSearchChange(e.target.value);
  };

  return (
    <nav
      className={`sticky top-0 grid grid-cols-2 md:flex justify-between items-center transition-all duration-300 md:gap-8 px-4 md:px-8 lg:px-20 z-30 border-b border-hairline ${
        isScrolled
          ? "py-2 bg-cream/90 backdrop-blur-md shadow-luxe"
          : "py-3 bg-cream"
      }`}
    >
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Hotel Logo"
            className="h-8 w-auto"
            width={200}
            height={200}
          />
        </Link>
      </div>

      <div className="row-start-2 col-span-2 border-0 md:border md:border-hairline flex shadow-sm hover:shadow-md transition-all md:rounded-full items-center px-2 mt-2 sm:md:mt-0 bg-surface">
        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 divide-x divide-hairline py-2 md:px-2 flex-grow">
          <input
            type="text"
            placeholder="Where to?"
            className="px-3 bg-transparent focus:outline-none lg:col-span-3 placeholder:text-sm text-ink font-sans"
            onChange={handleSearchChange}
          />
        </div>

        <button className="bg-ink w-9 h-9 rounded-full grid place-items-center text-sm text-center transition-all hover:bg-brass-dark shrink-0">
          <Search className="w-4 h-4 text-cream" />
        </button>
      </div>

      <div className="flex items-center space-x-4 relative justify-end">
        <button aria-label="Language">
          <Globe className="w-5 h-5 text-ink" />
        </button>
        <button
          onClick={togglePopup}
          className="bg-surface border border-hairline text-ink px-4 py-2 rounded-full hover:shadow-md flex gap-3 items-center justify-center"
        >
          <Menu className="w-4 h-4" />
          {user ? (
            <span className="w-6 h-6 rounded-full overflow-hidden bg-surface-alt">
              <Image
                src={user?.image || dummyImg}
                alt="Profile"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </span>
          ) : (
            <span className="bg-ink w-6 h-6 rounded-full flex items-center justify-center text-xs text-cream">
              <User className="w-3 h-3" />
            </span>
          )}
        </button>

        {/* Popup */}
        <div
          className={`max-w-48 w-48 bg-surface shadow-luxe border border-hairline rounded-xl absolute right-0 top-full max-h-fit mt-2 z-50 ${
            isPopupVisible ? "block" : "hidden"
          }`}
        >
          <ul className="popup-container py-1">
            {!user ? (
              <>
                <Link href="/login">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </li>
                </Link>

                <Link href="/register">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Signup
                  </li>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </li>
                </Link>

                {user?.role === "user" && (
                  <>
                    <Link href="/add-hotel">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Create Hotel
                      </li>
                    </Link>

                    <Link href="/manage-hotels">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Manage Hotels
                      </li>
                    </Link>

                    <Link href="/bookings">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Bookings
                      </li>
                    </Link>

                    <Link href="/wishlists">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlists
                      </li>
                    </Link>

                    <Link href={`/profile/${user?.id}`}>
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </li>
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <Link href="/add-hotel">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Create Hotel
                      </li>
                    </Link>

                    <Link href="/dashboard/hotels-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Hotels List
                      </li>
                    </Link>

                    <Link href="/dashboard/bookings-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Bookings List
                      </li>
                    </Link>

                    <Link href="/dashboard/users-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Users List
                      </li>
                    </Link>
                  </>
                )}

                <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                  <SignOutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
```

- [ ] **Step 2: Verify the edit**

Run:
```bash
grep -c "fas fa-" components/Navbar.jsx
grep -q 'from "lucide-react"' components/Navbar.jsx && echo LUCIDE_OK
grep -q "isScrolled" components/Navbar.jsx && echo SCROLL_OK
```
Expected:
```
0
LUCIDE_OK
SCROLL_OK
```

- [ ] **Step 3: Lint** (see Global Constraints for the worktree-nested lint workaround)

Run: `npm run lint` (or the `npx eslint --no-eslintrc -c .eslintrc.json components/Navbar.jsx` workaround if in a nested worktree)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Navbar.jsx
git commit -m "feat: restyle Navbar with luxury tokens, lucide icons, scroll-aware chrome"
```

---

### Task 2: Rebuild `Footer.jsx`

**Files:**
- Modify: `components/Footer.jsx` (currently a 1-line copyright stub, no columns, no links)

**Interfaces:**
- Consumes: `fadeUp`, `stagger` from `lib/motion.js` (Phase 0); `ink`/`cream`/`brass-dark`/`brass-light` tokens; the existing `/api/newsletter` `POST { email } → { message }` contract already used by `components/Newsletter.jsx` and `app/api/newsletter/route.js` (no API change — same endpoint, same request/response shape, same email regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
- No new exports — same default export `Footer`, no props.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Facebook, Instagram, Twitter, Send } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!EMAIL_REGEX.test(email)) {
      setStatus("error");
      setMessage("Please enter a valid email address");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to subscribe");
      }

      setStatus("success");
      setMessage(data.message || "Subscribed successfully");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="bg-ink text-cream border-t border-brass-dark"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={fadeUp}>
          <Image
            src="/logo.svg"
            alt="Hotel Logo"
            width={140}
            height={40}
            className="h-8 w-auto brightness-0 invert"
          />
          <p className="mt-4 text-sm text-cream/70 max-w-xs">
            Curated stays, booked with ease. Luxury hospitality, wherever you land.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <a href="#" aria-label="Facebook" className="text-cream/70 hover:text-brass-light transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Instagram" className="text-cream/70 hover:text-brass-light transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" aria-label="Twitter" className="text-cream/70 hover:text-brass-light transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Explore</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li><Link href="/" className="hover:text-brass-light transition-colors">Home</Link></li>
            <li><Link href="/bookings" className="hover:text-brass-light transition-colors">Bookings</Link></li>
            <li><Link href="/wishlists" className="hover:text-brass-light transition-colors">Wishlists</Link></li>
            <li><Link href="/add-hotel" className="hover:text-brass-light transition-colors">Add your property</Link></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Account</h3>
          <ul className="space-y-3 text-sm text-cream/70">
            <li><Link href="/login" className="hover:text-brass-light transition-colors">Login</Link></li>
            <li><Link href="/register" className="hover:text-brass-light transition-colors">Register</Link></li>
            <li><Link href="/dashboard" className="hover:text-brass-light transition-colors">Dashboard</Link></li>
          </ul>
        </motion.div>

        <motion.div variants={fadeUp}>
          <h3 className="font-serif text-lg mb-4">Stay in the loop</h3>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 min-w-0 bg-cream/10 border border-cream/20 rounded-full px-4 py-2 text-sm text-cream placeholder:text-cream/50 focus:outline-none focus:ring-2 focus:ring-brass"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              aria-label="Subscribe"
              className="shrink-0 bg-brass-dark hover:bg-brass w-9 h-9 rounded-full grid place-items-center transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-cream" />
            </button>
          </form>
          {message && (
            <p className={`mt-2 text-xs ${status === "error" ? "text-red-400" : "text-brass-light"}`}>
              {message}
            </p>
          )}
        </motion.div>
      </div>

      <div className="border-t border-cream/10 py-6 px-4 md:px-8 lg:px-20 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} AirBnB. All rights reserved.
      </div>
    </motion.footer>
  );
};

export default Footer;
```

- [ ] **Step 2: Verify the edit**

Run:
```bash
grep -q 'from "@/lib/motion"' components/Footer.jsx && echo MOTION_OK
grep -c "href=" components/Footer.jsx
grep -q "/api/newsletter" components/Footer.jsx && echo API_OK
```
Expected:
```
MOTION_OK
10
API_OK
```
(10 `href=` matches: 3 social links (`#`) + 4 Explore links (`/`, `/bookings`, `/wishlists`, `/add-hotel`) + 3 Account links (`/login`, `/register`, `/dashboard`). If your count differs, diff against the Step 1 code block before treating it as a bug.)

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Footer.jsx
git commit -m "feat: rebuild Footer with brand/explore/account columns and newsletter signup"
```

---

### Task 3: Restyle `AnnounceBar.jsx`

**Files:**
- Modify: `components/AnnounceBar.jsx` (currently rainbow gradients, emoji copy, 4+ concurrent infinite-loop animations, isMobile-driven short/long text variants)

**Interfaces:**
- No new exports — same default export `AnnounceBar`, same `{ onClose }` prop contract (still called the same way from wherever it's mounted).
- Intentional behavior simplification (per user decision: "restyle, keep rotating banner"): drops the old `isMobile` short-text/short-action variants and the dot-indicator row — the shorter luxury copy fits the `truncate` class at all breakpoints without needing a separate mobile string, and the dot indicators were purely decorative chrome not called out in the spec. The core rotating-banner + dismiss behavior is preserved.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Percent, Hotel, Star, Gift, Clock, X } from "lucide-react";

const ANNOUNCEMENTS = [
  { id: 1, icon: Percent, text: "Limited-time offer — 20% off select luxury stays this month.", action: "Book now" },
  { id: 2, icon: Hotel, text: "New arrivals in Kyoto, Lisbon, and Cape Town.", action: "Explore" },
  { id: 3, icon: Star, text: "Members save more — join our loyalty program.", action: "Join" },
  { id: 4, icon: Gift, text: "Complimentary breakfast on weekend bookings.", action: "View offer" },
  { id: 5, icon: Clock, text: "Last-minute stays near you, updated daily.", action: "View deals" },
];

const ROTATE_MS = 5000;

const AnnounceBar = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div className="relative bg-ink text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-2.5 flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 min-w-0"
          >
            <Icon className="w-4 h-4 text-brass-light shrink-0" />
            <p className="text-sm truncate">{current.text}</p>
            <span className="hidden sm:inline text-sm text-brass-light font-medium whitespace-nowrap">
              {current.action}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleClose}
          aria-label="Dismiss announcement"
          className="shrink-0 text-cream/60 hover:text-cream transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!prefersReducedMotion && (
        <motion.div
          key={current.id}
          className="absolute bottom-0 left-0 h-0.5 bg-brass-dark"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default AnnounceBar;
```

- [ ] **Step 2: Verify the edit**

Run:
```bash
grep -c "isMobile" components/AnnounceBar.jsx
grep -c "🎉\|🏨\|⭐\|🎁\|📍" components/AnnounceBar.jsx
grep -q "useReducedMotion" components/AnnounceBar.jsx && echo REDUCED_MOTION_OK
```
Expected:
```
0
0
REDUCED_MOTION_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/AnnounceBar.jsx
git commit -m "feat: restyle AnnounceBar to luxury palette, cut concurrent animations to spec"
```

---

### Task 4: Add `app/template.js` route-transition wrapper

**Files:**
- Create: `app/template.js` (no prior version — Next.js app router convention, re-mounts on every navigation within this segment)

**Interfaces:**
- Default export `Template`, receives `{ children }` from Next.js automatically (standard `template.js` convention — no manual wiring needed elsewhere, Next.js picks it up for every route under `app/`).
- Does not wrap the `@modal` parallel-route slot (that's rendered via the `{modal}` prop in `app/layout.js`, sibling to `{children}`, untouched by this file) — only the primary page content re-animates on navigation.

- [ ] **Step 1: Create the file**

```jsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

const Template = ({ children }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export default Template;
```

- [ ] **Step 2: Verify the file**

Run:
```bash
grep -q "\"use client\"" app/template.js && \
grep -q "useReducedMotion" app/template.js && \
grep -q "export default Template" app/template.js && \
echo OK
```
Expected: `OK`

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/template.js
git commit -m "feat: add route-transition wrapper via app/template.js"
```

---

## Self-Review

**Spec coverage:** §7 Phase 1 lists Navbar, Footer, AnnounceBar, `app/template.js` — all 4 present as Task 1-4. §4 motion inventory's "Navbar shrinks/blurs on scroll" → Task 1. §4's "route transitions via template.js + AnimatePresence" → Task 4 (enter-only; see note below — this is a deliberate, documented deviation, not a gap). §6 footer columns (Brand/Explore/Account/Newsletter/legal, real routes only) → Task 2, verified against the actual existing routes (`/`, `/bookings`, `/wishlists`, `/add-hotel`, `/login`, `/register`, `/dashboard` all exist in `app/`). §8's animation cap and `brass`/`brass-dark` contrast rule → applied in Tasks 1-3 (no plain `brass` used for text/icon color anywhere in this plan).

**Deviation note:** Task 4 implements an enter-only transition, not full `AnimatePresence` exit/enter choreography across route changes. Next.js `template.js` remounts fresh on every navigation by design, and reliably wiring `AnimatePresence` exit animations across that remount requires a `key={pathname}` at a layout level with more invasive changes than this phase's scope — the enter-only fade satisfies "every page navigation gets a consistent enter animation" from this plan's stated goal without that added complexity. If full exit choreography is wanted later, it's a separate, larger change to `app/layout.js`, not a Phase 1 task.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected command output (Footer's `href=` count step includes a self-check note since it's the one count worth double-checking by hand rather than trusting blindly).

**Type/name consistency:** `fadeUp`/`stagger` imported by name from `lib/motion.js` exactly as Phase 0 exports them. All four files keep their existing default-export names (`Navbar`, `Footer`, `AnnounceBar`) except the new `Template`, which is the exact name Next.js's `template.js` convention expects as the default export (Next.js does not care about the internal name, only that it's a default export — `Template` is used here purely for readability).

---

## Next Phases

Phase 2 (Homepage: Hero, HotelListing, HotelsCategory, TopRatedHotel, Offer, Newsletter + skeletons) gets its own plan, written next against those components' actual current layout.
