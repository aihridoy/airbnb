import { Review } from "@/models/review-model";
import { dbConnect } from "@/service/mongo";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        await dbConnect();
        const deletedReview = await Review.findByIdAndDelete(id);

        if (!deletedReview) {
            return new Response(JSON.stringify({ message: 'Review not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Review deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting review:', error);
        return new Response(JSON.stringify({ message: 'Failed to delete review' }), { status: 500 });
    }
}
