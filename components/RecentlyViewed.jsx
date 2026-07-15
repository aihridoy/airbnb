"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import Hotel from "./Hotel";
import { fadeUp, stagger } from "@/lib/motion";

const calcAvg = (reviews, id) => {
  const r = reviews.filter((v) => v.hotelId === id);
  return r.length ? r.reduce((s, v) => s + v.ratings, 0) / r.length : 0;
};

export default function RecentlyViewed({ hotels = [], reviews = [] }) {
  // null = localStorage not read yet (avoids an SSR/client markup mismatch)
  const [viewedIds, setViewedIds] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setViewedIds(getRecentlyViewed());
  }, []);

  const { list, isRecommended } = useMemo(() => {
    if (viewedIds === null) return { list: [], isRecommended: false };

    const byId = Object.fromEntries(hotels.map((h) => [h._id, h]));
    const viewed = viewedIds.map((id) => byId[id]).filter(Boolean);
    if (viewed.length > 0) return { list: viewed, isRecommended: false };

    const recommended = [...hotels]
      .map((h) => ({ ...h, avg: calcAvg(reviews, h._id) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 4);
    return { list: recommended, isRecommended: true };
  }, [viewedIds, hotels, reviews]);

  if (list.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          {isRecommended ? "Recommended For You" : "Recently Viewed"}
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          {isRecommended
            ? "Popular stays picked based on guest ratings"
            : "Pick up where you left off"}
        </p>
      </div>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {list.map((hotel) => (
          <motion.div key={hotel._id} variants={fadeUp}>
            <Hotel hotel={hotel} averageRating={calcAvg(reviews, hotel._id)} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
