'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Star, Heart, Wifi, Car, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { getAllHotels } from '@/app/action';
import Image from 'next/image';

const HERO_SLIDES = [
  {
    title: "Discover Perfect",
    highlight: "Getaway",
    subtitle:
      "Explore a wide range of accommodations, from luxurious beachfront villas to cozy mountain retreats, perfect for your next vacation or weekend escape.",
    bgGradient: "from-blue-600 via-purple-600 to-pink-600",
    glowColor: "shadow-blue-500/50",
  },
  {
    title: "Explore Amazing",
    highlight: "Destinations",
    subtitle:
      "Discover handpicked hotels and resorts located in breathtaking destinations, offering unique experiences and stunning views for every traveler.",
    bgGradient: "from-emerald-600 via-teal-600 to-cyan-600",
    glowColor: "shadow-emerald-500/50",
  },
  {
    title: "Elevated Luxury",
    highlight: "Redefined",
    subtitle:
      "Indulge in premium accommodations with world-class amenities, designed to provide unmatched comfort and sophistication for your dream getaway.",
    bgGradient: "from-orange-600 via-red-600 to-pink-600",
    glowColor: "shadow-orange-500/50",
  },
];

const STATS = [
  { id: 'hotels', label: "Available Hotels" },
  { id: 'travelers', number: "50,000+", label: "Happy Travelers" },
  { id: 'rating', number: "4.9", label: "Average Rating", icon: Star },
  { id: 'support', number: "24/7", label: "Customer Support" }
];

const AnimatedHeroBanner = () => {
  const [hotels, setHotels] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHotelHovering, setIsHotelHovering] = useState(false);

  const fetchHotels = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllHotels();
      setHotels(data?.hotels || []);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setError("Failed to load hotels");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

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

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  }), []);

  const floatingVariants = useMemo(() => ({
    initial: { y: 0, rotate: 0 },
    animate: {
      y: [-10, 10, -10],
      rotate: [-2, 2, -2],
      transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
    }
  }), []);

  const glowVariants = useMemo(() => ({
    initial: { scale: 0.8, opacity: 0.3 },
    animate: {
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.6, 0.3],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  }), []);

  const getAmenityIcon = useCallback((amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes('parking')) return <Car className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    if (amenityLower.includes('fitness')) return <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
    return <Heart className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />;
  }, []);

  const currentHotel = hotels[currentHotelIndex];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
        <div className="text-white text-center p-4">
          <p className="text-lg sm:text-xl mb-4">{error}</p>
          <button
            onClick={fetchHotels}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-5 sm:py-0 md:py-0 lg:py-0">
      <div className="absolute inset-0 bg-black/40 z-[1]" aria-hidden="true" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[currentSlide].bgGradient} opacity-15`}
          aria-hidden="true"
        />
      </AnimatePresence>

      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`float-${i}`}
            variants={floatingVariants}
            initial="initial"
            animate="animate"
            className={`absolute w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-5 blur-3xl`}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className={`absolute top-1/4 left-1/4 w-48 h-48 sm:w-64 sm:h-64 lg:w-96 lg:h-96 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-10 blur-3xl`}
        aria-hidden="true"
      />
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className={`absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-56 sm:h-56 lg:w-80 lg:h-80 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-8 blur-2xl`}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto"
          role="main"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                    {HERO_SLIDES[currentSlide].title}
                    <span className={`block bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} bg-clip-text text-transparent drop-shadow-none`}>
                      {HERO_SLIDES[currentSlide].highlight}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl drop-shadow-md">
                    {HERO_SLIDES[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Hotel Card */}
            <div className="order-1 lg:order-2">
              {isLoading ? (
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl">
                  <div className="animate-pulse">
                    <div className="w-full h-48 sm:h-56 lg:h-64 bg-gray-700 rounded-xl sm:rounded-2xl mb-4"></div>
                    <div className="h-6 sm:h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                    <div className="flex gap-2 sm:gap-4 mb-4">
                      <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/4"></div>
                      <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ) : currentHotel && (
                <motion.div
                  variants={itemVariants}
                  className="relative"
                  onMouseEnter={() => setIsHotelHovering(true)}
                  onMouseLeave={() => setIsHotelHovering(false)}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentHotel._id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.8 }}
                      className="bg-white/10 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/20 shadow-2xl"
                    >
                      <div className="relative mb-4">
                        <Image
                          height={256}
                          width={512}
                          src={currentHotel.images[0]}
                          alt={currentHotel.title}
                          className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-xl sm:rounded-2xl"
                          priority
                        />
                        <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/50 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1">
                          <span className="text-white font-semibold text-sm sm:text-base">${currentHotel.rent}/night</span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-1">{currentHotel.title}</h3>
                      <p className="text-gray-300 mb-3 flex items-center gap-2 text-sm sm:text-base">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" aria-hidden="true" />
                        <span className="line-clamp-1">{currentHotel.location}</span>
                      </p>
                      
                      <div className="flex items-center gap-2 sm:gap-4 mb-4 text-gray-300 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                          {currentHotel.guestCapacity} guests
                        </span>
                        <span className="hidden sm:inline">{currentHotel.bedroomCapacity} bedrooms</span>
                        <span className="sm:hidden">{currentHotel.bedroomCapacity} bed</span>
                        <span className="hidden sm:inline">{currentHotel.bedCapacity} beds</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 mb-4">
                        {currentHotel.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={`${currentHotel._id}-amenity-${index}`} className="flex items-center gap-1 bg-white/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-300">
                            {getAmenityIcon(amenity)}
                            <span className="truncate max-w-20 sm:max-w-none">{amenity}</span>
                          </div>
                        ))}
                        {currentHotel.amenities.length > 3 && (
                          <div className="flex items-center bg-white/10 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-300">
                            +{currentHotel.amenities.length - 3} more
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm sm:text-base">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" aria-hidden="true" />
                            <span className="text-white font-semibold">4.9</span>
                          </div>
                          <span className="text-gray-400 hidden sm:inline">·</span>
                          <span className="text-gray-300 text-xs sm:text-sm truncate max-w-24 sm:max-w-none">
                            <span className="hidden sm:inline">Host: </span>{currentHotel.hostName}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 sm:px-4 py-2 text-white font-semibold transition-all duration-200 text-xs sm:text-sm"
                          aria-label={`View details for ${currentHotel.title}`}
                        >
                          <Link href={`/details/${currentHotel._id}`}>
                            View Details
                          </Link>
                        </motion.button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 max-w-4xl mx-auto mt-8 sm:mt-12"
            role="region"
            aria-label="Statistics"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ scale: 1.05 }}
                className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20"
              >
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 sm:mb-2 flex items-center justify-center gap-1 sm:gap-2">
                  {stat.id === 'hotels' ? (hotels.length.toLocaleString() || '0') : stat.number}
                  {stat.icon && <stat.icon className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-400" aria-hidden="true" />}
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 sm:w-6 sm:h-10 border-2 border-white/60 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 sm:h-3 bg-white/80 rounded-full mt-1 sm:mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

AnimatedHeroBanner.propTypes = {
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
      hostName: PropTypes.string.isRequired
    })
  )
};

export default React.memo(AnimatedHeroBanner);