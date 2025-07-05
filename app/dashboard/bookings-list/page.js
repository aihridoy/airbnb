import Navbar from "@/components/Navbar";
import React from "react";
import { getBookings, session } from "../../action";
import { redirect } from "next/navigation";
import BookingsList from "@/components/BookingsList";

export default async function Bookings() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect("/login");
    }
    const { bookings } = await getBookings();

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Bookings</h1>
                <BookingsList bookings={bookings} />
            </div>
        </>
    );
}