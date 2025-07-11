"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Pagination from "./Pagination";
import { getUserById } from "@/app/action";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingsList = ({ bookings }) => {
  const [users, setUsers] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Get unique user IDs from bookings
        const uniqueUserIds = [
          ...new Set(bookings.map((booking) => booking.userId)),
        ];

        // Fetch all users
        const userPromises = uniqueUserIds.map(async (userId) => {
          try {
            const response = await getUserById(userId);
            return { userId, user: response?.user };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, user: null };
          }
        });

        const userResults = await Promise.all(userPromises);

        // Create users object with userId as key
        const usersObject = userResults.reduce((acc, { userId, user }) => {
          acc[userId] = user;
          return acc;
        }, {});

        setUsers(usersObject);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookings.length > 0) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [bookings]);

  const bookingsPerPage = 8;
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setModalOpen(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const downloadReceipt = async (booking) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText("Reservation Receipt", {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0, 0.4, 0.7),
    });

    let yPos = height - 100;
    const drawDetail = (label, value, bold = false) => {
      const font = bold ? boldFont : helveticaFont;
      page.drawText(label, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(value), {
        x: 250,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPos -= 20;
    };

    // Get user info for this booking
    const user = users[booking.userId];

    drawDetail("Booking ID:", booking?._id?.slice(0, 8), true);
    drawDetail("Customer Name:", user?.name || "N/A");
    drawDetail("Customer Email:", user?.email || "N/A");
    drawDetail("Customer Location:", user?.location || "N/A");
    drawDetail("Property:", booking?.bookingDetails?.title || "N/A");
    drawDetail("Total Guests:", booking?.bookingDetails?.guests || "N/A");
    drawDetail(
      "Check-in:",
      formatDate(booking?.bookingDetails?.checkInDate) || "N/A"
    );
    drawDetail(
      "Check-out:",
      formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"
    );
    drawDetail("Total Paid:", `$${booking?.totalPrice || "N/A"}`, true);
    drawDetail("Hotel ID:", booking?.hotelId || "N/A");
    drawDetail("User ID:", booking?.userId || "N/A");
    drawDetail(
      "Rating:",
      `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${
        booking?.bookingDetails?.totalReviews
      } review(s))`
    );
    drawDetail("Card Number:", booking?.paymentDetails?.cardNumber || "N/A");
    drawDetail(
      "Billing Address:",
      `${booking?.paymentDetails?.billingAddress?.streetAddress}, ${booking?.paymentDetails?.billingAddress?.city}, ${booking?.paymentDetails?.billingAddress?.state},\n${booking?.paymentDetails?.billingAddress?.zipCode}`
    );

    yPos = 50;
    page.drawText("Thank you for your booking!", {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.4, 0.7),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${booking?._id}.pdf`;
    link.click();
  };

  // Skeleton Loading Component
  const SkeletonRow = () => (
    <tr className="border-t">
      <td className="p-2 sm:p-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md animate-pulse"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 xl:hidden"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden xl:table-cell">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4 hidden md:table-cell">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="space-y-4 px-4 sm:px-0">
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Image</th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Property</th>
                <th className="p-2 sm:p-4 hidden xl:table-cell text-xs sm:text-sm">
                  Customer
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Booking Date
                </th>
                <th className="p-2 sm:p-4 hidden md:table-cell text-xs sm:text-sm">
                  Guests
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Check-In
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Check-Out
                </th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Total Cost</th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 px-4 sm:px-0">
        {paginatedBookings.length > 0 ? (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Image
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Property
                  </th>
                  <th className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm font-medium">
                    Customer
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Booking Date
                  </th>
                  <th className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm font-medium">
                    Guests
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Check-In
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Check-Out
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Total Cost
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => {
                  const user = users[booking.userId];
                  return (
                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                      <td className="p-2 sm:p-3">
                        {booking?.bookingDetails?.hotelImage && (
                          <Image
                            width={64}
                            height={64}
                            src={booking.bookingDetails.hotelImage}
                            alt="Property Thumbnail"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                            sizes="(max-width: 640px) 48px, 64px"
                            priority={false}
                          />
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div className="font-semibold text-zinc-800 mb-1 max-w-[200px] truncate">
                          {booking?.bookingDetails?.title || "N/A"}
                        </div>
                        <div className="xl:hidden text-xs text-zinc-600 mb-1">
                          Customer: {user?.name || "Loading..."}
                        </div>
                        <div className="lg:hidden text-xs text-zinc-600 mb-1">
                          Booked: {formatDate(booking?.createdAt) || "N/A"}
                        </div>
                        <div className="md:hidden text-xs text-zinc-600 mb-1">
                          Guests: {booking?.bookingDetails?.guests || "N/A"}
                        </div>
                        <div className="lg:hidden text-xs text-zinc-600 mb-1">
                          {formatDate(booking?.bookingDetails?.checkInDate) ||
                            "N/A"}{" "}
                          -{" "}
                          {formatDate(booking?.bookingDetails?.checkOutDate) ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm text-zinc-600 max-w-[150px]">
                        <div className="font-medium text-zinc-800 truncate">
                          {user?.name || "Loading..."}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {user?.email || ""}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {user?.location || ""}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-zinc-600">
                        {formatDate(booking?.createdAt) || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm text-zinc-600">
                        {booking?.bookingDetails?.guests || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-zinc-600">
                        {formatDate(booking?.bookingDetails?.checkInDate) ||
                          "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-zinc-600">
                        {formatDate(booking?.bookingDetails?.checkOutDate) ||
                          "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-rose-600 font-semibold">
                        ${booking?.totalPrice || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-500 hover:text-blue-600 text-sm p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => openModal(booking)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button
                            className="text-gray-500 hover:text-gray-600 text-sm p-1 rounded hover:bg-gray-50 transition-colors"
                            onClick={() => downloadReceipt(booking)}
                            title="Download Receipt"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div id="empty-state" className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              No Bookings Yet
            </h2>
            <p className="text-zinc-500 text-sm sm:text-base">
              You made no bookings. Start exploring amazing stays!
            </p>
          </div>
        )}
        {paginatedBookings.length > 0 && (
          <div className="mt-4 sm:mt-6 text-center">
            <Pagination
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white w-full max-w-md sm:max-w-lg rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">
                Booking Details
              </h2>
              <button
                className="text-gray-400 hover:text-gray-600 text-lg sm:text-xl"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-sm sm:text-base">
              {/* Customer Information */}
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Customer Information
                </h3>
                <p className="text-gray-600">
                  <span className="font-semibold">Name: </span>
                  {users[selectedBooking.userId]?.name || "Loading..."}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Email: </span>
                  {users[selectedBooking.userId]?.email || "Loading..."}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Location: </span>
                  {users[selectedBooking.userId]?.location || "Loading..."}
                </p>
              </div>

              {/* Booking Information */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Booking Information
                </h3>
                <p className="text-gray-600">
                  <span className="font-semibold">Title: </span>
                  {selectedBooking.bookingDetails.title}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Description: </span>
                  {selectedBooking.bookingDetails.description}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Guests: </span>
                  {selectedBooking.bookingDetails.guests}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Check-In: </span>
                  {formatDate(selectedBooking.bookingDetails.checkInDate)}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Check-Out: </span>
                  {formatDate(selectedBooking.bookingDetails.checkOutDate)}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Total Price: </span>$
                  {selectedBooking.totalPrice}
                </p>
              </div>
            </div>
            <button
              className="mt-4 w-full px-4 py-2 text-sm sm:text-base bg-primary text-white rounded-lg hover:brightness-90 transition-colors"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsList;
