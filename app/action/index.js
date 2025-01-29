"use server";

import { auth, signIn, signOut } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function addHotel(formData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/add-hotel`, {
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

export async function getHotels(page = 1, pageSize = 8, searchQuery = '') {
    try {
        const query = searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : '';
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels?page=${page}&pageSize=${pageSize}${query}`, {
            method: 'GET',
            cache: 'no-store',
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        revalidatePath('/');
        return data;
    } catch (error) {
        console.error('Failed to fetch hotels:', error);
        throw error;
    }
}

export async function getAllHotels() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/all-hotels`, {
            method: 'GET',
            cache: 'no-store',
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Failed to load reviews:", error);
    }
}

export async function getHotelById(id) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/${id}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/${id}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/hotels/${id}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/add-wishlist`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wishlists`, {
            method: 'GET',
            cache: 'no-store',
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        revalidatePath('/wishlists');
        return data;

    } catch (error) {
        console.error("Failed to load wishlists:", error);
    }
}

export async function deleteWishlist(id) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/wishlists/${id}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/add-review`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews`, {
            method: 'GET',
            cache: 'no-store',
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Failed to load reviews:", error);
    }
}

export async function deleteReview(id) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/${id}`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/add-booking`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings`, {
            method: 'GET',
            cache: 'no-store',
        })
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        return data;

    } catch (error) {
        console.error("Failed to load reviews:", error);
    }
}

export async function getBooking(bookingId) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/bookings/${bookingId}`, {
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
    }
}


export async function doSignOut() {
    await signOut()
    window.location.reload();
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/send-email`, {
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

