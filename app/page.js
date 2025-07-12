import AnnounceBar from "@/components/AnnounceBar";
import Footer from "@/components/Footer";
import AnimatedHeroBanner from "@/components/Hero";
import HotelListing from "@/components/HotelListing";
import HotelsCategory from "@/components/HotelsCategory";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Offer from "@/components/Offer";
import TopRatedHotels from "@/components/TopRatedHotel";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <AnnounceBar />
      <Navbar />
      <AnimatedHeroBanner />
      <Suspense fallback={<div>Loading...</div>}>
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
