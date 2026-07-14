import { NextResponse } from "next/server";
import { Review } from "@/models/review-model";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const review = await Review.findById(id);
        if (!review) {
            return NextResponse.json({ message: 'Review not found' }, { status: 404 });
        }

        if (session.user.role !== 'admin' && review.userId?.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await review.deleteOne();

        return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ message: 'Failed to delete review' }, { status: 500 });
    }
}
