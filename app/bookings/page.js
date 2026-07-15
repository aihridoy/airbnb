import Navbar from "@/components/Navbar";
import React from "react";
import { getBookings, session } from "../action";
import { redirect } from "next/navigation";
import BookingDetailsModal from "@/components/BookingDetailsModal";

export default async function Bookings() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  const { user } = authResult;
  const { bookings } = await getBookings();
  const filteredBookings = bookings.filter(
    (booking) => booking.userId === user.id
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl text-ink mb-6">My Bookings</h1>
          <BookingDetailsModal bookings={filteredBookings} />
        </div>
      </div>
    </>
  );
}
