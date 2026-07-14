import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import { auth } from '@/auth';
import { Review } from '@/models/review-model';

export async function POST(request) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { hotelId, ratings, review } = await request.json();

        if (!hotelId || !ratings || !review) {
            return NextResponse.json(
                { error: 'hotelId, ratings and review are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingReview = await Review.findOne({ hotelId, userId: session.user.id });
        if (existingReview) {
            return NextResponse.json(
                { message: 'You have already reviewed this hotel' },
                { status: 400 })
        }

        const newReview = new Review({
            hotelId,
            userId: session.user.id,
            userName: session.user.name,
            ratings,
            review,
        });

        const savedReview = await newReview.save();

        return NextResponse.json(
            { message: 'Review added successfully', review: savedReview },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error adding review:', error);
        return NextResponse.json(
            { error: 'An error occurred while adding the review' },
            { status: 500 }
        );
    }
}
