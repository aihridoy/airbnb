"use client";

import { addToWishlist } from '@/app/action';
import { Heart } from 'lucide-react';
import React from 'react';

const AddToFavButton = ({ hotelId, userId, title, location, rent, images, wishlists }) => {
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
                className={`absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30`}
                aria-label="Add to favorites"
            >
                <Heart 
                    className={`w-5 h-5 transition-all duration-200 ${
                        isInWishList 
                            ? 'text-red-500 fill-red-500' 
                            : 'text-white hover:text-red-300'
                    }`}
                />
            </button>
        </div>
    );
};

export default AddToFavButton;