# Hotel Redesign — Phase 2: Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every homepage section (Hero, HotelListing, HotelsCategory, TopRatedHotel, Offer, Newsletter) to the luxury-minimal design system, and add composed skeleton components + a real Suspense fallback in place of the current bare "Loading..." text.

**Architecture:** Task 1 adds two composed skeleton components (`HotelCardSkeleton`, `HotelGridSkeleton`) on top of Phase 0's base `Skeleton` primitive — Tasks 2, 3, 5, and 8 depend on these and must run after Task 1. Tasks 4, 6, 7 (HotelsCategory, Offer, Newsletter) are independent of Task 1 and each other, and could run in parallel if desired, but this plan lists them in a fixed order for simplicity.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4 (Phase 0 tokens), framer-motion 12, lucide-react, `lib/motion.js` (Phase 0), Swiper (already a dependency, used by `TopRatedHotel.jsx`).

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — spec §7 Phase 2, §5 Skeleton System (composed skeletons), §4 motion cap.

## Global Constraints

- Tokens from Phase 0 (`tailwind.config.js`): `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif` (Fraunces), `shadow-luxe`, `animate-shimmer`. `brass` is decorative/background only — text/icon color needing contrast uses `brass-dark` (light backgrounds) or `brass-light` (dark `ink` backgrounds).
- Max 1-2 animated elements active in any single viewport at once. Several of these files currently have 4+ concurrent infinite-loop decorative animations (floating blur blobs, pulsing glows, bouncing badges) — all such decorative infinite loops are removed in this phase. Section reveal animations use `whileInView`/`viewport={{ once: true }}` (fires once, not infinite) or the shared `stagger`/`fadeUp` variants from `lib/motion.js`.
- No emoji as icons — lucide-react only. `components/HotelsCategory.jsx` currently uses `react-icons/fa`; `components/Newsletter.jsx` currently uses literal emoji characters (🎯✈️⚡🗺️) as icons — both migrate to lucide-react in this phase.
- **`components/Hotel.jsx` (the hotel card component rendered inside `HotelListing`'s grid) is explicitly OUT OF SCOPE for this phase** — it belongs to Phase 3 (Browse & Details) per the spec's phase list, alongside `app/details/[id]` and `Reviews`/`Reserve`. This means `HotelListing`'s grid will look like a luxury-toned container around old-style plain cards until Phase 3 lands — an expected, temporary transitional state, not a bug.
- `components/SuggestedHotels.jsx` (used on the hotel details page, a *different* file from `components/TopRatedHotel.jsx`) is also out of scope — it belongs to Phase 3.
- No test framework exists in this repo — verification is lint + targeted `grep`.
- **Known environment issue:** if working from a git worktree nested inside this repo's directory tree, `npm run lint` (next lint) fails with a false "Plugin @next/next was conflicted" error. Use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead in that situation.
- **Deliberate UX fix, not just a restyle:** `components/Offer.jsx` currently has a fake countdown timer (hardcoded "2 days 14:32:15" that ticks down locally on every page load, never backed by a real deadline) — this is a dark pattern (fake urgency) and is removed entirely in this phase, not just reskinned.

---

### Task 1: Composed skeleton components — `HotelCardSkeleton` and `HotelGridSkeleton`

**Files:**
- Create: `components/skeletons/HotelCardSkeleton.jsx`
- Create: `components/skeletons/HotelGridSkeleton.jsx`

**Interfaces:**
- Consumes: `components/skeletons/Skeleton.jsx` (Phase 0 base primitive, default export `Skeleton`, prop `className`).
- Produces: default export `HotelCardSkeleton` (no props) and default export `HotelGridSkeleton` (prop `count`, defaults to 8). Tasks 2, 3, 5, and 8 import these by these exact names.

- [ ] **Step 1: Create `components/skeletons/HotelCardSkeleton.jsx`**

```jsx
import Skeleton from "./Skeleton";

const HotelCardSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-2/3 rounded" />
          <Skeleton className="h-5 w-10 rounded" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
    </div>
  );
};

export default HotelCardSkeleton;
```

- [ ] **Step 2: Create `components/skeletons/HotelGridSkeleton.jsx`**

```jsx
import HotelCardSkeleton from "./HotelCardSkeleton";

const HotelGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <HotelCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default HotelGridSkeleton;
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -q 'from "./Skeleton"' components/skeletons/HotelCardSkeleton.jsx && \
grep -q 'from "./HotelCardSkeleton"' components/skeletons/HotelGridSkeleton.jsx && \
grep -q "export default HotelCardSkeleton" components/skeletons/HotelCardSkeleton.jsx && \
grep -q "export default HotelGridSkeleton" components/skeletons/HotelGridSkeleton.jsx && \
echo OK
```
Expected: `OK`

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/skeletons/HotelCardSkeleton.jsx components/skeletons/HotelGridSkeleton.jsx
git commit -m "feat: add composed HotelCardSkeleton and HotelGridSkeleton"
```

---

### Task 2: Restyle `Hero.jsx` (`AnimatedHeroBanner`)

**Files:**
- Modify: `components/Hero.jsx`

**Interfaces:**
- Consumes: `HotelCardSkeleton` (Task 1), `fadeUp`/`stagger`/`luxeEase` from `lib/motion.js` (Phase 0).
- No new exports — same default export (`React.memo(AnimatedHeroBanner)`), same `{ wishlists }` prop, same PropTypes.
- **Documented simplification:** the original file has 6 infinite-looping floating blur blobs, 2 infinite pulsing glow blobs, and an infinite double-bounce scroll indicator running concurrently — all removed per the Global Constraints motion cap. All data logic (hotel/review fetching, session fetch, slide rotation every 5s, hotel rotation every 7s, average-rating calculation, amenity icon mapping, favorite button integration) is preserved exactly — only the decorative animation layer and color palette change.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, Users, Star, Wifi, Car, Dumbbell, Heart } from "lucide-react";
import Link from "next/link";
import { getAllHotels, getReviews, session } from "@/app/action";
import Image from "next/image";
import AddToFavButton from "./AddToFavBtn";
import HotelCardSkeleton from "./skeletons/HotelCardSkeleton";
import { fadeUp, stagger, luxeEase } from "@/lib/motion";

const HERO_SLIDES = [
  {
    title: "Discover Perfect",
    highlight: "Getaways",
    subtitle:
      "Explore a curated range of accommodations, from luxurious beachfront villas to cozy mountain retreats, perfect for your next escape.",
  },
  {
    title: "Explore Amazing",
    highlight: "Destinations",
    subtitle:
      "Handpicked hotels and resorts in breathtaking locations, offering unique experiences and stunning views for every traveler.",
  },
  {
    title: "Elevated Luxury",
    highlight: "Redefined",
    subtitle:
      "Indulge in premium accommodations with world-class amenities, designed for unmatched comfort and sophistication.",
  },
];

const STATS = [
  { id: "hotels", label: "Available Hotels" },
  { id: "travelers", number: "50,000+", label: "Happy Travelers" },
  { id: "rating", number: "4.9", label: "Average Rating", icon: Star },
  { id: "support", number: "24/7", label: "Customer Support" },
];

const AnimatedHeroBanner = ({ wishlists }) => {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userId, setUserId] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHotelHovering, setIsHotelHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [hotelsData, reviewsData] = await Promise.all([
        getAllHotels(),
        getReviews(),
      ]);
      setHotels(hotelsData?.hotels || []);
      setReviews(reviewsData?.reviews || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load hotels");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isHotelHovering) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHotelHovering]);

  useEffect(() => {
    if (isHotelHovering || hotels.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHotelIndex((prev) => (prev + 1) % hotels.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [hotels.length, isHotelHovering]);

  const getAmenityIcon = useCallback((amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi"))
      return <Wifi className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes("parking"))
      return <Car className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes("fitness"))
      return <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    return <Heart className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
  }, []);

  const currentHotelRating = useMemo(() => {
    if (!hotels[currentHotelIndex] || reviews.length === 0) return 0;

    const filteredReviews = reviews.filter(
      (review) => review.hotelId === hotels[currentHotelIndex]._id
    );
    const totalReviews = filteredReviews.length;
    const averageRating =
      totalReviews > 0
        ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews
        : 0;

    return averageRating;
  }, [hotels, reviews, currentHotelIndex]);

  const currentHotel = hotels[currentHotelIndex];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="text-cream text-center p-4">
          <p className="text-lg sm:text-xl mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-brass-dark hover:bg-brass text-cream px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink py-5 sm:py-0 md:py-0 lg:py-0">
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-[#2a251f]"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          variants={prefersReducedMotion ? undefined : stagger}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          className="w-full max-w-7xl mx-auto py-16"
          role="main"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: luxeEase }}
                  className="space-y-4 sm:space-y-6"
                >
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-cream leading-tight">
                    {HERO_SLIDES[currentSlide].title}
                    <span className="block italic text-brass-light">
                      {HERO_SLIDES[currentSlide].highlight}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-cream/70 max-w-2xl">
                    {HERO_SLIDES[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hotel Card */}
            <div className="order-1 lg:order-2">
              {isLoading ? (
                <div className="bg-cream/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream/10">
                  <HotelCardSkeleton />
                </div>
              ) : (
                currentHotel && (
                  <motion.div
                    variants={prefersReducedMotion ? undefined : fadeUp}
                    className="relative"
                    onMouseEnter={() => setIsHotelHovering(true)}
                    onMouseLeave={() => setIsHotelHovering(false)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentHotel._id}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
                        transition={{ duration: 0.6, ease: luxeEase }}
                        className="bg-cream/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream/10 shadow-luxe"
                      >
                        <div className="relative mb-4">
                          <Image
                            height={256}
                            width={512}
                            src={currentHotel.images[0]}
                            alt={currentHotel.title}
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-xl sm:rounded-2xl"
                            priority
                          />

                          <AddToFavButton
                            hotelId={currentHotel._id}
                            userId={userId}
                            title={currentHotel.title}
                            location={currentHotel.location}
                            rent={currentHotel.rent}
                            images={currentHotel.images}
                            wishlists={wishlists}
                          />

                          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-ink/70 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1">
                            <span className="text-cream font-semibold text-sm sm:text-base">
                              ${currentHotel.rent}/night
                            </span>
                          </div>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-cream mb-2 line-clamp-1">
                          {currentHotel.title}
                        </h3>
                        <p className="text-cream/60 mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <MapPin
                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1">{currentHotel.location}</span>
                        </p>

                        <div className="flex items-center gap-2 sm:gap-4 mb-4 text-cream/60 text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Users
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              aria-hidden="true"
                            />
                            {currentHotel.guestCapacity} guests
                          </span>
                          <span className="hidden sm:inline">
                            {currentHotel.bedroomCapacity} bedrooms
                          </span>
                          <span className="sm:hidden">
                            {currentHotel.bedroomCapacity} bed
                          </span>
                          <span className="hidden sm:inline">
                            {currentHotel.bedCapacity} beds
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {currentHotel.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <div
                                key={`${currentHotel._id}-amenity-${index}`}
                                className="flex items-center gap-1 bg-cream/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-cream/70"
                              >
                                {getAmenityIcon(amenity)}
                                <span className="truncate max-w-20 sm:max-w-none">
                                  {amenity}
                                </span>
                              </div>
                            ))}
                          {currentHotel.amenities.length > 3 && (
                            <div className="flex items-center bg-cream/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-cream/70">
                              +{currentHotel.amenities.length - 3} more
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm sm:text-base">
                            <div className="flex items-center gap-1">
                              <Star
                                className="w-3 h-3 sm:w-4 sm:h-4 text-brass-light fill-current"
                                aria-hidden="true"
                              />
                              <span className="text-cream font-semibold">
                                {currentHotelRating > 0
                                  ? currentHotelRating.toFixed(1)
                                  : "No rating"}
                              </span>
                            </div>
                            <span className="text-cream/40 hidden sm:inline">·</span>
                            <span className="text-cream/60 text-xs sm:text-sm truncate max-w-24 sm:max-w-none">
                              <span className="hidden sm:inline">Host: </span>
                              {currentHotel.hostName}
                            </span>
                          </div>
                          <Link
                            href={`/details/${currentHotel._id}`}
                            className="bg-brass-dark hover:bg-brass rounded-lg px-3 sm:px-4 py-2 text-cream font-semibold transition-colors text-xs sm:text-sm"
                            aria-label={`View details for ${currentHotel.title}`}
                          >
                            View Details
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )
              )}
            </div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12"
            role="region"
            aria-label="Statistics"
          >
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cream/5 border border-cream/10"
              >
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-cream mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
                  {stat.id === "hotels"
                    ? hotels.length.toLocaleString() || "0"
                    : stat.number}
                  {stat.icon && (
                    <stat.icon
                      className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-brass-light"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="text-cream/60 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

AnimatedHeroBanner.propTypes = {
  wishlists: PropTypes.array,
  userId: PropTypes.string,
  hotels: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      rent: PropTypes.number.isRequired,
      guestCapacity: PropTypes.number.isRequired,
      bedroomCapacity: PropTypes.number.isRequired,
      bedCapacity: PropTypes.number.isRequired,
      amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
      hostName: PropTypes.string.isRequired,
    })
  ),
};

export default React.memo(AnimatedHeroBanner);
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "floatingVariants\|glowVariants" components/Hero.jsx
grep -q 'from "./skeletons/HotelCardSkeleton"' components/Hero.jsx && echo SKELETON_OK
grep -q 'from "@/lib/motion"' components/Hero.jsx && echo MOTION_OK
grep -q "useReducedMotion" components/Hero.jsx && echo REDUCED_MOTION_OK
```
Expected:
```
0
SKELETON_OK
MOTION_OK
REDUCED_MOTION_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Hero.jsx
git commit -m "feat: restyle Hero to luxury palette, cut decorative animation to spec cap"
```

---

### Task 3: Restyle `HotelListing.jsx`

**Files:**
- Modify: `components/HotelListing.jsx`

**Interfaces:**
- Consumes: `HotelGridSkeleton` (Task 1), `fadeUp` from `lib/motion.js`.
- No new exports — same default export `HotelListing`, no props.
- Renders `<Hotel />` cards (`components/Hotel.jsx`) exactly as before — that component is untouched (Phase 3 scope, see Global Constraints).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { getHotels, getReviews } from "@/app/action";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hotel from "./Hotel";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import Pagination from "./Pagination";
import HotelGridSkeleton from "./skeletons/HotelGridSkeleton";
import { fadeUp } from "@/lib/motion";

const HotelListing = () => {
  const { searchQuery } = useSearch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [hotelsData, reviewsData] = await Promise.all([
          getHotels(currentPage, 8, searchQuery),
          getReviews(),
        ]);
        setHotels(hotelsData);
        setTotalPages(hotelsData.totalPages);
        setReviews(reviewsData?.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/?page=${newPage}`);
    }
  };

  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        Error loading hotels: {error}
      </div>
    );
  }

  return (
    <section className="mt-10 px-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Find Your Stay
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Discover a range of hotels tailored for every traveler.
        </p>
      </motion.div>
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <HotelGridSkeleton count={8} />
        ) : hotels?.hotels?.length === 0 ? (
          <div className="text-center text-xl text-muted h-96 flex items-center justify-center">
            No hotels found.
          </div>
        ) : (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {hotels?.hotels?.map((hotel) => {
              const filteredReviews = reviews.filter(
                (review) => review.hotelId === hotel._id
              );
              const totalReviews = filteredReviews.length;
              const averageRating =
                totalReviews > 0
                  ? filteredReviews.reduce(
                      (acc, review) => acc + review.ratings,
                      0
                    ) / totalReviews
                  : 0;
              return (
                <motion.div key={hotel._id} variants={fadeUp}>
                  <Hotel hotel={hotel} averageRating={averageRating} />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <div className="mt-10 flex justify-center">
        {hotels && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </div>
    </section>
  );
};

export default HotelListing;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'from "./skeletons/HotelGridSkeleton"' components/HotelListing.jsx && echo SKELETON_OK
grep -q 'from "@/lib/motion"' components/HotelListing.jsx && echo MOTION_OK
grep -c "bg-gray-200" components/HotelListing.jsx
```
Expected:
```
SKELETON_OK
MOTION_OK
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/HotelListing.jsx
git commit -m "feat: restyle HotelListing with luxury tokens and composed skeleton"
```

---

### Task 4: Restyle `HotelsCategory.jsx`

**Files:**
- Modify: `components/HotelsCategory.jsx`

**Interfaces:**
- Consumes: `Skeleton` (Phase 0 base primitive), `fadeUp` from `lib/motion.js`.
- No new exports — same default export `HotelsCategory`, no props.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { getAllHotels } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Building2, Umbrella, Mountain, Trees, Gem, Sun, Waves } from "lucide-react";
import { motion } from "framer-motion";
import Skeleton from "./skeletons/Skeleton";
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

const HotelsCategory = () => {
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const response = await getAllHotels();
        if (!response || !response.hotels) {
          throw new Error("No hotels found");
        }
        setHotels(response.hotels);

        const uniqueCategories = [
          ...new Set(response.hotels.map((hotel) => hotel.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Building2;
    return <Icon className="w-8 h-8 text-brass-dark" aria-hidden="true" />;
  };

  const getCategoryTitle = (category) =>
    category.charAt(0).toUpperCase() + category.slice(1);

  const getCategoryCount = (category) =>
    hotels.filter((hotel) => hotel.category === category).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Explore by Category
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Find the perfect hotel that suits your travel preferences and style
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-hairline overflow-hidden"
            >
              <div className="p-6 text-center">
                <Skeleton className="h-10 w-10 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-3/4 mx-auto mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded" />
              </div>
              <div className="bg-surface-alt px-6 py-3">
                <Skeleton className="h-4 w-1/3 mx-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              variants={fadeUp}
              className="bg-surface rounded-xl border border-hairline hover:shadow-luxe transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  {getCategoryTitle(category)}
                </h3>
                <p className="text-sm text-muted">
                  {getCategoryCount(category)}{" "}
                  {getCategoryCount(category) === 1 ? "hotel" : "hotels"}
                </p>
              </div>
              <div className="bg-surface-alt px-6 py-3">
                <Link
                  href={`/category/${category}`}
                  className="text-sm font-medium text-brass-dark hover:text-ink transition-colors duration-200"
                >
                  Explore →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted">
            No categories available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotelsCategory;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "react-icons" components/HotelsCategory.jsx
grep -q 'from "./skeletons/Skeleton"' components/HotelsCategory.jsx && echo SKELETON_OK
grep -q 'from "@/lib/motion"' components/HotelsCategory.jsx && echo MOTION_OK
```
Expected:
```
0
SKELETON_OK
MOTION_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/HotelsCategory.jsx
git commit -m "feat: restyle HotelsCategory with lucide icons and luxury tokens"
```

---

### Task 5: Restyle `TopRatedHotel.jsx`

**Files:**
- Modify: `components/TopRatedHotel.jsx` (default export is internally named `SuggestedHotels` — this is a pre-existing naming quirk in this file only, unrelated to the separate `components/SuggestedHotels.jsx` file used on the details page; keep the internal name as-is, do not rename it)

**Interfaces:**
- Consumes: `Skeleton` (Phase 0 base primitive).
- No new exports — same default export, no props. Still imported as `TopRatedHotels` in `app/page.js` (that import alias is unaffected by this task).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import { getHotels, getReviews } from "@/app/action";
import Skeleton from "./skeletons/Skeleton";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const calcAvg = (reviews, id) => {
  const r = reviews.filter((v) => v.hotelId === id);
  return r.length ? +(r.reduce((s, v) => s + v.ratings, 0) / r.length).toFixed(1) : 0;
};

export default function SuggestedHotels() {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [h, r] = await Promise.all([getHotels(), getReviews()]);
        setHotels(h?.hotels ?? []);
        setReviews(r?.reviews ?? []);
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top = useMemo(() => {
    return [...hotels]
      .map((h) => ({ ...h, avg: calcAvg(reviews, h._id) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [hotels, reviews]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 rounded-lg mb-8 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl overflow-hidden border border-hairline"
            >
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-6 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/4 rounded" />
                  <Skeleton className="h-6 w-24 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Top-Rated Hotels
        </h2>
        <p className="text-muted text-base sm:text-lg mt-2">
          Discover our handpicked selection of guest-favorite stays
        </p>
      </header>

      <div
        className="relative"
        onMouseEnter={() => swiperRef.current?.swiper?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.swiper?.autoplay?.start()}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          ref={swiperRef}
          navigation={{
            nextEl: ".next-btn",
            prevEl: ".prev-btn",
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {top.map((hotel) => {
            const totalReviews = reviews.filter((r) => r.hotelId === hotel._id).length;

            return (
              <SwiperSlide key={hotel._id}>
                <Link href={`/details/${hotel._id}`} className="block">
                  <article className="group bg-surface rounded-xl overflow-hidden border border-hairline transition-all duration-300 hover:shadow-luxe">
                    <div className="relative h-64">
                      <Image
                        src={hotel.images?.[0] ?? "/placeholder.jpg"}
                        alt={hotel.title || "Hotel image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={false}
                      />
                      <span className="absolute top-3 right-3 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-ink">
                        <Star className="w-4 h-4 text-brass-dark fill-current" />
                        {hotel.avg.toFixed(1)} ({totalReviews})
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-ink line-clamp-1 group-hover:text-brass-dark transition-colors">
                          {hotel.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.location}</span>
                        </div>
                        <p className="text-sm text-muted line-clamp-2">{hotel.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-xl font-bold text-ink">${hotel.rent}</span>
                          <span className="text-sm text-muted ml-1">/night</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 bg-brass-dark text-cream text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-brass transition-all duration-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          aria-label="Previous slide"
          className="prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface border border-hairline rounded-full flex items-center justify-center shadow-md hover:bg-brass-dark hover:text-cream transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Next slide"
          className="next-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-surface border border-hairline rounded-full flex items-center justify-center shadow-md hover:bg-brass-dark hover:text-cream transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <style jsx global>{`
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d9c6a0;
          opacity: 0.7;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          width: 12px;
          height: 12px;
          background: #8c6d3f;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -q 'from "./skeletons/Skeleton"' components/TopRatedHotel.jsx && echo SKELETON_OK
grep -c "#009688" components/TopRatedHotel.jsx
grep -c "bg-gray-200" components/TopRatedHotel.jsx
```
Expected:
```
SKELETON_OK
0
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/TopRatedHotel.jsx
git commit -m "feat: restyle TopRatedHotel carousel with luxury tokens"
```

---

### Task 6: Restyle `Offer.jsx` (and remove fake countdown)

**Files:**
- Modify: `components/Offer.jsx`

**Interfaces:**
- No new exports — same default export `Offer`, no props.
- **UX fix, not just restyle:** the fake countdown timer state/effect (`timeLeft`, the `setInterval` that decrements a hardcoded "2 days 14:32:15" with no real deadline behind it) is deleted entirely, per Global Constraints.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";
import React from "react";
import { Percent, ShieldCheck, BadgeCheck, Clock } from "lucide-react";

const OFFERS = [
  {
    title: "Summer Escape",
    discount: "25%",
    description: "Beach resorts & coastal getaways",
  },
  {
    title: "City Breaks",
    discount: "20%",
    description: "Urban adventures & luxury stays",
  },
  {
    title: "Mountain Retreats",
    discount: "30%",
    description: "Cozy cabins & scenic lodges",
  },
];

const Offer = () => {
  return (
    <div className="bg-surface-alt py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-brass-light/40 text-brass-dark px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Percent className="w-4 h-4 mr-2" />
            Limited Time Offers
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
            Special Summer Deals
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Save up to 30% on handpicked hotels and resorts.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {OFFERS.map((offer, index) => (
            <div
              key={index}
              className="group relative bg-surface rounded-xl border border-hairline hover:shadow-luxe transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-ink">{offer.title}</h3>
                  <div className="bg-brass-dark text-cream px-3 py-1 rounded-full text-sm font-bold">
                    {offer.discount} OFF
                  </div>
                </div>
                <p className="text-muted mb-4">{offer.description}</p>
                <div className="flex items-center text-sm text-muted">
                  <BadgeCheck className="w-4 h-4 mr-1 text-brass-dark" />
                  Free cancellation
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-muted">
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-brass-dark" />
              Secure booking
            </div>
            <div className="flex items-center">
              <BadgeCheck className="w-4 h-4 mr-1 text-brass-dark" />
              Best price guarantee
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-brass-dark" />
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offer;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "timeLeft\|setInterval" components/Offer.jsx
grep -c "from-blue-400\|from-purple-400\|from-green-400" components/Offer.jsx
```
Expected:
```
0
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Offer.jsx
git commit -m "fix: remove fake countdown timer from Offer, restyle to luxury tokens"
```

---

### Task 7: Restyle `Newsletter.jsx`

**Files:**
- Modify: `components/Newsletter.jsx`

**Interfaces:**
- No new exports — same default export `Newsletter`, no props. Same `/api/newsletter` POST contract, same email regex, same success/error/loading state machine as before — only markup, classes, and icons change.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";
import React, { useState } from "react";
import { Target, Plane, Zap, Map, Loader2, Check } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

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

      setIsSubmitted(true);
      setEmail("");

      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    } catch (error) {
      setEmailError(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: Target, title: "Exclusive Deals", description: "Get access to member-only discounts up to 40% off" },
    { icon: Plane, title: "Travel Tips", description: "Expert advice and hidden gems from travel professionals" },
    { icon: Zap, title: "Flash Sales", description: "Be the first to know about limited-time offers" },
    { icon: Map, title: "Destination Guides", description: "Comprehensive guides for your next adventure" },
  ];

  return (
    <div className="bg-ink py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-cream/10 text-brass-light px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Join 50,000+ Happy Travelers
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-cream mb-4">
            Never Miss a <span className="italic text-brass-light">Deal</span>
          </h2>
          <p className="text-xl text-cream/70 max-w-2xl mx-auto">
            Get exclusive access to flash sales, travel tips, and insider deals
            delivered straight to your inbox
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="flex items-center bg-cream/5 rounded-2xl border border-cream/10 overflow-hidden">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="Enter your email address"
                className="w-full px-6 py-4 text-cream bg-transparent focus:outline-none placeholder-cream/40"
                required
              />
              {emailError && (
                <div className="absolute -bottom-6 left-0 text-red-400 text-sm">
                  {emailError}
                </div>
              )}
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoading || isSubmitted}
              className="bg-brass-dark hover:bg-brass text-cream px-8 py-4 font-semibold transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subscribing...
                </span>
              ) : isSubmitted ? (
                <span className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Subscribed!
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {isSubmitted && (
            <div className="mt-6 p-4 bg-cream/5 border border-brass-dark/40 rounded-lg text-center">
              <span className="text-brass-light font-medium">
                Welcome aboard! Check your email to get regular updates.
              </span>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-sm text-cream/60">
            <span>100% Secure</span>
            <span>No Spam</span>
            <span>Unsubscribe Anytime</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-cream/5 rounded-2xl p-6 border border-cream/10 hover:border-brass-dark/50 transition-all duration-300"
              >
                <Icon className="w-8 h-8 text-brass-light mb-3" />
                <h3 className="text-lg font-semibold text-cream mb-2">{benefit.title}</h3>
                <p className="text-cream/60 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-cream/5 rounded-2xl p-8 border border-cream/10">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">50,000+</div>
              <div className="text-cream/60">Happy Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">2x/week</div>
              <div className="text-cream/60">Newsletter Frequency</div>
            </div>
            <div>
              <div className="text-3xl font-serif text-brass-light mb-2">$500+</div>
              <div className="text-cream/60">Average Savings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "🎯\|✈️\|⚡\|🗺️" components/Newsletter.jsx
grep -q "/api/newsletter" components/Newsletter.jsx && echo API_OK
grep -c "from-purple-600\|from-indigo-50" components/Newsletter.jsx
```
Expected:
```
0
API_OK
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Newsletter.jsx
git commit -m "feat: restyle Newsletter with lucide icons and luxury tokens"
```

---

### Task 8: Wire real skeleton fallback in `app/page.js`

**Files:**
- Modify: `app/page.js`

**Interfaces:**
- Consumes: `HotelGridSkeleton` (Task 1).

- [ ] **Step 1: Replace the file contents**

```jsx
import AnnounceBar from "@/components/AnnounceBar";
import Footer from "@/components/Footer";
import AnimatedHeroBanner from "@/components/Hero";
import HeroSection from "@/components/HeroSection";
import HotelListing from "@/components/HotelListing";
import HotelsCategory from "@/components/HotelsCategory";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Offer from "@/components/Offer";
import TopRatedHotels from "@/components/TopRatedHotel";
import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <AnnounceBar />
      <Navbar />
      <HeroSection />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6 mt-10">
            <HotelGridSkeleton count={8} />
          </div>
        }
      >
        <HotelListing />
      </Suspense>
      <HotelsCategory />
      <TopRatedHotels />
      <Offer />
      <Newsletter />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "Loading\.\.\." app/page.js
grep -q 'from "@/components/skeletons/HotelGridSkeleton"' app/page.js && echo OK
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
git add app/page.js
git commit -m "feat: replace homepage Suspense fallback with real skeleton"
```

---

## Self-Review

**Spec coverage:** §7 Phase 2 lists Hero/HeroSection, HotelListing, HotelsCategory, TopRatedHotel, Offer, Newsletter, plus skeletons/Suspense fallback — all present as Tasks 1-8 (`HeroSection.jsx` itself needs no change, it's a thin server-component wrapper that just fetches wishlists/session and renders `AnimatedHeroBanner` — verified by reading the file, no styling in it to restyle). §5 composed skeletons → Task 1. §8 motion cap and emoji/icon rules → applied in Tasks 2, 4, 6, 7 (removed floating blobs, react-icons, literal emoji, fake countdown).

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected command output.

**Type/name consistency:** `HotelCardSkeleton`/`HotelGridSkeleton` (Task 1) imported by the exact same names in Tasks 2, 3, 5, 8. `fadeUp`/`stagger`/`luxeEase` imported from `lib/motion.js` exactly as Phase 0 exports them. `TopRatedHotel.jsx`'s internal `SuggestedHotels` function name is explicitly called out as a pre-existing quirk, not touched, so it doesn't get confused with the separate `components/SuggestedHotels.jsx` file (Phase 3 scope).

**Scope check:** `components/Hotel.jsx` and `components/SuggestedHotels.jsx` are explicitly flagged as out-of-scope Phase 3 work in Global Constraints, with the resulting transitional visual inconsistency (old card style inside a new luxury-toned grid) called out as expected, not a defect.

---

## Next Phases

Phase 3 (Browse & Details: `app/category/[category]`, `app/details/[id]`, `Hotel` card, `Reviews`, `Reserve`, `SuggestedHotels`, `HotelSearch`, `Pagination`, + `loading.js` for both routes) gets its own plan, written next against those components' actual current layout — this will finally restyle `Hotel.jsx`, resolving Task 3's transitional grid-inconsistency note above.
