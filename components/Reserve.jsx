/* eslint-disable react/no-unescaped-entities */
"use client"
import React, { useContext, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { BookingContext } from '@/contexts/BookingContext';
import { session } from '@/app/action';

const Reserve = ({ rent, title, description, serviceFee, cleaningFee, totalReviews, averageRating, ownerId, hotelId, hotelImage }) => {
    const [user, setUser] = useState(null);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [guests, setGuests] = useState('');
    const { setBookingDetails } = useContext(BookingContext);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const res = await session();
            setUser(res);
        };

        fetchUser();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!user) {
            router.push('/login');
            return;
        }

        if (checkInDate && checkOutDate && guests) {
            const checkIn = format(checkInDate, 'yyyy-MM-dd');
            const checkOut = format(checkOutDate, 'yyyy-MM-dd');
            setBookingDetails({
                title,
                description,
                rent,
                guests,
                checkIn: checkIn,
                checkOut: checkOut,
                serviceFee,
                cleaningFee,
                totalReviews,
                averageRating,
                ownerId,
                hotelId,
                hotelImage,
            });
            router.push('/paymentProcess');
        } else {
            alert('Please fill out all fields.');
        }
    };
    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-white shadow-lg rounded-xl p-6 border">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="text-xl font-bold">${rent}</span>
                        <span className="text-gray-600 ml-1">per night</span>
                    </div>
                    <div className="flex items-center">
                        <i className="fas fa-star text-yellow-500 mr-1"></i>
                        <span>{averageRating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="border rounded-lg mb-4">
                    <div className="grid grid-cols-2 border-b">
                        <div className="p-3 border-r">
                            <DatePicker
                                selected={checkInDate}
                                onChange={date => setCheckInDate(date)}
                                selectsStart
                                startDate={checkInDate}
                                endDate={checkOutDate}
                                placeholderText="Check in"
                                className="w-full"
                                dateFormat="MM/dd/yyyy"
                            />
                        </div>
                        <div className="p-3">
                            <DatePicker
                                selected={checkOutDate}
                                onChange={date => setCheckOutDate(date)}
                                selectsEnd
                                startDate={checkInDate}
                                endDate={checkOutDate}
                                minDate={checkInDate}
                                placeholderText="Check out"
                                className="w-full"
                                dateFormat="MM/dd/yyyy"
                            />
                        </div>
                    </div>
                    <input
                        type="number"
                        placeholder="Guests"
                        className="w-full p-3"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full block text-center bg-primary text-white py-3 rounded-lg transition-all hover:brightness-90"
                >
                    Reserve
                </button>

                <div className="text-center mt-4 text-gray-600">
                    <p>You won't be charged yet</p>
                </div>
            </div>
        </form>
    );
};

export default Reserve;