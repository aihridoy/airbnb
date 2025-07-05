"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Pagination from "./Pagination";

const ManageHotelList = ({ filteredHotels, reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const hotelsPerPage = 12;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
      <div
        className={`${
          currentHotels.length > 0
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            : ""
        }`}
      >
        {currentHotels.length > 0 ? (
          currentHotels.map((hotel) => {
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
                : "N/A";
            const hotelImage =
              hotel.images &&
              hotel.images.length > 0 &&
              hotel.images[Math.floor(Math.random() * hotel.images.length)];

            const handleDelete = async () => {
              const confirmDelete = confirm(
                `Are you sure you want to delete ${hotel.title}?`
              );
              if (!confirmDelete) return;

              try {
                const result = await deleteHotelById(hotel._id);
                alert(result.message || "Hotel deleted successfully!");
              } catch (error) {
                console.error("Error deleting hotel:", error);
                alert("Failed to delete hotel!");
              }
            };

            return (
              <div
                key={hotel._id}
                className="overflow-hidden cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <Image
                    width={500}
                    height={500}
                    src={hotelImage}
                    alt="Hotel Property"
                    className="w-full h-40 sm:h-48 object-cover rounded-t-md transition-all hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={false}
                  />
                  <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/80 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                    <i className="fas fa-star text-yellow-500 mr-1"></i>
                    {Number(averageRating)?.toFixed(1)}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h2 className="text-base sm:text-lg font-semibold text-zinc-800 mb-2 truncate">
                    {hotel.title}
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                    <span className="text-zinc-600 text-sm sm:text-base">
                      {hotel.bedroomCapacity} Rooms Available
                    </span>
                    <span className="text-rose-600 font-semibold text-sm sm:text-base">
                      ${hotel.rent}/night
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-2">
                    <span className="text-zinc-500 text-sm">
                      Location: {hotel.location}
                    </span>
                    <div className="flex space-x-2 sm:space-x-3">
                      <Link
                        href={{
                          pathname: "/add-hotel",
                          query: { hotelId: hotel._id },
                        }}
                        className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-600 text-sm sm:text-base"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div id="empty-state" className="text-center py-8 sm:py-12 w-full">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              No Hotels Found
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base">
              It seems there are no hotels available at the moment. Please try
              again later!
            </p>
          </div>
        )}
      </div>
      {currentHotels.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center">
          <Pagination
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
          />
        </div>
      )}
    </>
  );
};

export default ManageHotelList;
