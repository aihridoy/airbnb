import Skeleton from "./Skeleton";

// Shared skeleton loaders for the dashboard routes. Each roughly mirrors its
// page layout so the loading.js fallback reads as content, not a spinner.

const Shell = ({ children }) => (
  <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">{children}</div>
);

const Header = ({ action = true }) => (
  <div className="flex justify-between items-center mb-8 gap-4">
    <Skeleton className="h-8 w-56 rounded" />
    {action && <Skeleton className="h-10 w-36 rounded-lg" />}
  </div>
);

export const GridPageSkeleton = ({ search = true, count = 6 }) => (
  <Shell>
    <Header />
    {search && <Skeleton className="h-12 w-full rounded-xl mb-8" />}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-hairline overflow-hidden"
        >
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-2/3 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  </Shell>
);

export const TablePageSkeleton = ({ rows = 8, search = true }) => (
  <Shell>
    <Header />
    {search && <Skeleton className="h-12 w-full max-w-md rounded-xl mb-6" />}
    <div className="rounded-2xl border border-hairline overflow-hidden">
      <Skeleton className="h-12 w-full" />
      <div className="divide-y divide-hairline">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1 rounded" />
            <Skeleton className="h-4 w-24 rounded hidden sm:block" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

export const StatsPageSkeleton = ({ cards = 4, charts = true }) => (
  <div className="p-6">
    <div className="mb-8 space-y-2">
      <Skeleton className="h-8 w-64 rounded" />
      <Skeleton className="h-4 w-40 rounded" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(cards)].map((_, i) => (
        <div
          key={i}
          className="bg-surface p-6 rounded-2xl border border-hairline"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20 rounded" />
              <Skeleton className="h-8 w-12 rounded" />
            </div>
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
    {charts && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
      </div>
    )}
  </div>
);

export const ProfilePageSkeleton = () => (
  <Shell>
    <div className="rounded-2xl border border-hairline p-8 mb-8 flex flex-col sm:flex-row items-center gap-6">
      <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
      <div className="space-y-3 w-full">
        <Skeleton className="h-7 w-48 rounded" />
        <Skeleton className="h-4 w-64 rounded" />
        <Skeleton className="h-6 w-40 rounded-full" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-hairline p-6 space-y-4"
        >
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-8 w-12 rounded" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-hairline p-6 space-y-4">
      <Skeleton className="h-6 w-40 rounded" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </Shell>
);

export const CreateHotelSkeleton = () => (
  <Shell>
    <div className="flex justify-between items-center mb-6 gap-4">
      <div className="space-y-3 w-full max-w-sm">
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-4 w-40 rounded" />
      </div>
      <Skeleton className="h-10 w-28 rounded-lg flex-shrink-0" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      <Skeleton className="h-80 w-full rounded-lg sm:col-span-2 sm:row-span-2 lg:col-span-1 lg:row-span-2" />
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-40 w-full rounded-lg" />
      ))}
    </div>
    <div className="space-y-4 max-w-md">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-6 w-full rounded" />
      ))}
    </div>
  </Shell>
);
