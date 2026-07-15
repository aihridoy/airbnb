"use client";

import { getAllHotels } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Skeleton from "./skeletons/Skeleton";
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

const HotelsCategory = () => {
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const response = await getAllHotels();
        if (!response || !response.hotels) {
          throw new Error("No hotels found");
        }
        setHotels(response.hotels);

        const uniqueCategories = [
          ...new Set(response.hotels.map((hotel) => hotel.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const getCategoryIcon = (category) => {
    const Icon = CATEGORY_ICONS[category] || Building2;
    return <Icon className="w-8 h-8 text-brass-dark" aria-hidden="true" />;
  };

  const getCategoryTitle = (category) =>
    category.charAt(0).toUpperCase() + category.slice(1);

  const getCategoryCount = (category) =>
    hotels.filter((hotel) => hotel.category === category).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0 py-12">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Explore by Category
        </h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Find the perfect hotel that suits your travel preferences and style
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl border border-hairline overflow-hidden"
            >
              <div className="p-6 text-center">
                <Skeleton className="h-10 w-10 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-3/4 mx-auto mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded" />
              </div>
              <div className="bg-surface-alt px-6 py-3">
                <Skeleton className="h-4 w-1/3 mx-auto rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={prefersReducedMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {categories.map((category) => (
            <motion.div
              key={category}
              variants={fadeUp}
              className="bg-surface rounded-xl border border-hairline hover:shadow-luxe transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="text-xl font-semibold text-ink mb-2">
                  {getCategoryTitle(category)}
                </h3>
                <p className="text-sm text-muted">
                  {getCategoryCount(category)}{" "}
                  {getCategoryCount(category) === 1 ? "hotel" : "hotels"}
                </p>
              </div>
              <div className="bg-surface-alt px-6 py-3">
                <Link
                  href={`/category/${category}`}
                  className="text-sm font-medium text-brass-dark hover:text-ink transition-colors duration-200"
                >
                  Explore →
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted">
            No categories available at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotelsCategory;
