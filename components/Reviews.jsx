"use client";

import { session } from '@/app/action';
import ReviewDeleteButton from './ReviewDeleteButton';
import Image from 'next/image';
import avatar from '/public/avatar.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { useEffect, useState } from 'react';

const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
};

const Reviews = ({ reviews }) => {
    const [sessionData, setSessionData] = useState(null);

    useEffect(() => {
        async function getSession() {
            const data = await session();
            setSessionData(data);
        }

        getSession();
    }, []);

    const Star = ({ filled }) => (
        <i className={`fas fa-star ${filled ? 'text-yellow-500' : 'text-gray-300'}`} />
    );

    return (
        <div className="max-w-7xl mx-auto">
            {reviews.length > 0 ? (
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={2}
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    className="swiper-modern"
                >
                    {reviews.map((review) => (
                        <SwiperSlide key={review._id}>
                            <div className="bg-white rounded-md shadow-sm p-6">
                                {/* User Info */}
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                                        <Image
                                            width={500}
                                            height={500}
                                            src={avatar}
                                            alt="User avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">{review.userName}</h4>
                                        <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} filled={i < review.ratings} />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 leading-relaxed">{review.review}</p>
                                {sessionData?.user && sessionData.user.id === review.userId && (
                                    <ReviewDeleteButton
                                        review={review}
                                        user={sessionData.user}
                                        className="text-sm text-red-500 hover:text-red-700"
                                    />
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            ) : (
                <p className="text-center text-gray-500 py-10">No reviews available for this hotel.</p>
            )}
        </div>
    );
};

export default Reviews;
