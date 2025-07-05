/* eslint-disable react/no-unescaped-entities */
import { getBookings, getHotelById, getReviews, getWishlists, session } from '@/app/action';
import AddToWishListButton from '@/components/AddToWishListButton';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import ProvidePreview from '@/components/ProvidePreview';
import Reserve from '@/components/Reserve';
import Reviews from '@/components/Reviews';
import SocialShare from '@/components/SocialShare';
import SuggestedHotels from '@/components/SuggestedHotels';
import Image from 'next/image';

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

const HotelDetailsPage = async ({ params }) => {
    const authResult = await session();
    const { id } = params;
    const { reviews } = await getReviews()
    const { wishlists } = await getWishlists()
    const { bookings } = await getBookings();
    let hotel;

    try {
        hotel = await getHotelById(id);
    } catch (error) {
        console.error('Error fetching hotel:', error);
        return (
            <div className="flex justify-center items-center h-screen text-center">
                <h1 className="text-4xl font-bold text-red-500">Hotel not found!</h1>
            </div>
        );
    }

    const { _id, title, location, amenities, bedCapacity, bedroomCapacity, description, guestCapacity, hostName, images, rent, serviceFee, cleaningFee, ownerId } = hotel;
    const currentUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/details/${id}`
    const hotelImage = images && images.length > 0 && images[0] || 'https://placehold.co/600x400'

    const filteredReviews = reviews.filter(review => review.hotelId === _id);
    const totalReviews = filteredReviews.length;
    const averageRating = totalReviews > 0 ? filteredReviews.reduce((acc, review) => acc + review.ratings, 0) / totalReviews : 0;

    const bookedHotels = bookings.filter(
        (booking) => booking.userId === authResult?.user?.id
    );
    const shouldRenderWishlistButton = !bookedHotels.some(booking => booking.hotelId === id);

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex justify-between">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold mb-2">{title}</h1>
                        <SocialShare currentUrl={currentUrl} hotel={hotel} />
                        <div className="flex items-center text-gray-600 mt-2">
                            <i className="fas fa-star text-yellow-500 mr-1"></i>
                            <span>{averageRating.toFixed(1)}</span>
                            <span className="ml-2">{totalReviews} reviews</span>
                            <span className="mx-2">·</span>
                            <span className="">{location}</span>
                        </div>
                    </div>
                    {
                        authResult && shouldRenderWishlistButton && <AddToWishListButton hotelId={_id} userId={authResult?.user?.id} title={title} location={location} rent={rent} images={images} wishlists={wishlists} />
                    }
                </div>
                <div className="grid grid-cols-4 grid-rows-2 gap-4 mb-8 h-[500px]">
                    {images.map((image, index) => (
                        <div key={index} className={index === 0 ? "col-span-2 row-span-2" : ""}>
                            <Image
                                width={500}
                                height={500}
                                src={image}
                                alt={`Room ${index}`}
                                className="w-full h-full object-cover rounded-lg"
                                unoptimized={true}
                            />
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-8">
                    <div className="col-span-2">
                        <div className="border-b pb-6 mb-6">
                            <h2 className="text-2xl font-semibold mb-4">
                                Entire villa hosted by {hostName}
                            </h2>
                            <div className="grid grid-cols-3 gap-4 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-person"></i>
                                    <span>{guestCapacity} guests</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-door-open"></i>
                                    <span>{bedroomCapacity} bedrooms</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-bed"></i>
                                    <span>{bedCapacity} beds</span>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4">About this place</h3>
                            <p className="text-gray-700 leading-relaxed">
                                {description}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-4">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {
                                    amenities?.map((amenity, index) => {
                                        let iconClass = '';
                                        switch (amenity.toLowerCase()) {
                                            case 'beach access':
                                                iconClass = 'fa-solid fa-umbrella-beach';
                                                break;
                                            case 'private pool':
                                                iconClass = 'fa-solid fa-person-swimming';
                                                break;
                                            case 'free wi-fi':
                                                iconClass = 'fa-solid fa-wifi';
                                                break;
                                            case 'kitchen':
                                                iconClass = 'fa-solid fa-sink';
                                                break;
                                            default:
                                                iconClass = 'fa-solid fa-check';
                                        }

                                        return (
                                            <div key={index} className="flex items-center gap-2">
                                                <i className={iconClass}></i>
                                                <span>{amenity}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>
                    <Reserve hotelImage={hotelImage} rent={rent} title={title} serviceFee={serviceFee} cleaningFee={cleaningFee} totalReviews={totalReviews} averageRating={averageRating} description={description} hotelId={_id} ownerId={ownerId} />
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-12 border-t">
                <ProvidePreview hotelId={_id} ownerId={ownerId} totalReviews={totalReviews} averageRating={averageRating} />
                <Reviews reviews={filteredReviews} />
                <SuggestedHotels />
            </div>
            <Footer />
        </>
    );
};

export default HotelDetailsPage;