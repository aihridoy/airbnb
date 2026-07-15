"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";
import Pagination from "@/components/Pagination";
import { MapPin, HeartOff } from "lucide-react";

const WishlistList = ({ wishlistNotBooked, searchParams }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(wishlistNotBooked.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlistNotBooked.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage < 1 || currentPage > totalPages) {
      router.replace(`/dashboard/wishlists?page=1`);
      return;
    }

    // Only show loading skeleton if there are items to display
    if (wishlistNotBooked.length > 0) {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      // If no items, immediately set loading to false
      setLoading(false);
    }
  }, [currentPage, totalPages, router, wishlistNotBooked.length]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setLoading(true);
    router.push(`/dashboard/wishlists?page=${page}`);
  };

  const skeletonLoader = (
    <div className="border border-hairline rounded-xl overflow-hidden animate-pulse">
      <div className="divide-y divide-hairline">
        {[...Array(itemsPerPage)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-6"
          >
            <div className="w-20 h-20 bg-surface-alt rounded-md" />
            <div className="flex-1 space-y-2 w-full">
              <div className="h-6 w-2/3 bg-surface-alt rounded" />
              <div className="h-4 w-1/3 bg-surface-alt rounded" />
            </div>
            <div className="w-24 h-6 bg-surface-alt rounded" />
            <div className="w-16 h-8 bg-surface-alt rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="inline-flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-surface-alt rounded border border-hairline" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading && wishlistNotBooked.length > 0 ? (
        skeletonLoader
      ) : currentItems.length > 0 ? (
        <>
          <div className="border border-hairline rounded-xl overflow-hidden">
            <div className="divide-y divide-hairline">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center sm:items-center py-4 px-4 sm:px-6 gap-4 hover:bg-surface-alt transition"
                >
                  <Link href={`/details/${item.hotelId}`} className="block">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-surface-alt rounded-md flex items-center justify-center text-xs text-muted">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 w-full">
                    <Link href={`/details/${item.hotelId}`} className="block">
                      <h2 className="text-lg font-semibold text-ink line-clamp-1">
                        {item.title}
                      </h2>
                      <div className="text-sm text-muted flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </div>
                    </Link>
                  </div>

                  <div className="text-lg font-bold text-brass-dark whitespace-nowrap">
                    ${item.rent}
                    <span className="text-sm text-muted font-normal ml-1">/night</span>
                  </div>

                  <div className="ml-2">
                    <DeleteWishlistButton id={item._id} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-surface-alt rounded-xl border border-dashed border-hairline">
          <HeartOff className="w-12 h-12 mx-auto text-brass-dark mb-4" />
          <h2 className="font-serif text-2xl text-ink mb-2">
            No Wishlists Available
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            You haven&apos;t added any hotels to your wishlist yet. Explore hotels and save your favorites!
          </p>
        </div>
      )}
    </>
  );
};

export default WishlistList;
