"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";
import Pagination from "@/components/Pagination";

const WishlistList = ({ wishlistNotBooked, searchParams }) => {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [loading, setLoading] = useState(true);
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(wishlistNotBooked.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlistNotBooked.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    // Validate currentPage and redirect if invalid
    if (currentPage < 1 || currentPage > totalPages) {
      router.replace(`/dashboard/wishlists?page=1`);
      return;
    }

    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage, totalPages, router]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setLoading(true);
    router.push(`/dashboard/wishlists?page=${page}`);
  };

  const skeletonLoader = (
    <div className="border rounded-lg overflow-x-auto animate-pulse">
      <div className="divide-y divide-gray-200">
        {[...Array(itemsPerPage)].map((_, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-center sm:items-stretch py-4 px-4 sm:px-6 gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md"></div>
            <div className="flex-1">
              <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-8 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center -space-x-px">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-gray-200 rounded border border-zinc-300"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        skeletonLoader
      ) : currentItems.length > 0 ? (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <div className="divide-y divide-gray-200">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center sm:items-stretch py-4 px-4 sm:px-6 gap-4 hover:bg-gray-50 transition-colors"
                >
                  <Link href={`/details/${item.hotelId}`} className="block">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={`${item.title} image`}
                        width={80}
                        height={80}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                        sizes="(max-width: 640px) 100vw, 80px"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-300 rounded-md flex items-center justify-center">
                        <span className="text-gray-500 text-xs">No Image</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link href={`/details/${item.hotelId}`} className="block">
                      <h2 className="text-lg font-semibold text-gray-800">{item.title}</h2>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
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
                    </Link>
                  </div>
                  <div className="text-lg font-bold text-rose-600">
                    ${item.rent} <span className="text-sm text-gray-500">/night</span>
                  </div>
                  <DeleteWishlistButton id={item._id} />
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
    </>
  );
};

export default WishlistList;