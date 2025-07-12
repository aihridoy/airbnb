"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";

const ManageHotelList = ({ filteredHotels, reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const hotelsPerPage = 12;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setLoading(true);
  };

  const handleDelete = async (hotelId, hotelTitle) => {
    const confirmDelete = confirm(`Are you sure you want to delete ${hotelTitle}?`);
    if (!confirmDelete) return;

    try {
      const result = await deleteHotelById(hotelId);
      alert(result.message || "Hotel deleted successfully!");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel!");
    }
  };

  const skeletonLoader = (
    <div className="border rounded-lg overflow-x-auto animate-pulse">
      <div className="divide-y divide-gray-200">
        {[...Array(hotelsPerPage)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center py-4 px-4 gap-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded sm:hidden"></div>
              <div className="h-4 w-1/3 bg-gray-200 rounded sm:hidden"></div>
            </div>
            <div className="hidden sm:flex w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="hidden sm:flex w-1/6 h-4 bg-gray-200 rounded"></div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="flex space-x-2">
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        skeletonLoader
      ) : currentHotels.length > 0 ? (
        <>
          <div className="border rounded-lg overflow-x-auto bg-white shadow-sm">
            <div className="divide-y divide-gray-100">
              {currentHotels.map((hotel) => {
                const filteredReviews = reviews.filter((r) => r.hotelId === hotel._id);
                const totalReviews = filteredReviews.length;
                const averageRating = totalReviews
                  ? filteredReviews.reduce((acc, r) => acc + r.ratings, 0) / totalReviews
                  : 0;
                const hotelImage =
                  hotel.images?.[Math.floor(Math.random() * hotel.images.length)];

                return (
                  <div
                    key={hotel._id}
                    className="flex flex-col sm:flex-row items-center py-5 px-4 sm:px-6 hover:bg-gray-50 transition duration-200 gap-4"
                  >
                    <Link href={`/details/${hotel._id}`}>
                      {hotelImage ? (
                        <Image
                          width={80}
                          height={80}
                          src={hotelImage}
                          alt="Hotel Image"
                          className="w-20 h-20 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-sm text-gray-500 rounded-md">
                          No Image
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 w-full sm:w-auto">
                      <Link href={`/details/${hotel._id}`}>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                          {hotel.title}
                        </h2>
                        <div className="text-sm text-gray-500 mt-1 sm:hidden">
                          {hotel.location}
                        </div>
                        <div className="text-sm text-gray-500 sm:hidden">
                          {hotel.bedroomCapacity} Rooms
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1 sm:hidden">
                          <i className="fas fa-star text-yellow-500 mr-1"></i>
                          {averageRating.toFixed(1)}
                        </div>
                      </Link>
                    </div>

                    <div className="hidden sm:block w-1/4 text-sm text-gray-500 truncate">
                      {hotel.location}
                    </div>
                    <div className="hidden sm:block w-1/6 text-sm text-gray-500">
                      {hotel.bedroomCapacity} Rooms
                    </div>

                    <div className="text-lg font-bold text-rose-600 whitespace-nowrap">
                      ${hotel.rent}
                      <span className="text-sm text-gray-400"> /night</span>
                    </div>

                    <div className="hidden sm:block w-16 text-sm text-gray-600">
                      <span className="flex items-center">
                        <i className="fas fa-star text-yellow-500 mr-1"></i>
                        {averageRating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex space-x-3 text-sm">
                      <Link
                        href={{
                          pathname: "/dashboard/create-hotel",
                          query: { hotelId: hotel._id },
                        }}
                        className="text-blue-600 hover:text-blue-800 transition"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(hotel._id, hotel.title)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Pagination
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700">No Hotels Found</h2>
          <p className="text-gray-500 mt-2">
            It seems there are no hotels available right now. Please try again later!
          </p>
        </div>
      )}
    </>
  );
};

export default ManageHotelList;