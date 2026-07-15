"use client";

import { deleteWishlist } from "@/app/action";
import React from "react";

const DeleteWishlistButton = ({ id }) => {
  const handleDeleteWishlist = async () => {
    try {
      await deleteWishlist(id);
      alert("Wishlist item deleted successfully!");
    } catch (error) {
      console.error("Failed to delete wishlist item:", error);
      alert("Failed to delete wishlist item. Please try again.");
    }
  };

  return (
    <div className="p-4 pt-0">
      <button
        onClick={handleDeleteWishlist}
        className="w-full bg-brass-dark hover:bg-brass text-cream font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass transition-colors duration-300"
      >
        Remove from Wishlist
      </button>
    </div>
  );
};

export default DeleteWishlistButton;
