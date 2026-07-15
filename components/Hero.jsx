"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Search, MapPin, Users } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=80";

const CATEGORY_LABELS = {
  urban: "Urban",
  beach: "Beach",
  mountain: "Mountain",
  luxury: "Luxury",
  rustic: "Rustic",
  countryside: "Countryside",
  lakeside: "Lakeside",
  desert: "Desert",
  island: "Island",
  ski: "Ski",
};

export default function Hero({ image, destinations = [], categories = [], hotels = [] }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const heroRef = useRef(null);
  const locationBoxRef = useRef(null);
  const [chromeH, setChromeH] = useState(0);

  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Height = viewport minus the announce bar + navbar above it, so together
  // they read as exactly one screen. Recomputes when the announce bar is
  // dismissed (its removal is a body DOM mutation) or on resize.
  useLayoutEffect(() => {
    const compute = () => {
      const nav = document.querySelector("nav");
      const announce = document.querySelector("[data-announcebar]");
      const next = (nav?.offsetHeight || 0) + (announce?.offsetHeight || 0);
      setChromeH((prev) => (prev === next ? prev : next));
    };
    compute();
    window.addEventListener("resize", compute);
    const mo = new MutationObserver(compute);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("resize", compute);
      mo.disconnect();
    };
  }, []);

  // Close the suggestions dropdown on outside click. Uses `click` (not
  // `mousedown`) so clicking the search button still submits the form.
  useEffect(() => {
    const onClick = (e) => {
      if (locationBoxRef.current && !locationBoxRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const goToSearch = (loc) => {
    const params = new URLSearchParams();
    if (loc) params.set("location", loc);
    if (guestCount > 1) params.set("guests", String(guestCount));
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearch(location.trim());
  };

  const query = location.trim().toLowerCase();

  // Typeahead: when the user is typing, match real hotels.
  const hotelMatches = useMemo(() => {
    if (!query) return [];
    return hotels
      .filter(
        (h) =>
          h.title?.toLowerCase().includes(query) ||
          h.location?.toLowerCase().includes(query) ||
          h.category?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [query, hotels]);

  const filteredDestinations = query
    ? destinations.filter((d) => d.toLowerCase().includes(query))
    : destinations;

  return (
    <section
      ref={heroRef}
      style={{ height: chromeH ? `calc(100dvh - ${chromeH}px)` : "100dvh" }}
      className="relative w-full overflow-hidden min-h-[520px]"
    >
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : parallaxY }}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
      >
        <Image
          src={image || FALLBACK_IMAGE}
          alt="Featured hotel"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10"
        aria-hidden="true"
      />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream mb-4">
          Escape. Unwind. Stay.
        </h1>
        <p className="text-cream/80 text-base sm:text-lg max-w-xl mb-10">
          Discover handpicked hotels and resorts for your next getaway.
        </p>

        <form
          onSubmit={handleSearch}
          className="w-full max-w-3xl bg-surface/95 backdrop-blur-md rounded-2xl border border-hairline shadow-luxe p-3 sm:p-4 flex flex-col sm:flex-row gap-3"
        >
          <div className="text-left relative flex-1" ref={locationBoxRef}>
            <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2.5 bg-surface h-11">
              <MapPin className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Search a city or hotel"
                className="w-full outline-none text-sm bg-transparent text-ink placeholder:text-muted"
              />
            </div>

            {dropdownOpen && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-surface border border-hairline rounded-xl shadow-luxe overflow-hidden text-left max-h-96 overflow-y-auto">
                {query ? (
                  <>
                    {hotelMatches.length > 0 ? (
                      <ul>
                        {hotelMatches.map((h) => (
                          <li key={h._id}>
                            <button
                              type="button"
                              onClick={() => {
                                setDropdownOpen(false);
                                router.push(`/details/${h._id}`);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-alt transition-colors text-left"
                            >
                              <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
                                <Image
                                  src={h.image || "https://placehold.co/96x96"}
                                  alt={h.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-ink truncate">
                                  {h.title}
                                </span>
                                <span className="block text-xs text-muted truncate">
                                  {h.location}
                                  {h.category ? ` · ${CATEGORY_LABELS[h.category] || h.category}` : ""}
                                </span>
                              </span>
                              <span className="text-sm font-semibold text-ink flex-shrink-0">
                                ${h.rent}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-3 text-sm text-muted">No matches for "{location.trim()}"</p>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        goToSearch(location.trim());
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-hairline text-sm text-brass-dark hover:bg-surface-alt transition-colors font-medium"
                    >
                      <Search className="w-4 h-4" />
                      Search all stays for "{location.trim()}"
                    </button>
                  </>
                ) : (
                  <div className="p-3">
                    {filteredDestinations.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide px-2 mb-1">
                          Popular destinations
                        </p>
                        <ul className="mb-2">
                          {filteredDestinations.slice(0, 6).map((dest) => (
                            <li key={dest}>
                              <button
                                type="button"
                                onClick={() => {
                                  setLocation(dest);
                                  setDropdownOpen(false);
                                  goToSearch(dest);
                                }}
                                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-ink hover:bg-surface-alt transition-colors"
                              >
                                <MapPin className="w-4 h-4 text-brass-dark flex-shrink-0" />
                                {dest}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {categories.length > 0 && (
                      <>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wide px-2 mb-1">
                          Browse by type
                        </p>
                        <div className="flex flex-wrap gap-2 px-2 pt-1">
                          {categories.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setDropdownOpen(false);
                                router.push(`/category/${cat}`);
                              }}
                              className="px-3 py-1.5 rounded-full border border-hairline text-xs text-ink hover:bg-surface-alt hover:border-brass transition-colors"
                            >
                              {CATEGORY_LABELS[cat] || cat}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <label className="text-left sm:w-32">
            <span className="sr-only">Guests</span>
            <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 bg-surface h-11">
              <Users className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
              <input
                type="number"
                min={1}
                value={guestCount}
                onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-full outline-none text-sm bg-transparent text-ink"
                aria-label="Guests"
              />
            </div>
          </label>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-brass-dark hover:bg-brass text-cream rounded-lg h-11 px-6 transition-colors font-medium"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span className="sm:hidden">Search</span>
          </button>
        </form>
      </div>
    </section>
  );
}
