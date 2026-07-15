"use client";

import { useMemo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const calcAvg = (reviews, id) => {
  const r = reviews.filter((v) => v.hotelId === id);
  return r.length ? +(r.reduce((s, v) => s + v.ratings, 0) / r.length).toFixed(1) : 0;
};

export default function TopRatedHotels({ hotels = [], reviews = [] }) {
  const swiperRef = useRef(null);

  const top = useMemo(() => {
    return [...hotels]
      .map((h) => ({ ...h, avg: calcAvg(reviews, h._id) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [hotels, reviews]);

  if (top.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-0 lg:px-0">
      <header className="text-center mb-10">
        <h2 className="font-serif text-4xl md:text-5xl text-ink mb-4">
          Top-Rated Hotels
        </h2>
        <p className="text-muted text-base sm:text-lg mt-2">
          Discover our handpicked selection of guest-favorite stays
        </p>
      </header>

      <div
        className="relative"
        onMouseEnter={() => swiperRef.current?.swiper?.autoplay?.stop()}
        onMouseLeave={() => swiperRef.current?.swiper?.autoplay?.start()}
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          ref={swiperRef}
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-16"
        >
          {top.map((hotel) => {
            const totalReviews = reviews.filter((r) => r.hotelId === hotel._id).length;

            return (
              <SwiperSlide key={hotel._id}>
                <Link href={`/details/${hotel._id}`} className="block">
                  <article className="group bg-surface rounded-xl overflow-hidden border border-hairline transition-all duration-300 hover:shadow-luxe">
                    <div className="relative h-64">
                      <Image
                        src={hotel.images?.[0] ?? "/placeholder.jpg"}
                        alt={hotel.title || "Hotel image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        priority={false}
                      />
                      <span className="absolute top-3 right-3 bg-cream/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-sm font-medium text-ink">
                        <Star className="w-4 h-4 text-brass-dark fill-current" />
                        {hotel.avg.toFixed(1)} ({totalReviews})
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-ink line-clamp-1 group-hover:text-brass-dark transition-colors">
                          {hotel.title}
                        </h3>
                        <div className="flex items-center gap-2 text-muted text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{hotel.location}</span>
                        </div>
                        <p className="text-sm text-muted line-clamp-2">{hotel.description}</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <span className="text-xl font-bold text-ink">${hotel.rent}</span>
                          <span className="text-sm text-muted ml-1">/night</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 bg-brass-dark text-cream text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-brass transition-all duration-300">
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
      </div>

      <style jsx global>{`
        .swiper-pagination {
          bottom: 4px !important;
        }
        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: #d9c6a0;
          opacity: 0.7;
          transition: all 0.3s;
        }
        .swiper-pagination-bullet-active {
          width: 12px;
          height: 12px;
          background: #8c6d3f;
          opacity: 1;
        }
      `}</style>
    </section>
  );
}
