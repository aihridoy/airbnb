const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hotelSchema = new Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
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
    category: {
      type: String,
      enum: ['urban', 'beach', 'mountain', 'luxury', 'rustic', 'countryside', 'lakeside'],
      default: 'urban',
      required: true, 
    },
    hostName: {
        type: String,
        required: true
    },
    guestCapacity: {
        type: Number,
        required: true
    },
    bedroomCapacity: {
        type: Number,
        required: true
    },
    bedCapacity: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    isOwner: {
        type: Boolean,
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    serviceFee: {
        type: Number,
        required: true
    },
    cleaningFee: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const Hotel = mongoose.models.hotels ?? mongoose.model('hotels', hotelSchema);

module.exports = Hotel;