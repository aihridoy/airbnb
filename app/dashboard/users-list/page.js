/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getUsers } from "@/app/action";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { Search, AlertTriangle, RotateCw, Mail, MapPin, Calendar, Users2 } from "lucide-react";
import Skeleton from "@/components/skeletons/Skeleton";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Skeleton Components
const SkeletonRow = () => (
  <tr className="border-t border-hairline">
    <td className="p-2 sm:p-4">
      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
    </td>
    <td className="p-2 sm:p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="sm:hidden space-y-1">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-48 rounded" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-28 rounded" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-6 w-16 rounded-full" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-24 rounded" />
    </td>
  </tr>
);

const SkeletonTable = () => (
  <div className="bg-surface rounded-xl overflow-x-auto border border-hairline">
    <table className="w-full text-left text-sm sm:text-base">
      <thead className="bg-surface-alt border-b border-hairline">
        <tr>
          <th className="p-3 sm:p-4 font-semibold text-ink">Profile</th>
          <th className="p-3 sm:p-4 font-semibold text-ink">Name</th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Email
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Location
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Role
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
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

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Debounced search handler
  const handleSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 300);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users.filter((user) => user.role !== "admin");

    return users.filter((user) => {
      if (user.role === "admin") return false;
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  }, [users, searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getRoleColor = (role) => {
    const colors = {
      user: "bg-brass-light/30 text-brass-dark",
      moderator: "bg-surface-alt text-ink",
      premium: "bg-brass-light/30 text-brass-dark",
      default: "bg-surface-alt text-muted",
    };
    return colors[role] || colors.default;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 sm:h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 mt-2 rounded" />
        </div>
        <SkeletonTable />
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded" />
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
          <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
            Users List
          </h1>
          <p className="text-muted">Manage and view all registered users</p>
        </div>

        <div className="bg-surface rounded-xl border border-hairline p-8 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted mb-6">
              We couldn't load the users. Please check your connection and try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-cream bg-brass-dark hover:bg-brass transition-colors"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1 sm:mb-2">
            Users List
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Manage and view all registered users
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-auto">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="By Name/ Email"
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 pl-10 text-sm sm:text-base border border-hairline rounded-lg focus:ring-2 focus:ring-brass focus:border-brass transition-all duration-200 bg-surface"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          </div>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          <div className="bg-surface rounded-xl overflow-x-auto border border-hairline">
            <table className="w-full text-left text-sm sm:text-base">
              <thead className="bg-surface-alt border-b border-hairline">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-ink">
                    Profile
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink">
                    Name
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Location
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Role
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-surface-alt transition-all duration-200 group"
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
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer ring-2 ring-hairline group-hover:ring-brass-light transition-all duration-200"
                              sizes="(max-width: 640px) 100vw, 48px"
                              priority={false}
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brass-dark rounded-full flex items-center justify-center cursor-pointer ring-2 ring-hairline group-hover:ring-brass-light transition-all duration-200">
                              <span className="text-cream text-sm sm:text-base font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Link href={`/profile/${user._id}`} className="block">
                        <div className="font-semibold text-ink group-hover:text-brass-dark transition-colors cursor-pointer">
                          {user.name}
                        </div>
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="text-xs text-muted flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="text-xs text-muted flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
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
                            <span className="text-xs text-muted">
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
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted" />
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
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted" />
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

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface rounded-lg p-4 border border-hairline">
            <div className="flex items-center text-sm text-muted">
              <Users2 className="w-4 h-4 mr-2 text-muted" />
              Showing{" "}
              <span className="font-medium text-ink mx-1">
                {startIndex + 1}
              </span>
              to{" "}
              <span className="font-medium text-ink mx-1">
                {Math.min(endIndex, filteredUsers.length)}
              </span>
              of{" "}
              <span className="font-medium text-ink mx-1">
                {filteredUsers.length}
              </span>{" "}
              {searchQuery ? "matching" : ""} users
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
        <div className="bg-surface rounded-xl border border-hairline p-8 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8 text-muted" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
              {searchQuery ? "No Matching Users" : "No Users Yet"}
            </h2>
            <p className="text-muted mb-6">
              {searchQuery
                ? `No users found matching "${searchQuery}"`
                : "Your community is just getting started. Users will appear here once they register."}
            </p>
            {!searchQuery && (
              <div className="text-sm text-muted">
                Check back later or invite people to join your platform!
              </div>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-cream bg-brass-dark hover:bg-brass transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
