import { NextResponse } from "next/server";
import { Wishlist } from "@/models/wishlist-model";
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
        const wishlistItem = await Wishlist.findById(id);
        if (!wishlistItem) {
            return NextResponse.json({ message: 'Wishlist not found' }, { status: 404 });
        }

        if (session.user.role !== 'admin' && wishlistItem.userId?.toString() !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        await wishlistItem.deleteOne();

        return NextResponse.json({ message: 'Wishlist deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting wishlist:', error);
        return NextResponse.json({ message: 'Failed to delete wishlist' }, { status: 500 });
    }
}
