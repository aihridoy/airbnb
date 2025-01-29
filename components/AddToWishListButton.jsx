"use client";

import { addToWishlist } from '@/app/action';
import React from 'react';

const AddToWishListButton = ({ hotelId, userId, title, location, rent, images, wishlists }) => {
    const isInWishList = wishlists && userId && hotelId ?
        wishlists.find(wishlist =>
            wishlist.userId === userId && wishlist.hotelId === hotelId
        ) : null;

    const handleAddToWishlist = async () => {
        try {
            await addToWishlist(userId, hotelId, title, location, rent, images);
            alert('Hotel added to wishlist!');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            alert('Failed to add to wishlist. Please try again.');
        }
    };

    return (
        <div>
            <button
                onClick={handleAddToWishlist}
                disabled={!!isInWishList}
                className={`px-4 py-2 rounded-full transition-all duration-200 ${isInWishList ? 'bg-gray-600 text-white cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            >
                {isInWishList ? 'Added to wishlist' : 'Add to wishlist'}
            </button>
        </div>
    );
};

export default AddToWishListButton;