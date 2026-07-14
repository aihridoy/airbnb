import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import { auth } from '@/auth';
import { Wishlist } from '@/models/wishlist-model';

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const query = session.user.role === 'admin' ? {} : { userId: session.user.id };
        const wishlists = await Wishlist.find(query).lean()
        return NextResponse.json(
            { wishlists },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching wishlists:', error);
        return NextResponse.json(
            { message: 'Failed to fetch wishlists', error: error.message },
            { status: 500 }
        );
    }
}
