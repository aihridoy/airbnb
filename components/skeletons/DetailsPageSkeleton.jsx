import Skeleton from "./Skeleton";

const DetailsPageSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded" />
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="hotel-image-grid mb-8">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="w-full h-full rounded-lg" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Skeleton className="h-6 w-2/3 rounded" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    </div>
  );
};

export default DetailsPageSkeleton;
