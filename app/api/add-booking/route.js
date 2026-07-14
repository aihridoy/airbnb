import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();
        const { hotelId, bookingDetails, paymentDetails, totalPrice } = body;

        if (!hotelId || !bookingDetails || !paymentDetails || !totalPrice) {
            return NextResponse.json({ message: 'Missing required fields.' }, { status: 400 });
        }

        // Never persist CVV, and never store a full card number.
        const { cardNumber, cvv, ...restPaymentDetails } = paymentDetails;
        const maskedPaymentDetails = {
            ...restPaymentDetails,
            cardNumber: cardNumber ? `**** **** **** ${String(cardNumber).slice(-4)}` : undefined,
        };

        const newBooking = new Booking({
            hotelId,
            userId: session.user.id,
            bookingDetails,
            paymentDetails: maskedPaymentDetails,
            totalPrice,
        });

        const savedBooking = await newBooking.save();

        return NextResponse.json(
            { message: 'Booking created successfully.', bookingId: savedBooking._id },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'An error occurred while creating the booking.' },
            { status: 500 }
        );
    }
}
