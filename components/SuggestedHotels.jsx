import { getHotels, getReviews } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Star } from "lucide-react";

const calculateAverageRating = (reviews, hotelId) => {
  const hotelReviews = reviews.filter((review) => review.hotelId === hotelId);
  if (hotelReviews.length === 0) return 0;
  const totalRating = hotelReviews.reduce((sum, review) => sum + review.ratings, 0);
  return Number((totalRating / hotelReviews.length).toFixed(1));
};

const getTopRatedHotels = (hotels, reviews, count = 5) => {
  return hotels
    .map((hotel) => ({
      ...hotel,
      averageRating: calculateAverageRating(reviews, hotel._id),
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, count);
};

const SuggestedHotels = async () => {
  const hotelsData = await getHotels();
  const reviewsData = await getReviews();
  const hotels = hotelsData?.hotels || [];
  const reviews = reviewsData?.reviews || [];
  const topRatedHotels = getTopRatedHotels(hotels, reviews, 5);

  return (
    <div className="max-w-7xl mx-auto mt-10">
      <h2 className="font-serif text-2xl text-ink mb-6">Suggested Hotels</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topRatedHotels?.map((hotel) => {
          const filteredReviews = reviews.filter((review) => review.hotelId === hotel._id);
          const totalReviews = filteredReviews.length;
          const averageRating =
            totalReviews > 0
              ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews
              : 0;
          return (
            <Link
              href={`/details/${hotel._id}`}
              key={hotel._id}
              className="bg-surface border border-hairline rounded-xl overflow-hidden hover:shadow-luxe transition-shadow duration-300"
            >
              <div className="h-48 relative">
                <Image
                  src={(hotel.images && hotel.images.length > 0 && hotel.images[0]) || "https://placehold.co/600x400"}
                  alt={hotel.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-ink">{hotel.title}</h3>
                <p className="text-sm text-muted">{hotel.location}</p>
                <div className="flex items-center gap-1 my-2">
                  <Star className="w-4 h-4 text-brass-dark fill-current" />
                  <span className="text-sm font-medium text-ink">{averageRating?.toFixed(1)}</span>
                  <span className="text-sm text-muted">({totalReviews} reviews)</span>
                </div>
                <p className="text-sm text-muted line-clamp-2">{hotel.description}</p>
                <p className="text-lg font-bold text-ink mt-4">${hotel.rent}/night</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedHotels;
