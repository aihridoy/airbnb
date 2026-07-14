# Hotel Redesign — Phase 0: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the design-token, font, motion, and skeleton-loading foundation that every later redesign phase (Navbar/Footer, Homepage, Browse/Details, Auth, User flows, Dashboard, Payment, Polish — see the spec) builds on.

**Architecture:** Pure additive foundation work — no existing page/component gets its visual redesign in this phase. We add Tailwind design tokens, wire the Fraunces display font alongside the already-installed Geist Sans, add a shared framer-motion variants module, and add the base `Skeleton` shimmer primitive. Nothing in this phase changes what any page currently looks like except the page background color/base text color (moving off default Tailwind gray onto the new `cream`/`ink` tokens), which is intentionally part of "foundation."

**Tech Stack:** Next.js 14 (app router), Tailwind CSS 3.4, framer-motion 12 (already a dependency), `next/font/google` (Fraunces), `next/font/local` (existing Geist).

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — this plan implements that spec's §3 (Design Tokens), part of §4 (motion tokens/variants only — component-level motion moments happen in later phases), and the base-primitive part of §5 (Skeleton Loading System; composed skeletons like `HotelCardSkeleton` are built in the phase that redesigns that page, not here).

## Global Constraints

- No test framework (Jest/Vitest/Playwright/RTL) exists in this repo (`package.json` has no test runner, no `*.test.*` files exist). Do not add one — out of scope and unnecessary for this phase (YAGNI). Verification in this plan uses `npm run lint` (already configured via `next/core-web-vitals`), targeted `grep`, and `node -e` sanity checks instead of unit tests.
- Color hex values must match the spec exactly: `cream #FAF7F2`, `surface #FFFFFF`, `surface-alt #F5F1EA`, `ink #1C1A17`, `muted #6B6459`, `brass #B08D57`, `brass-dark #8C6D3F`, `brass-light #D9C6A0`, `hairline #E8E1D5`. Keep the existing `primary: "#009688"` token untouched (still referenced by unredesigned components elsewhere in the app until their phase lands).
- `brass` is decorative/background/badge use only. Any text, icon, or link needing 4.5:1 contrast on `cream`/`surface` must use `brass-dark` instead (spec §8).
- Do not add shadcn/ui or any new component/animation library — hand-rolled Tailwind + the already-installed `framer-motion` only (spec §8/§9).
- All motion respects `prefers-reduced-motion` — this phase only lands the variants module; the reduced-motion check itself is applied by consumers in later phases via framer-motion's `useReducedMotion` hook, called out here so later phases don't skip it.

---

### Task 1: Design tokens in `tailwind.config.js`

**Files:**
- Modify: `tailwind.config.js` (currently only extends `colors.primary`)

**Interfaces:**
- Produces: Tailwind utility classes available to every later task/phase — `bg-cream`, `bg-surface`, `bg-surface-alt`, `text-ink`, `text-muted`, `bg-brass`/`text-brass`/`border-brass`, `bg-brass-dark`/`text-brass-dark`, `bg-brass-light`/`text-brass-light`, `border-hairline`, `font-sans` (now resolves to `var(--font-geist-sans)`), `font-serif` (resolves to `var(--font-fraunces)`), `shadow-luxe`, `animate-shimmer`.

- [ ] **Step 1: Replace the file contents**

```js
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#009688",
        cream: "#FAF7F2",
        surface: "#FFFFFF",
        "surface-alt": "#F5F1EA",
        ink: "#1C1A17",
        muted: "#6B6459",
        brass: "#B08D57",
        "brass-dark": "#8C6D3F",
        "brass-light": "#D9C6A0",
        hairline: "#E8E1D5",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-fraunces)", ...defaultTheme.fontFamily.serif],
      },
      boxShadow: {
        luxe: "0 30px 60px -20px rgba(28, 26, 23, 0.15)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Verify the config loads and has the expected tokens**

Run:
```bash
node -e "
const c = require('./tailwind.config.js');
const colors = c.theme.extend.colors;
const fonts = c.theme.extend.fontFamily;
console.log(colors.brass, colors['brass-dark'], colors.ink, colors.cream);
console.log(fonts.sans[0], fonts.serif[0]);
console.log(c.theme.extend.animation.shimmer);
"
```
Expected output:
```
#B08D57 #8C6D3F #1C1A17 #FAF7F2
var(--font-geist-sans) var(--font-fraunces)
shimmer 1.6s ease-in-out infinite
```

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors (config file is plain CommonJS, ESLint should report no new problems).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js
git commit -m "feat: add luxury-minimal design tokens (colors, fonts, shadow, shimmer)"
```

---

### Task 2: Wire Fraunces display font alongside existing Geist Sans

**Files:**
- Modify: `app/layout.js`

**Interfaces:**
- Consumes: Tailwind `font-sans`/`font-serif` from Task 1.
- Produces: `--font-fraunces` CSS variable available globally (same pattern as the existing `--font-geist-sans`/`--font-geist-mono`), and the base page canvas now uses `bg-cream`/`text-ink` instead of default `bg-gray-50`.

- [ ] **Step 1: Replace the file contents**

```js
import localFont from "next/font/local";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { BookingProvider } from "@/contexts/BookingContext";
import { SearchProvider } from "@/contexts/SearchContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "AirBnB",
  description: "Generated by create next app",
};

export default function RootLayout({ children, modal }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className="bg-cream font-sans text-ink">
        <SearchProvider>
          <BookingProvider>
            {modal}
            {children}
          </BookingProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify the edit**

Run:
```bash
grep -n "font-fraunces\|bg-cream\|Fraunces" app/layout.js
```
Expected: three matches — the `Fraunces` import, the `fraunces.variable` usage in the `<html>` className, and `bg-cream` in the `<body>` className.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/layout.js
git commit -m "feat: wire Fraunces display font and apply cream/ink base canvas"
```

---

### Task 3: Shared motion variants module

**Files:**
- Create: `lib/motion.js`

**Interfaces:**
- Produces: named exports `luxeEase` (array, cubic-bezier control points), `fadeUp`, `stagger`, `scaleIn` (framer-motion variant objects, each with `hidden`/`visible` keys). Later phases import these instead of redefining inline variant objects per component — e.g. `import { fadeUp, stagger } from "@/lib/motion"` then `<motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} />`.

- [ ] **Step 1: Create the file**

```js
export const luxeEase = [0.22, 1, 0.36, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: luxeEase },
  },
};

export const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: luxeEase },
  },
};
```

- [ ] **Step 2: Verify the exports**

Run:
```bash
grep -c "^export const" lib/motion.js
```
Expected: `4`

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/motion.js
git commit -m "feat: add shared framer-motion variants (fadeUp, stagger, scaleIn)"
```

---

### Task 4: Base `Skeleton` shimmer primitive

**Files:**
- Create: `components/skeletons/Skeleton.jsx`

**Interfaces:**
- Consumes: `animate-shimmer`, `bg-surface-alt` Tailwind utilities from Task 1.
- Produces: default export `Skeleton` React component, props `{ className }` (string, Tailwind classes for sizing/shape — e.g. `"h-64 w-full rounded-xl"`). Later phases build composed skeletons (`HotelCardSkeleton`, `DashboardStatSkeleton`, etc., per spec §5) by composing this primitive, e.g. `<Skeleton className="h-64 w-full rounded-xl" />` for an image block.

- [ ] **Step 1: Create the file**

```jsx
const Skeleton = ({ className = "" }) => {
  return (
    <div className={`relative overflow-hidden bg-surface-alt ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
};

export default Skeleton;
```

- [ ] **Step 2: Verify the component**

Run:
```bash
grep -q "animate-shimmer" components/skeletons/Skeleton.jsx && \
grep -q "export default Skeleton" components/skeletons/Skeleton.jsx && \
echo OK
```
Expected: `OK`

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/skeletons/Skeleton.jsx
git commit -m "feat: add base Skeleton shimmer primitive"
```

---

## Self-Review

**Spec coverage:** §3 Design Tokens → Task 1 (colors, shadow) + Task 2 (fonts). §4 motion tokens (ease/duration/variants module) → Task 3. §5 base skeleton primitive → Task 4. Composed skeletons and all component/page motion moments are explicitly deferred to their respective later-phase plans (spec §7 Phase 1 onward) — not a gap, it's the documented phase boundary.

**Placeholder scan:** No TBD/TODO, no "add error handling" hand-waves, every step has literal file contents and literal expected command output.

**Type/name consistency:** `brass`/`brass-dark`/`brass-light`/`ink`/`muted`/`cream`/`surface`/`surface-alt`/`hairline` used identically across Tasks 1, 2, and referenced by name (not redefined) in Task 4. `fadeUp`/`stagger`/`scaleIn`/`luxeEase` are the exact names later phases must import from `lib/motion.js` — no aliasing introduced elsewhere in this plan. `Skeleton` is the exact default-export name later composed-skeleton files will import.

---

## Next Phases

Phases 1–8 (global chrome, homepage, browse/details, auth, user flows, dashboard, payment, polish — spec §7) each get their own plan document, written just before that phase starts, so composed-skeleton shapes and page-specific motion choices are planned against the actual current layout of the page being touched rather than guessed speculatively now.
