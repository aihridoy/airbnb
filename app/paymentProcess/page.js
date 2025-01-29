"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useContext, useState } from 'react';
import { BookingContext } from '@/contexts/BookingContext';
import PaymentAndBillingForm from '@/components/PaymentAndBillingForm';
import EditModal from '@/components/EditModal';
import { useRouter } from 'next/navigation';

const PaymentProcessPage = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };

    const { bookingDetails, updateBookingDetails } = useContext(BookingContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editType, setEditType] = useState(null);

    const formattedCheckIn = bookingDetails.checkIn ? format(parseISO(bookingDetails.checkIn), 'MMM d') : '';
    const formattedCheckOut = bookingDetails.checkOut ? format(parseISO(bookingDetails.checkOut), 'd, yyyy') : '';
    const formattedDateRange = (bookingDetails.checkIn && bookingDetails.checkOut)
        ? `${formattedCheckIn} - ${formattedCheckOut}`
        : 'Date Range Not Available';

    let nights = 0;
    if (bookingDetails.checkIn && bookingDetails.checkOut) {
        const checkInDate = parseISO(bookingDetails.checkIn);
        const checkOutDate = parseISO(bookingDetails.checkOut);
        nights = differenceInDays(checkOutDate, checkInDate);
    }

    const pricePerNight = parseFloat(bookingDetails.rent || 0);
    const totalPricePerNight = pricePerNight * nights;
    const totalPrice = totalPricePerNight + parseFloat(bookingDetails.cleaningFee) + parseFloat(bookingDetails.serviceFee);

    const openModal = (type) => {
        setEditType(type);
        setIsModalOpen(true);
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <button onClick={handleGoBack} className="text-zinc-800 hover:underline">
                        <i className="fas fa-chevron-left mr-2"></i>
                        Request to book
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Your trip</h2>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-medium">Dates</h3>
                                    <p className="text-zinc-600 text-sm">{formattedDateRange}</p>
                                </div>
                                <button
                                    onClick={() => openModal('dates')}
                                    className="text-zinc-800 underline text-sm"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Guests</h3>
                                    <p className="text-zinc-600 text-sm">{bookingDetails?.guests} guest</p>
                                </div>
                                <button
                                    onClick={() => openModal('guests')}
                                    className="text-zinc-800 underline text-sm"
                                >
                                    Edit
                                </button>
                            </div>
                        </section>
                        <PaymentAndBillingForm totalPrice={totalPrice} bookingDetails={bookingDetails} />
                    </div>

                    <div>
                        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 sticky top-0">
                            <div className="flex items-start gap-4 mb-6">
                                <Image
                                    width={500}
                                    height={500}
                                    src={bookingDetails?.hotelImage}
                                    alt="Property"
                                    className="w-20 h-20 rounded-lg object-cover"
                                    unoptimized={true}
                                />
                                <div>
                                    <p className="text-sm">
                                        {bookingDetails?.title}
                                    </p>
                                    <div className="flex items-center">
                                        <i className="fas fa-star text-sm mr-1"></i>
                                        <span className="text-xs mt-1 text-zinc-500"
                                        >{bookingDetails?.averageRating?.toFixed(1)} ({bookingDetails?.totalReviews} Reviews)</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold mb-4">Price details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>${bookingDetails?.rent} x {nights} nights</span>
                                        <span>${totalPricePerNight}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Cleaning fee</span>
                                        <span>${bookingDetails?.cleaningFee}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Service fee</span>
                                        <span>${bookingDetails?.serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold pt-3 border-t">
                                        <span>Total (USD)</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            {isModalOpen && (
                <EditModal
                    type={editType}
                    onClose={() => setIsModalOpen(false)}
                    guests={bookingDetails?.guests}
                    checkIn={bookingDetails.checkIn}
                    checkOut={bookingDetails.checkOut}
                    updateBookingDetails={updateBookingDetails}
                />
            )}
        </>
    );
};

export default PaymentProcessPage;
