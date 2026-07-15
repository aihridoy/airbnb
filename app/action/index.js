"use server";

import { auth, signIn, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';
import { Review } from '@/models/review-model';

// Mongoose .lean() docs carry BSON ObjectId/Date instances, which Server
// Actions can't serialize back to the client as-is - round-trip through
// JSON to get the same plain strings a NextResponse.json() route would.
const toPlain = (value) => JSON.parse(JSON.stringify(value));

// Server Actions run on the server, so calling our own /api/* routes with
// fetch() does NOT automatically carry the browser's session cookie the way
// a same-origin browser fetch would. Forward it explicitly so auth() inside
// the route handlers can see the signed-in user.
function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        return process.env.NEXT_PUBLIC_API_BASE_URL;
    }
    const h = headers();
    const host = h.get('host');
    const protocol = h.get('x-forwarded-proto') ?? 'http';
    return `${protocol}://${host}`;
}

function internalFetch(path, options = {}) {
    const cookie = headers().get('cookie') ?? '';
    return fetch(`${getBaseUrl()}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
            cookie,
        },
    });
}

export async function addHotel(formData) {
    try {
        const response = await internalFetch(`/api/add-hotel`, {
            method: 'POST',
            body: formData,
            cache: 'no-store',
        });
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        revalidatePath('/app/add-hotel');
        return data;
    } catch (error) {
        console.error('Failed to add hotel:', error);
        throw error;
    }
}

export async function getHotels(page = 1, pageSize = 8, searchQuery = '', minGuests = 0) {
    try {
        await dbConnect();

        const conditions = [];
        if (searchQuery) {
            conditions.push({
                $or: [
                    { title: { $regex: searchQuery, $options: 'i' } },
                    { location: { $regex: searchQuery, $options: 'i' } },
                ],
            });
        }
        if (minGuests > 0) {
            conditions.push({ guestCapacity: { $gte: minGuests } });
        }
        const query = conditions.length ? { $and: conditions } : {};
        const skip = (page - 1) * pageSize;

        const [hotels, total] = await Promise.all([
            Hotel.find(query).skip(skip).limit(pageSize).lean(),
            Hotel.countDocuments(query),
        ]);

        return toPlain({
            hotels,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Failed to fetch hotels:', error);
        throw error;
    }
}

// Rich filtered search used by the /search page. One aggregation handles
// location, guests, category, price range, amenities, and min-rating (which
// needs a review lookup) plus pagination. getHotels stays light for the
// homepage browse listing.
export async function searchHotels({
    location = '',
    guests = 0,
    category = '',
    minPrice = 0,
    maxPrice = 0,
    amenities = [],
    minRating = 0,
    page = 1,
    pageSize = 12,
} = {}) {
    try {
        await dbConnect();

        const match = {};
        if (location) {
            match.$or = [
                { title: { $regex: location, $options: 'i' } },
                { location: { $regex: location, $options: 'i' } },
            ];
        }
        if (guests > 0) match.guestCapacity = { $gte: guests };
        if (category) match.category = category;
        if (minPrice > 0 || maxPrice > 0) {
            match.rent = {};
            if (minPrice > 0) match.rent.$gte = minPrice;
            if (maxPrice > 0) match.rent.$lte = maxPrice;
        }
        if (amenities.length > 0) match.amenities = { $all: amenities };

        const pipeline = [{ $match: match }];

        // Only pay for the review join when a rating filter is active.
        if (minRating > 0) {
            pipeline.push(
                {
                    $lookup: {
                        from: 'reviews',
                        localField: '_id',
                        foreignField: 'hotelId',
                        as: 'reviewDocs',
                    },
                },
                {
                    $addFields: {
                        avgRating: {
                            $cond: [
                                { $gt: [{ $size: '$reviewDocs' }, 0] },
                                { $avg: '$reviewDocs.ratings' },
                                0,
                            ],
                        },
                    },
                },
                { $match: { avgRating: { $gte: minRating } } },
                { $project: { reviewDocs: 0 } },
            );
        }

        const skip = (page - 1) * pageSize;
        pipeline.push({
            $facet: {
                data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: pageSize }],
                meta: [{ $count: 'total' }],
            },
        });

        const [result] = await Hotel.aggregate(pipeline);
        const hotels = result?.data ?? [];
        const total = result?.meta?.[0]?.total ?? 0;

        return toPlain({
            hotels,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        });
    } catch (error) {
        console.error('Failed to search hotels:', error);
        throw error;
    }
}

export async function getAllHotels(category = null) {
    try {
        await dbConnect();
        const query = category ? { category } : {};
        const hotels = await Hotel.find(query).lean();
        return toPlain({ hotels });
    } catch (error) {
        console.error("Failed to load hotels:", error);
        throw error;
    }
}

export async function getHotelById(id) {
    try {
        const response = await internalFetch(`/api/hotels/${id}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        revalidatePath(`/details/${id}`);
        return data;
    } catch (error) {
        console.error('Failed to fetch hotel by ID:', error);
        throw error;
    }
}

export async function updateHotelById(id, hotelData) {
    hotelData.images = JSON.parse(hotelData.images || '[]');
    hotelData.amenities = JSON.parse(hotelData.amenities || [])
    try {
        const response = await internalFetch(`/api/hotels/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(hotelData),
            cache: 'no-store',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        revalidatePath(`/details/${id}`);
        return data;
    } catch (error) {
        console.error('Failed to update hotel:', error);
        throw error;
    }
}


export async function deleteHotelById(id) {
    try {
        const response = await internalFetch(`/api/hotels/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        revalidatePath(`/manage-hotels`);
        return data;
    } catch (error) {
        console.error('Failed to delete hotel:', error);
        throw error;
    }
}

export async function addToWishlist(userId, hotelId, title, location, rent, images) {
    try {
        const response = await internalFetch(`/api/add-wishlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, hotelId, title, location, rent, images }),
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        revalidatePath('/wishlists');
        return data;
    } catch (error) {
        console.error('Failed to add to wishlist:', error);
        throw error;
    }
}

export async function getWishlists() {
    try {
        const response = await internalFetch(`/api/wishlists`, {
            method: 'GET',
            cache: 'no-store',
        })
        // Signed-out visitor: no wishlist, not an error.
        if (response.status === 401) {
            return { wishlists: [] };
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        revalidatePath('/wishlists');
        return data;

    } catch (error) {
        console.error("Failed to load wishlists:", error);
        return { wishlists: [] };
    }
}

export async function deleteWishlist(id) {
    try {
        const response = await internalFetch(`/api/wishlists/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to delete wishlist: HTTP ${response.status}`);
        }
        revalidatePath(`/wishlists`);
        return data;
    } catch (error) {
        console.error('Failed to delete wishlist:', error);
        throw error;
    }
}

export async function submitReview(reviewData) {
    try {
        const response = await internalFetch(`/api/add-review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reviewData),
            cache: 'no-store',
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        revalidatePath(`/details/${reviewData.hotelId}`);
        return data;
    } catch (error) {
        console.error('Failed to submit review:', error);
        throw error;
    }
}

export async function getReviews() {
    try {
        await dbConnect();
        const reviews = await Review.find().lean();
        return toPlain({ reviews });
    } catch (error) {
        console.error("Failed to load reviews:", error);
        return { reviews: [] };
    }
}

export async function deleteReview(id) {
    try {
        const response = await internalFetch(`/api/reviews/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to delete review: HTTP ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error('Failed to delete review:', error);
        throw error;
    }
}

export async function createBooking(data) {
    try {
        const response = await internalFetch(`/api/add-booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create booking.');
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error creating booking:', error.message);
        throw error;
    }
}

export async function getBookings() {
    try {
        const response = await internalFetch(`/api/bookings`, {
            method: 'GET',
            cache: 'no-store',
        })
        // Signed-out visitor: no bookings, not an error.
        if (response.status === 401) {
            return { bookings: [] };
        }
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Failed to load bookings:", error);
        return { bookings: [] };
    }
}

export async function getBooking(bookingId) {
    try {
        const response = await internalFetch(`/api/bookings/${bookingId}`, {
            method: 'GET',
            cache: 'no-store',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error(`Failed to fetch booking with ID ${bookingId}:`, error);
        return { booking: null };
    }
}


export async function doSignOut() {
    await signOut();
}

export async function session() {
    const authResult = await auth();
    return authResult || null;
}

export async function login(formData) {
    try {
        const response = await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirect: false,
        });
        return response;
    } catch (err) {
        throw err;
    }
}

export async function sendEmail({ to, subject, html }) {
    try {
        const response = await internalFetch(`/api/send-email`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to send email");

        return result;
    } catch (error) {
        console.error("Error in sendEmail action:", error);
        throw error;
    }
};

export async function getUsers() {
    try {
        const response = await internalFetch(`/api/users`, {
            method: 'GET',
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error("Failed to load users:", error);
        // Return error state instead of undefined
        return {
            success: false,
            error: error.message || "Failed to fetch users",
            users: []
        };
    }
}

export async function getUserById(id) {
    try {
        const response = await internalFetch(`/api/users/${id}`, {
            method: 'GET',
            cache: 'no-store',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        return data;

    } catch (error) {
        console.error("Failed to load user:", error);
        // Return error state instead of undefined
        return {
            success: false,
            error: error.message || "Failed to fetch user",
            user: null
        };
    }
}
