/* eslint-disable react/no-unescaped-entities */
"use client"
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../../action";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";
import Pagination from "@/components/Pagination";

export default function WishlistPage() {
  const [wishlistNotBooked, setWishlistNotBooked] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await session();
        if (!authResult || !authResult.user) {
          redirect("/login");
          return;
        }

        const [wishlistsData, bookingsData] = await Promise.all([
          getWishlists(),
          getBookings()
        ]);

        const wishlists = wishlistsData?.wishlists || [];
        const bookings = bookingsData?.bookings || [];

       const filteredWishlists = wishlists.length > 0 ? wishlists : [];

        const filteredNotBooked = filteredWishlists.filter(
          (wishlist) =>
            !bookings.some(
              (booking) =>
                booking.hotelId === wishlist.hotelId &&
                booking.userId === authResult?.user?.id
            )
        );

        setWishlistNotBooked(filteredNotBooked);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(wishlistNotBooked.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWishlists = wishlistNotBooked.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        {wishlistNotBooked.length > 0 ? (
          <>
            <div className="border rounded-lg">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-4">Image</th>
                    <th className="p-4">Hotel Name</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Price/Night</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentWishlists.map((item) => (
                    <tr key={item._id} className="border-t hover:bg-gray-50">
                      <td className="p-4">
                        {item.images && item.images.length > 0 ? (
                          <Link href={`/details/${item.hotelId}`}>
                            <Image
                              src={item.images[0]}
                              alt={`${item.title} image`}
                              width={80}
                              height={80}
                              className="w-20 h-20 object-cover rounded-md"
                              // unoptimized={true}
                              loading="lazy"
                            />
                          </Link>
                        ) : (
                          <div className="w-20 h-20 bg-gray-300 flex items-center justify-center rounded-md">
                            <span className="text-gray-500 text-sm">No Image</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-zinc-800">
                        <Link href={`/details/${item.hotelId}`} className="hover:text-blue-600">
                          {item.title}
                        </Link>
                      </td>
                      <td className="p-4 text-zinc-600 flex items-center">
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
                      </td>
                      <td className="p-4 text-rose-600 font-semibold">${item.rent}</td>
                      <td className="p-4">
                        <DeleteWishlistButton id={item._id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  handlePageChange={handlePageChange}
                  currentPage={currentPage}
                  totalPages={totalPages}
                />
              </div>
            )}
            
            {/* Results info */}
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {startIndex + 1}-{Math.min(endIndex, wishlistNotBooked.length)} of {wishlistNotBooked.length} items
            </div>
          </>
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