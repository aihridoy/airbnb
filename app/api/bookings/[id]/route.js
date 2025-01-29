import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        await dbConnect();
        const booking = await Booking.findById(id).lean();
        if (!booking) {
            return NextResponse.json(
                { message: `Booking with ID ${id} not found` },
                { status: 404 }
            );
        }
        return NextResponse.json(
            { booking },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching booking:', error);
        return NextResponse.json(
            { message: 'Failed to fetch booking', error: error.message },
            { status: 500 }
        );
    }
}
