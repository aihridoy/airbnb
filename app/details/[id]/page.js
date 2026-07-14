/* eslint-disable react/no-unescaped-entities */
import {
  getBookings,
  getHotelById,
  getReviews,
  getWishlists,
  session,
} from "@/app/action";
import AddToWishListButton from "@/components/AddToWishListButton";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProvidePreview from "@/components/ProvidePreview";
import Reserve from "@/components/Reserve";
import Reviews from "@/components/Reviews";
import SocialShare from "@/components/SocialShare";
import SuggestedHotels from "@/components/SuggestedHotels";
import Image from "next/image";
import {
  Star,
  Users,
  DoorOpen,
  BedDouble,
  Umbrella,
  Waves,
  Wifi,
  Utensils,
  Check,
} from "lucide-react";

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const hotel = await getHotelById(id);
    return {
      title: hotel?.title?.slice(0, 50),
      description: hotel?.description?.slice(0, 100),
      openGraph: {
        images: `${hotel?.images[0]}`,
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return {
      title: "Hotel Not Found",
      description: "The requested hotel could not be found.",
    };
  }
}

const AMENITY_ICONS = {
  "beach access": Umbrella,
  "private pool": Waves,
  "free wi-fi": Wifi,
  kitchen: Utensils,
};

const HotelDetailsPage = async ({ params }) => {
  const authResult = await session();
  const { id } = params;
  const { reviews } = await getReviews();
  const { wishlists } = await getWishlists();
  const { bookings } = await getBookings();
  let hotel;

  try {
    hotel = await getHotelById(id);
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return (
      <div className="flex justify-center items-center min-h-screen text-center px-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-red-500">
          Hotel not found!
        </h1>
      </div>
    );
  }

  const {
    _id,
    title,
    location,
    amenities,
    bedCapacity,
    bedroomCapacity,
    description,
    guestCapacity,
    hostName,
    images,
    rent,
    serviceFee,
    cleaningFee,
    ownerId,
  } = hotel;
  const currentUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/details/${id}`;
  const hotelImage =
    (images && images.length > 0 && images[0]) ||
    "https://placehold.co/600x400";

  const filteredReviews = reviews.filter((review) => review.hotelId === _id);
  const totalReviews = filteredReviews.length;
  const averageRating =
    totalReviews > 0
      ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) /
        totalReviews
      : 0;

  const bookedHotels = bookings.filter(
    (booking) => booking.userId === authResult?.user?.id
  );
  const shouldRenderWishlistButton = !bookedHotels.some(
    (booking) => booking.hotelId === id
  );

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">{title}</h1>
            <SocialShare currentUrl={currentUrl} hotel={hotel} />
            <div className="flex flex-wrap items-center text-muted mt-2 gap-2">
              <Star className="w-4 h-4 text-brass-dark fill-current mr-1" />
              <span>{averageRating.toFixed(1)}</span>
              <span>{totalReviews} reviews</span>
              <span className="hidden sm:inline mx-2">·</span>
              <span>{location}</span>
            </div>
          </div>
          {authResult && shouldRenderWishlistButton && (
            <AddToWishListButton
              hotelId={_id}
              userId={authResult?.user?.id}
              title={title}
              location={location}
              rent={rent}
              images={images}
              wishlists={wishlists}
            />
          )}
        </div>
        <div className="hotel-image-grid mb-8">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`
                relative
                ${index === 0 && "(min-width: 640px)" ? "col-span-2 row-span-2" : ""}
              `}
            >
              <Image
                width={index === 0 ? 800 : 400}
                height={index === 0 ? 800 : 400}
                src={image}
                alt={`Room ${index}`}
                className="w-full h-full object-cover rounded-lg"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                priority={index === 0}
                loading={index > 0 ? "lazy" : undefined}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="col-span-1 lg:col-span-2">
            <div className="border-b border-hairline pb-6 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-4">
                Entire villa hosted by {hostName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-muted">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{guestCapacity} guests</span>
                </div>
                <div className="flex items-center gap-2">
                  <DoorOpen className="w-4 h-4" />
                  <span>{bedroomCapacity} bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="w-4 h-4" />
                  <span>{bedCapacity} beds</span>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                About this place
              </h3>
              <p className="text-ink/80 leading-relaxed">{description}</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                What this place offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {amenities?.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity.toLowerCase()] || Check;
                  return (
                    <div key={amenity} className="flex items-center gap-2 text-ink">
                      <Icon className="w-4 h-4 text-brass-dark" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="sticky top-20 self-start">
            <Reserve
              hotelImage={hotelImage}
              rent={rent}
              title={title}
              serviceFee={serviceFee}
              cleaningFee={cleaningFee}
              totalReviews={totalReviews}
              averageRating={averageRating}
              description={description}
              hotelId={_id}
              ownerId={ownerId}
            />
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-hairline">
        <ProvidePreview
          hotelId={_id}
          ownerId={ownerId}
          totalReviews={totalReviews}
          averageRating={averageRating}
        />
        <Reviews reviews={filteredReviews} />
        <SuggestedHotels />
      </div>
      <Footer />
    </>
  );
};

export default HotelDetailsPage;
