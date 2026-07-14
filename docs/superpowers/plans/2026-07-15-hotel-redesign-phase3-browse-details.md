# Hotel Redesign — Phase 3: Browse & Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the category-browse page, the hotel-details page, and every component they render (`Hotel` card, `Reviews`, `ProvidePreview`, `Reserve`, `SuggestedHotels`, `Pagination`) to the luxury-minimal design system, add a real details-page skeleton, and fix two real bugs found while reading these files.

**Architecture:** `components/Hotel.jsx` (Task 1) is consumed by `app/category/[category]/page.js` (Task 6), so Task 1 must land before Task 6. `components/skeletons/DetailsPageSkeleton.jsx` (Task 2) is consumed by `app/details/[id]/loading.js` (Task 4). All other tasks are independent of each other.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4 (Phase 0 tokens), framer-motion 12, lucide-react, `lib/motion.js`, Swiper (Reviews carousel), react-datepicker (Reserve).

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — spec §7 Phase 3, with two corrections noted below (found while reading the actual files, not knowable before this point in the project).

## Corrections to the Spec's Phase 3 File List

1. **`HotelSearch.jsx` does NOT belong in this phase.** The spec's Phase 3 list named it, but it is only ever imported by `app/dashboard/hotels-list/page.js` and `app/dashboard/manage-hotels/page.js` — it's admin-dashboard UI (renders `HotelsList` or `ManageHotelList` depending on role), unrelated to the public browse/details experience. It moves to the Phase 6 (Dashboard) plan instead.
2. **`ProvidePreview.jsx` is ADDED to this phase**, even though the spec didn't name it. It's the header+"Write a Review" bar directly above `Reviews` on the details page — restyling `Reviews` without it would leave an obviously mismatched old-style header sitting right next to the new luxury review cards.

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`, `animate-shimmer`. `brass` decorative-only; text/icon contrast uses `brass-dark` (light bg) or `brass-light` (dark bg).
- No emoji/react-icons/Font Awesome classes — lucide-react only. This phase migrates the last `fas fa-*` and `react-icons/fa` usages out of the browse/details surface (Font Awesome CDN link in `app/layout.js` stays — 14 other out-of-scope files still use it).
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.
- **Explicitly OUT OF SCOPE for this phase** (small interactive widgets, deferred — restyling every widget on this page would balloon scope past what's reviewable in one phase): `components/ReviewModal.jsx`, `components/ReviewDeleteButton.jsx`, `components/AddToWishListButton.jsx`, `components/AddToFavBtn.jsx`, `components/SocialShare.jsx`. None of these are touched by any task below.
- **Two real bugs found while reading these files, fixed as part of this phase (not just restyled):**
  1. `app/category/[category]/page.js` renders hotel cards using `hotel.name`, `hotel.price`, `hotel.rating`, `hotel.reviews` — fields that do not exist on hotel documents anywhere else in this app (every other component uses `hotel.title`, `hotel.rent`, and a computed `averageRating` from the reviews collection, confirmed via `components/Hotel.jsx`, `components/HotelsCategory.jsx`, `components/Hero.jsx`). Today this means every category-page card silently renders a blank title and never shows a price or rating. Task 6 fixes this by fetching reviews (same pattern as `HotelsCategory`/`HotelListing`) and reusing `components/Hotel.jsx` instead of the page's own broken duplicate card markup — this also deletes a ~60-line duplicate of the same card UI (DRY).
  2. `components/SuggestedHotels.jsx` uses the deprecated `next/image` `layout="fill" objectFit="cover"` API (removed in favor of the `fill` prop + `object-cover` class since Next 13). Task 9 updates it to the current API while restyling.

---

### Task 1: Restyle `components/Hotel.jsx`

**Files:**
- Modify: `components/Hotel.jsx`

**Interfaces:**
- No new exports — same default export `Hotel`, same `{ hotel, averageRating }` props. Consumed by `app/category/[category]/page.js` (Task 6) and `components/HotelListing.jsx` (already merged, Phase 2 — that file's usage is unaffected, it just gets the new card styling automatically).
- The old bed-icon markup used `<i className="ph-bed">` — a Phosphor Icons class with no Phosphor stylesheet loaded anywhere in this app (only Font Awesome's CDN is loaded), so it silently rendered nothing. Replaced with a real `lucide-react` `BedDouble` icon.

- [ ] **Step 1: Replace the file contents**

```jsx
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Star } from "lucide-react";

const Hotel = ({ hotel, averageRating }) => {
  const hotelImage =
    (hotel.images && hotel.images.length > 0 && hotel.images[0]) ||
    "https://placehold.co/600x400";
  return (
    <Link
      href={`/details/${hotel._id}`}
      className="block group bg-surface rounded-2xl border border-hairline overflow-hidden hover:shadow-luxe transition-shadow duration-300"
    >
      <div className="relative">
        <Image
          width={500}
          height={500}
          src={hotelImage}
          alt={hotel.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-ink flex items-center gap-1">
          <BedDouble className="w-3 h-3" />
          {hotel.bedroomCapacity} Rooms Left
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center gap-2">
          <h3 className="font-serif text-lg text-ink line-clamp-1">{hotel.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-4 h-4 text-brass-dark fill-current" />
            <span className="text-sm text-muted">{Number(averageRating)?.toFixed(1)}</span>
          </div>
        </div>
        <p className="text-muted text-sm mt-1">{hotel.location}</p>
        <div className="mt-2 flex justify-between items-center">
          <div>
            <span className="font-bold text-ink">${hotel.rent}</span>
            <span className="text-muted text-sm ml-1">per night</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Hotel;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "ph-bed" components/Hotel.jsx
grep -q 'from "lucide-react"' components/Hotel.jsx && echo OK
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
git add components/Hotel.jsx
git commit -m "feat: restyle Hotel card, replace broken ph-bed icon with lucide BedDouble"
```

---

### Task 2: Add `components/skeletons/DetailsPageSkeleton.jsx`

**Files:**
- Create: `components/skeletons/DetailsPageSkeleton.jsx`

**Interfaces:**
- Consumes: `Skeleton` (Phase 0 base primitive).
- Produces: default export `DetailsPageSkeleton` (no props). Consumed by `app/details/[id]/loading.js` (Task 4).

- [ ] **Step 1: Create the file**

```jsx
import Skeleton from "./Skeleton";

const DetailsPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="hotel-image-grid mb-8">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="w-full h-full rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Skeleton className="h-6 w-2/3 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default DetailsPageSkeleton;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'from "./Skeleton"' components/skeletons/DetailsPageSkeleton.jsx && \
grep -q "export default DetailsPageSkeleton" components/skeletons/DetailsPageSkeleton.jsx && \
grep -q "hotel-image-grid" components/skeletons/DetailsPageSkeleton.jsx && \
echo OK
```
Expected: `OK`

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/skeletons/DetailsPageSkeleton.jsx
git commit -m "feat: add DetailsPageSkeleton composed skeleton"
```

---

### Task 3: Wire `app/category/[category]/loading.js` to `HotelGridSkeleton`

**Files:**
- Modify: `app/category/[category]/loading.js` (currently a generic spinner, unrelated to the real page layout)

**Interfaces:**
- Consumes: `HotelGridSkeleton` (Phase 2, already merged), `Skeleton` (Phase 0).

- [ ] **Step 1: Replace the file contents**

```jsx
import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import Skeleton from "@/components/skeletons/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 space-y-3">
        <Skeleton className="h-10 w-64 rounded" />
        <Skeleton className="h-5 w-48 rounded" />
      </div>
      <HotelGridSkeleton count={8} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'from "@/components/skeletons/HotelGridSkeleton"' app/category/\[category\]/loading.js && echo OK
```
Expected: `OK`

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/category/[category]/loading.js"
git commit -m "feat: wire category loading.js to real HotelGridSkeleton"
```

---

### Task 4: Wire `app/details/[id]/loading.js` to `DetailsPageSkeleton`

**Files:**
- Modify: `app/details/[id]/loading.js`

**Interfaces:**
- Consumes: `DetailsPageSkeleton` (Task 2).

- [ ] **Step 1: Replace the file contents**

```jsx
import DetailsPageSkeleton from "@/components/skeletons/DetailsPageSkeleton";

export default function Loading() {
  return <DetailsPageSkeleton />;
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'from "@/components/skeletons/DetailsPageSkeleton"' app/details/\[id\]/loading.js && echo OK
```
Expected: `OK`

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/details/[id]/loading.js"
git commit -m "feat: wire details loading.js to real DetailsPageSkeleton"
```

---

### Task 5: Restyle both route `error.js` files

**Files:**
- Modify: `app/category/[category]/error.js`
- Modify: `app/details/[id]/error.js`

**Interfaces:**
- No exports change — both remain `export default function Error({ error, reset })`, the exact signature Next.js's error-boundary convention requires.
- Both files are currently byte-identical; this task applies the identical replacement to both.

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
grep -c "bg-primary" "app/category/[category]/error.js" "app/details/[id]/error.js"
```
Expected:
```
app/category/[category]/error.js:0
app/details/[id]/error.js:0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/category/[category]/error.js" "app/details/[id]/error.js"
git commit -m "feat: restyle category and details error boundaries with luxury tokens"
```

---

### Task 6: Restyle `app/category/[category]/page.js` (and fix the field-name bug)

**Files:**
- Modify: `app/category/[category]/page.js`

**Interfaces:**
- Consumes: `Hotel` (Task 1), `HotelGridSkeleton` (Phase 2), `fadeUp` (Phase 0), `Navbar`/`Footer` (Phase 1, unchanged imports).
- No new exports — same default export `CategoryPage`, no props (reads `category` from `useParams()` as before).
- **Bug fix, not just a restyle:** replaces the broken inline card markup (`hotel.name`/`hotel.price`/`hotel.rating`/`hotel.reviews` — fields that don't exist on hotel documents) with `<Hotel hotel={hotel} averageRating={...} />`, computing `averageRating` the same way `HotelsCategory`/`HotelListing` already do (fetch reviews alongside hotels, filter by `hotelId`).

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import { getAllHotels, getReviews } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  Umbrella,
  Mountain,
  Trees,
  Gem,
  Sun,
  Waves,
  AlertTriangle,
  ArrowLeft,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hotel from "@/components/Hotel";
import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import { fadeUp } from "@/lib/motion";

const CATEGORY_ICONS = {
  urban: Building2,
  beach: Umbrella,
  mountain: Mountain,
  rustic: Trees,
  luxury: Gem,
  countryside: Sun,
  lakeside: Waves,
};

const CategoryPage = () => {
  const params = useParams();
  const category = params.category;
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const [hotelsResponse, reviewsResponse] = await Promise.all([
          getAllHotels(category),
          getReviews(),
        ]);
        setHotels(hotelsResponse?.hotels || []);
        setReviews(reviewsResponse?.reviews || []);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setError(error.message);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchHotelsByCategory();
    }
  }, [category]);

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Building2;
    return <Icon className="w-8 h-8 text-brass-dark" aria-hidden="true" />;
  };

  const getCategoryTitle = (category) =>
    category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">Something went wrong</h2>
            <p className="text-lg text-red-600 mb-4">Error: {error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-10">
          <div className="flex items-center mb-4 gap-3">
            {getCategoryIcon(category)}
            <h1 className="font-serif text-4xl text-ink">
              {getCategoryTitle(category)} Hotels
            </h1>
          </div>
          {!loading && (
            <p className="text-lg text-muted">
              Found {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} in{" "}
              {getCategoryTitle(category)} category
            </p>
          )}
        </div>

        {loading ? (
          <HotelGridSkeleton count={8} />
        ) : hotels.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {hotels.map((hotel) => {
              const filteredReviews = reviews.filter(
                (review) => review.hotelId === hotel._id
              );
              const totalReviews = filteredReviews.length;
              const averageRating =
                totalReviews > 0
                  ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) /
                    totalReviews
                  : 0;
              return (
                <motion.div key={hotel._id} variants={fadeUp}>
                  <Hotel hotel={hotel} averageRating={averageRating} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-surface-alt rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-muted" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">No Hotels Found</h2>
            <p className="text-lg text-muted mb-6">
              We couldn't find any hotels in the {getCategoryTitle(category)} category
              at the moment.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Categories
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "hotel\.name\|hotel\.price\|hotel\.rating\b" "app/category/[category]/page.js"
grep -c "react-icons" "app/category/[category]/page.js"
grep -q 'from "@/components/Hotel"' "app/category/[category]/page.js" && echo HOTEL_OK
grep -q 'from "@/components/skeletons/HotelGridSkeleton"' "app/category/[category]/page.js" && echo SKELETON_OK
```
Expected:
```
0
0
HOTEL_OK
SKELETON_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/category/[category]/page.js"
git commit -m "fix: category page hotel cards used nonexistent fields, reuse Hotel component"
```

---

### Task 7: Restyle `components/Reviews.jsx`

**Files:**
- Modify: `components/Reviews.jsx`

**Interfaces:**
- No new exports — same default export `Reviews`, same `{ reviews }` prop. `ReviewDeleteButton` (out of scope) is still rendered with the same props as before.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { session } from "@/app/action";
import ReviewDeleteButton from "./ReviewDeleteButton";
import Image from "next/image";
import avatar from "/public/avatar.png";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString("en-US", { month: "long", year: "numeric" });
};

const Reviews = ({ reviews }) => {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    async function getSession() {
      const data = await session();
      setSessionData(data);
    }

    getSession();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {reviews.length > 0 ? (
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="swiper-modern"
        >
          {reviews.map((review) => (
            <SwiperSlide key={review._id}>
              <div className="bg-surface rounded-xl border border-hairline p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      width={500}
                      height={500}
                      src={avatar}
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-ink">{review.userName}</h4>
                    <p className="text-sm text-muted">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center mb-4 gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.ratings ? "text-brass-dark fill-current" : "text-hairline"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-ink/80 mb-4 leading-relaxed">{review.review}</p>
                {sessionData?.user && sessionData.user.id === review.userId && (
                  <ReviewDeleteButton
                    review={review}
                    user={sessionData.user}
                    className="text-sm text-red-500 hover:text-red-700"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <p className="text-center text-muted py-10">No reviews available for this hotel.</p>
      )}
    </div>
  );
};

export default Reviews;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-star" components/Reviews.jsx
grep -q 'Star } from "lucide-react"' components/Reviews.jsx && echo OK
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
git add components/Reviews.jsx
git commit -m "feat: restyle Reviews carousel with luxury tokens and lucide star icons"
```

---

### Task 8: Restyle `components/ProvidePreview.jsx`

**Files:**
- Modify: `components/ProvidePreview.jsx`

**Interfaces:**
- No new exports — same default export `ProvidePreview`, same props (`hotelId`, `ownerId`, `totalReviews`, `averageRating`). `ReviewModal` (out of scope) still rendered with the same props.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";
import React, { useEffect, useState } from "react";
import ReviewModal from "./ReviewModal";
import { session } from "@/app/action";
import { Star } from "lucide-react";

const ProvidePreview = ({ hotelId, ownerId, totalReviews, averageRating }) => {
  const [userId, setUserId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const isOwner = ownerId === userId;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await session();
        setUserId(userData?.user?.id || null);
      } catch (error) {
        console.error("Failed to fetch user session:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-2xl text-ink">Reviews</h2>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-brass-dark fill-current mr-2" />
            <span className="text-xl font-semibold text-ink">{averageRating.toFixed(1)}</span>
            <span className="mx-2 text-muted">·</span>
            <span className="text-muted">{totalReviews} reviews</span>
          </div>
        </div>
        {!isOwner && userId && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-hairline rounded-lg text-ink hover:bg-surface-alt transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>
      {showModal && <ReviewModal setShowModal={setShowModal} hotelId={hotelId} />}
    </>
  );
};

export default ProvidePreview;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-star" components/ProvidePreview.jsx
grep -q 'Star } from "lucide-react"' components/ProvidePreview.jsx && echo OK
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
git add components/ProvidePreview.jsx
git commit -m "feat: restyle ProvidePreview review-header bar with luxury tokens"
```

---

### Task 9: Restyle `components/Reserve.jsx`

**Files:**
- Modify: `components/Reserve.jsx`

**Interfaces:**
- No new exports — same default export `Reserve`, same props. `BookingContext`/`router`/date-picker/booking-submission logic unchanged.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BookingContext } from "@/contexts/BookingContext";
import { session } from "@/app/action";
import { Star } from "lucide-react";

const Reserve = ({
  rent,
  title,
  description,
  serviceFee,
  cleaningFee,
  totalReviews,
  averageRating,
  ownerId,
  hotelId,
  hotelImage,
}) => {
  const [user, setUser] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState("");
  const { setBookingDetails } = useContext(BookingContext);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await session();
      setUser(res);
    };

    fetchUser();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    if (checkInDate && checkOutDate && guests) {
      const checkIn = format(checkInDate, "yyyy-MM-dd");
      const checkOut = format(checkOutDate, "yyyy-MM-dd");
      setBookingDetails({
        title,
        description,
        rent,
        guests,
        checkIn: checkIn,
        checkOut: checkOut,
        serviceFee,
        cleaningFee,
        totalReviews,
        averageRating,
        ownerId,
        hotelId,
        hotelImage,
      });
      router.push("/paymentProcess");
    } else {
      alert("Please fill out all fields.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface shadow-luxe rounded-2xl p-6 border border-hairline">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xl font-bold text-ink">${rent}</span>
            <span className="text-muted ml-1">per night</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-brass-dark fill-current mr-1" />
            <span className="text-ink">{averageRating.toFixed(1)}</span>
          </div>
        </div>

        <div className="border border-hairline rounded-lg mb-4">
          <div className="grid grid-cols-2 border-b border-hairline">
            <div className="p-3 border-r border-hairline">
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                placeholderText="Check in"
                className="w-full"
                dateFormat="MM/dd/yyyy"
              />
            </div>
            <div className="p-3">
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate}
                placeholderText="Check out"
                className="w-full"
                dateFormat="MM/dd/yyyy"
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Guests"
            className="w-full p-3 rounded-b-lg focus:outline-none"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full block text-center bg-brass-dark text-cream py-3 rounded-lg transition-colors hover:bg-brass"
        >
          Reserve
        </button>

        <div className="text-center mt-4 text-muted">
          <p>You won&apos;t be charged yet</p>
        </div>
      </div>
    </form>
  );
};

export default Reserve;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-star" components/Reserve.jsx
grep -c "eslint-disable" components/Reserve.jsx
grep -q 'Star } from "lucide-react"' components/Reserve.jsx && echo OK
```
Expected:
```
0
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Reserve.jsx
git commit -m "feat: restyle Reserve booking card with luxury tokens"
```

---

### Task 10: Restyle `components/SuggestedHotels.jsx` (details-page suggestions)

**Files:**
- Modify: `components/SuggestedHotels.jsx` (server component — a different file from `components/TopRatedHotel.jsx`, which was restyled in Phase 2)

**Interfaces:**
- No new exports — same default async export `SuggestedHotels`, no props. Rendered by `app/details/[id]/page.js` (Task 12).
- **Deprecated-API fix:** replaces `layout="fill" objectFit="cover"` with the current `fill` prop + `object-cover` class (the `layout`/`objectFit` props were removed from `next/image` in Next 13+; this file predates that migration).

- [ ] **Step 1: Replace the file contents**

```jsx
import { getHotels, getReviews } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star } from "lucide-react";

const calculateAverageRating = (reviews, hotelId) => {
  const hotelReviews = reviews.filter((review) => review.hotelId === hotelId);
  if (hotelReviews.length === 0) return 0;
  const totalRating = hotelReviews.reduce((sum, review) => sum + review.ratings, 0);
  return Number((totalRating / hotelReviews.length).toFixed(1));
};

const getTopRatedHotels = (hotels, reviews, count = 5) => {
  return hotels
    .map((hotel) => ({
      ...hotel,
      averageRating: calculateAverageRating(reviews, hotel._id),
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, count);
};

const SuggestedHotels = async () => {
  const hotelsData = await getHotels();
  const reviewsData = await getReviews();
  const hotels = hotelsData?.hotels || [];
  const reviews = reviewsData?.reviews || [];
  const topRatedHotels = getTopRatedHotels(hotels, reviews, 5);

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <h2 className="font-serif text-2xl text-ink mb-6">Suggested Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topRatedHotels?.map((hotel) => {
          const filteredReviews = reviews.filter((review) => review.hotelId === hotel._id);
          const totalReviews = filteredReviews.length;
          const averageRating =
            totalReviews > 0
              ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews
              : 0;
          return (
            <Link
              href={`/details/${hotel._id}`}
              key={hotel._id}
              className="bg-surface border border-hairline rounded-xl overflow-hidden hover:shadow-luxe transition-shadow duration-300"
            >
              <div className="h-48 relative">
                <Image src={hotel.images[0]} alt={hotel.title} fill className="object-cover" />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-ink">{hotel.title}</h3>
                <p className="text-sm text-muted">{hotel.location}</p>
                <div className="flex items-center gap-1 my-2">
                  <Star className="w-4 h-4 text-brass-dark fill-current" />
                  <span className="text-sm font-medium text-ink">{averageRating?.toFixed(1)}</span>
                  <span className="text-sm text-muted">({totalReviews} reviews)</span>
                </div>
                <p className="text-sm text-muted line-clamp-2">{hotel.description}</p>
                <p className="text-lg font-bold text-ink mt-4">${hotel.rent}/night</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedHotels;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "layout=\"fill\"" components/SuggestedHotels.jsx
grep -q 'Star } from "lucide-react"' components/SuggestedHotels.jsx && echo OK
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
git add components/SuggestedHotels.jsx
git commit -m "fix: migrate SuggestedHotels off deprecated next/image API, restyle to luxury tokens"
```

---

### Task 11: Restyle `components/Pagination.jsx`

**Files:**
- Modify: `components/Pagination.jsx`

**Interfaces:**
- No new exports — same default export `Pagination`, same `{ handlePageChange, currentPage, totalPages }` props. Consumed by `components/HotelListing.jsx` (Phase 2, already merged) and several dashboard components (Phase 6 scope, unaffected by this restyle beyond inheriting the new look, which is a net improvement, not a regression).

- [ ] **Step 1: Replace the file contents**

```jsx
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({ handlePageChange, currentPage, totalPages }) => {
  return (
    <nav aria-label="Page navigation">
      <ul className="inline-flex items-center -space-x-px">
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage - 1);
            }}
            className={`flex items-center py-2 px-3 ml-0 leading-tight text-muted bg-surface rounded-l-lg border border-hairline hover:bg-surface-alt hover:text-ink ${
              currentPage === 1 ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="w-4 h-4" />
          </a>
        </li>
        {Array.from({ length: totalPages }, (_, i) => (
          <li key={i}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(i + 1);
              }}
              className={`py-2 px-3 leading-tight text-muted bg-surface border border-hairline hover:bg-surface-alt hover:text-ink ${
                currentPage === i + 1 ? "bg-brass-light/40 text-ink font-semibold" : ""
              }`}
            >
              {i + 1}
            </a>
          </li>
        ))}
        <li>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePageChange(currentPage + 1);
            }}
            className={`flex items-center py-2 px-3 leading-tight text-muted bg-surface rounded-r-lg border border-hairline hover:bg-surface-alt hover:text-ink ${
              currentPage === totalPages ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-chevron" components/Pagination.jsx
grep -q 'from "lucide-react"' components/Pagination.jsx && echo OK
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
git add components/Pagination.jsx
git commit -m "feat: restyle Pagination with lucide chevrons and luxury tokens"
```

---

### Task 12: Restyle `app/details/[id]/page.js`

**Files:**
- Modify: `app/details/[id]/page.js`

**Interfaces:**
- Consumes: restyled `Reserve`/`Reviews`/`ProvidePreview`/`SuggestedHotels` (Tasks 7-10, all merged before this task runs), unchanged `AddToWishListButton`/`SocialShare` (out of scope, same props as before).
- No exports change — same `generateMetadata`, same default export `HotelDetailsPage`, same `{ params }` prop. All data-fetching (`getBookings`, `getHotelById`, `getReviews`, `getWishlists`, `session`) is unchanged — only JSX markup/classes/icons change.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
import {
  getBookings,
  getHotelById,
  getReviews,
  getWishlists,
  session,
} from "@/app/action";
import AddToWishListButton from "@/components/AddToWishListButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProvidePreview from "@/components/ProvidePreview";
import Reserve from "@/components/Reserve";
import Reviews from "@/components/Reviews";
import SocialShare from "@/components/SocialShare";
import SuggestedHotels from "@/components/SuggestedHotels";
import Image from "next/image";
import {
  Star,
  Users,
  DoorOpen,
  BedDouble,
  Umbrella,
  Waves,
  Wifi,
  Utensils,
  Check,
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const hotel = await getHotelById(id);
    return {
      title: hotel?.title?.slice(0, 50),
      description: hotel?.description?.slice(0, 100),
      openGraph: {
        images: `${hotel?.images[0]}`,
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return {
      title: "Hotel Not Found",
      description: "The requested hotel could not be found.",
    };
  }
}

const AMENITY_ICONS = {
  "beach access": Umbrella,
  "private pool": Waves,
  "free wi-fi": Wifi,
  kitchen: Utensils,
};

const HotelDetailsPage = async ({ params }) => {
  const authResult = await session();
  const { id } = params;
  const { reviews } = await getReviews();
  const { wishlists } = await getWishlists();
  const { bookings } = await getBookings();
  let hotel;

  try {
    hotel = await getHotelById(id);
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return (
      <div className="flex justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-500">
          Hotel not found!
        </h1>
      </div>
    );
  }

  const {
    _id,
    title,
    location,
    amenities,
    bedCapacity,
    bedroomCapacity,
    description,
    guestCapacity,
    hostName,
    images,
    rent,
    serviceFee,
    cleaningFee,
    ownerId,
  } = hotel;
  const currentUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/details/${id}`;
  const hotelImage =
    (images && images.length > 0 && images[0]) ||
    "https://placehold.co/600x400";

  const filteredReviews = reviews.filter((review) => review.hotelId === _id);
  const totalReviews = filteredReviews.length;
  const averageRating =
    totalReviews > 0
      ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) /
        totalReviews
      : 0;

  const bookedHotels = bookings.filter(
    (booking) => booking.userId === authResult?.user?.id
  );
  const shouldRenderWishlistButton = !bookedHotels.some(
    (booking) => booking.hotelId === id
  );

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">{title}</h1>
            <SocialShare currentUrl={currentUrl} hotel={hotel} />
            <div className="flex flex-wrap items-center text-muted mt-2 gap-2">
              <Star className="w-4 h-4 text-brass-dark fill-current mr-1" />
              <span>{averageRating.toFixed(1)}</span>
              <span>{totalReviews} reviews</span>
              <span className="hidden sm:inline mx-2">·</span>
              <span>{location}</span>
            </div>
          </div>
          {authResult && shouldRenderWishlistButton && (
            <AddToWishListButton
              hotelId={_id}
              userId={authResult?.user?.id}
              title={title}
              location={location}
              rent={rent}
              images={images}
              wishlists={wishlists}
            />
          )}
        </div>
        <div className="hotel-image-grid mb-8">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`
                relative
                ${index === 0 && "(min-width: 640px)" ? "col-span-2 row-span-2" : ""}
              `}
            >
              <Image
                width={index === 0 ? 800 : 400}
                height={index === 0 ? 800 : 400}
                src={image}
                alt={`Room ${index}`}
                className="w-full h-full object-cover rounded-lg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index === 0}
                loading={index > 0 ? "lazy" : undefined}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="border-b border-hairline pb-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-4">
                Entire villa hosted by {hostName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{guestCapacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" />
                  <span>{bedroomCapacity} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4" />
                  <span>{bedCapacity} beds</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                About this place
              </h3>
              <p className="text-ink/80 leading-relaxed">{description}</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                What this place offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities?.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.toLowerCase()] || Check;
                  return (
                    <div key={amenity} className="flex items-center gap-2 text-ink">
                      <Icon className="w-4 h-4 text-brass-dark" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="sticky top-20 self-start">
            <Reserve
              hotelImage={hotelImage}
              rent={rent}
              title={title}
              serviceFee={serviceFee}
              cleaningFee={cleaningFee}
              totalReviews={totalReviews}
              averageRating={averageRating}
              description={description}
              hotelId={_id}
              ownerId={ownerId}
            />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-hairline">
        <ProvidePreview
          hotelId={_id}
          ownerId={ownerId}
          totalReviews={totalReviews}
          averageRating={averageRating}
        />
        <Reviews reviews={filteredReviews} />
        <SuggestedHotels />
      </div>
      <Footer />
    </>
  );
};

export default HotelDetailsPage;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-" "app/details/[id]/page.js"
grep -q 'from "lucide-react"' "app/details/[id]/page.js" && echo OK
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
git add "app/details/[id]/page.js"
git commit -m "feat: restyle hotel details page shell with luxury tokens and lucide icons"
```

---

## Self-Review

**Spec coverage:** §7 Phase 3 file list, corrected per the two notes above (HotelSearch removed, ProvidePreview added). Hotel card (Task 1), category page (Task 6), details page (Task 12), Reviews (Task 7), Reserve (Task 9), SuggestedHotels (Task 10), Pagination (Task 11), loading.js for both routes (Tasks 3-4), all present.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected output.

**Type/name consistency:** `Hotel` (Task 1) imported by exact name in Task 6. `DetailsPageSkeleton`/`HotelGridSkeleton`/`Skeleton` imported by exact names matching their producing tasks. `fadeUp` imported from `@/lib/motion` exactly as Phase 0 defines it.

**Bug-fix scope check:** Both bug fixes (category page field names, SuggestedHotels deprecated Image API) are narrowly scoped to the files already being restyled in this phase — no speculative fixes elsewhere.

**Out-of-scope check:** `ReviewModal.jsx`, `ReviewDeleteButton.jsx`, `AddToWishListButton.jsx`, `AddToFavBtn.jsx`, `SocialShare.jsx`, and `HotelSearch.jsx` do not appear in any task's file list — confirmed deferred (the last one explicitly reassigned to the Phase 6 plan).

---

## Next Phases

Phase 4 (Auth: `app/login`, `app/register`, `app/@modal` intercepted modals) gets its own plan, written next.
