"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { getAllHotels, getReviews } from "@/app/action";
import Skeleton from "./skeletons/Skeleton";
import { fadeUp, stagger } from "@/lib/motion";

export default function Testimonials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const [hotelsRes, reviewsRes] = await Promise.all([getAllHotels(), getReviews()]);
        const hotels = hotelsRes?.hotels ?? [];
        const reviews = reviewsRes?.reviews ?? [];
        const hotelById = Object.fromEntries(hotels.map((h) => [h._id, h]));

        const seenHotels = new Set();
        const top = [...reviews]
          .filter((r) => r.ratings >= 4 && r.review)
          .sort((a, b) => b.ratings - a.ratings)
          .filter((r) => {
            if (seenHotels.has(r.hotelId)) return false;
            seenHotels.add(r.hotelId);
            return true;
          })
          .slice(0, 6)
          .map((r) => ({ ...r, hotel: hotelById[r.hotelId] }));

        setItems(top);
      } catch (e) {
        console.error("Failed to load testimonials:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          What Our Guests Say
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Real reviews from travelers who found their perfect stay
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-hairline p-6 space-y-3">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-16 w-full rounded" />
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {items.map((item) => (
            <motion.div
              key={item._id}
              variants={fadeUp}
              className="bg-surface rounded-xl border border-hairline p-6 hover:shadow-luxe transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.ratings ? "text-brass-dark fill-current" : "text-hairline"
                      }`}
                    />
                  ))}
                </div>
                <Quote className="w-6 h-6 text-hairline" aria-hidden="true" />
              </div>
              <p className="text-ink text-sm leading-relaxed line-clamp-4 mb-4">
                {item.review}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">{item.userName}</span>
                {item.hotel && (
                  <span className="text-muted line-clamp-1">{item.hotel.title}</span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
