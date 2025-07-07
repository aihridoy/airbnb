'use client';

import { getAllHotels } from '@/app/action';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
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
          throw new Error('No hotels found');
        }
        
        setHotels(response.hotels);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setError(error.message);
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">Loading hotels...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-lg">Error: {error}</div>
          <Link href="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
        <Navbar />
        <div className="h-screen max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-4xl mr-3">{getCategoryIcon(category)}</span>
          <h1 className="text-3xl font-bold text-gray-900">
            {getCategoryTitle(category)} Hotels
          </h1>
        </div>
        <p className="text-gray-600">
          Found {hotels.length} {hotels.length === 1 ? 'hotel' : 'hotels'} in {getCategoryTitle(category)} category
        </p>
      </div>

      {/* Hotels Grid */}
      {hotels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              {/* Hotel Image */}
              {hotel.images && hotel.images.length > 0 && (
                <Image
                  src={hotel.images[0]}
                  alt={hotel.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover rounded-t-lg"
                  style={{ objectFit: 'cover', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}
                  priority={true}
                />
              )}
              
              {/* Hotel Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hotel.name}
                </h3>
                
                {hotel.location && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {hotel.location}
                  </p>
                )}
                
                {hotel.price && (
                  <p className="text-lg font-bold text-green-600 mb-2">
                    ${hotel.price}/night
                  </p>
                )}
                
                {hotel.rating && (
                  <div className="flex items-center mb-3">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm text-gray-600 ml-1">
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
                  className="inline-block bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">
            No hotels found in {getCategoryTitle(category)} category
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Browse all categories
          </Link>
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default CategoryPage;