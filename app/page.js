import AnnounceBar from "@/components/AnnounceBar";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HotelListing from "@/components/HotelListing";
import HotelsCategory from "@/components/HotelsCategory";
import HowItWorks from "@/components/HowItWorks";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Offer from "@/components/Offer";
import PopularDestinations from "@/components/PopularDestinations";
import RecentlyViewed from "@/components/RecentlyViewed";
import Testimonials from "@/components/Testimonials";
import TopRatedHotels from "@/components/TopRatedHotel";
import WhyBookWithUs from "@/components/WhyBookWithUs";
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
      <PopularDestinations />
      <RecentlyViewed />
      <TopRatedHotels />
      <Testimonials />
      <WhyBookWithUs />
      <HowItWorks />
      <Offer />
      <FAQ />
      <Newsletter />
      <Footer />
    </>
  );
}
