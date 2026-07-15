"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Search, MapPin, Users } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

export default function Hero({ image, destinations = [], categories = [] }) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
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
  // `mousedown`) so clicking the search button still submits the form -
  // a mousedown close mid-interaction was swallowing the submit.
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
    if (checkIn) params.set("checkin", checkIn.toISOString().slice(0, 10));
    if (checkOut) params.set("checkout", checkOut.toISOString().slice(0, 10));
    router.push(`/search?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    goToSearch(location.trim());
  };

  const filteredDestinations = location.trim()
    ? destinations.filter((d) =>
        d.toLowerCase().includes(location.trim().toLowerCase())
      )
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
          className="w-full max-w-4xl bg-surface/95 backdrop-blur-md rounded-2xl border border-hairline shadow-luxe p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div className="text-left relative" ref={locationBoxRef}>
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

            {dropdownOpen && (destinations.length > 0 || categories.length > 0) && (
              <div className="absolute z-20 left-0 right-0 mt-2 bg-surface border border-hairline rounded-xl shadow-luxe p-3 text-left max-h-80 overflow-y-auto">
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

          <label className="text-left">
            <span className="sr-only">Check-in</span>
            <div className="border border-hairline rounded-lg px-3 bg-surface h-11 flex items-center">
              <DatePicker
                selected={checkIn}
                onChange={setCheckIn}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date()}
                placeholderText="Check-in"
                className="w-full outline-none text-sm bg-transparent text-ink placeholder:text-muted"
              />
            </div>
          </label>

          <label className="text-left">
            <span className="sr-only">Check-out</span>
            <div className="border border-hairline rounded-lg px-3 bg-surface h-11 flex items-center">
              <DatePicker
                selected={checkOut}
                onChange={setCheckOut}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={checkIn || new Date()}
                placeholderText="Check-out"
                className="w-full outline-none text-sm bg-transparent text-ink placeholder:text-muted"
              />
            </div>
          </label>

          <div className="flex gap-2">
            <label className="flex-1 text-left">
              <span className="sr-only">Guests</span>
              <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 bg-surface h-11">
                <Users className="w-4 h-4 text-muted flex-shrink-0" aria-hidden="true" />
                <input
                  type="number"
                  min={1}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full outline-none text-sm bg-transparent text-ink"
                />
              </div>
            </label>
            <button
              type="submit"
              aria-label="Search hotels"
              className="flex items-center justify-center bg-brass-dark hover:bg-brass text-cream rounded-lg h-11 px-4 transition-colors"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
