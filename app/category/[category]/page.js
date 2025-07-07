/* eslint-disable react/no-unescaped-entities */
'use client';

import { getAllHotels } from '@/app/action';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { FaCity, FaUmbrellaBeach, FaMountain, FaTree, FaGem, FaSun, FaWater, FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CategoryPage = () => {
  const params = useParams();
  const category = params.category;
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotelsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getAllHotels(category);
        if (!response || !response.hotels) {
          // Don't throw error for empty results, just set empty array
          setHotels([]);
        } else {
          setHotels(response.hotels);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
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
    return category ? category.charAt(0).toUpperCase() + category.slice(1) : '';
  };

  const BeautifulLoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 border-solid rounded-full animate-spin"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-solid rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
      </div>
      <div className="mt-6 text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Hotels...</h3>
        <p className="text-sm text-gray-500">Please wait while we fetch the best {getCategoryTitle(category)} hotels for you</p>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow"
        >
          <div className="text-center py-12">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
              <p className="text-lg text-red-600 mb-4">Error: {error}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go back to home
            </Link>
          </div>
        </motion.div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow"
      >
        <div className="mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center mb-4"
          >
            <span className="mr-3">{getCategoryIcon(category)}</span>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {getCategoryTitle(category)} Hotels
            </h1>
          </motion.div>
          {!loading && (
            <p className="text-lg text-gray-600">
              Found {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} in {getCategoryTitle(category)} category
            </p>
          )}
        </div>

        {loading ? (
          <BeautifulLoadingSpinner />
        ) : hotels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {hotels.map((hotel) => (
              <motion.div
                key={hotel._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {hotel.images && hotel.images.length > 0 ? (
                  <div className="relative w-full h-48">
                    <Image
                      src={hotel.images[0]}
                      alt={hotel.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover rounded-t-lg"
                      priority={true}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                    {hotel.name}
                  </h3>
                  {hotel.location && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-1" />
                      {hotel.location}
                    </p>
                  )}
                  {hotel.price && (
                    <p className="text-lg font-bold text-green-600 mb-2">
                      ${hotel.price}/night
                    </p>
                  )}
                  {hotel.rating && (
                    <div className="flex items-center mb-3">
                      <FaStar className="text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {hotel.rating} ({hotel.reviews ? hotel.reviews.length : 0} reviews)
                      </span>
                    </div>
                  )}
                  {hotel.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {hotel.description}
                    </p>
                  )}
                  <Link
                    href={`/details/${hotel._id}`}
                    className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Hotels Found
            </h2>
            <p className="text-lg text-gray-500 mb-6">
              We couldn't find any hotels in the {getCategoryTitle(category)} category at the moment.
            </p>
            <div className="space-y-3">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z" />
                </svg>
                Browse All Categories
              </Link>
              <p className="text-sm text-gray-400">
                or try searching for hotels in other categories
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
      <Footer />
    </div>
  );
};

export default CategoryPage;