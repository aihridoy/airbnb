"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";

const HotelsList = ({ filteredHotels, reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 8;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (hotelId, hotelTitle) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete ${hotelTitle}?`
    );
    if (!confirmDelete) return;

    try {
      const result = await deleteHotelById(hotelId);
      alert(result.message || "Hotel deleted successfully!");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel!");
    }
  };

  return (
    <div className="space-y-4 px-4 sm:px-0">
      {currentHotels.length > 0 ? (
        <div className="border border-hairline rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="bg-surface-alt">
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Image
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Hotel Name
                </th>
                <th className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm font-medium">
                  Location
                </th>
                <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                  Rooms
                </th>
                <th className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm font-medium">
                  Price/Night
                </th>
                <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                  Rating
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentHotels.map((hotel) => {
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
                const hotelImage =
                  hotel.images &&
                  hotel.images.length > 0 &&
                  hotel.images[Math.floor(Math.random() * hotel.images.length)];

                return (
                  <tr key={hotel._id} className="border-t border-hairline hover:bg-surface-alt">
                    <td className="p-2 sm:p-3">
                      {hotelImage && (
                        <Link href={`/details/${hotel._id}`}>
                          <Image
                            width={64}
                            height={64}
                            src={hotelImage}
                            alt="Hotel Property"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                            sizes="(max-width: 640px) 48px, 64px"
                            priority={false}
                          />
                        </Link>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      <div className="font-semibold text-ink mb-1 max-w-[200px] truncate">
                        <Link href={`/details/${hotel._id}`}>{hotel.title}</Link>
                      </div>
                      <div className="xl:hidden text-xs text-muted mb-1">
                        Location: {hotel.location}
                      </div>
                      <div className="lg:hidden text-xs text-muted mb-1">
                        Rooms: {hotel.bedroomCapacity}
                      </div>
                      <div className="md:hidden text-xs text-muted mb-1">
                        Price: ${hotel.rent}/night
                      </div>
                      <div className="lg:hidden text-xs text-muted mb-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-brass-dark fill-current" />
                          {Number(averageRating)?.toFixed(1)} ({totalReviews} reviews)
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm text-muted">
                      {hotel.location}
                    </td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-muted">
                      {hotel.bedroomCapacity} Rooms
                    </td>
                    <td className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm text-brass-dark font-semibold">
                      ${hotel.rent}
                    </td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-brass-dark fill-current" />
                        {Number(averageRating)?.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="flex space-x-2">
                        <Link
                          href={{
                            pathname: "/dashboard/create-hotel",
                            query: { hotelId: hotel._id },
                          }}
                          className="text-brass-dark hover:text-brass text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                          title="Edit Hotel"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel._id, hotel.title)}
                          className="text-red-500 hover:text-red-600 text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                          title="Delete Hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div id="empty-state" className="text-center py-8 sm:py-12">
          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
            No Hotels Found
          </h2>
          <p className="text-muted text-sm sm:text-base">
            It seems there are no hotels available at the moment. Please try
            again later!
          </p>
        </div>
      )}
      {currentHotels.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center">
          <Pagination
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
          />
        </div>
      )}
    </div>
  );
};

export default HotelsList;
