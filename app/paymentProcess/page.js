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
import { ChevronLeft, Star } from 'lucide-react';

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
            <div className="max-w-7xl mx-auto px-6 py-8 bg-cream">
                <div className="mb-8">
                    <button onClick={handleGoBack} className="flex items-center text-ink hover:text-brass-dark transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Request to book
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <section className="mb-8">
                            <h2 className="font-serif text-xl text-ink mb-4">Your trip</h2>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-medium text-ink">Dates</h3>
                                    <p className="text-muted text-sm">{formattedDateRange}</p>
                                </div>
                                <button
                                    onClick={() => openModal('dates')}
                                    className="text-brass-dark underline text-sm hover:text-brass"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-ink">Guests</h3>
                                    <p className="text-muted text-sm">{bookingDetails?.guests} guest</p>
                                </div>
                                <button
                                    onClick={() => openModal('guests')}
                                    className="text-brass-dark underline text-sm hover:text-brass"
                                >
                                    Edit
                                </button>
                            </div>
                        </section>
                        <PaymentAndBillingForm totalPrice={totalPrice} bookingDetails={bookingDetails} />
                    </div>

                    <div>
                        <div className="bg-surface border border-hairline p-6 rounded-2xl mb-8 sticky top-0">
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
                                    <p className="text-sm text-ink">
                                        {bookingDetails?.title}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <Star className="w-3.5 h-3.5 mr-1 text-brass-dark fill-current" />
                                        <span className="text-xs text-muted"
                                        >{bookingDetails?.averageRating?.toFixed(1)} ({bookingDetails?.totalReviews} Reviews)</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-hairline pt-4">
                                <h3 className="font-semibold text-ink mb-4">Price details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-ink">
                                        <span>${bookingDetails?.rent} x {nights} nights</span>
                                        <span>${totalPricePerNight}</span>
                                    </div>
                                    <div className="flex justify-between text-ink">
                                        <span>Cleaning fee</span>
                                        <span>${bookingDetails?.cleaningFee}</span>
                                    </div>
                                    <div className="flex justify-between text-ink">
                                        <span>Service fee</span>
                                        <span>${bookingDetails?.serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-ink pt-3 border-t border-hairline">
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
