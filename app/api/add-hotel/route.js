import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';
import mongoose from 'mongoose';

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.formData();
        const ownerId = body.get('ownerId');
        if (!ownerId || ownerId === 'null') {
            return NextResponse.json(
                { message: 'ownerId is required' },
                { status: 400 }
            );
        }
        if (!mongoose.Types.ObjectId.isValid(ownerId)) {
            return NextResponse.json(
                { message: 'Invalid ownerId format' },
                { status: 400 }
            );
        }
        const hotelData = {
            ownerId: mongoose.Types.ObjectId.createFromHexString(ownerId),
            title: body.get('title'),
            location: body.get('location'),
            rent: parseFloat(body.get('rent')),
            hostName: body.get('hostName'),
            guestCapacity: parseInt(body.get('guestCapacity'), 10),
            bedroomCapacity: parseInt(body.get('bedroomCapacity'), 10),
            bedCapacity: parseInt(body.get('bedCapacity'), 10),
            description: body.get('description'),
            amenities: JSON.parse(body.get('amenities') || '[]'),
            images: body.getAll('images[]') || [],
            serviceFee: parseFloat(body.get('serviceFee')),
            cleaningFee: parseFloat(body.get('cleaningFee'))
        };
        const newHotel = new Hotel(hotelData);
        await newHotel.save();
        return NextResponse.json({
            message: 'Hotel added successfully',
            hotel: newHotel
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST request:', error);
        return NextResponse.json({
            message: 'Failed to add hotel',
            error: error.message
        }, { status: 500 });
    }
}