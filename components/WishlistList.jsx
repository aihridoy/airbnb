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
    <div className="border rounded-xl overflow-hidden animate-pulse">
      <div className="divide-y divide-gray-200">
        {[...Array(itemsPerPage)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-6"
          >
            <div className="w-20 h-20 bg-gray-200 rounded-md" />
            <div className="flex-1 space-y-2 w-full">
              <div className="h-6 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
            </div>
            <div className="w-24 h-6 bg-gray-200 rounded" />
            <div className="w-16 h-8 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="inline-flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-gray-200 rounded border" />
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
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="divide-y divide-gray-100">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center sm:items-center py-4 px-4 sm:px-6 gap-4 hover:bg-gray-50 transition"
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
                      <div className="w-20 h-20 bg-gray-300 rounded-md flex items-center justify-center text-xs text-gray-500">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 w-full">
                    <Link href={`/details/${item.hotelId}`} className="block">
                      <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                        {item.title}
                      </h2>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </div>
                    </Link>
                  </div>

                  <div className="text-lg font-bold text-primary whitespace-nowrap">
                    ${item.rent}
                    <span className="text-sm text-gray-500 ml-1">/night</span>
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
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <HeartOff className="w-12 h-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No Wishlists Available
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            You haven&apos;t added any hotels to your wishlist yet. Explore hotels and save your favorites!
          </p>
        </div>
      )}
    </>
  );
};

export default WishlistList;