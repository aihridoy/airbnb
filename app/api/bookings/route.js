import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await dbConnect();

        const query = session.user.role === "admin" ? {} : { userId: session.user.id };
        const bookings = await Booking.find(query).lean()
        return NextResponse.json(
            { bookings },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json(
            { message: 'Failed to fetch bookings', error: error.message },
            { status: 500 }
        );
    }
}
