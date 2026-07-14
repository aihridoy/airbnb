import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import { auth } from '@/auth';
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
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        const hotel = await Hotel.findById(id);
        if (!hotel) {
            return NextResponse.json({
                message: 'Hotel not found',
            }, { status: 404 });
        }

        if (session.user.role !== 'admin' && hotel.ownerId?.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await hotel.deleteOne();

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

// Fields a hotel owner/admin is allowed to update. Anything else in the
// request body (e.g. ownerId) is ignored to prevent mass-assignment.
const UPDATABLE_FIELDS = [
    'title',
    'location',
    'rent',
    'category',
    'hostName',
    'guestCapacity',
    'bedroomCapacity',
    'bedCapacity',
    'description',
    'amenities',
    'images',
    'serviceFee',
    'cleaningFee',
];

export async function PATCH(request, { params }) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const existingHotel = await Hotel.findById(id);
        if (!existingHotel) {
            return NextResponse.json({
                message: 'Hotel not found'
            }, { status: 404 });
        }

        if (session.user.role !== 'admin' && existingHotel.ownerId?.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const updateFields = {};
        for (const key of UPDATABLE_FIELDS) {
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
