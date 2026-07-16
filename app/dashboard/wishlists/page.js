/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { getBookings, getWishlists, session } from "../../action";
import { redirect } from "next/navigation";
import WishlistList from "@/components/WishlistList";

export default async function WishlistPage({ searchParams }) {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  let wishlistsData, bookingsData;
  try {
    [wishlistsData, bookingsData] = await Promise.all([
      getWishlists(),
      getBookings(),
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="px-4 py-8">
        <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
        <div className="text-center py-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-500">
            Error loading wishlists
          </h2>
          <p className="text-muted text-sm sm:text-base mt-2">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

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
    <div className="px-4 py-8">
      <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
      <WishlistList wishlistNotBooked={wishlistNotBooked} searchParams={searchParams} />
    </div>
  );
}