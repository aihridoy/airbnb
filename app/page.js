import AnnounceBar from "@/components/AnnounceBar";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
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
import { getAllHotels, getHotels, getReviews } from "@/app/action";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=2000&q=80";

const pickHeroImage = (hotels) => {
  const withImages = hotels.filter((h) => h.images?.[0]);
  const luxury = withImages.filter((h) => h.category === "luxury");
  const pool = luxury.length ? luxury : withImages;
  if (!pool.length) return HERO_FALLBACK;
  return pool[Math.floor(Math.random() * pool.length)].images[0];
};

const topDestinations = (hotels) => {
  const counts = new Map();
  for (const h of hotels) {
    if (!h.location) continue;
    counts.set(h.location, (counts.get(h.location) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([location]) => location);
};

export default async function Home() {
  // One round of parallel queries feeds every section below - passed down as
  // props so nothing re-fetches the same data on the client.
  const [allHotelsRes, reviewsRes, initialListing] = await Promise.all([
    getAllHotels(),
    getReviews(),
    getHotels(1, 8, "", 0),
  ]);

  const hotels = allHotelsRes?.hotels ?? [];
  const reviews = reviewsRes?.reviews ?? [];
  const heroImage = pickHeroImage(hotels);
  const destinations = topDestinations(hotels);
  const categories = [...new Set(hotels.map((h) => h.category))];
  // Slim list for the hero search typeahead - only the fields it renders.
  const heroHotels = hotels.map((h) => ({
    _id: h._id,
    title: h.title,
    location: h.location,
    category: h.category,
    rent: h.rent,
    image: h.images?.[0] || null,
  }));

  return (
    <>
      <AnnounceBar />
      <Navbar />
      <Hero
        image={heroImage}
        destinations={destinations}
        categories={categories}
        hotels={heroHotels}
      />
      <HotelListing initialData={initialListing} initialReviews={reviews} />
      <HotelsCategory hotels={hotels} />
      <PopularDestinations hotels={hotels} />
      <RecentlyViewed hotels={hotels} reviews={reviews} />
      <TopRatedHotels hotels={hotels} reviews={reviews} />
      <Testimonials hotels={hotels} reviews={reviews} />
      <WhyBookWithUs />
      <HowItWorks />
      <Offer />
      <FAQ />
      <Newsletter />
      <Footer />
    </>
  );
}
