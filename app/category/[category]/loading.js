import HotelGridSkeleton from "@/components/skeletons/HotelGridSkeleton";
import Skeleton from "@/components/skeletons/Skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-10 w-64 rounded" />
          <Skeleton className="h-5 w-48 rounded" />
        </div>
        <HotelGridSkeleton count={8} />
      </div>
      <Footer />
    </div>
  );
}
