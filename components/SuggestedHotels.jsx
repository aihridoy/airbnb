import { getHotels, getReviews } from '@/app/action';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const calculateAverageRating = (reviews, hotelId) => {
    const hotelReviews = reviews.filter(review => review.hotelId === hotelId);
    if (hotelReviews.length === 0) return 0;
    const totalRating = hotelReviews.reduce((sum, review) => sum + review.ratings, 0);
    return Number((totalRating / hotelReviews.length).toFixed(1));
};

const getTopRatedHotels = (hotels, reviews, count = 5) => {
    return hotels
        .map(hotel => ({
            ...hotel,
            averageRating: calculateAverageRating(reviews, hotel._id)
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, count);
};

const SuggestedHotels = async () => {
    const hotelsData = await getHotels();
    const reviewsData = await getReviews();
    const hotels = hotelsData?.hotels || [];
    const reviews = reviewsData?.reviews || [];
    const topRatedHotels = getTopRatedHotels(hotels, reviews, 5);

    return (
        <div className="max-w-7xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Suggested Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topRatedHotels?.map((hotel) => {
                    const filteredReviews = reviews.filter(review => review.hotelId === hotel._id);
                    const totalReviews = filteredReviews.length;
                    const averageRating = totalReviews > 0 ?
                        filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews :
                        0;
                    return (
                        <Link href={`/details/${hotel._id}`} key={hotel._id} className="bg-white shadow-md rounded-lg overflow-hidden">
                            <div className="h-48 relative">
                                <Image
                                    src={hotel.images[0]}
                                    alt={hotel.title}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800">{hotel.title}</h3>
                                <p className="text-sm text-gray-500">{hotel.location}</p>
                                <div className="flex items-center my-2">
                                    <p>
                                        <span className="text-yellow-500 font-bold text-sm">{averageRating?.toFixed(1)} ★</span> ({totalReviews} reviews)
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700 line-clamp-2">{hotel.description}</p>
                                <p className="text-lg font-bold text-gray-900 mt-4">${hotel.rent}/night</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
};

export default SuggestedHotels;