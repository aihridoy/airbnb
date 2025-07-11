/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getUsers } from "@/app/action";
import Pagination from "@/components/Pagination";
import Link from "next/link";

// Skeleton Components
const SkeletonRow = () => (
  <tr className="border-t animate-pulse">
    <td className="p-2 sm:p-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full"></div>
    </td>
    <td className="p-2 sm:p-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="sm:hidden space-y-1">
          <div className="h-3 bg-gray-200 rounded w-40"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
          <div className="h-3 bg-gray-200 rounded w-28"></div>
        </div>
      </div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <div className="h-4 bg-gray-200 rounded w-48"></div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <div className="h-4 bg-gray-200 rounded w-28"></div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </td>
  </tr>
);

const SkeletonTable = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
    <table className="w-full text-left text-sm sm:text-base">
      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <tr>
          <th className="p-3 sm:p-4 font-semibold text-gray-700">Profile</th>
          <th className="p-3 sm:p-4 font-semibold text-gray-700">Name</th>
          <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
            Email
          </th>
          <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
            Location
          </th>
          <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
            Role
          </th>
          <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
            Joined
          </th>
        </tr>
      </thead>
      <tbody>
        {[...Array(8)].map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

const LoadingCard = () => (
  <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-100">
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-300 rounded-full animate-spin animation-delay-150"></div>
      </div>
      <div className="text-center space-y-2">
        <div className="h-5 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
      </div>
    </div>
  </div>
);

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();

        if (!data || !data.success) {
          setError("Failed to load users");
          return;
        }

        setUsers(data.users || []);
      } catch (err) {
        setError("Failed to load users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Smooth scroll to top of table
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter out admin users - only show regular users
  const regularUsers = users.filter((user) => user.role !== "admin");

  // Calculate pagination
  const totalPages = Math.ceil(regularUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = regularUsers.slice(startIndex, endIndex);

  const getRoleColor = (role) => {
    const colors = {
      user: "bg-blue-100 text-blue-800",
      moderator: "bg-purple-100 text-purple-800",
      premium: "bg-yellow-100 text-yellow-800",
      default: "bg-gray-100 text-gray-800",
    };
    return colors[role] || colors.default;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-72 mt-2 animate-pulse"></div>
        </div>
        <SkeletonTable />
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Users List
          </h1>
          <p className="text-gray-600">Manage and view all registered users</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 border border-red-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load the users. Please check your connection and try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Users List
        </h1>
        <p className="text-gray-600">Manage and view all registered users</p>
      </div>

      {regularUsers.length > 0 ? (
        <>
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-100">
            <table className="w-full text-left text-sm sm:text-base">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700">
                    Profile
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
                    Location
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
                    Role
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-gray-700 hidden sm:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <td className="p-3 sm:p-4">
                      <Link href={`/profile/${user._id}`}>
                        <div className="relative">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={`${user.name} profile`}
                              width={40}
                              height={40}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200"
                              sizes="(max-width: 640px) 100vw, 48px"
                              priority={false}
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center cursor-pointer ring-2 ring-gray-200 group-hover:ring-blue-300 transition-all duration-200">
                              <span className="text-white text-sm sm:text-base font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Link href={`/profile/${user._id}`} className="block">
                        <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer group-hover:text-blue-600">
                          {user.name}
                        </div>
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="text-xs text-gray-600 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                              />
                            </svg>
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-600 flex items-center">
                            <svg
                              className="w-3 h-3 mr-1 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                            </svg>
                            {user.location || "Not specified"}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            <span className="text-xs text-gray-500">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                          />
                        </svg>
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        {user.location || "Not specified"}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-gray-600 hidden sm:table-cell">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination and Stats */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center text-sm text-gray-600">
              <svg
                className="w-4 h-4 mr-2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(endIndex, regularUsers.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {regularUsers.length}
              </span>{" "}
              users
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 border border-gray-100">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              No Users Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Your community is just getting started. Users will appear here
              once they register.
            </p>
            <div className="text-sm text-gray-500">
              Check back later or invite people to join your platform!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
