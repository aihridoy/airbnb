/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../../action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
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
          getBookings(),
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
      <div className="w-full px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-brass-dark" />
          <p className="mt-4 text-muted">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <h1 className="font-serif text-2xl text-ink mb-6">Wishlists</h1>
      {wishlistNotBooked.length > 0 ? (
        <>
          <div className="border border-hairline rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="p-4 text-ink">Image</th>
                  <th className="p-4 text-ink">Hotel Name</th>
                  <th className="p-4 text-ink">Location</th>
                  <th className="p-4 text-ink">Price/Night</th>
                  <th className="p-4 text-ink">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentWishlists.map((item) => (
                  <tr key={item._id} className="border-t border-hairline hover:bg-surface-alt">
                    <td className="p-4">
                      {item.images && item.images.length > 0 ? (
                        <Link href={`/details/${item.hotelId}`}>
                          <Image
                            src={item.images[0]}
                            alt={`${item.title} image`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-md"
                            loading="lazy"
                          />
                        </Link>
                      ) : (
                        <div className="w-20 h-20 bg-surface-alt flex items-center justify-center rounded-md">
                          <span className="text-muted text-sm">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      <Link href={`/details/${item.hotelId}`} className="hover:text-brass-dark">
                        {item.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </td>
                    <td className="p-4 text-brass-dark font-semibold">${item.rent}</td>
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
          <div className="mt-4 text-sm text-muted text-center">
            Showing {startIndex + 1}-{Math.min(endIndex, wishlistNotBooked.length)} of {wishlistNotBooked.length} items
          </div>
        </>
      ) : (
        <div id="empty-state" className="text-center py-12">
          <h2 className="font-serif text-2xl text-ink mb-2">
            No Wishlists Available
          </h2>
          <p className="text-muted text-sm">
            You can add hotels to your wishlist by clicking the button on the
            hotel details page.
          </p>
        </div>
      )}
    </div>
  );
}
