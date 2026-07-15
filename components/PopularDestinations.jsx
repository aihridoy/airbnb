"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

export default function PopularDestinations({ hotels = [] }) {
  const prefersReducedMotion = useReducedMotion();

  const byLocation = new Map();
  for (const hotel of hotels) {
    const loc = hotel.location;
    if (!loc) continue;
    if (!byLocation.has(loc)) {
      byLocation.set(loc, { location: loc, count: 0, image: hotel.images?.[0] });
    }
    byLocation.get(loc).count += 1;
  }
  const destinations = [...byLocation.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  if (destinations.length === 0) return null;

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

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {destinations.map((dest) => (
          <motion.div key={dest.location} variants={fadeUp}>
            <Link
              href={`/search?location=${encodeURIComponent(dest.location)}`}
              className="group relative block h-40 w-full rounded-xl overflow-hidden"
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
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
