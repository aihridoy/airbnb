const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const wishlistSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'hotels',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    rent: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
}, { timestamps: true });

export const Wishlist = mongoose.models.wishlists || mongoose.model('wishlists', wishlistSchema);