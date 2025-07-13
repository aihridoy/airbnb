'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHotel, FaPercent, FaGift, FaStar, FaMapMarkerAlt, FaBell, FaTimes } from 'react-icons/fa';

const AnnounceBar = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dynamic announcements with icons and colors
  const announcements = [
    {
      id: 1,
      text: "🎉 Limited Time: 25% OFF on all luxury hotels! Book now and save big!",
      shortText: "🎉 25% OFF luxury hotels!",
      icon: <FaPercent className="text-yellow-400" />,
      bgGradient: "from-purple-600 to-pink-600",
      textColor: "text-white",
      action: "Book Now",
      shortAction: "Book",
      urgent: true
    },
    {
      id: 2,
      text: "🏨 New hotels added in Miami, Tokyo, and Paris! Explore now!",
      shortText: "🏨 New hotels in Miami, Tokyo & Paris!",
      icon: <FaHotel className="text-blue-400" />,
      bgGradient: "from-blue-600 to-cyan-600",
      textColor: "text-white",
      action: "Explore",
      shortAction: "View",
      urgent: false
    },
    {
      id: 3,
      text: "⭐ Join our loyalty program and get exclusive member rates!",
      shortText: "⭐ Join loyalty program for exclusive rates!",
      icon: <FaStar className="text-yellow-400" />,
      bgGradient: "from-amber-600 to-orange-600",
      textColor: "text-white",
      action: "Join Now",
      shortAction: "Join",
      urgent: false
    },
    {
      id: 4,
      text: "🎁 Free breakfast included with weekend bookings this month!",
      shortText: "🎁 Free breakfast with weekend bookings!",
      icon: <FaGift className="text-green-400" />,
      bgGradient: "from-green-600 to-emerald-600",
      textColor: "text-white",
      action: "View Deals",
      shortAction: "Deals",
      urgent: false
    },
    {
      id: 5,
      text: "📍 Last-minute deals available in your area! Check them out!",
      shortText: "📍 Last-minute deals in your area!",
      icon: <FaMapMarkerAlt className="text-red-400" />,
      bgGradient: "from-red-600 to-rose-600",
      textColor: "text-white",
      action: "View Local",
      shortAction: "Local",
      urgent: true
    }
  ];

  // Auto-rotate announcements
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, isMobile ? 5000 : 4000); // Slower rotation on mobile

    return () => clearInterval(interval);
  }, [announcements.length, isVisible, isMobile]);

  const currentAnnouncement = announcements[currentIndex];

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden bg-gradient-to-r ${currentAnnouncement.bgGradient} shadow-lg`}
    >
      {/* Animated background pattern - reduced opacity on mobile */}
      <div className={`absolute inset-0 ${isMobile ? 'opacity-5' : 'opacity-10'}`}>
        <div className="absolute inset-0 bg-repeat bg-center" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Moving sparkles animation - fewer on mobile */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isMobile ? 2 : 3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-60"
            animate={{
              x: [-10, typeof window !== 'undefined' ? window.innerWidth + 10 : 1200],
              y: [Math.random() * 60, Math.random() * 60],
              scale: [0, 1, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 px-2 sm:px-4 py-2 sm:py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              {/* Notification bell with pulse - smaller on mobile */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex-shrink-0"
              >
                <FaBell className={`text-white ${isMobile ? 'text-sm' : 'text-lg'}`} />
              </motion.div>

              {/* Announcement content with fade animation */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentAnnouncement.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0"
                >
                  {/* Icon - hidden on very small screens */}
                  <div className="flex-shrink-0 hidden xs:block">
                    {React.cloneElement(currentAnnouncement.icon, {
                      className: `${currentAnnouncement.icon.props.className} ${isMobile ? 'text-sm' : ''}`
                    })}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`${isMobile ? 'text-xs' : 'text-sm md:text-base'} font-medium ${currentAnnouncement.textColor} leading-tight truncate sm:whitespace-normal`}>
                      {isMobile ? currentAnnouncement.shortText : currentAnnouncement.text}
                    </p>
                  </div>
                  
                  {/* Urgent badge - smaller on mobile */}
                  {currentAnnouncement.urgent && (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex-shrink-0"
                    >
                      <span className={`bg-red-500 text-white font-bold rounded-full ${
                        isMobile ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
                      }`}>
                        {isMobile ? '!' : 'URGENT'}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action button and close button */}
            <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`bg-white bg-opacity-20 hover:bg-opacity-30 text-black hover:text-white rounded-full font-medium transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20 ${
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm px-4 py-1.5'
                }`}
              >
                {isMobile ? currentAnnouncement.shortAction : currentAnnouncement.action}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className={`text-white hover:text-gray-200 transition-colors duration-200 ${
                  isMobile ? 'p-0.5' : 'p-1'
                }`}
                aria-label="Close announcement"
              >
                <FaTimes className={isMobile ? 'text-xs' : 'text-sm'} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-0.5 sm:h-1 bg-black bg-opacity-20">
        <motion.div
          className="h-full bg-white bg-opacity-60"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: isMobile ? 5 : 4, ease: "linear" }}
          key={currentAnnouncement.id}
        />
      </div>

      {/* Dots indicator - smaller on mobile and positioned better */}
      <div className={`absolute ${isMobile ? 'bottom-1 right-12' : 'bottom-2 left-1/2 transform -translate-x-1/2'} flex space-x-1`}>
        {announcements.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default AnnounceBar;