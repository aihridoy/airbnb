import Navbar from "@/components/Navbar";
import React from "react";
import { getBookings, session } from "../../action";
import { redirect } from "next/navigation";
import BookingDetailsModal from "@/components/BookingDetailsModal";
import BookingsList from "@/components/BookingsList";

export default async function Bookings() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect("/login");
    }
    const { bookings } = await getBookings();
   
    return (
        <>
            <div className="w-full mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
                <BookingsList bookings={bookings} />
            </div>
        </>
    );
}
