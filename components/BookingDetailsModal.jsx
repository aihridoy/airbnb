"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Pagination from "./Pagination";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingDetailsModal = ({ bookings }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <>
      <div className="space-y-4 px-4 sm:px-6 lg:px-8">
        {bookings.length > 0 ? (
          <>
            {paginatedBookings.map((booking) => {
              const downloadReceipt = async () => {
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([612, 792]);
                const { width, height } = page.getSize();
                const helveticaFont = await pdfDoc.embedFont(
                  StandardFonts.Helvetica
                );
                const boldFont = await pdfDoc.embedFont(
                  StandardFonts.HelveticaBold
                );

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

                drawDetail("Booking ID:", booking?._id?.slice(0, 8), true);
                drawDetail(
                  "Property:",
                  booking?.bookingDetails?.title || "N/A"
                );
                drawDetail(
                  "Total Guests:",
                  booking?.bookingDetails?.guests || "N/A"
                );
                drawDetail(
                  "Check-in:",
                  formatDate(booking?.bookingDetails?.checkInDate) || "N/A"
                );
                drawDetail(
                  "Check-out:",
                  formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"
                );
                drawDetail(
                  "Total Paid:",
                  `$${booking?.totalPrice || "N/A"}`,
                  true
                );
                drawDetail("Hotel ID:", booking?.hotelId || "N/A");
                drawDetail("User ID:", booking?.userId || "N/A");
                drawDetail(
                  "Rating:",
                  `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${
                    booking?.bookingDetails?.totalReviews
                  } review(s))`
                );
                drawDetail(
                  "Card Number:",
                  booking?.paymentDetails?.cardNumber || "N/A"
                );
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

              return (
                <div
                  key={booking._id}
                  className="bg-white shadow-md rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <Image
                      width={300}
                      height={200}
                      src={booking?.bookingDetails?.hotelImage}
                      alt="Property Thumbnail"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md"
                      sizes="(max-width: 640px) 100vw, 150px"
                      priority={false}
                    />
                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg text-zinc-800 font-semibold truncate">
                        {booking?.bookingDetails?.title}
                      </h2>
                      <p className="text-zinc-500 text-xs sm:text-sm">
                        Booking Date: {formatDate(booking?.createdAt)}
                      </p>
                      <p className="text-zinc-500 text-xs sm:text-sm">
                        Booking Cost: ${booking.totalPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <button
                      className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-primary text-white rounded-lg hover:brightness-90 transition-colors"
                      onClick={() => openModal(booking)}
                    >
                      View Trip Details
                    </button>
                    <button
                      onClick={downloadReceipt}
                      className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <i className="fas fa-download mr-1 sm:mr-2"></i>
                      Download Receipt
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 sm:mt-6 text-center">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
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
      </div>
      {isModalOpen && (
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
            {selectedBooking && (
              <div className="space-y-2 text-sm sm:text-base">
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
            )}
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

export default BookingDetailsModal;
