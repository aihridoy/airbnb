"use client";

import { getHotels } from "@/app/action";
import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Hotel from "./Hotel";
import HotelGridSkeleton from "./skeletons/HotelGridSkeleton";

const PAGE_SIZE = 12;

// "Find Your Stay" is a pure browse listing. Loads 12 at a time via a
// "Show More" button that appends in place - no route nav, so the scroll
// position stays put (old ?page pagination jumped back to the top).
const HotelListing = ({ initialData = null, initialReviews = [] }) => {
  const prefersReducedMotion = useReducedMotion();
  const [hotels, setHotels] = useState(initialData?.hotels ?? []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviews] = useState(initialReviews);

  const hasMore = page < totalPages;

  const loadMore = async () => {
    setLoading(true);
    try {
      const next = page + 1;
      const data = await getHotels(next, PAGE_SIZE, "", 0);
      setHotels((prev) => [...prev, ...(data.hotels ?? [])]);
      setTotalPages(data.totalPages);
      setPage(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    <section id="hotel-listing" className="mt-10 px-6 min-h-screen">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
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
        {hotels.length === 0 ? (
          initialData ? (
            <div className="text-center text-xl text-muted h-96 flex items-center justify-center">
              No hotels found.
            </div>
          ) : (
            <HotelGridSkeleton count={PAGE_SIZE} />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hotels.map((hotel) => {
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
                <Hotel
                  key={hotel._id}
                  hotel={hotel}
                  averageRating={averageRating}
                />
              );
            })}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 rounded-full border border-ink text-ink font-medium hover:bg-ink hover:text-cream transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Loading..." : "Show More Hotels"}
          </button>
        </div>
      )}
    </section>
  );
};

export default HotelListing;
