# Hotel Management Site Redesign — Design Spec

**Date:** 2026-07-14
**Status:** Approved for planning

## 1. Goal

Redesign the entire application (public marketing pages, browse/details, auth, user dashboard, admin dashboard, payment flow) into a modern, luxury-minimal hotel management site with immersive but tasteful motion, and complete skeleton-loading coverage across every route and client-side fetch. Rebuild the footer, which is currently a one-line stub.

Full site is in scope — this is one design system applied consistently across the whole app, executed in phases (see §7) rather than a single flat diff.

## 2. Current State (baseline)

- Next.js 14 (app router), Tailwind CSS 3.4 (compiled output committed to `globals.css`, config only extends `primary: #009688`), `framer-motion` and `lucide-react` already installed but underused, icons currently mix Font Awesome (CDN `<link>` in `layout.js`) and `react-icons`.
- Fonts: Geist Sans + Geist Mono (local variable fonts), no serif/display face.
- Footer (`components/Footer.jsx`) is a single centered line of copyright text — no columns, no links, no structure.
- Loading states: one `<Suspense fallback={<div>Loading...</div>}>` in `app/page.js`; no `loading.js` route segments anywhere; no skeleton components.
- Component style: hand-rolled functional components, Tailwind utility classes inline, no design-token layer, no shared motion/variants utility.
- Key surfaces: public homepage (`Navbar`, `AnnounceBar`, `HeroSection`/`Hero`, `HotelListing`, `HotelsCategory`, `TopRatedHotel`, `Offer`, `Newsletter`, `Footer`), browse/details (`app/category/[category]`, `app/details/[id]`, `Hotel` card, `Reviews`, `Reserve`, `SuggestedHotels`), auth (`app/login`, `app/register`, intercepted modals in `app/@modal`), user flows (`app/bookings`, `app/wishlists`, `app/profile/[id]`, `app/add-hotel`, `app/manage-hotels`), admin dashboard (`app/dashboard/*`, `Sidebar`, `Chart.jsx`), payment (`app/paymentProcess`, `app/payment-success`).

## 3. Design Tokens

Add to `tailwind.config.js` `theme.extend` (keep existing `primary` for backward compat during migration, new tokens below):

**Colors**
| Token | Hex | Use |
|---|---|---|
| `cream` | `#FAF7F2` | page background (light) |
| `surface` | `#FFFFFF` | cards |
| `surface-alt` | `#F5F1EA` | alternating section bg |
| `ink` | `#1C1A17` | primary text, dark section bg |
| `muted` | `#6B6459` | secondary text |
| `brass` | `#B08D57` | accent, CTAs, focus rings |
| `brass-dark` | `#8C6D3F` | accent hover/active |
| `brass-light` | `#D9C6A0` | subtle accent backgrounds/badges |
| `hairline` | `#E8E1D5` | borders, replaces default gray borders |

**Typography**
- Display/headings: `Fraunces` (via `next/font/google`, variable weight 300–600, italic optional axis), exposed as `--font-fraunces` / Tailwind `font-serif`.
- Body/UI: existing Geist Sans, unchanged, Tailwind `font-sans`.
- Scale: hero display 56–72px / h1 40px / h2 32px / h3 24px / body 16px / small 14px, all with `leading-tight` on display sizes.

**Shape & elevation**
- Radius: `rounded-2xl` (1rem) default card radius, `rounded-3xl` (1.5rem) for hero/feature panels.
- Prefer 1px `hairline` borders over shadow-heavy cards.
- New luxury shadow token: `shadow-luxe` = `0 30px 60px -20px rgba(28,26,23,0.15)`.

**Motion**
- Easing: `[0.22, 1, 0.36, 1]` (named `luxe` in `lib/motion.js`).
- Section reveal duration: 600–800ms. Micro-interaction duration: 200–300ms.
- Shared variants module `lib/motion.js`: `fadeUp`, `stagger`, `scaleIn`, exported for reuse across components instead of inline duplicate objects.
- All scroll/entrance animation must check `prefers-reduced-motion` (via a small `useReducedMotion` wrapper around framer-motion's built-in hook) and fall back to instant/no-op.

## 4. Motion Inventory (signature moments)

- **Navbar**: transitions from tall/transparent-ish to compact/blurred+bordered on scroll (`backdrop-blur`, height/shadow interpolation).
- **Hero**: parallax background layers on scroll, slow ken-burns zoom on load, headline revealed word-by-word (stagger), search bar springs in after headline.
- **Grid sections** (`HotelListing`, `HotelsCategory`, `TopRatedHotel`, `Offer`): `whileInView` fade-up with staggered children, once-only (`viewport={{ once: true }}`).
- **Hotel card**: image scale-on-hover, price/heart badge micro-pop on interaction.
- **Route transitions**: shared fade/slide wrapper via `app/template.js` + `AnimatePresence`, applied app-wide.
- **Dashboard**: stat tiles count up on mount, table rows stagger in on data load.
- Nothing in this list runs as an infinite/looping animation on idle content — all entrance-based or interaction-based, to keep it "immersive," not distracting.

## 5. Skeleton Loading System

New directory `components/skeletons/`:
- `Skeleton.jsx` — base primitive, custom shimmer-sweep CSS animation (gradient sweep, keyframe added to `globals.css`) rather than flat `animate-pulse`, sized via `className` passthrough.
- Composed skeletons built from the primitive: `HotelCardSkeleton`, `HotelGridSkeleton`, `DetailsPageSkeleton`, `DashboardStatSkeleton`, `TableRowSkeleton`, `ProfileSkeleton`, `BookingListSkeleton`, `ReviewsSkeleton`.

Two coverage layers, both required:
1. **Route-level** — `loading.js` added to every route segment that fetches data: `app/details/[id]`, `app/category/[category]`, `app/dashboard/*` (bookings, bookings-list, create-hotel, hotels-list, manage-hotels, profile, users-list, wishlists, wishlists-list), `app/bookings`, `app/wishlists`, `app/profile/[id]`, `app/manage-hotels`, `app/add-hotel`. Each renders the matching composed skeleton so layout doesn't shift on resolve.
2. **Component-level** — any client-side fetch or `Suspense` boundary gets a skeleton fallback instead of the current `<div>Loading...</div>` (e.g. `HotelListing` suspense in `app/page.js`, search-driven results, dashboard tables that fetch client-side).

## 6. Footer Rebuild

Replace `components/Footer.jsx` entirely. Charcoal (`ink`) background, brass hairline top border, scroll-reveal-in on first view. Structure:
- **Brand column**: logo, one-line tagline, social icon row (lucide icons).
- **Explore column**: links to routes that actually exist today — Home (`/`), Bookings (`/bookings`), Wishlists (`/wishlists`), Add your property (`/add-hotel`).
- **Account column**: Login (`/login`), Register (`/register`), Dashboard (`/dashboard`).
- **Newsletter**: compact signup form reusing the existing `/api/newsletter` subscribe flow (same one wired up in `Newsletter.jsx`), not a new endpoint.
- **Legal row**: copyright line, no links to pages that don't exist (no About/Careers/Terms pages in this app today — do not fabricate dead links).

## 7. Phased Execution Order

Full scope, executed in dependency order so later phases can reuse earlier foundations:

0. **Foundation** — tailwind tokens, Fraunces font wiring in `layout.js`, `lib/motion.js`, `components/skeletons/Skeleton.jsx` + shimmer keyframe in `globals.css`.
1. **Global chrome** — `Navbar`, `Footer`, `AnnounceBar`, `app/template.js` route-transition wrapper.
2. **Homepage** — `Hero`/`HeroSection`, `HotelListing`, `HotelsCategory`, `TopRatedHotel`, `Offer`, `Newsletter`, plus their skeletons/Suspense fallback.
3. **Browse & details** — `app/category/[category]`, `app/details/[id]`, `Hotel` card, `Reviews`, `Reserve`, `SuggestedHotels`, `HotelSearch`, `Pagination`, + `loading.js` for both routes.
4. **Auth** — `app/login`, `app/register`, `app/@modal` intercepted login/register modals.
5. **User flows** — `app/bookings`, `app/wishlists`, `app/profile/[id]`, `app/add-hotel`, `app/manage-hotels` + related components (`BookingsList`, `WishlistList`, `ManageHotelList`, `HotelsListManage`) + `loading.js` for each.
6. **Admin dashboard** — `Sidebar`, `app/dashboard/*` pages, `Chart.jsx`, `EditModal`, `Create.jsx` + `loading.js`/skeletons for each list/table view.
7. **Payment flow** — `app/paymentProcess`, `app/payment-success`, `PaymentAndBillingForm`, `Success.jsx`.
8. **Polish pass** — `prefers-reduced-motion` audit, responsive QA (mobile/tablet/desktop) across all touched pages, remove now-unused Font Awesome CDN link if fully migrated to lucide-react.

Each phase is independently shippable and reviewable; later phases depend only on the Phase 0 foundation, not on each other, so they can be parallelized across sessions/agents if desired.

## 8. UI/UX Pro Max Validation

Ran `ui-ux-pro-max` design-system + domain searches (color, typography, ux, nextjs stack) against this brief. Findings folded in below; none contradict the approved direction in §3–§6, they harden it:

- **Accent contrast rule**: use `brass` (`#B08D57`) for decorative/background/badge use only. For any accent text, icon, or link that must hit 4.5:1 (AA) on `cream`/`surface`, use `brass-dark` (`#8C6D3F`) instead — matches the tool's WCAG-adjusted luxury-gold accent pattern (its default `#CA8A04`-family accent gets auto-adjusted for the same reason).
- **Motion cap**: no more than 1–2 animated elements active in any single viewport at once (tool flags "animate everything" as a high-severity anti-pattern). Applies across §4's motion inventory — e.g. hero headline stagger *or* parallax layer moving at a time, not both competing for attention.
- **Smooth anchor scroll**: add `scroll-behavior: smooth` at the html level for any in-page anchor links (footer → sections, etc).
- **Easing discipline**: entrances use ease-out, exits ease-in — already implied by the `luxe` cubic-bezier in §3, keep linear easing out of all UI transitions.
- **Next.js implementation confirms**: `loading.js` per route segment (§5) and `Suspense` streaming (§5, already used in `app/page.js`) are the framework-idiomatic pattern, not a custom one — no change needed. All images must go through `next/image` (already the case in `Hotel.jsx`; carry forward, no raw `<img>` in new/redesigned components). `next.config.js` `images.remotePatterns` already covers the hosts in use (Unsplash, placehold.co, googleusercontent, freepik) — no config change needed unless new image hosts are introduced.
- Font pairing choice (Fraunces + Geist Sans) stays as approved in §3 — the tool's own luxury pairings (Playfair Display/Cormorant + Inter/Montserrat) validate the general serif-display + clean-sans luxury pattern; Fraunces was chosen deliberately over Playfair for a warmer/less formal editorial feel and to reuse the already-installed Geist Sans rather than adding Inter.

## 9. Explicit Non-Goals

- No new component library (no shadcn/Radix) — hand-rolled Tailwind + framer-motion only, per existing codebase style.
- No backend/API changes — this is UI/UX + motion + loading-state only. Newsletter footer signup reuses the existing subscribe endpoint as-is.
- No fabricated pages/links (About, Careers, Terms) — footer and nav only link to routes that exist in the app today.
- No infinite/looping decorative animation on idle content — motion is entrance- or interaction-triggered only.
