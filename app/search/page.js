/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { Search as SearchIcon, ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { searchHotels, getReviews } from "@/app/action";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Hotel from "@/components/Hotel";

const PAGE_SIZE = 12;

const CATEGORY_LABELS = {
  urban: "Urban", beach: "Beach", mountain: "Mountain", luxury: "Luxury",
  rustic: "Rustic", countryside: "Countryside", lakeside: "Lakeside",
  desert: "Desert", island: "Island", ski: "Ski",
};

export function generateMetadata({ searchParams }) {
  const location = searchParams?.location?.trim();
  return { title: location ? `Stays in ${location}` : "Search stays" };
}

// Normalize raw searchParams into a clean filter object.
const parseFilters = (sp = {}) => ({
  location: sp.location?.trim() || "",
  guests: parseInt(sp.guests || "0", 10) || 0,
  category: sp.category || "",
  minPrice: parseInt(sp.minPrice || "0", 10) || 0,
  maxPrice: parseInt(sp.maxPrice || "0", 10) || 0,
  minRating: parseFloat(sp.minRating || "0") || 0,
  amenities: sp.amenities ? sp.amenities.split(",").filter(Boolean) : [],
});

// Build a /search href from a filter object (+ page), omitting empties.
const hrefFor = (f, page = 1) => {
  const q = new URLSearchParams();
  if (f.location) q.set("location", f.location);
  if (f.guests) q.set("guests", String(f.guests));
  if (f.category) q.set("category", f.category);
  if (f.minPrice) q.set("minPrice", String(f.minPrice));
  if (f.maxPrice) q.set("maxPrice", String(f.maxPrice));
  if (f.minRating) q.set("minRating", String(f.minRating));
  if (f.amenities.length) q.set("amenities", f.amenities.join(","));
  if (page > 1) q.set("page", String(page));
  return `/search?${q.toString()}`;
};

const SearchPage = async ({ searchParams }) => {
  const f = parseFilters(searchParams);
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);

  const [data, reviewsRes] = await Promise.all([
    searchHotels({ ...f, page, pageSize: PAGE_SIZE }),
    getReviews(),
  ]);

  const hotels = data?.hotels ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const reviews = reviewsRes?.reviews ?? [];

  // Active-filter chips: each links back to /search with that filter removed.
  const chips = [];
  if (f.location) chips.push({ label: `"${f.location}"`, remove: { ...f, location: "" } });
  if (f.category) chips.push({ label: CATEGORY_LABELS[f.category] || f.category, remove: { ...f, category: "" } });
  if (f.guests) chips.push({ label: `${f.guests}+ guests`, remove: { ...f, guests: 0 } });
  if (f.minPrice || f.maxPrice)
    chips.push({
      label: `$${f.minPrice || 0}–$${f.maxPrice || "∞"}`,
      remove: { ...f, minPrice: 0, maxPrice: 0 },
    });
  if (f.minRating) chips.push({ label: `${f.minRating}+ ★`, remove: { ...f, minRating: 0 } });
  f.amenities.forEach((a) =>
    chips.push({ label: a, remove: { ...f, amenities: f.amenities.filter((x) => x !== a) } })
  );

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink">
            {total} {total === 1 ? "stay" : "stays"}
            {f.location ? (
              <> for "<span className="text-brass-dark">{f.location}</span>"</>
            ) : (
              " available"
            )}
          </h1>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            {chips.map((c, i) => (
              <Link
                key={i}
                href={hrefFor(c.remove)}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full border border-hairline bg-surface text-sm text-ink hover:bg-surface-alt transition-colors"
              >
                {c.label}
                <X className="w-3.5 h-3.5 text-muted" />
              </Link>
            ))}
            <Link href="/search" className="text-sm text-brass-dark hover:underline ml-1">
              Clear all
            </Link>
          </div>
        )}

        {hotels.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-20 h-20 bg-surface-alt rounded-full flex items-center justify-center mb-6">
              <SearchIcon className="w-9 h-9 text-muted" />
            </div>
            <h2 className="font-serif text-2xl text-ink mb-2">No stays found</h2>
            <p className="text-muted mb-6">Try removing a filter or searching a different destination.</p>
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
                <PageLink href={hrefFor(f, page - 1)} disabled={page <= 1} aria="Previous page">
                  <ChevronLeft className="w-4 h-4" />
                </PageLink>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={hrefFor(f, p)}
                    className={`py-2 px-3.5 rounded-lg border text-sm ${
                      p === page
                        ? "bg-brass-dark text-cream border-brass-dark"
                        : "bg-surface text-muted border-hairline hover:bg-surface-alt hover:text-ink"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                <PageLink href={hrefFor(f, page + 1)} disabled={page >= totalPages} aria="Next page">
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
    <span aria-label={aria} className="flex items-center py-2 px-3 rounded-lg border border-hairline bg-surface text-muted opacity-50 pointer-events-none">
      {children}
    </span>
  ) : (
    <Link href={href} aria-label={aria} className="flex items-center py-2 px-3 rounded-lg border border-hairline bg-surface text-muted hover:bg-surface-alt hover:text-ink">
      {children}
    </Link>
  );

export default SearchPage;
