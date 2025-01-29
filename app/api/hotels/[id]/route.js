import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import Hotel from '@/models/hotel-model';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const hotel = await Hotel.findById(id).lean();

        if (!hotel) {
            return NextResponse.json({
                message: 'Hotel not found'
            }, { status: 404 });
        }

        return NextResponse.json(hotel, { status: 200 });
    } catch (error) {
        console.error('Error fetching hotel:', error);
        return NextResponse.json({
            message: 'Failed to fetch hotel',
            error: error.message
        }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;

        const hotel = await Hotel.findByIdAndDelete(id);

        if (!hotel) {
            return NextResponse.json({
                message: 'Hotel not found',
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Hotel deleted successfully',
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting hotel:', error);
        return NextResponse.json({
            message: 'Failed to delete hotel',
            error: error.message,
        }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const existingHotel = await Hotel.findById(id);
        if (!existingHotel) {
            return NextResponse.json({
                message: 'Hotel not found'
            }, { status: 404 });
        }
        const updateFields = {};
        for (const key in body) {
            if (body[key] !== undefined) {
                updateFields[key] = body[key];
            }
        }
        const updatedHotel = await Hotel.findByIdAndUpdate(
            id,
            { $set: updateFields },
            { new: true, runValidators: true }
        );
        return NextResponse.json({
            message: 'Hotel updated successfully',
            hotel: updatedHotel
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating hotel:', error);
        return NextResponse.json({
            message: 'Failed to update hotel',
            error: error.message
        }, { status: 500 });
    }
}