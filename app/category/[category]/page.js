/* eslint-disable react/no-unescaped-entities */
"use client";

import { getAllHotels, getReviews } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Building2,
  Umbrella,
  Mountain,
  Trees,
  Gem,
  Sun,
  Waves,
  Sunrise,
  Palmtree,
  Snowflake,
  AlertTriangle,
  ArrowLeft,
  Search,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hotel from "@/components/Hotel";
import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import { fadeUp } from "@/lib/motion";

const CATEGORY_ICONS = {
  urban: Building2,
  beach: Umbrella,
  mountain: Mountain,
  rustic: Trees,
  luxury: Gem,
  countryside: Sun,
  lakeside: Waves,
  desert: Sunrise,
  island: Palmtree,
  ski: Snowflake,
};

const CategoryPage = () => {
  const params = useParams();
  const category = params.category;
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchHotelsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const [hotelsResponse, reviewsResponse] = await Promise.all([
          getAllHotels(category),
          getReviews(),
        ]);
        setHotels(hotelsResponse?.hotels || []);
        setReviews(reviewsResponse?.reviews || []);
      } catch (error) {
        console.error("Error fetching hotels:", error);
        setError(error.message);
        setHotels([]);
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchHotelsByCategory();
    }
  }, [category]);

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Building2;
    return <Icon className="w-8 h-8 text-brass-dark" aria-hidden="true" />;
  };

  const getCategoryTitle = (category) =>
    category ? category.charAt(0).toUpperCase() + category.slice(1) : "";

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">Something went wrong</h2>
            <p className="text-lg text-red-600 mb-4">Error: {error}</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go back to home
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="mb-10">
          <div className="flex items-center mb-4 gap-3">
            {getCategoryIcon(category)}
            <h1 className="font-serif text-4xl text-ink">
              {getCategoryTitle(category)} Hotels
            </h1>
          </div>
          {!loading && (
            <p className="text-lg text-muted">
              Found {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} in{" "}
              {getCategoryTitle(category)} category
            </p>
          )}
        </div>

        {loading ? (
          <HotelGridSkeleton count={8} />
        ) : hotels.length > 0 ? (
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {hotels.map((hotel) => {
              const filteredReviews = reviews.filter(
                (review) => review.hotelId === hotel._id
              );
              const totalReviews = filteredReviews.length;
              const averageRating =
                totalReviews > 0
                  ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) /
                    totalReviews
                  : 0;
              return (
                <motion.div key={hotel._id} variants={fadeUp}>
                  <Hotel hotel={hotel} averageRating={averageRating} />
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-surface-alt rounded-full flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-muted" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">No Hotels Found</h2>
            <p className="text-lg text-muted mb-6">
              We couldn't find any hotels in the {getCategoryTitle(category)} category
              at the moment.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Categories
            </Link>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
