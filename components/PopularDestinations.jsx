"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getAllHotels } from "@/app/action";
import { useSearch } from "@/contexts/SearchContext";
import Skeleton from "./skeletons/Skeleton";
import { fadeUp, stagger } from "@/lib/motion";

export default function PopularDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setSearchQuery } = useSearch();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllHotels();
        const hotels = res?.hotels ?? [];

        const byLocation = new Map();
        for (const hotel of hotels) {
          const loc = hotel.location;
          if (!loc) continue;
          if (!byLocation.has(loc)) {
            byLocation.set(loc, { location: loc, count: 0, image: hotel.images?.[0] });
          }
          byLocation.get(loc).count += 1;
        }

        const top = [...byLocation.values()]
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        setDestinations(top);
      } catch (e) {
        console.error("Failed to load destinations:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSelect = (location) => {
    setSearchQuery(location);
    document.getElementById("hotel-listing")?.scrollIntoView({ behavior: "smooth" });
  };

  if (!loading && destinations.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Popular Destinations
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Handpicked cities and regions our guests love most
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {destinations.map((dest) => (
            <motion.button
              key={dest.location}
              variants={fadeUp}
              onClick={() => handleSelect(dest.location)}
              className="group relative h-40 w-full rounded-xl overflow-hidden text-left"
            >
              <Image
                src={dest.image || "https://placehold.co/400x300"}
                alt={dest.location}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-cream">
                <div className="flex items-center gap-1 font-serif text-lg">
                  <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="line-clamp-1">{dest.location}</span>
                </div>
                <p className="text-xs text-cream/70">
                  {dest.count} {dest.count === 1 ? "hotel" : "hotels"}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      )}
    </section>
  );
}
