"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
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
    <div className="space-y-4">
      {currentHotels.length > 0 ? (
        <div className="border rounded-lg">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-4">Image</th>
                <th className="p-4">Hotel Name</th>
                <th className="p-4">Location</th>
                <th className="p-4">Rooms</th>
                <th className="p-4">Price/Night</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Actions</th>
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
                  <tr key={hotel._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      {hotelImage && (
                        <Link href={`/details/${hotel._id}`}>
                          <Image
                            width={80}
                            height={80}
                            src={hotelImage}
                            alt="Hotel Property"
                            className="w-20 h-20 object-cover rounded-md"
                            // unoptimized={true}
                          />
                        </Link>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-zinc-800">
                      <Link href={`/details/${hotel._id}`}>{hotel.title}</Link>
                    </td>
                    <td className="p-4 text-zinc-600">{hotel.location}</td>
                    <td className="p-4 text-zinc-600">
                      {hotel.bedroomCapacity} Rooms
                    </td>
                    <td className="p-4 text-rose-600 font-semibold">
                      ${hotel.rent}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center">
                        <i className="fas fa-star text-yellow-500 mr-1"></i>
                        {Number(averageRating)?.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-4">
                        <Link
                          href={{
                            pathname: "/dashboard/create-hotel",
                            query: { hotelId: hotel._id },
                          }}
                          className="text-blue-500 hover:text-blue-600"
                        >
                          <i className="fas fa-edit"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel._id, hotel.title)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <i className="fas fa-trash"></i>
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
        <div id="empty-state" className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            No Hotels Found
          </h2>
          <p className="text-zinc-500 text-sm">
            It seems there are no hotels available at the moment. Please try
            again later!
          </p>
        </div>
      )}
      <div className="mt-4 text-center">
        <Pagination
          handlePageChange={handlePageChange}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
        />
      </div>
    </div>
  );
};

export default HotelsList;
