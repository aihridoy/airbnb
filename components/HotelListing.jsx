"use client";

import { getHotels } from "@/app/action";
import React, { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Hotel from "./Hotel";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "./Pagination";
import HotelGridSkeleton from "./skeletons/HotelGridSkeleton";
import { fadeUp } from "@/lib/motion";

// "Find Your Stay" is a pure browse listing - paginated only. Actual
// searching lives on the /search page (hero + navbar navigate there).
const HotelListing = ({ initialData = null, initialReviews = [] }) => {
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState(initialData);
  const [error, setError] = useState(null);
  const [reviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);

  // Server already provided page 1 - skip refetching it on first mount.
  const skipNextFetch = useRef(Boolean(initialData) && currentPage === 1);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        const hotelsData = await getHotels(currentPage, 8, "", 0);
        setHotels(hotelsData);
        setTotalPages(hotelsData.totalPages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

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
        {loading ? (
          <HotelGridSkeleton count={8} />
        ) : hotels?.hotels?.length === 0 ? (
          <div className="text-center text-xl text-muted h-96 flex items-center justify-center">
            No hotels found.
          </div>
        ) : (
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
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
