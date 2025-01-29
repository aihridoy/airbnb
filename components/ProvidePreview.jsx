"use client"
import React, { useEffect, useState } from 'react';
import ReviewModal from './ReviewModal';
import { session } from '@/app/action';

const ProvidePreview = ({ hotelId, ownerId, totalReviews, averageRating }) => {
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const isOwner = ownerId === userId;

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                setUserId(userData?.user?.id || null);
            } catch (error) {
                console.error('Failed to fetch user session:', error);
            }
        };
        fetchUser();
    }, []);

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold">Reviews</h2>
                    <div className="flex items-center">
                        <i className="fas fa-star text-yellow-500 mr-2"></i>
                        <span className="text-xl font-semibold">{averageRating.toFixed(1)}</span>
                        <span className="mx-2">·</span>
                        <span className="text-gray-600">{totalReviews} reviews</span>
                    </div>
                </div>
                {
                    !isOwner && userId && <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 border border-gray-900 rounded-lg hover:bg-gray-100"
                    >
                        Write a Review
                    </button>
                }
            </div>
            {
                showModal && <ReviewModal setShowModal={setShowModal} hotelId={hotelId} />
            }
        </>
    );
};

export default ProvidePreview;