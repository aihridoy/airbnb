/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getBooking } from "../action";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Link from "next/link";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PaymentSuccess() {
  const [booking, setBooking] = useState({});
  const [bookingId, setBookingId] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setBookingId(params.get("bookingId"));
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const response = await getBooking(bookingId);
      setBooking(response?.booking);
    };

    fetchBookings();
  }, [bookingId]);

  const downloadReceipt = async () => {
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
      size: 24,
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

    drawDetail("Booking ID:", bookingId?.slice(0, 8), true);
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
      `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${booking?.bookingDetails?.totalReviews} review(s))`
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
    link.download = `receipt_${bookingId}.pdf`;
    link.click();
  };

  return (
    <>
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center my-12">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
            <i className="fas fa-check-circle text-4xl text-primary"></i>
          </div>
          <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-zinc-600 mb-8">
            Your booking has been confirmed. Check your email for details.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start gap-6 mb-6 pb-6 border-b">
            <Image
              width={500}
              height={500}
              src={booking?.bookingDetails?.hotelImage}
              alt="Property"
              className="w-32 h-32 rounded-lg object-cover"
              // unoptimized={true}
            />
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                {booking?.bookingDetails?.title}
              </h2>
              <div className="flex items-center mb-2">
                <i className="fas fa-star text-sm mr-1"></i>
                <span className="text-sm">
                  {booking?.bookingDetails?.averageRating?.toFixed(1)} (
                  {booking?.bookingDetails?.totalReviews}+ reviews)
                </span>
              </div>
              <p className="text-zinc-600">
                {booking?.bookingDetails?.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Reservation Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-600 text-sm">Check-in</span>
                  <span className="text-zinc-500 text-sm">
                    {formatDate(booking?.bookingDetails?.checkInDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 text-sm">Check-out</span>
                  <span className="text-zinc-500 text-sm">
                    {formatDate(booking?.bookingDetails?.checkOutDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600 text-sm">Guests</span>
                  <span className="text-zinc-500 text-sm">
                    {booking?.bookingDetails?.guests} guest
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Total amount paid</span>
                  <span className="font-semibold">${booking?.totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 text-sm">Booking ID</span>
                  <span>{bookingId?.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6">Next Steps</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-primary">
                <i className="fas fa-envelope text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Check your email</h4>
                <p className="text-zinc-600">
                  We've sent your confirmation and trip details to your email
                  address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary">
                <i className="fas fa-comment-alt text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Message your host</h4>
                <p className="text-zinc-600">
                  Introduce yourself and let them know your travel plans.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-primary">
                <i className="fas fa-suitcase text-xl"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Plan your trip</h4>
                <p className="text-zinc-600">
                  Review house rules and check-in instructions in your trip
                  details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadReceipt}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:brightness-90"
          >
            <i className="fas fa-download mr-2"></i>
            Download Receipt
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-zinc-600">Need help with your booking?</p>
          <a href="#" className="text-primary hover:underline">
            Visit our Help Center
          </a>
          <br />
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </>
  );
}
