import Footer from "@/components/Footer";
import HotelListing from "@/components/HotelListing";
import Navbar from "@/components/Navbar";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <HotelListing />
      </Suspense>
      <Footer />
    </>
  );
}
