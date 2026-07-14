import Skeleton from "./Skeleton";

const HotelCardSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="mt-3 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-2/3 rounded" />
          <Skeleton className="h-5 w-10 rounded" />
        </div>
        <Skeleton className="h-4 w-1/2 rounded" />
        <Skeleton className="h-4 w-1/3 rounded" />
      </div>
    </div>
  );
};

export default HotelCardSkeleton;
