"use client"
import React, { useEffect, useState } from 'react';
import { submitReview, session } from '@/app/action';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
            <div className="bg-surface border border-hairline shadow-luxe rounded-2xl w-full max-w-xl overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-serif text-lg text-ink">Write a Review</h2>
                        <button
                            onClick={() => setShowModal(false)}
                            className="text-muted hover:text-ink transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {error && (
                        <div className="text-red-500 mb-4">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6">
                        <div>
                            <label className="block text-ink font-medium mb-2">Overall Rating</label>
                            <div className="flex gap-2">
                                {[...Array(5)].map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={`text-3xl ${index < ratings ? 'text-brass-dark' : 'text-hairline'}`}
                                        onClick={() => setRatings(index + 1)}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-ink font-medium mb-2">Your Review</label>
                            <textarea
                                rows="4"
                                placeholder="Share your experience..."
                                className="w-full px-4 py-3 rounded-lg border border-hairline focus:outline-none focus:ring-2 focus:ring-brass"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                            ></textarea>
                        </div>
                    </form>
                </div>
                <div className="border-t border-hairline p-4 bg-surface-alt flex justify-end gap-4">
                    <button
                        className="px-4 py-2 text-muted hover:bg-surface rounded-lg transition-colors"
                        onClick={() => setShowModal(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors"
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
