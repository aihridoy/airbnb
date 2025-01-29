"use client"

import { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
    const [bookingDetails, setBookingDetails] = useState({
        title: '',
        description: '',
        rent: 0,
        serviceFee: 0,
        cleaningFee: 0,
        checkInDate: null,
        checkOutDate: null,
        guests: '',
        ownerId: '',
        hotelId: '',
        hotelImage: '',
    });

    const updateBookingDetails = (updates) => {
        setBookingDetails((prevDetails) => ({
            ...prevDetails,
            ...updates,
        }));
    };

    return (
        <BookingContext.Provider value={{ bookingDetails, setBookingDetails, updateBookingDetails }}>
            {children}
        </BookingContext.Provider>
    );
};