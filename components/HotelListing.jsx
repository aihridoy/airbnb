"use client";

import { getHotels, getReviews } from '@/app/action';
import React, { useState, useEffect } from 'react';
import Hotel from './Hotel';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSearch } from '@/contexts/SearchContext';
import Pagination from './Pagination';

const HotelListing = () => {
    const { searchQuery } = useSearch();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [hotels, setHotels] = useState(null);
    const [error, setError] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            try {
                const [hotelsData, reviewsData] = await Promise.all([
                    getHotels(currentPage, 8, searchQuery),
                    getReviews()
                ]);
                setHotels(hotelsData);
                setTotalPages(hotelsData.totalPages);
                setReviews(reviewsData?.reviews || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [currentPage, searchQuery]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            router.push(`/?page=${newPage}`);
        }
    };

    const loadingSpinner = (
        <div className="flex justify-center items-center h-[650px]">
            <div className="animate-spin rounded-full h-40 w-40 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) {
        return <div>Error loading hotels: {error}</div>;
    }

    return (
        <>
            <section className="mt-10 px-6 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {loading ? (
                        loadingSpinner
                    ) : hotels?.hotels?.length === 0 ? (
                        <div className="text-center text-xl text-gray-500 h-96 flex items-center justify-center">
                            No hotels found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {hotels?.hotels?.map((hotel) => {
                                const filteredReviews = reviews.filter(review => review.hotelId === hotel._id);
                                const totalReviews = filteredReviews.length;
                                const averageRating = totalReviews > 0 ?
                                    filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews :
                                    0;
                                return <Hotel key={hotel._id} hotel={hotel} averageRating={averageRating} />;
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-10 flex justify-center">
                {hotels && <Pagination currentPage={currentPage} totalPages={totalPages} handlePageChange={handlePageChange} />}
            </div>
            </section>

            
        </>
    );
};

export default HotelListing;