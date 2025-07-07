'use client';

import { getAllHotels } from '@/app/action';
import Link from 'next/link'; // ✅ fixed
import React, { useEffect, useState } from 'react';

const HotelsCategory = () => {
  const [hotels, setHotels] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
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
      }
    };

    fetchHotels();
  }, []);

  const handleCategoryClick = (category) => {
    console.log('Category clicked:', category);
    // You can handle routing here later
  };

  const getCategoryIcon = (category) => {
    const icons = {
      urban: '🏙️',
      beach: '🏖️',
      mountain: '🏔️',
      rustic: '🌲',
      luxury: '✨',
      countryside: '🌄',
      lakeside: '🏞️',
    };
    return icons[category] || '🏠';
  };

  const getCategoryTitle = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getCategoryCount = (category) => {
    return hotels.filter((hotel) => hotel.category === category).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Browse by Category
        </h2>
        <p className="text-gray-600">
          Discover hotels that match your travel style
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {categories.map((category) => (
          <div // ✅ fixed from <d> to <div>
            key={category}
            onClick={() => handleCategoryClick(category)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 border border-gray-200"
          >
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">
                {getCategoryIcon(category)}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {getCategoryTitle(category)}
              </h3>
              <p className="text-sm text-gray-500">
                {getCategoryCount(category)}{' '}
                {getCategoryCount(category) === 1 ? 'hotel' : 'hotels'}
              </p>
            </div>
            <div className="bg-gray-50 px-6 py-3 rounded-b-xl">
              <div className="flex justify-center">
                <Link
                  href={`/category/${category}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Loading categories...</div>
        </div>
      )}
    </div>
  );
};

export default HotelsCategory;