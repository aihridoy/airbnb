# Hotel Redesign — Phase 8: Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close out the redesign — delete dead code flagged across Phases 6-7, remove the now-unused Font Awesome CDN link and legacy `primary` token, restyle the five small interactive widgets deferred since Phase 3 and the 404 page (both missed by every subsequent phase), audit and fix `prefers-reduced-motion` gating on the four components that still animate unconditionally, and run a final responsive/build sanity pass.

## Spec Reference

Per the master spec (`docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` §95): "Polish pass — `prefers-reduced-motion` audit, responsive QA (mobile/tablet/desktop) across all touched pages, remove now-unused Font Awesome CDN link if fully migrated to lucide-react."

## Gaps Found While Investigating This Phase (not previously flagged)

1. **Five small interactive widgets were explicitly deferred in Phase 3 and never picked up by any later phase.** Phase 3's plan (`docs/superpowers/plans/2026-07-15-hotel-redesign-phase3-browse-details.md:24`) reads: *"Explicitly OUT OF SCOPE for this phase ... restyling every widget on this page would balloon scope past what's reviewable in one phase: `components/ReviewModal.jsx`, `components/ReviewDeleteButton.jsx`, `components/AddToWishListButton.jsx`, `components/AddToFavBtn.jsx`, `components/SocialShare.jsx`."* No Phase 4-7 plan ever reassigned them. Investigated each in this phase:
   - `ReviewModal.jsx` — still fully unstyled (`bg-white`, `text-gray-700`, `bg-primary`, no lucide close icon). **In scope, Task 4.**
   - `ReviewDeleteButton.jsx` — trivial text link, only `text-red-500`. Light touch-up. **In scope, Task 5.**
   - `AddToWishListButton.jsx` — still `bg-blue-500`/`bg-gray-600`, no icon. **In scope, Task 6.**
   - `AddToFavBtn.jsx` — **already fine, no changes needed.** It already uses `lucide-react`'s `Heart` icon; its `bg-white/20 backdrop-blur-sm` and `text-white`/`text-red-500` colors are a photo-overlay badge (sits on top of a hero image), not a card-surface color, so the luxury token palette doesn't apply here. Confirmed via `grep` — zero `gray`/`primary`/Font Awesome classes. Excluded from this plan's tasks.
   - `SocialShare.jsx` — **already fine, no changes needed.** Uses `next-share`'s official brand-colored share icons (Facebook/Twitter/LinkedIn), which are correctly excluded from the lucide-only icon rule — these are recognizable third-party brand marks, not generic UI icons. No gray/primary classes present. Excluded from this plan's tasks.
2. **`app/not-found.js` (the 404 page) was never restyled by any phase** — still `text-red-600`, `text-gray-600`, `bg-blue-500`. **In scope, Task 3.**
3. **`components/Create.jsx`** — flagged dead in Phase 6 (zero imports anywhere), still present. **Deleted in Task 1.**
4. **`components/Success.jsx`** — flagged dead in Phase 7 (zero imports anywhere), still present. **Deleted in Task 1.**
5. **Four components animate with framer-motion but never call `useReducedMotion()`**, unlike every other animated component in the app (`Hero.jsx`, `AnnounceBar.jsx`, `app/template.js`, both auth modals): `app/category/[category]/page.js`, `components/Footer.jsx`, `components/HotelsCategory.jsx`, `components/HotelListing.jsx`. Each unconditionally sets `initial={{ opacity: 0, y: 20 }}` (or `initial="hidden"`) with a `y`-translate/opacity entrance, which the master spec's own polish-pass requirement (`prefers-reduced-motion` audit) exists specifically to catch. **Fixed in Task 7.**

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`. `brass` decorative-only; text/icon contrast uses `brass-dark`.
- No emoji/Font Awesome/react-icons — lucide-react only, **except** recognized third-party brand icons (e.g. `next-share`'s social-network icons in `SocialShare.jsx`, left untouched).
- Modal chrome (established in Phase 5/7): overlay `bg-ink/60 backdrop-blur-sm`, panel `bg-surface border border-hairline shadow-luxe rounded-2xl`, header row with a lucide `X` close button (`text-muted hover:text-ink`, `aria-label="Close"`).
- `confirm()`/`alert()` blocking-dialog flows are explicitly out of scope to touch (established precedent since Phase 5) — `ReviewDeleteButton.jsx`'s `confirm()`/`alert()` and `ReviewModal.jsx`'s `alert()` on submit success stay exactly as they are.
- The `useReducedMotion()` gating pattern is established in `components/Hero.jsx`: `const prefersReducedMotion = useReducedMotion();` then `initial={prefersReducedMotion ? false : <original initial value>}` (or `undefined` for a variants-based `"hidden"` string). `whileInView`/`animate`/`variants`/`transition` props are left unchanged — only `initial` is gated, since skipping the "from" state is sufficient to make the element render directly at its final position with no motion.
- All business logic, data-fetching, and state in every touched file must be preserved byte-identical — only markup/classes/icons/the specific `initial` prop values change.
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.

---

### Task 1: Delete dead code (`components/Create.jsx`, `components/Success.jsx`)

**Files:**
- Delete: `components/Create.jsx`
- Delete: `components/Success.jsx`

**Interfaces:**
- Neither file is imported anywhere in the app (confirmed via `grep -rln "components/Create\b\|components/Success\b" app components` returning zero matches for either as an import path). Deleting them changes no other file's behavior.

- [ ] **Step 1: Delete both files**

```bash
git rm components/Create.jsx components/Success.jsx
```

- [ ] **Step 2: Verify**

Run:
```bash
test -f components/Create.jsx && echo STILL_EXISTS || echo CREATE_DELETED_OK
test -f components/Success.jsx && echo STILL_EXISTS || echo SUCCESS_DELETED_OK
grep -rln "components/Create\b\|components/Success\b" app components 2>/dev/null | wc -l | tr -d ' '
```
Expected:
```
CREATE_DELETED_OK
SUCCESS_DELETED_OK
0
```

- [ ] **Step 3: Commit**

```bash
git commit -m "chore: delete dead Create.jsx and Success.jsx components"
```

---

### Task 2: Remove the Font Awesome CDN link and the unused `primary` Tailwind token

**Files:**
- Modify: `app/layout.js`
- Modify: `tailwind.config.js`

**Interfaces:**
- No exports change. `RootLayout`'s `children`/`modal` props and provider nesting (`SearchProvider`/`BookingProvider`) are unchanged — only the `<head>` block loses its Font Awesome `<link>`. `tailwind.config.js`'s other color tokens (`cream`, `surface`, `ink`, `brass`, etc.) are unchanged — only the `primary: "#009688"` line is removed.
- **Depends on Task 1**: this removal is only safe once `components/Create.jsx` and `components/Success.jsx` (the last two files anywhere in the app using `fas fa-` classes and the `primary`/`text-primary`/`bg-primary` tokens) are deleted. Do not run this task before Task 1 is committed.

- [ ] **Step 1: Remove the CDN link from `app/layout.js`**

Change:
```jsx
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
      </head>
      <body className="bg-cream font-sans text-ink">
```
to:
```jsx
      <body className="bg-cream font-sans text-ink">
```

(The `<head>` element itself is removed entirely since it contained only this one link — Next.js's `<html>`/`<body>` structure doesn't require an explicit empty `<head>`.)

- [ ] **Step 2: Remove the `primary` token from `tailwind.config.js`**

Find the line:
```js
        primary: "#009688",
```
and delete it (leaving the surrounding `colors: { ... }` object's other entries — `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline` — untouched).

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "font-awesome" app/layout.js
grep -c "primary" tailwind.config.js
grep -rln "\btext-primary\b\|\bbg-primary\b\|\bborder-primary\b\|\bring-primary\b" app components --include="*.js" --include="*.jsx" 2>/dev/null | wc -l | tr -d ' '
```
Expected:
```
0
0
0
```

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/layout.js tailwind.config.js
git commit -m "chore: remove unused Font Awesome CDN link and legacy primary token"
```

---

### Task 3: Restyle `app/not-found.js` (404 page)

**Files:**
- Modify: `app/not-found.js`

**Interfaces:**
- No exports change — same default export `NotFound`. Next.js's `not-found.js` convention takes no meaningful props (the `{ error, reset }` destructure in the current file is vestigial — `not-found.js` is never passed these; only `error.js` boundaries receive them — but harmless, left as-is per "don't fix what isn't broken" since removing it is out of this task's narrow scope and it causes no bug).

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";

export default function NotFound({ error, reset }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-cream text-center">
            <h1 className="font-serif text-6xl text-ink mb-4">404</h1>
            <p className="text-lg text-muted mb-8">Looks like you've ventured into the unknown.</p>
            <Link href="/" className="px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors">
                Return Home
            </Link>
        </main>
    );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "text-red-600\|text-gray-600\|bg-blue-500" app/not-found.js
```
Expected:
```
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/not-found.js
git commit -m "feat: restyle 404 page with luxury tokens"
```

---

### Task 4: Restyle `components/ReviewModal.jsx`

**Files:**
- Modify: `components/ReviewModal.jsx`

**Interfaces:**
- No exports change — same default export `ReviewModal`, same `{ setShowModal, hotelId }` props (consumed unchanged by `components/ProvidePreview.jsx`, already restyled in Phase 3 — do not touch that file). `handleSubmit`/`submitReview`/`session` fetch logic and the `ratings`/`review`/`error`/`userId`/`userName` state are preserved byte-identical. The `alert()` on submit success stays as-is (established precedent — blocking dialogs are out of scope).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client"
import React, { useEffect, useState } from 'react';
import { submitReview, session } from '@/app/action';
import { X } from 'lucide-react';

const ReviewModal = ({ setShowModal, hotelId }) => {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [ratings, setRatings] = useState(0);
    const [review, setReview] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                setUserId(userData?.user?.id || null);
                setUserName(userData?.user?.name || null);
            } catch (error) {
                console.error('Failed to fetch user session:', error);
            }
        };

        fetchUser();
    }, []);

    const handleSubmit = async () => {
        try {
            await submitReview({ hotelId, userId, userName, ratings, review });
            alert('Review submitted successfully!');
            setShowModal(false);
        } catch (error) {
            setError(error.message);
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
            <div className="bg-surface border border-hairline shadow-luxe rounded-2xl w-full max-w-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-lg text-ink">Write a Review</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-muted hover:text-ink transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-500 mb-4">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6">
                        <div>
                            <label className="block text-ink font-medium mb-2">Overall Rating</label>
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`text-3xl ${index < ratings ? 'text-brass-dark' : 'text-hairline'}`}
                                        onClick={() => setRatings(index + 1)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-ink font-medium mb-2">Your Review</label>
                            <textarea
                                rows="4"
                                placeholder="Share your experience..."
                                className="w-full px-4 py-3 rounded-lg border border-hairline focus:outline-none focus:ring-2 focus:ring-brass"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div className="border-t border-hairline p-4 bg-surface-alt flex justify-end gap-4">
                    <button
                        className="px-4 py-2 text-muted hover:bg-surface rounded-lg transition-colors"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors"
                        onClick={handleSubmit}
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-white\|bg-gray-50\|text-gray-700\|bg-primary\|text-yellow-500\|text-gray-300" components/ReviewModal.jsx
grep -q "X } from 'lucide-react'" components/ReviewModal.jsx && echo OK
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
git add components/ReviewModal.jsx
git commit -m "feat: restyle ReviewModal with luxury tokens and lucide close icon"
```

---

### Task 5: Restyle `components/ReviewDeleteButton.jsx`

**Files:**
- Modify: `components/ReviewDeleteButton.jsx`

**Interfaces:**
- No exports change — same default export `ReviewDeleteButton`, same `{ review, user }` props (consumed unchanged by `components/Reviews.jsx`, already restyled in Phase 3). `handleDelete`/`deleteReview`/`confirm()`/`alert()`/`window.location.reload()` logic preserved byte-identical — only the button's className changes.

- [ ] **Step 1: Replace the file contents**

```jsx
'use client';

import { deleteReview } from '@/app/action';

const ReviewDeleteButton = ({ review, user }) => {

    const handleDelete = async (id) => {
        const confirmDelete = confirm(`Are you sure you want to delete the review?`);
        if (!confirmDelete) return;
        try {
            const data = await deleteReview(id);
            alert(data.message || 'Review deleted successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Error deleting review');
        }
    };

    return (
        <>
            {user?.id === review.userId && (
                <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 hover:text-red-600 hover:underline transition-colors text-sm"
                >
                    Delete Review
                </button>
            )}
        </>
    );
};

export default ReviewDeleteButton;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q "hover:text-red-600 hover:underline transition-colors" components/ReviewDeleteButton.jsx && echo OK
```
Expected:
```
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ReviewDeleteButton.jsx
git commit -m "feat: restyle ReviewDeleteButton hover state"
```

---

### Task 6: Restyle `components/AddToWishListButton.jsx`

**Files:**
- Modify: `components/AddToWishListButton.jsx`

**Interfaces:**
- No exports change — same default export `AddToWishListButton`, same `{ hotelId, userId, title, location, rent, images, wishlists }` props (consumed unchanged by `app/details/[id]/page.js`, already restyled in Phase 3). `handleAddToWishlist`/`addToWishlist`/`isInWishList` logic preserved byte-identical — only the button's className changes.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { addToWishlist } from '@/app/action';
import React from 'react';

const AddToWishListButton = ({ hotelId, userId, title, location, rent, images, wishlists }) => {
    const isInWishList = wishlists && userId && hotelId ?
        wishlists.find(wishlist =>
            wishlist.userId === userId && wishlist.hotelId === hotelId
        ) : null;

    const handleAddToWishlist = async () => {
        try {
            await addToWishlist(userId, hotelId, title, location, rent, images);
            alert('Hotel added to wishlist!');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            alert('Failed to add to wishlist. Please try again.');
        }
    };

    return (
        <div>
            <button
                onClick={handleAddToWishlist}
                disabled={!!isInWishList}
                className={`px-4 py-2 rounded-full transition-colors duration-200 ${isInWishList ? 'bg-hairline text-muted cursor-not-allowed' : 'bg-brass-dark text-cream hover:bg-brass'}`}
            >
                {isInWishList ? 'Added to wishlist' : 'Add to wishlist'}
            </button>
        </div>
    );
};

export default AddToWishListButton;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-blue-500\|bg-gray-600" components/AddToWishListButton.jsx
```
Expected:
```
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/AddToWishListButton.jsx
git commit -m "feat: restyle AddToWishListButton with luxury tokens"
```

---

### Task 7: Add `prefers-reduced-motion` gating to the 4 ungated animated components

**Files:**
- Modify: `app/category/[category]/page.js`
- Modify: `components/Footer.jsx`
- Modify: `components/HotelsCategory.jsx`
- Modify: `components/HotelListing.jsx`

**Interfaces:**
- No exports change in any of the 4 files. All data-fetching, state, and every framer-motion prop other than `initial` (`whileInView`, `variants`, `transition`, `viewport`) are preserved byte-identical — only the `initial` value becomes conditional on `useReducedMotion()`, matching the pattern already established in `components/Hero.jsx`.

- [ ] **Step 1: `components/HotelListing.jsx`**

Change the import:
```jsx
import { motion } from "framer-motion";
```
to:
```jsx
import { motion, useReducedMotion } from "framer-motion";
```

Add, right after the `const { searchQuery } = useSearch();` line inside `HotelListing`:
```jsx
  const prefersReducedMotion = useReducedMotion();
```

Change:
```jsx
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
```
to:
```jsx
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
```

Change:
```jsx
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
```
to:
```jsx
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
```

- [ ] **Step 2: `components/HotelsCategory.jsx`**

Change the import:
```jsx
import { motion } from "framer-motion";
```
to:
```jsx
import { motion, useReducedMotion } from "framer-motion";
```

Add, right after `const [isLoading, setIsLoading] = useState(true);` inside `HotelsCategory`:
```jsx
  const prefersReducedMotion = useReducedMotion();
```

Change:
```jsx
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
```
to:
```jsx
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
```

Change:
```jsx
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
```
to:
```jsx
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
```

- [ ] **Step 3: `app/category/[category]/page.js`**

Change the import:
```jsx
import { motion } from "framer-motion";
```
to:
```jsx
import { motion, useReducedMotion } from "framer-motion";
```

Add, right after `const [error, setError] = useState(null);` inside `CategoryPage`:
```jsx
  const prefersReducedMotion = useReducedMotion();
```

Change:
```jsx
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
```
to:
```jsx
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
```

- [ ] **Step 4: `components/Footer.jsx`**

Change the import:
```jsx
import { motion } from "framer-motion";
```
to:
```jsx
import { motion, useReducedMotion } from "framer-motion";
```

Add, right after `const [message, setMessage] = useState("");` inside `Footer`:
```jsx
  const prefersReducedMotion = useReducedMotion();
```

Change:
```jsx
    <motion.footer
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="bg-ink text-cream border-t border-brass-dark"
    >
```
to:
```jsx
    <motion.footer
      initial={prefersReducedMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true }}
      variants={stagger}
      className="bg-ink text-cream border-t border-brass-dark"
    >
```

- [ ] **Step 5: Verify**

Run:
```bash
grep -c "useReducedMotion" app/category/\[category\]/page.js components/Footer.jsx components/HotelsCategory.jsx components/HotelListing.jsx
grep -c "prefersReducedMotion ? false" app/category/\[category\]/page.js components/Footer.jsx components/HotelsCategory.jsx components/HotelListing.jsx
```
Expected: every file shows `2` for the first command (one import reference + one variable declaration) except `components/Footer.jsx` and `app/category/[category]/page.js`, which each have exactly one `motion.*` block to gate, so `1` for the second command there; `components/HotelListing.jsx` and `components/HotelsCategory.jsx` each have two `motion.div` blocks to gate, so `2` for the second command there.

- [ ] **Step 6: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add app/category/\[category\]/page.js components/Footer.jsx components/HotelsCategory.jsx components/HotelListing.jsx
git commit -m "fix: gate entrance animations behind prefers-reduced-motion on 4 components"
```

---

### Task 8: Final responsive/build sanity pass

**Files:** none (verification-only task, no code changes expected — see note below).

**Interfaces:** N/A.

This task is the master spec's "responsive QA (mobile/tablet/desktop) across all touched pages" requirement. This app has no visual browser-automation tool available in this environment (no Playwright/screenshot capability), so this pass is:
1. A **static audit** — grep every file touched across Phases 1-8 for hardcoded fixed pixel widths that would break on mobile (`w-[<number>px]` outside of icon-sized elements, or a bare `width:` inline style), and confirm every grid/flex layout added during the redesign carries at least one responsive breakpoint prefix (`sm:`/`md:`/`lg:`).
2. A **build sanity check** — `npm run build` must compile with zero syntax/type errors (a broken responsive class name or malformed JSX would fail this step even without a browser).

- [ ] **Step 1: Static responsive audit**

Run:
```bash
grep -rn "w-\[[0-9]\+px\]" app components --include="*.js" --include="*.jsx" | grep -v "w-\[1px\]\|w-\[2px\]\|w-\[3px\]\|w-\[4px\]"
```
Expected: no output (or, if any lines appear, each one must be a hairline/border-width utility, not a layout-breaking fixed width — inspect any hits manually before treating this task as complete).

- [ ] **Step 2: Build sanity check**

Run:
```bash
rm -rf .next
npm run build
```
Expected: output contains `✓ Compiled successfully`. The build may still fail afterward at the "Collecting page data" step with `Invalid/Missing environment variable: "MONGODB_CONNECTION_STRING"` — this is a pre-existing local-environment limitation (no `.env` file in this worktree, unrelated to any code in this branch) and does NOT indicate a regression, since every prior phase's build hit the identical error at the identical step. Only a failure at or before the `✓ Compiled successfully` line indicates a real problem introduced by this branch.

- [ ] **Step 3: Clean up build artifacts**

```bash
rm -rf .next
```

- [ ] **Step 4: Report**

No commit for this task (no files change). Write a one-paragraph note to `.superpowers/sdd/task-8-report.md` stating: the static audit's grep output (or "no hits"), the build's compile-success confirmation, and an explicit statement that full cross-device visual QA was not possible in this environment and would need a real browser or device lab to complete — this limitation should be surfaced to the user, not silently treated as "done."

---

## Self-Review

**Spec coverage:** All three master-spec Phase 8 requirements are covered: `prefers-reduced-motion` audit (Task 7, with 4 real gaps found and fixed), Font Awesome CDN removal (Task 2, gated correctly behind Task 1's dead-code deletion), responsive QA (Task 8, with its environment limitation disclosed rather than glossed over).

**Deferred-item coverage:** All items flagged by earlier phases are resolved here: `Create.jsx` (Phase 6) and `Success.jsx` (Phase 7) deleted in Task 1; the 5 widgets deferred since Phase 3 are each individually triaged (3 restyled, 2 confirmed already fine and explicitly excluded with reasoning, not silently dropped); `app/not-found.js` — a gap not previously flagged by any phase, caught during this phase's investigation — restyled in Task 3.

**Bug-fix scope check:** Task 7's fix is narrowly scoped to the `initial` prop only, per the established `Hero.jsx` pattern — no unrelated animation behavior changes.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents/diffs and literal expected output.

**Type/name consistency:** `ReviewModal`'s props (`setShowModal, hotelId`) unchanged vs. its existing consumer `ProvidePreview.jsx`. `ReviewDeleteButton`'s props (`review, user`) unchanged vs. its existing consumer `Reviews.jsx`. `AddToWishListButton`'s props (`hotelId, userId, title, location, rent, images, wishlists`) unchanged vs. its existing consumer `app/details/[id]/page.js`.

**Out-of-scope check:** `AddToFavBtn.jsx` and `SocialShare.jsx` do not appear in any task's file list — confirmed correctly excluded with documented reasoning (photo-overlay badge context; third-party brand icons), not silently forgotten.

---

## Redesign Complete

This is the final phase (8 of 8) of the hotel-management luxury redesign. After this phase merges, every route, component, modal, loading/error boundary, and small interactive widget in the app uses the luxury-minimal brass/cream/ink design system with Fraunces serif headings, lucide-react icons, framer-motion animation gated behind `prefers-reduced-motion`, and route + component-level skeleton loading.
