"use client";

import { deleteWishlist } from '@/app/action';
import React from 'react';

const DeleteWishlistButton = ({ id }) => {

    const handleDeleteWishlist = async () => {
        try {
            await deleteWishlist(id);
            alert('Wishlist item deleted successfully!');
        } catch (error) {
            console.error('Failed to delete wishlist item:', error);
            alert('Failed to delete wishlist item. Please try again.');
        }
    };

    return (
        <div className="p-4 pt-0">
            <button
                onClick={handleDeleteWishlist}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition-colors duration-300"
            >
                Remove from Wishlist
            </button>
        </div>
    );
};

export default DeleteWishlistButton;