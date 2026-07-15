import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';

export const dynamic = "force-dynamic";

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '8', 10);
        const searchQuery = searchParams.get('search') || '';
        const minGuests = parseInt(searchParams.get('guests') || '0', 10);

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
        const hotels = await Hotel.find(query).skip(skip).limit(pageSize).lean();
        const total = await Hotel.countDocuments(query);

        return NextResponse.json({
            hotels,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching hotels:', error);
        return NextResponse.json({
            message: 'Failed to fetch hotels',
            error: error.message
        }, { status: 500 });
    }
}