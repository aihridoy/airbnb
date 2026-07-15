const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
});

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;

// review-model.js is ESM (export const) - plain `node` can't require it directly,
// so mirror the schema here the same way seed-users.js mirrors user-model.js.
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.users || mongoose.model('users', userSchema);

const reviewSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    userName: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });
const Review = mongoose.models.reviews || mongoose.model('reviews', reviewSchema);

const Hotel = require('../models/hotel-model');

const REVIEWERS = [
    'Sarah Chen', 'Marcus Bell', 'Priya Nair', 'Tom Becker', 'Lucia Alvarez',
    'Noah Fischer', 'Hana Kobayashi', 'Ethan Brooks', 'Ines Duarte', 'Omar Haddad',
    'Grace Liu', 'Daniel Osei',
];

const RATINGS_CYCLE = [5, 4, 5, 3, 4, 5, 4, 5, 4, 3, 5, 4];

const COMMENTS = [
    'Fantastic stay, the room was spotless and the staff went out of their way to help.',
    'Great location and comfortable beds, would definitely book again.',
    'Good value for the price, though the wifi was a bit slow during peak hours.',
    'Absolutely loved the view and the amenities, one of the best stays we\'ve had.',
    'Check-in was smooth and the room matched the photos perfectly.',
    'Solid stay overall, breakfast could use more variety but everything else was great.',
    'The pool and spa were the highlight of our trip, very relaxing atmosphere.',
    'Clean, quiet, and well-located. Exactly what we needed for a short getaway.',
    'Staff were friendly and responsive, minor delay at check-in but handled well.',
    'Beautiful property, the photos genuinely don\'t do it justice.',
    'Comfortable and convenient, though parking was a little tight in the evenings.',
    'A memorable stay with great service from start to finish, highly recommend.',
];

async function seedReviews() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_CONNECTION_STRING environment variable is not set');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@gmail.com' });
        const demoUser = await User.findOne({ email: 'abul@gmail.com' });
        if (!admin || !demoUser) {
            throw new Error('Demo users not found - run seed-users.js first');
        }
        const reviewerIds = [admin._id, demoUser._id];

        const hotels = await Hotel.find().lean();
        if (hotels.length === 0) {
            throw new Error('No hotels found - run seed-hotels.js first');
        }

        let created = 0;
        let updated = 0;
        let globalIndex = 0;

        for (const hotel of hotels) {
            const reviewCount = 3 + (globalIndex % 4); // 3-6 reviews per hotel

            for (let i = 0; i < reviewCount; i++) {
                const reviewer = REVIEWERS[globalIndex % REVIEWERS.length];
                const doc = {
                    hotelId: hotel._id,
                    userName: reviewer,
                    userId: reviewerIds[globalIndex % reviewerIds.length],
                    ratings: RATINGS_CYCLE[globalIndex % RATINGS_CYCLE.length],
                    review: COMMENTS[globalIndex % COMMENTS.length],
                };

                const result = await Review.updateOne(
                    { hotelId: doc.hotelId, userName: doc.userName, review: doc.review },
                    { $set: doc },
                    { upsert: true }
                );
                if (result.upsertedCount > 0) created++;
                else updated++;

                globalIndex++;
            }
        }

        console.log(`\nSeed completed! Created: ${created}, Updated: ${updated}, Total reviews touched: ${created + updated}`);
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedReviews();
