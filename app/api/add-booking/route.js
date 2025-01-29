import { Booking } from "@/models/booking-model";
import { dbConnect } from "@/service/mongo";

export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();
        const { hotelId, userId, bookingDetails, paymentDetails, totalPrice } = body;

        if (!hotelId || !userId || !bookingDetails || !paymentDetails || !totalPrice) {
            return new Response(JSON.stringify({ message: 'Missing required fields.' }), { status: 400 });
        }

        const newBooking = new Booking({
            hotelId,
            userId,
            bookingDetails,
            paymentDetails,
            totalPrice,
        });

        const savedBooking = await newBooking.save();

        return new Response(
            JSON.stringify({ message: 'Booking created successfully.', bookingId: savedBooking._id }),
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return new Response(
            JSON.stringify({ message: 'An error occurred while creating the booking.' }),
            { status: 500 }
        );
    }
}
