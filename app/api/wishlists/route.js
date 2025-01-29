import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import { Wishlist } from '@/models/wishlist-model';

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const wishlists = await Wishlist.find().lean()
        return NextResponse.json(
            { wishlists },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { message: 'Failed to fetch reviews', error: error.message },
            { status: 500 }
        );
    }
}
