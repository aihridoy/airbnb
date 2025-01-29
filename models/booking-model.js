import mongoose, { Schema } from 'mongoose';

const bookingSchema = new Schema(
    {
        hotelId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hotel',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        bookingDetails: {
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
            },
            hotelImage: {
                type: String,
            },
            guests: {
                type: Number,
                required: true,
            },
            averageRating: {
                type: Number,
            },
            totalReviews: {
                type: Number,
            },
            checkInDate: {
                type: Date,
                required: true,
            },
            checkOutDate: {
                type: Date,
                required: true,
            },
            cleaningFee: {
                type: Number,
            },
            serviceFee: {
                type: Number,
            },
        },
        paymentDetails: {
            cardNumber: {
                type: String,
                required: true,
            },
            expiration: {
                type: String,
                required: true,
            },
            cvv: {
                type: String,
                required: true,
            },
            billingAddress: {
                streetAddress: {
                    type: String,
                    required: true,
                },
                aptSuite: {
                    type: String,
                },
                city: {
                    type: String,
                    required: true,
                },
                state: {
                    type: String,
                    required: true,
                },
                zipCode: {
                    type: String,
                    required: true,
                },
            },
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Booking = mongoose.models.bookings ?? mongoose.model('bookings', bookingSchema);
