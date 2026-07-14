import { NextResponse } from 'next/server';
import { Wishlist } from '@/models/wishlist-model';
import Hotel from '@/models/hotel-model';
import { dbConnect } from '@/service/mongo';
import { auth } from '@/auth';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const body = await request.json();
        const { hotelId, title, location, rent, images } = body;

        if (!hotelId || !title || !location || rent === undefined) {
            return NextResponse.json({ message: 'hotelId, title, location and rent are required' }, { status: 400 });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return NextResponse.json({ message: 'Hotel not found' }, { status: 404 });
        }
        const wishlistItem = new Wishlist({
            userId: session.user.id,
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
