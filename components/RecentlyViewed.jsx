"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { getAllHotels, getReviews } from "@/app/action";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import Hotel from "./Hotel";
import HotelGridSkeleton from "./skeletons/HotelGridSkeleton";
import { fadeUp, stagger } from "@/lib/motion";

const calcAvg = (reviews, id) => {
  const r = reviews.filter((v) => v.hotelId === id);
  return r.length ? r.reduce((s, v) => s + v.ratings, 0) / r.length : 0;
};

export default function RecentlyViewed() {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isRecommended, setIsRecommended] = useState(false);
  const [loading, setLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    (async () => {
      try {
        const [hotelsRes, reviewsRes] = await Promise.all([getAllHotels(), getReviews()]);
        const allHotels = hotelsRes?.hotels ?? [];
        const allReviews = reviewsRes?.reviews ?? [];
        setReviews(allReviews);

        const viewedIds = getRecentlyViewed();
        const byId = Object.fromEntries(allHotels.map((h) => [h._id, h]));
        const viewed = viewedIds.map((id) => byId[id]).filter(Boolean);

        if (viewed.length > 0) {
          setHotels(viewed);
          setIsRecommended(false);
        } else {
          const recommended = [...allHotels]
            .map((h) => ({ ...h, avg: calcAvg(allReviews, h._id) }))
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 4);
          setHotels(recommended);
          setIsRecommended(true);
        }
      } catch (e) {
        console.error("Failed to load recently viewed hotels:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!loading && hotels.length === 0) return null;

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

      {loading ? (
        <HotelGridSkeleton count={4} />
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {hotels.map((hotel) => (
            <motion.div key={hotel._id} variants={fadeUp}>
              <Hotel hotel={hotel} averageRating={calcAvg(reviews, hotel._id)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
}
