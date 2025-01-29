import { NextResponse } from 'next/server';
import { dbConnect } from '@/service/mongo';
import { Review } from '@/models/review-model';

export async function POST(request) {
    try {
        const { hotelId, userId, userName, ratings, review } = await request.json();

        if (!hotelId || !userId || !ratings || !review || !userName) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingReview = await Review.findOne({ hotelId, userId });
        if (existingReview) {
            return NextResponse.json(
                { message: 'You have already reviewed this hotel' },
                { status: 400 })
        }

        const newReview = new Review({
            hotelId,
            userId,
            userName,
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
