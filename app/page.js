import Footer from "@/components/Footer";
import HotelListing from "@/components/HotelListing";
import Navbar from "@/components/Navbar";
import Newsletter from "@/components/Newsletter";
import Offer from "@/components/Offer";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <HotelListing />
      </Suspense>
      <Offer />
      <Newsletter />
      <Footer />
    </>
  );
}
