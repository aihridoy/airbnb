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
    const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };
    return (
        <>
            <div
                className={`${currentHotels.length > 0
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                            <div key={hotel._id} className="overflow-hidden cursor-pointer">
                                <div className="relative">
                                    <Image
                                        width={500}
                                        height={500}
                                        src={hotelImage}
                                        alt="Hotel Property"
                                        className="w-full h-48 object-cover rounded-md transition-all hover:scale-105"
                                        // unoptimized={true}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/80 px-3 py-1 rounded-full text-sm font-semibold">
                                        <i className="fas fa-star text-yellow-500 mr-1"></i>
                                        {Number(averageRating)?.toFixed(1)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-zinc-800 mb-2">
                                        {hotel.title}
                                    </h2>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-600">
                                            {hotel.bedroomCapacity} Rooms Available
                                        </span>
                                        <span className="text-rose-600 font-semibold">
                                            ${hotel.rent}/night
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-zinc-500">
                                            Location: {hotel.location}
                                        </span>
                                        <div className="space-x-2">
                                            <Link
                                                href={{
                                                    pathname: "/add-hotel",
                                                    query: { hotelId: hotel._id },
                                                }}
                                                className="text-blue-500 hover:text-blue-600"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Link>
                                            <button
                                                onClick={handleDelete}
                                                className="text-red-500 hover:text-red-600"
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
                    <div id="empty-state" className="text-center py-12 ml-auto">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No Hotels Found
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            It seems there are no hotels available at the moment. Please try
                            again later!
                        </p>
                    </div>
                )}
            </div>
            <div className="mt-4 text-center">
                <Pagination
                    handlePageChange={handlePageChange}
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
                />
            </div>
        </>
    );
};

export default ManageHotelList;
