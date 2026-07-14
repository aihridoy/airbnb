import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    const { id } = params;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();
        const booking = await Booking.findById(id).lean();
        if (!booking) {
            return NextResponse.json(
                { message: `Booking with ID ${id} not found` },
                { status: 404 }
            );
        }

        if (session.user.role !== "admin" && booking.userId?.toString() !== session.user.id) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
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
