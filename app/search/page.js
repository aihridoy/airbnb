/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Search as SearchIcon, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { getHotels, getReviews } from "@/app/action";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hotel from "@/components/Hotel";

const PAGE_SIZE = 12;

export function generateMetadata({ searchParams }) {
  const location = searchParams?.location?.trim();
  return {
    title: location ? `Stays in ${location}` : "Search stays",
  };
}

const buildHref = (params, page) => {
  const q = new URLSearchParams();
  if (params.location) q.set("location", params.location);
  if (params.checkin) q.set("checkin", params.checkin);
  if (params.checkout) q.set("checkout", params.checkout);
  if (params.guests) q.set("guests", params.guests);
  q.set("page", String(page));
  return `/search?${q.toString()}`;
};

const SearchPage = async ({ searchParams }) => {
  const location = searchParams?.location?.trim() || "";
  const guests = parseInt(searchParams?.guests || "0", 10) || 0;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const [data, reviewsRes] = await Promise.all([
    getHotels(page, PAGE_SIZE, location, guests),
    getReviews(),
  ]);

  const hotels = data?.hotels ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const reviews = reviewsRes?.reviews ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink">
            {total} {total === 1 ? "stay" : "stays"}
            {location ? (
              <>
                {" "}for "<span className="text-brass-dark">{location}</span>"
              </>
            ) : (
              " available"
            )}
          </h1>
          <p className="text-muted mt-2">
            {guests > 0 && `For ${guests} ${guests === 1 ? "guest" : "guests"} · `}
            Browse and book your next stay.
          </p>
        </div>

        {hotels.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-6">
              <SearchIcon className="w-9 h-9 text-muted" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">No stays found</h2>
            <p className="text-muted mb-6">
              We couldn't find anything matching {location ? `"${location}"` : "your search"}.
              Try a different destination.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {hotels.map((hotel) => {
                const hotelReviews = reviews.filter((r) => r.hotelId === hotel._id);
                const avg =
                  hotelReviews.length > 0
                    ? hotelReviews.reduce((a, r) => a + r.ratings, 0) / hotelReviews.length
                    : 0;
                return <Hotel key={hotel._id} hotel={hotel} averageRating={avg} />;
              })}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <PageLink
                  href={buildHref({ location, guests }, page - 1)}
                  disabled={page <= 1}
                  aria={"Previous page"}
                >
                  <ChevronLeft className="w-4 h-4" />
                </PageLink>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildHref({ location, guests }, p)}
                    className={`py-2 px-3.5 rounded-lg border text-sm ${
                      p === page
                        ? "bg-brass-dark text-cream border-brass-dark"
                        : "bg-surface text-muted border-hairline hover:bg-surface-alt hover:text-ink"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                <PageLink
                  href={buildHref({ location, guests }, page + 1)}
                  disabled={page >= totalPages}
                  aria={"Next page"}
                >
                  <ChevronRight className="w-4 h-4" />
                </PageLink>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

const PageLink = ({ href, disabled, aria, children }) =>
  disabled ? (
    <span
      aria-label={aria}
      className="flex items-center py-2 px-3 rounded-lg border border-hairline bg-surface text-muted opacity-50 pointer-events-none"
    >
      {children}
    </span>
  ) : (
    <Link
      href={href}
      aria-label={aria}
      className="flex items-center py-2 px-3 rounded-lg border border-hairline bg-surface text-muted hover:bg-surface-alt hover:text-ink"
    >
      {children}
    </Link>
  );

export default SearchPage;
