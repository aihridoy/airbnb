"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Percent, Hotel, Star, Gift, Clock, X } from "lucide-react";

const ANNOUNCEMENTS = [
  { id: 1, icon: Percent, text: "Limited-time offer — 20% off select luxury stays this month.", action: "Book now" },
  { id: 2, icon: Hotel, text: "New arrivals in Kyoto, Lisbon, and Cape Town.", action: "Explore" },
  { id: 3, icon: Star, text: "Members save more — join our loyalty program.", action: "Join" },
  { id: 4, icon: Gift, text: "Complimentary breakfast on weekend bookings.", action: "View offer" },
  { id: 5, icon: Clock, text: "Last-minute stays near you, updated daily.", action: "View deals" },
];

const ROTATE_MS = 5000;

const AnnounceBar = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];
  const Icon = current.icon;

  return (
    <div data-announcebar className="relative bg-ink text-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-20 py-2.5 flex items-center justify-between gap-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 min-w-0"
          >
            <Icon className="w-4 h-4 text-brass-light shrink-0" />
            <p className="text-sm truncate">{current.text}</p>
            <span className="hidden sm:inline text-sm text-brass-light font-medium whitespace-nowrap">
              {current.action}
            </span>
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleClose}
          aria-label="Dismiss announcement"
          className="shrink-0 text-cream/60 hover:text-cream transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!prefersReducedMotion && (
        <motion.div
          key={current.id}
          className="absolute bottom-0 left-0 h-0.5 bg-brass-dark"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: ROTATE_MS / 1000, ease: "linear" }}
        />
      )}
    </div>
  );
};

export default AnnounceBar;
