import HotelCardSkeleton from "./HotelCardSkeleton";

const HotelGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <HotelCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default HotelGridSkeleton;
