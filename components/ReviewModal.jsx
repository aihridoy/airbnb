"use client"
import React, { useEffect, useState } from 'react';
import { submitReview, session } from '@/app/action';

const ReviewModal = ({ setShowModal, hotelId }) => {
    const [userId, setUserId] = useState(null);
    const [userName, setUserName] = useState(null);
    const [ratings, setRatings] = useState(0);
    const [review, setReview] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                setUserId(userData?.user?.id || null);
                setUserName(userData?.user?.name || null);
            } catch (error) {
                console.error('Failed to fetch user session:', error);
            }
        };

        fetchUser();
    }, []);

    const handleSubmit = async () => {
        try {
            await submitReview({ hotelId, userId, userName, ratings, review });
            alert('Review submitted successfully!');
            setShowModal(false);
        } catch (error) {
            setError(error.message);
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl w-full max-w-xl mx-4 overflow-hidden">
                <div className="p-6">
                    {error && (
                        <div className="text-red-500 mb-4">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Overall Rating</label>
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`text-3xl ${index < ratings ? 'text-yellow-500' : 'text-gray-300'}`}
                                        onClick={() => setRatings(index + 1)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">Your Review</label>
                            <textarea
                                rows="4"
                                placeholder="Share your experience..."
                                className="w-full px-4 py-3 rounded-lg border"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div className="border-t p-4 bg-gray-50 flex justify-end gap-4">
                    <button
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:brightness-90"
                        onClick={handleSubmit}
                    >
                        Submit Review
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
