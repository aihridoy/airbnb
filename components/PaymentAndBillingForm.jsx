"use client";

import { createBooking, sendEmail, session } from "@/app/action";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentAndBillingForm = ({ totalPrice, bookingDetails }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                setUser(userData?.user || null);
            } catch (error) {
                console.error("Failed to fetch user session:", error);
            }
        };

        fetchUser();
    }, []);
    const {
        title,
        description,
        guests,
        averageRating,
        checkIn,
        checkOut,
        totalReviews,
        ownerId,
        hotelId,
        cleaningFee,
        serviceFee,
        hotelImage,
    } = bookingDetails;
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiration: "",
        cvv: "",
        streetAddress: "",
        aptSuite: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const bookingPayload = {
            hotelId,
            userId: user?.id,
            bookingDetails: {
                title,
                description,
                guests,
                averageRating,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalReviews,
                hotelImage,
                cleaningFee,
                serviceFee,
            },
            paymentDetails: {
                cardNumber: formData.cardNumber,
                expiration: formData.expiration,
                cvv: formData.cvv,
                billingAddress: {
                    streetAddress: formData.streetAddress,
                    aptSuite: formData.aptSuite,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                },
            },
            totalPrice,
        };

        try {
            const response = await createBooking(bookingPayload);
            if (response) {
                await sendEmail({
                    to: user?.email,
                    subject: "Booking Confirmation",
                    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #0056b3;">Reservation Receipt</h1>
            <p><strong>Booking ID:</strong> ${response.bookingId || "N/A"}</p>
            <p><strong>Property:</strong> ${title || "N/A"}</p>
            <p><strong>Total Guests:</strong> ${guests || "N/A"}</p>
            <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString("en-US") || "N/A"
                        }</p>
            <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString("en-US") || "N/A"
                        }</p>
            <p><strong>Total Paid:</strong> $${totalPrice || "N/A"}</p>
            <p><strong>Hotel ID:</strong> ${hotelId || "N/A"}</p>
            <p><strong>User ID:</strong> ${user?.id || "N/A"}</p>
            <p><strong>Rating:</strong> ${averageRating || "N/A"} (${totalReviews || 0
                        } review(s))</p>
            <p><strong>Card Number:</strong> **** **** **** ${formData.cardNumber.slice(-4) || "N/A"
                        }</p>
        </div>
    `,
                });
                toast.success(response.message || "Booking created successfully!");
                setIsLoading(false);
                router.push(`/payment-success?bookingId=${response.bookingId}`);
            } else {
                toast.error("Failed to create booking. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <section className="mb-8">
            <ToastContainer position="top-right" autoClose={3000} />
            <form onSubmit={handleSubmit}>
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Pay with American Express
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="Card number"
                            className="w-full p-3 border rounded-lg"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="expiration"
                                value={formData.expiration}
                                onChange={handleChange}
                                placeholder="Expiration"
                                className="p-3 border rounded-lg"
                            />
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                placeholder="CVV"
                                className="p-3 border rounded-lg"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Billing address</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            placeholder="Street address"
                            className="w-full p-3 border rounded-lg"
                        />
                        <input
                            type="text"
                            name="aptSuite"
                            value={formData.aptSuite}
                            onChange={handleChange}
                            placeholder="Apt or suite number"
                            className="w-full p-3 border rounded-lg"
                        />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full p-3 border rounded-lg"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="p-3 border rounded-lg"
                            />
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="ZIP code"
                                className="p-3 border rounded-lg"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full block text-center bg-primary text-white py-3 rounded-lg mt-6 ${isLoading
                                ? "cursor-not-allowed opacity-50"
                                : "hover:brightness-90"
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Request to book"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default PaymentAndBillingForm;
