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
    if (amenityLower.includes('wifi')) return <Wifi className="w-4 h-4" aria-hidden="true" />;
    if (amenityLower.includes('parking')) return <Car className="w-4 h-4" aria-hidden="true" />;
    if (amenityLower.includes('fitness')) return <Dumbbell className="w-4 h-4" aria-hidden="true" />;
    return <Heart className="w-4 h-4" aria-hidden="true" />;
  }, []);

  const currentHotel = hotels[currentHotelIndex];

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-center p-4">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={fetchHotels}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
            className={`absolute w-64 h-64 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-5 blur-3xl`}
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-10 blur-3xl`}
        aria-hidden="true"
      />
      <motion.div
        variants={glowVariants}
        initial="initial"
        animate="animate"
        className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} opacity-8 blur-2xl`}
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-4 h-screen flex items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto"
          role="main"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-lg">
                    {HERO_SLIDES[currentSlide].title}
                    <span className={`block bg-gradient-to-r ${HERO_SLIDES[currentSlide].bgGradient} bg-clip-text text-transparent drop-shadow-none`}>
                      {HERO_SLIDES[currentSlide].highlight}
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-200 max-w-2xl drop-shadow-md">
                    {HERO_SLIDES[currentSlide].subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {isLoading ? (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
                <div className="animate-pulse">
                  <div className="w-full h-64 bg-gray-700 rounded-2xl mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="flex gap-4 mb-4">
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
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
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl"
                  >
                    <div className="relative mb-4">
                      <Image
                        height={256}
                        width={512}
                        src={currentHotel.images[0]}
                        alt={currentHotel.title}
                        className="w-full h-64 object-cover rounded-2xl"
                        priority
                      />
                      <button
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30"
                        aria-label="Add to favorites"
                      >
                        <Heart className="w-5 h-5 text-white" />
                      </button>
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
                        <span className="text-white font-semibold">${currentHotel.rent}/night</span>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">{currentHotel.title}</h3>
                    <p className="text-gray-300 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" aria-hidden="true" />
                      <span>{currentHotel.location}</span>
                    </p>
                    
                    <div className="flex items-center gap-4 mb-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        {currentHotel.guestCapacity} guests
                      </span>
                      <span>{currentHotel.bedroomCapacity} bedrooms</span>
                      <span>{currentHotel.bedCapacity} beds</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {currentHotel.amenities.slice(0, 4).map((amenity, index) => (
                        <div key={`${currentHotel._id}-amenity-${index}`} className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm text-gray-300">
                          {getAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" aria-hidden="true" />
                          <span className="text-white font-semibold">4.9</span>
                        </div>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-300">Host: {currentHotel.hostName}</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-4 py-2 text-white font-semibold transition-all duration-200"
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

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
            role="region"
            aria-label="Statistics"
          >
            {STATS.map((stat) => (
              <motion.div
                key={stat.id}
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/20"
              >
                <div className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  {stat.id === 'hotels' ? (hotels.length.toLocaleString() || '0') : stat.number}
                  {stat.icon && <stat.icon className="w-5 h-5 text-yellow-400" aria-hidden="true" />}
                </div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* {hotels.length > 0 && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20" role="tablist" aria-label="Hotel carousel">
          {hotels.map((hotel, index) => (
            <button
              key={hotel._id}
              onClick={() => setCurrentHotelIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                currentHotelIndex === index 
                  ? 'bg-white shadow-lg' 
                  : 'bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Select hotel ${index + 1}`}
            />
          ))}
        </div>
      )} */}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white/80 rounded-full mt-2"
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