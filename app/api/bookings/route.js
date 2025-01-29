import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const bookings = await Booking.find().lean()
        return NextResponse.json(
            { bookings },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { message: 'Failed to fetch reviews', error: error.message },
            { status: 500 }
        );
    }
}