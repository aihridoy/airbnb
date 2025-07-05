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

const BookingsList = ({ bookings }) => {
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

        drawDetail("Booking ID:", booking?._id?.slice(0, 8), true);
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

    return (
        <>
            <div className="space-y-4 px-4 sm:px-0">
                {paginatedBookings.length > 0 ? (
                    <div className="border rounded-lg overflow-x-auto">
                        <table className="w-full text-left text-sm sm:text-base">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-2 sm:p-4">Image</th>
                                    <th className="p-2 sm:p-4">Property</th>
                                    <th className="p-2 sm:p-4 hidden sm:table-cell">Booking Date</th>
                                    <th className="p-2 sm:p-4 hidden sm:table-cell">Guests</th>
                                    <th className="p-2 sm:p-4 hidden sm:table-cell">Check-In</th>
                                    <th className="p-2 sm:p-4 hidden sm:table-cell">Check-Out</th>
                                    <th className="p-2 sm:p-4">Total Cost</th>
                                    <th className="p-2 sm:p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedBookings.map((booking) => (
                                    <tr key={booking._id} className="border-t hover:bg-gray-50">
                                        <td className="p-2 sm:p-4">
                                            {booking?.bookingDetails?.hotelImage && (
                                                <Image
                                                    width={80}
                                                    height={80}
                                                    src={booking.bookingDetails.hotelImage}
                                                    alt="Property Thumbnail"
                                                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                                                    sizes="(max-width: 640px) 100vw, 80px"
                                                    priority={false}
                                                />
                                            )}
                                        </td>
                                        <td className="p-2 sm:p-4 font-semibold text-zinc-800 truncate">
                                            <div className="sm:hidden text-xs text-zinc-600 mb-1">
                                                {formatDate(booking?.createdAt) || "N/A"}
                                            </div>
                                            {booking?.bookingDetails?.title || "N/A"}
                                            <div className="sm:hidden text-xs text-zinc-600 mt-1">
                                                Guests: {booking?.bookingDetails?.guests || "N/A"}
                                            </div>
                                            <div className="sm:hidden text-xs text-zinc-600 mt-1">
                                                Check-In: {formatDate(booking?.bookingDetails?.checkInDate) || "N/A"}
                                            </div>
                                            <div className="sm:hidden text-xs text-zinc-600 mt-1">
                                                Check-Out: {formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"}
                                            </div>
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">
                                            {formatDate(booking?.createdAt) || "N/A"}
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">
                                            {booking?.bookingDetails?.guests || "N/A"}
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">
                                            {formatDate(booking?.bookingDetails?.checkInDate) || "N/A"}
                                        </td>
                                        <td className="p-2 sm:p-4 hidden sm:table-cell text-zinc-600">
                                            {formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"}
                                        </td>
                                        <td className="p-2 sm:p-4 text-rose-600 font-semibold">
                                            ${booking?.totalPrice || "N/A"}
                                        </td>
                                        <td className="p-2 sm:p-4">
                                            <div className="flex space-x-2 sm:space-x-4">
                                                <button
                                                    className="text-blue-500 hover:text-blue-600 text-sm sm:text-base"
                                                    onClick={() => openModal(booking)}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button
                                                    className="text-gray-500 hover:text-gray-600 text-sm sm:text-base"
                                                    onClick={() => downloadReceipt(booking)}
                                                >
                                                    <i className="fas fa-download"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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

export default BookingsList;