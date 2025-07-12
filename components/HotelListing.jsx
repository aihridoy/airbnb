"use client";

import { getHotels, getReviews } from "@/app/action";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Hotel from "./Hotel";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "@/contexts/SearchContext";
import Pagination from "./Pagination";

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

  const skeletonLoader = (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 w-full h-64 rounded-xl"></div>
          <div className="mt-3">
            <div className="flex justify-between items-center">
              <div className="bg-gray-200 h-6 w-3/4 rounded"></div>
              <div className="flex items-center">
                <div className="bg-gray-200 h-4 w-4 rounded-full"></div>
                <div className="bg-gray-200 h-4 w-8 ml-1 rounded"></div>
              </div>
            </div>
            <div className="bg-gray-200 h-4 w-1/2 mt-1 rounded"></div>
            <div className="mt-2 flex justify-between items-center">
              <div className="bg-gray-200 h-4 w-1/3 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return <div>Error loading hotels: {error}</div>;
  }

  return (
    <>
      <section className="mt-10 px-6 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Find Your Stay
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover a range of hotels tailored for every traveler.
          </p>
        </motion.div>
        <div className="max-w-7xl mx-auto">
          {loading ? (
            skeletonLoader
          ) : hotels?.hotels?.length === 0 ? (
            <div className="text-center text-xl text-gray-500 h-96 flex items-center justify-center">
              No hotels found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
    </>
  );
};

export default HotelListing;
