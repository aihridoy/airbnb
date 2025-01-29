import { NextResponse } from 'next/server';
import { Wishlist } from '@/models/wishlist-model';
import Hotel from '@/models/hotel-model';
import { dbConnect } from '@/service/mongo';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { userId, hotelId, title, location, rent, images } = body;
        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return NextResponse.json({ message: 'Hotel not found' }, { status: 404 });
        }
        const wishlistItem = new Wishlist({
            userId,
            hotelId,
            title,
            location,
            rent,
            images
        });
        await wishlistItem.save();
        return NextResponse.json({ message: 'Hotel added to wishlist successfully', data: wishlistItem });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ message: 'Error adding hotel to wishlist', error: error.message }, { status: 500 });
    }
}