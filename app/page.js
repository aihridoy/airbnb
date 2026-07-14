import AnnounceBar from "@/components/AnnounceBar";
import Footer from "@/components/Footer";
import AnimatedHeroBanner from "@/components/Hero";
import HeroSection from "@/components/HeroSection";
import HotelListing from "@/components/HotelListing";
import HotelsCategory from "@/components/HotelsCategory";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Offer from "@/components/Offer";
import TopRatedHotels from "@/components/TopRatedHotel";
import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <AnnounceBar />
      <Navbar />
      <HeroSection />
      <Suspense
        fallback={
          <div className="max-w-7xl mx-auto px-6 mt-10">
            <HotelGridSkeleton count={8} />
          </div>
        }
      >
        <HotelListing />
      </Suspense>
      <HotelsCategory />
      <TopRatedHotels />
      <Offer />
      <Newsletter />
      <Footer />
    </>
  );
}
