import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        const hotels = await Hotel.find().lean()
        return NextResponse.json(
            { hotels },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { message: 'Failed to fetch hotels', error: error.message },
            { status: 500 }
        );
    }
}
