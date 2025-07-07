import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await dbConnect();
        
        // Get the category from query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        
        // Build the query filter
        let query = {};
        if (category) {
            query.category = category;
        }
        
        const hotels = await Hotel.find(query).lean();
        
        return NextResponse.json(
            { hotels },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return NextResponse.json(
            { message: 'Failed to fetch hotels', error: error.message },
            { status: 500 }
        );
    }
}