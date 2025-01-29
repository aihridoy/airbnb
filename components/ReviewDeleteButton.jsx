'use client';

import { deleteReview } from '@/app/action';

const ReviewDeleteButton = ({ review, user }) => {

    const handleDelete = async (id) => {
        const confirmDelete = confirm(`Are you sure you want to delete the review?`);
        if (!confirmDelete) return;
        try {
            const data = await deleteReview(id);
            alert(data.message || 'Review deleted successfully');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Error deleting review');
        }
    };

    return (
        <>
            {user?.id === review.userId && (
                <button
                    onClick={() => handleDelete(review._id)}
                    className="text-red-500 hover:underline"
                >
                    Delete Review
                </button>
            )}
        </>
    );
};

export default ReviewDeleteButton;
