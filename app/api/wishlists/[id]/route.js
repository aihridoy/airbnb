import { Wishlist } from "@/models/wishlist-model";
import { dbConnect } from "@/service/mongo";

export async function DELETE(req, { params }) {
    const { id } = params;

    try {
        await dbConnect();
        const deletedWishlist = await Wishlist.findByIdAndDelete(id);

        if (!deletedWishlist) {
            return new Response(JSON.stringify({ message: 'Wishlist not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({ message: 'Wishlist deleted successfully' }), { status: 200 });
    } catch (error) {
        console.error('Error deleting wishlist:', error);
        return new Response(JSON.stringify({ message: 'Failed to delete wishlist' }), { status: 500 });
    }
}
