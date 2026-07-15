/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../action";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
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
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
          {wishlistNotBooked.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistNotBooked.map((item) => (
                <div
                  key={item._id}
                  className="bg-surface border border-hairline rounded-2xl hover:shadow-luxe transition-shadow duration-300 overflow-hidden"
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
                            fill
                            className="object-cover transition-transform transform hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent h-20 flex items-end p-4">
                            <h2 className="text-cream font-serif text-lg">
                              {item.title}
                            </h2>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 bg-surface-alt flex items-center justify-center">
                          <span className="text-muted text-sm">
                            No Image Available
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 text-sm text-muted flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <p className="text-ink font-bold text-lg mb-2">
                      ${item.rent}{" "}
                      <span className="text-sm text-muted font-normal">/night</span>
                    </p>
                  </div>
                  <DeleteWishlistButton id={item._id} />
                </div>
              ))}
            </div>
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
      </div>
    </>
  );
}
