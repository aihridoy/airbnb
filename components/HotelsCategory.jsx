"use client";

import Link from "next/link";
import React from "react";
import { Building2, Umbrella, Mountain, Trees, Gem, Sun, Waves, Sunrise, Palmtree, Snowflake } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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

const HotelsCategory = ({ hotels = [] }) => {
  const prefersReducedMotion = useReducedMotion();
  const categories = [...new Set(hotels.map((hotel) => hotel.category))];

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

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted">
            No categories available at the moment.
          </p>
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
    </div>
  );
};

export default HotelsCategory;
