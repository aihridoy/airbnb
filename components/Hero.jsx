"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Search, MapPin, Users, Star, Minus, Plus, SlidersHorizontal, ChevronDown } from "lucide-react";

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

const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

export default function Hero({
  image,
  destinations = [],
  categories = [],
  hotels = [],
  amenityOptions = [],
  priceBounds = { min: 0, max: 1000 },
}) {
  const router = useRouter();

  // Filter state
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [guests, setGuests] = useState(1);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [amenities, setAmenities] = useState([]);

  // Which segment popover is open: 'where' | 'type' | 'guests' | 'price' | 'filters' | null
  const [active, setActive] = useState(null);

  const heroRef = useRef(null);
  const barRef = useRef(null);
  const inputRef = useRef(null);
  const [chromeH, setChromeH] = useState(0);

  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Height = viewport minus the announce bar + navbar, so together they read
  // as exactly one screen. Recomputes on announce dismiss / resize.
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

  // Close any open segment on outside click.
  useEffect(() => {
    const onClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setActive(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const goToSearch = (loc = location) => {
    const params = new URLSearchParams();
    if (loc.trim()) params.set("location", loc.trim());
    if (category) params.set("category", category);
    if (guests > 1) params.set("guests", String(guests));
    if (minPrice) params.set("minPrice", String(minPrice));
    if (maxPrice) params.set("maxPrice", String(maxPrice));
    if (minRating > 0) params.set("minRating", String(minRating));
    if (amenities.length) params.set("amenities", amenities.join(","));
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearch();
  };

  const query = location.trim().toLowerCase();
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

  const toggleAmenity = (a) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const filterCount = (minRating > 0 ? 1 : 0) + amenities.length;
  const priceLabel =
    minPrice || maxPrice
      ? `$${minPrice || priceBounds.min}–$${maxPrice || priceBounds.max}`
      : "Any price";

  const segment = (key, label, value, extra = "") => (
    <button
      type="button"
      onClick={() => setActive((a) => (a === key ? null : key))}
      className={`text-left px-4 py-2 rounded-full transition-colors hover:bg-surface-alt ${
        active === key ? "bg-surface-alt" : ""
      } ${extra}`}
    >
      <span className="block text-[10px] uppercase tracking-wide text-muted font-semibold">
        {label}
      </span>
      <span className="flex items-center gap-1 text-sm text-ink truncate">
        {value}
        <ChevronDown className="w-3 h-3 text-muted flex-shrink-0" />
      </span>
    </button>
  );

  return (
    <section
      ref={heroRef}
      style={{ height: chromeH ? `calc(100dvh - ${chromeH}px)` : "100dvh" }}
      className="relative w-full overflow-hidden min-h-[560px]"
    >
      <motion.div
        style={{ y: prefersReducedMotion ? 0 : parallaxY }}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
      >
        <Image src={image || FALLBACK_IMAGE} alt="Featured hotel" fill priority sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/10" aria-hidden="true" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-cream mb-4">
          Escape. Unwind. Stay.
        </h1>
        <p className="text-cream/80 text-base sm:text-lg max-w-xl mb-10">
          Discover handpicked hotels and resorts for your next getaway.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-4xl">
          <div
            ref={barRef}
            className="bg-surface/95 backdrop-blur-md rounded-2xl lg:rounded-full border border-hairline shadow-luxe flex flex-col lg:flex-row lg:items-center p-2 lg:p-1.5 gap-1 lg:gap-0"
          >
            {/* WHERE */}
            <div className="relative flex-1 lg:min-w-0">
              <div
                onClick={() => {
                  setActive("where");
                  inputRef.current?.focus();
                }}
                className={`px-4 py-1.5 rounded-full cursor-text transition-colors hover:bg-surface-alt ${
                  active === "where" ? "bg-surface-alt" : ""
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wide text-muted font-semibold">
                  Where
                </span>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-muted flex-shrink-0" aria-hidden="true" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setActive("where");
                    }}
                    onFocus={() => setActive("where")}
                    placeholder="Search a city or hotel"
                    className="w-full outline-none text-sm bg-transparent text-ink placeholder:text-muted"
                  />
                </div>
              </div>

              {active === "where" && (
                <div className="absolute z-30 left-0 right-0 lg:w-96 mt-2 bg-surface border border-hairline rounded-xl shadow-luxe overflow-hidden text-left max-h-96 overflow-y-auto">
                  {query ? (
                    <>
                      {hotelMatches.length > 0 ? (
                        <ul>
                          {hotelMatches.map((h) => (
                            <li key={h._id}>
                              <button
                                type="button"
                                onClick={() => {
                                  setActive(null);
                                  router.push(`/details/${h._id}`);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-alt transition-colors text-left"
                              >
                                <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
                                  <Image src={h.image || "https://placehold.co/96x96"} alt={h.title} fill sizes="48px" className="object-cover" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium text-ink truncate">{h.title}</span>
                                  <span className="block text-xs text-muted truncate">
                                    {h.location}
                                    {h.category ? ` · ${CATEGORY_LABELS[h.category] || h.category}` : ""}
                                  </span>
                                </span>
                                <span className="text-sm font-semibold text-ink flex-shrink-0">${h.rent}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="px-3 py-3 text-sm text-muted">No matches for &quot;{location.trim()}&quot;</p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActive(null);
                          goToSearch();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-hairline text-sm text-brass-dark hover:bg-surface-alt transition-colors font-medium"
                      >
                        <Search className="w-4 h-4" />
                        Search all stays for &quot;{location.trim()}&quot;
                      </button>
                    </>
                  ) : (
                    <div className="p-3">
                      {filteredDestinations.length > 0 && (
                        <>
                          <p className="text-xs font-semibold text-muted uppercase tracking-wide px-2 mb-1">Popular destinations</p>
                          <ul className="mb-2">
                            {filteredDestinations.slice(0, 6).map((dest) => (
                              <li key={dest}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLocation(dest);
                                    setActive(null);
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
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:block h-8 w-px bg-hairline" aria-hidden="true" />

            {/* TYPE */}
            <div className="relative">
              {segment("type", "Type", category ? CATEGORY_LABELS[category] || category : "Any type")}
              {active === "type" && (
                <div className="absolute z-30 left-0 mt-2 w-56 bg-surface border border-hairline rounded-xl shadow-luxe p-2 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("");
                      setActive(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-alt ${!category ? "text-brass-dark font-medium" : "text-ink"}`}
                  >
                    Any type
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCategory(c);
                        setActive(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-alt ${category === c ? "text-brass-dark font-medium" : "text-ink"}`}
                    >
                      {CATEGORY_LABELS[c] || c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden lg:block h-8 w-px bg-hairline" aria-hidden="true" />

            {/* GUESTS */}
            <div className="relative">
              {segment("guests", "Guests", `${guests} guest${guests > 1 ? "s" : ""}`)}
              {active === "guests" && (
                <div className="absolute z-30 left-0 mt-2 w-60 bg-surface border border-hairline rounded-xl shadow-luxe p-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink">Guests</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Decrease guests"
                        onClick={() => setGuests((g) => Math.max(1, g - 1))}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-ink hover:border-brass disabled:opacity-40"
                        disabled={guests <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-ink">{guests}</span>
                      <button
                        type="button"
                        aria-label="Increase guests"
                        onClick={() => setGuests((g) => Math.min(20, g + 1))}
                        className="w-8 h-8 rounded-full border border-hairline flex items-center justify-center text-ink hover:border-brass"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block h-8 w-px bg-hairline" aria-hidden="true" />

            {/* PRICE */}
            <div className="relative">
              {segment("price", "Price", priceLabel)}
              {active === "price" && (
                <div className="absolute z-30 right-0 mt-2 w-72 bg-surface border border-hairline rounded-xl shadow-luxe p-4 text-left">
                  <p className="text-sm text-ink mb-3">Price per night</p>
                  <div className="flex items-center gap-3">
                    <label className="flex-1">
                      <span className="block text-xs text-muted mb-1">Min</span>
                      <div className="flex items-center border border-hairline rounded-lg px-2 h-10">
                        <span className="text-muted text-sm">$</span>
                        <input
                          type="number"
                          min={0}
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder={String(priceBounds.min)}
                          className="w-full outline-none text-sm bg-transparent text-ink px-1"
                        />
                      </div>
                    </label>
                    <span className="text-muted mt-5">–</span>
                    <label className="flex-1">
                      <span className="block text-xs text-muted mb-1">Max</span>
                      <div className="flex items-center border border-hairline rounded-lg px-2 h-10">
                        <span className="text-muted text-sm">$</span>
                        <input
                          type="number"
                          min={0}
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder={String(priceBounds.max)}
                          className="w-full outline-none text-sm bg-transparent text-ink px-1"
                        />
                      </div>
                    </label>
                  </div>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="mt-3 text-xs text-brass-dark hover:underline"
                    >
                      Clear price
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:block h-8 w-px bg-hairline" aria-hidden="true" />

            {/* FILTERS (rating + amenities) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActive((a) => (a === "filters" ? null : "filters"))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-colors hover:bg-surface-alt ${active === "filters" ? "bg-surface-alt" : ""}`}
              >
                <SlidersHorizontal className="w-4 h-4 text-ink" />
                <span className="text-sm text-ink">Filters</span>
                {filterCount > 0 && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-brass-dark text-cream text-xs flex items-center justify-center">
                    {filterCount}
                  </span>
                )}
              </button>
              {active === "filters" && (
                <div className="absolute z-30 right-0 mt-2 w-72 bg-surface border border-hairline rounded-xl shadow-luxe p-4 text-left max-h-80 overflow-y-auto">
                  <p className="text-sm text-ink mb-2">Minimum rating</p>
                  <div className="flex gap-2 mb-4">
                    {RATING_OPTIONS.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setMinRating(r.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                          minRating === r.value
                            ? "bg-brass-dark text-cream border-brass-dark"
                            : "border-hairline text-ink hover:bg-surface-alt"
                        }`}
                      >
                        {r.value > 0 && <Star className="w-3.5 h-3.5 fill-current" />}
                        {r.label}
                      </button>
                    ))}
                  </div>

                  {amenityOptions.length > 0 && (
                    <>
                      <p className="text-sm text-ink mb-2">Amenities</p>
                      <div className="space-y-1.5">
                        {amenityOptions.map((a) => (
                          <label key={a} className="flex items-center gap-2 text-sm text-ink cursor-pointer">
                            <input
                              type="checkbox"
                              checked={amenities.includes(a)}
                              onChange={() => toggleAmenity(a)}
                              className="accent-brass-dark w-4 h-4"
                            />
                            {a}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* SEARCH */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-brass-dark hover:bg-brass text-cream rounded-full h-12 lg:h-11 px-6 lg:ml-2 transition-colors font-medium"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
              <span className="lg:hidden">Search</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
