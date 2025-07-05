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
    const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
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

    return (
        <div className="space-y-4 px-4 sm:px-0">
            {currentHotels.length > 0 ? (
                <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-left text-sm sm:text-base">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 sm:p-4">Image</th>
                                <th className="p-2 sm:p-4">Hotel Name</th>
                                <th className="p-2 sm:p-4 hidden sm:table-cell">Location</th>
                                <th className="p-2 sm:p-4 hidden sm:table-cell">Rooms</th>
                                <th className="p-2 sm:p-4">Price/Night</th>
                                <th className="p-2 sm:p-4 hidden sm:table-cell">Rating</th>
                                <th className="p-2 sm:p-4">Actions</th>
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
                                        <td className="p-2 sm:p-4">
                                            {hotelImage && (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={hotelImage}
                                                    alt="Hotel Property"
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                                                    sizes="(max-width: 640px) 100vw, 80px"
                                                    priority={false}
                                                />
                                            )}
                                        </td>
                                        <td className="p-2 sm:p-4 font-semibold text-zinc-800 truncate">
                                            <div className="sm:hidden text-xs text-zinc-600 mb-1">
                                                {hotel.location}
                                            </div>
                                            {hotel.title}
                                            <div className="sm:hidden text-xs text-zinc-600 mt-1">
                                                {hotel.bedroomCapacity} Rooms
                                            </div>
                                            <div className="sm:hidden text-xs flex items-center mt-1">
                                                <i className="fas fa-star text-yellow-500 mr-1"></i>
                                                {Number(averageRating)?.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">{hotel.location}</td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">{hotel.bedroomCapacity} Rooms</td>
                                        <td className="p-2 sm:p-4 text-rose-600 font-semibold">${hotel.rent}</td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell">
                                            <span className="flex items-center">
                                                <i className="fas fa-star text-yellow-500 mr-1"></i>
                                                {Number(averageRating)?.toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-4">
                                            <div className="flex space-x-2 sm:space-x-4">
                                                <Link
                                                    href={{
                                                        pathname: "/dashboard/create-hotel",
                                                        query: { hotelId: hotel._id },
                                                    }}
                                                    className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(hotel._id, hotel.title)}
                                                    className="text-red-500 hover:text-red-600 text-sm sm:text-base"
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
                <div id="empty-state" className="text-center py-8 sm:py-12">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                        No Hotels Found
                    </h2>
                    <p className="text-zinc-500 text-sm sm:text-base">
                        It seems there are no hotels available at the moment. Please try again later!
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