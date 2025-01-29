/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../action";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";

export default async function WishlistPage() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect("/login");
    }
    const wishlistsData = await getWishlists();
    const bookingsData = await getBookings();

    const wishlists = wishlistsData?.wishlists || [];
    const bookings = bookingsData?.bookings || [];

    const filteredWishlists =
        wishlists.length > 0
            ? wishlists.filter((wishlist) => wishlist.userId === authResult?.user?.id)
            : [];

    const wishlistNotBooked = filteredWishlists.filter(
        (wishlist) =>
            !bookings.some(
                (booking) =>
                    booking.hotelId === wishlist.hotelId &&
                    booking.userId === authResult?.user?.id
            )
    );

    return (
        <>
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
                {wishlistNotBooked.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlistNotBooked.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden"
                            >
                                <div>
                                    <Link
                                        href={`/details/${item.hotelId}`}
                                        className="block relative"
                                    >
                                        {item.images && item.images.length > 0 ? (
                                            <div className="relative h-64">
                                                <Image
                                                    src={item.images[0]}
                                                    alt={`${item.title} image`}
                                                    layout="fill"
                                                    objectFit="cover"
                                                    className="transition-transform transform hover:scale-105 overflow-hidden rounded-t-2xl"
                                                    unoptimized={true}
                                                    loading="lazy"
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-20 flex items-end p-4">
                                                    <h2 className="text-white font-bold text-lg">
                                                        {item.title}
                                                    </h2>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-64 bg-gray-300 flex items-center justify-center">
                                                <span className="text-gray-500 text-sm">
                                                    No Image Available
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                </div>
                                <div className="p-4">
                                    <div className="mb-2 text-sm text-gray-600 flex items-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 mr-1"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                        </svg>
                                        {item.location}
                                    </div>
                                    <p className="text-gray-800 font-bold text-lg mb-2">
                                        ${item.rent}{" "}
                                        <span className="text-sm text-gray-500">/night</span>
                                    </p>
                                </div>
                                <DeleteWishlistButton id={item._id} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div id="empty-state" className="text-center py-12">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            No Wishlists Available
                        </h2>
                        <p className="text-zinc-500 text-sm">
                            You can add hotels to your wishlist by clicking the button on the
                            hotel details page.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}