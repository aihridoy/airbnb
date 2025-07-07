"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, MapPin } from 'lucide-react';
import { getHotels, getReviews } from '@/app/action';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const calcAvg = (reviews, id) => {
  const r = reviews.filter((v) => v.hotelId === id);
  return r.length ? +(r.reduce((s, v) => s + v.ratings, 0) / r.length).toFixed(1) : 0;
};

export default function SuggestedHotels() {
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [h, r] = await Promise.all([getHotels(), getReviews()]);
        setHotels(h?.hotels ?? []);
        setReviews(r?.reviews ?? []);
      } catch (e) {
        console.error('Fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const top = useMemo(() => {
    return [...hotels]
      .map((h) => ({ ...h, avg: calcAvg(reviews, h._id) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [hotels, reviews]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-8 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded-lg mb-8 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl overflow-hidden">
              <div className="h-64 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-6 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="flex justify-between">
                  <div className="h-6 w-1/4 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0">
      <header className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Top-Rated Hotels
        </h2>
        <p className="text-slate-500 text-base sm:text-lg mt-2">
          Discover our handpicked selection of guest-favorite stays
        </p>
      </header>

      <div
        className="relative"
        onMouseEnter={() => swiperRef.current?.swiper?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.swiper?.autoplay?.start()}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          ref={swiperRef}
          navigation={{
            nextEl: '.next-btn',
            prevEl: '.prev-btn',
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-12"
        >
          {top.map((hotel) => {
            const totalReviews = reviews.filter((r) => r.hotelId === hotel._id).length;

            return (
              <SwiperSlide key={hotel._id}>
                <Link href={`/details/${hotel._id}`} className="block">
                  <article className="group bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
                    {/* Image */}
                    <div className="relative h-64">
                      <Image
                        src={hotel.images?.[0] ?? '/placeholder.jpg'}
                        alt={hotel.title || 'Hotel image'}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={false}
                      />
                      {/* Rating badge */}
                      <span className="absolute top-3 right-3 bg-white/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-slate-800">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        {hotel.avg.toFixed(1)} ({totalReviews})
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                          {hotel.title}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.location}</span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{hotel.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-xl font-bold text-slate-900">${hotel.rent}</span>
                          <span className="text-sm text-slate-500 ml-1">/night</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 bg-teal-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-teal-700 transition-all duration-300">
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Custom Navigation */}
        <button
          aria-label="Previous slide"
          className="prev-btn absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-teal-600 hover:text-white transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          aria-label="Next slide"
          className="next-btn absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-teal-600 hover:text-white transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Custom bullet styles */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d4e4e3;
          opacity: 0.7;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          width: 12px;
          height: 12px;
          background: #009688; /* Tailwind teal-600 */
          opacity: 1;
        }
      `}</style>
    </section>
  );
}