"use client";
import React, { useEffect, useState } from "react";
import ReviewModal from "./ReviewModal";
import { session } from "@/app/action";
import { Star } from "lucide-react";

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
        console.error("Failed to fetch user session:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="font-serif text-2xl text-ink">Reviews</h2>
          <div className="flex items-center">
            <Star className="w-5 h-5 text-brass-dark fill-current mr-2" />
            <span className="text-xl font-semibold text-ink">{averageRating.toFixed(1)}</span>
            <span className="mx-2 text-muted">·</span>
            <span className="text-muted">{totalReviews} reviews</span>
          </div>
        </div>
        {!isOwner && userId && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 border border-hairline rounded-lg text-ink hover:bg-surface-alt transition-colors"
          >
            Write a Review
          </button>
        )}
      </div>
      {showModal && <ReviewModal setShowModal={setShowModal} hotelId={hotelId} />}
    </>
  );
};

export default ProvidePreview;