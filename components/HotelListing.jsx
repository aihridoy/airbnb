"use client";

import { getHotels, getReviews } from "@/app/action";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hotel from "./Hotel";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import Pagination from "./Pagination";
import HotelGridSkeleton from "./skeletons/HotelGridSkeleton";
import { fadeUp } from "@/lib/motion";

const HotelListing = () => {
  const { searchQuery } = useSearch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState(null);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const [hotelsData, reviewsData] = await Promise.all([
          getHotels(currentPage, 8, searchQuery),
          getReviews(),
        ]);
        setHotels(hotelsData);
        setTotalPages(hotelsData.totalPages);
        setReviews(reviewsData?.reviews || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, searchQuery]);

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
    <section className="mt-10 px-6 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
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
            initial="hidden"
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
