'use client';

import { getAllHotels } from '@/app/action';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaCity, FaUmbrellaBeach, FaMountain, FaTree, FaGem, FaSun, FaWater } from 'react-icons/fa';
import { motion } from 'framer-motion';

const HotelsCategory = () => {
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true);
        const response = await getAllHotels();
        if (!response || !response.hotels) {
          throw new Error('No hotels found');
        }
        setHotels(response.hotels);

        const uniqueCategories = [
          ...new Set(response.hotels.map((hotel) => hotel.category)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching hotels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const getCategoryIcon = (category) => {
    const icons = {
      urban: <FaCity className="text-4xl text-blue-500" />,
      beach: <FaUmbrellaBeach className="text-4xl text-yellow-500" />,
      mountain: <FaMountain className="text-4xl text-green-500" />,
      rustic: <FaTree className="text-4xl text-brown-500" />,
      luxury: <FaGem className="text-4xl text-purple-500" />,
      countryside: <FaSun className="text-4xl text-orange-500" />,
      lakeside: <FaWater className="text-4xl text-teal-500" />,
    };
    return icons[category] || <FaCity className="text-4xl text-gray-500" />;
  };

  const getCategoryTitle = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryCount = (category) => {
    return hotels.filter((hotel) => hotel.category === category).length;
  };

  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 animate-pulse">
      <div className="p-6 text-center">
        <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </div>
      <div className="bg-gray-50 px-6 py-3 rounded-b-xl">
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Explore by Category
        </h2>
       <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find the perfect hotel that suits your travel preferences and style
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(5)].map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden"
            >
              <div className="p-6 text-center">
                <div className="mb-4 flex justify-center">{getCategoryIcon(category)}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {getCategoryTitle(category)}
                </h3>
                <p className="text-sm text-gray-500">
                  {getCategoryCount(category)}{' '}
                  {getCategoryCount(category) === 1 ? 'hotel' : 'hotels'}
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-b-xl">
                <Link
                  href={`/category/${category}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  Explore →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <p className="text-lg text-gray-500">No categories available at the moment.</p>
        </motion.div>
      )}
    </div>
  );
};

export default HotelsCategory;