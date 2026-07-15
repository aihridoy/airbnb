"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MapPin, Users, Star, Wifi, Car, Dumbbell, Heart } from "lucide-react";
import Link from "next/link";
import { getAllHotels, getReviews, session } from "@/app/action";
import Image from "next/image";
import AddToFavButton from "./AddToFavBtn";
import HotelCardSkeleton from "./skeletons/HotelCardSkeleton";
import { fadeUp, stagger, luxeEase } from "@/lib/motion";

const HERO_SLIDES = [
  {
    title: "Discover Perfect",
    highlight: "Getaways",
    subtitle:
      "Explore a curated range of accommodations, from luxurious beachfront villas to cozy mountain retreats, perfect for your next escape.",
  },
  {
    title: "Explore Amazing",
    highlight: "Destinations",
    subtitle:
      "Handpicked hotels and resorts in breathtaking locations, offering unique experiences and stunning views for every traveler.",
  },
  {
    title: "Elevated Luxury",
    highlight: "Redefined",
    subtitle:
      "Indulge in premium accommodations with world-class amenities, designed for unmatched comfort and sophistication.",
  },
];

const STATS = [
  { id: "hotels", label: "Available Hotels" },
  { id: "travelers", number: "50,000+", label: "Happy Travelers" },
  { id: "rating", number: "4.9", label: "Average Rating", icon: Star },
  { id: "support", number: "24/7", label: "Customer Support" },
];

const AnimatedHeroBanner = ({ wishlists }) => {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [userId, setUserId] = useState();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHotelHovering, setIsHotelHovering] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [hotelsData, reviewsData] = await Promise.all([
        getAllHotels(),
        getReviews(),
      ]);
      setHotels(hotelsData?.hotels || []);
      setReviews(reviewsData?.reviews || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load hotels");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isHotelHovering) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isHotelHovering]);

  useEffect(() => {
    if (isHotelHovering || hotels.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHotelIndex((prev) => (prev + 1) % hotels.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [hotels.length, isHotelHovering]);

  const getAmenityIcon = useCallback((amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes("wifi"))
      return <Wifi className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes("parking"))
      return <Car className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes("fitness"))
      return <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    return <Heart className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
  }, []);

  const currentHotelRating = useMemo(() => {
    if (!hotels[currentHotelIndex] || reviews.length === 0) return 0;

    const filteredReviews = reviews.filter(
      (review) => review.hotelId === hotels[currentHotelIndex]._id
    );
    const totalReviews = filteredReviews.length;
    const averageRating =
      totalReviews > 0
        ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews
        : 0;

    return averageRating;
  }, [hotels, reviews, currentHotelIndex]);

  const currentHotel = hotels[currentHotelIndex];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink px-4">
        <div className="text-cream text-center p-4">
          <p className="text-lg sm:text-xl mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-brass-dark hover:bg-brass text-cream px-4 py-2 rounded-lg text-sm sm:text-base transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink py-5 sm:py-0 md:py-0 lg:py-0">
      <div
        className="absolute inset-0 bg-gradient-to-br from-ink via-ink to-[#2a251f]"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          variants={prefersReducedMotion ? undefined : stagger}
          initial={prefersReducedMotion ? undefined : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          className="w-full max-w-7xl mx-auto py-16"
          role="main"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: luxeEase }}
                  className="space-y-4 sm:space-y-6"
                >
                  <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-cream leading-tight">
                    {HERO_SLIDES[currentSlide].title}
                    <span className="block italic text-brass-light">
                      {HERO_SLIDES[currentSlide].highlight}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-cream/70 max-w-2xl">
                    {HERO_SLIDES[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hotel Card */}
            <div className="order-1 lg:order-2">
              {isLoading ? (
                <div className="bg-cream/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream/10">
                  <HotelCardSkeleton />
                </div>
              ) : (
                currentHotel && (
                  <motion.div
                    variants={prefersReducedMotion ? undefined : fadeUp}
                    className="relative"
                    onMouseEnter={() => setIsHotelHovering(true)}
                    onMouseLeave={() => setIsHotelHovering(false)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentHotel._id}
                        initial={prefersReducedMotion ? false : { opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
                        transition={{ duration: 0.6, ease: luxeEase }}
                        className="bg-cream/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-cream/10 shadow-luxe"
                      >
                        <div className="relative mb-4">
                          <Image
                            height={256}
                            width={512}
                            src={currentHotel.images[0]}
                            alt={currentHotel.title}
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-xl sm:rounded-2xl"
                            priority
                          />

                          <AddToFavButton
                            hotelId={currentHotel._id}
                            userId={userId}
                            title={currentHotel.title}
                            location={currentHotel.location}
                            rent={currentHotel.rent}
                            images={currentHotel.images}
                            wishlists={wishlists}
                          />

                          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-ink/70 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1">
                            <span className="text-cream font-semibold text-sm sm:text-base">
                              ${currentHotel.rent}/night
                            </span>
                          </div>
                        </div>

                        <h3 className="font-serif text-lg sm:text-xl lg:text-2xl text-cream mb-2 line-clamp-1">
                          {currentHotel.title}
                        </h3>
                        <p className="text-cream/60 mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <MapPin
                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1">{currentHotel.location}</span>
                        </p>

                        <div className="flex items-center gap-2 sm:gap-4 mb-4 text-cream/60 text-xs sm:text-sm">
                          <span className="flex items-center gap-1">
                            <Users
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              aria-hidden="true"
                            />
                            {currentHotel.guestCapacity} guests
                          </span>
                          <span className="hidden sm:inline">
                            {currentHotel.bedroomCapacity} bedrooms
                          </span>
                          <span className="sm:hidden">
                            {currentHotel.bedroomCapacity} bed
                          </span>
                          <span className="hidden sm:inline">
                            {currentHotel.bedCapacity} beds
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                          {currentHotel.amenities
                            .slice(0, 3)
                            .map((amenity, index) => (
                              <div
                                key={`${currentHotel._id}-amenity-${index}`}
                                className="flex items-center gap-1 bg-cream/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-cream/70"
                              >
                                {getAmenityIcon(amenity)}
                                <span className="truncate max-w-20 sm:max-w-none">
                                  {amenity}
                                </span>
                              </div>
                            ))}
                          {currentHotel.amenities.length > 3 && (
                            <div className="flex items-center bg-cream/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-cream/70">
                              +{currentHotel.amenities.length - 3} more
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm sm:text-base">
                            <div className="flex items-center gap-1">
                              <Star
                                className="w-3 h-3 sm:w-4 sm:h-4 text-brass-light fill-current"
                                aria-hidden="true"
                              />
                              <span className="text-cream font-semibold">
                                {currentHotelRating > 0
                                  ? currentHotelRating.toFixed(1)
                                  : "No rating"}
                              </span>
                            </div>
                            <span className="text-cream/40 hidden sm:inline">·</span>
                            <span className="text-cream/60 text-xs sm:text-sm truncate max-w-24 sm:max-w-none">
                              <span className="hidden sm:inline">Host: </span>
                              {currentHotel.hostName}
                            </span>
                          </div>
                          <Link
                            href={`/details/${currentHotel._id}`}
                            className="bg-brass-dark hover:bg-brass rounded-lg px-3 sm:px-4 py-2 text-cream font-semibold transition-colors text-xs sm:text-sm"
                            aria-label={`View details for ${currentHotel.title}`}
                          >
                            View Details
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>
                )
              )}
            </div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={prefersReducedMotion ? undefined : fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12"
            role="region"
            aria-label="Statistics"
          >
            {STATS.map((stat) => (
              <div
                key={stat.id}
                className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-cream/5 border border-cream/10"
              >
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-cream mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
                  {stat.id === "hotels"
                    ? hotels.length.toLocaleString() || "0"
                    : stat.number}
                  {stat.icon && (
                    <stat.icon
                      className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-brass-light"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className="text-cream/60 text-xs sm:text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

AnimatedHeroBanner.propTypes = {
  wishlists: PropTypes.array,
  userId: PropTypes.string,
  hotels: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
      rent: PropTypes.number.isRequired,
      guestCapacity: PropTypes.number.isRequired,
      bedroomCapacity: PropTypes.number.isRequired,
      bedCapacity: PropTypes.number.isRequired,
      amenities: PropTypes.arrayOf(PropTypes.string).isRequired,
      hostName: PropTypes.string.isRequired,
    })
  ),
};

export default React.memo(AnimatedHeroBanner);
