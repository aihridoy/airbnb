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

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.users || mongoose.model('users', userSchema);
const Hotel = require('../models/hotel-model');

// Verified real Unsplash photo IDs (hotel/travel imagery)
const IMAGE_IDS = [
    '1566073771259-6a8506099945', '1611892440504-42a792e24d32', '1571003123894-1f0594d2b5d9',
    '1520250497591-112f2f40a3f4', '1582719478250-c89cae4dc85b', '1445019980597-93fa8acb246c',
    '1455587734955-081b22074882', '1551882547-ff40c63fe5fa', '1568084680786-a84f91d1153c',
    '1590490360182-c33d57733427', '1596436889106-be35e843f974', '1584132967334-10e028bd69f7',
    '1618773928121-c32242e63f39', '1512918728675-ed5a9ecdebfd', '1631049307264-da0ec9d70304',
    '1520277739336-7bf67edfa768', '1519449556851-5720b33024e7', '1542314831-068cd1dbfeeb',
    '1615460549969-36fa19521a4f', '1544124499-58912cbddaad', '1522708323590-d24dbb6b0267',
    '1591088398332-8a7791972843', '1602002418082-a4443e081dd1', '1493857671505-72967e2e2760',
    '1548574505-5e239809ee19', '1560448204-e02f11c3d0e2', '1571896349842-33c89424de2d',
    '1517320964276-a002fa203177', '1476514525535-07fb3b4ae5f1', '1571770095004-6b61b1cf308a',
    '1544161515-4ab6ce6db874', '1551038247-3d9af20df552', '1496412705862-e0088f16f791',
    '1509316975850-ff9c5deb0cd9', '1451337516015-6b6e9a44a8a3', '1473116763249-2faaef81ccda',
    '1497436072909-60f360e1d4b1', '1573843981267-be1999ff37cd', '1548013146-72479768bada',
    '1587381420270-3e1a5b9e6904', '1518684079-3c830dcef090', '1519681393784-d120267933ba',
    '1515444744559-7be63e1600de', '1580977276076-ae4b8c219b8e', '1470770903676-69b98201ea1c',
];

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const CATEGORIES = [
    { key: 'urban', label: 'Urban', cities: ['New York', 'Tokyo', 'Paris', 'London', 'Singapore'] },
    { key: 'beach', label: 'Beach', cities: ['Bali', 'Cancun', 'Phuket', 'Santorini', 'Maldives'] },
    { key: 'mountain', label: 'Mountain', cities: ['Aspen', 'Zermatt', 'Banff', 'Chamonix', 'Queenstown'] },
    { key: 'luxury', label: 'Luxury', cities: ['Dubai', 'Monaco', 'Beverly Hills', 'St. Moritz', 'Ibiza'] },
    { key: 'rustic', label: 'Rustic', cities: ['Cotswolds', 'Tuscany', 'Vermont', 'Bavaria', 'Provence'] },
    { key: 'countryside', label: 'Countryside', cities: ['Yorkshire', 'Loire Valley', 'Douro Valley', 'Napa Valley', 'Cotswolds'] },
    { key: 'lakeside', label: 'Lakeside', cities: ['Lake Como', 'Lake Tahoe', 'Lake Geneva', 'Lake Bled', 'Lake Louise'] },
    { key: 'desert', label: 'Desert', cities: ['Marrakech', 'Palm Springs', 'Wadi Rum', 'Sahara', 'Scottsdale'] },
    { key: 'island', label: 'Island', cities: ['Fiji', 'Seychelles', 'Bora Bora', 'Capri', 'Zanzibar'] },
    { key: 'ski', label: 'Ski', cities: ["Whistler", "St. Anton", "Val d'Isere", 'Niseko', 'Park City'] },
];

const SUFFIXES = ['Hotel', 'Resort', 'Retreat', 'Lodge', 'Villa'];
const HOSTS = ['Amara Reyes', 'James Whitfield', 'Sofia Marchetti', 'Kenji Watanabe', 'Elena Kovac'];
const AMENITIES_POOL = [
    'Free Wifi', 'Swimming Pool', 'Free Parking', 'Fitness Center', 'Spa',
    'Restaurant', 'Bar', 'Air Conditioning', 'Room Service', 'Pet Friendly',
];

function buildHotels(ownerId) {
    const hotels = [];
    let globalIndex = 0;

    for (const { key, label, cities } of CATEGORIES) {
        for (let i = 0; i < 5; i++) {
            const city = cities[i];
            const suffix = SUFFIXES[i % SUFFIXES.length];
            const rent = 90 + globalIndex * 7;
            const img1 = img(IMAGE_IDS[(globalIndex * 2) % IMAGE_IDS.length]);
            const img2 = img(IMAGE_IDS[(globalIndex * 2 + 1) % IMAGE_IDS.length]);

            hotels.push({
                ownerId,
                title: `${city} ${label} ${suffix}`,
                location: city,
                rent,
                category: key,
                hostName: HOSTS[globalIndex % HOSTS.length],
                guestCapacity: 2 + (globalIndex % 5),
                bedroomCapacity: 1 + (globalIndex % 4),
                bedCapacity: 1 + (globalIndex % 5),
                description: `A handpicked ${label.toLowerCase()} escape in ${city}, offering a comfortable stay with modern amenities and easy access to the area's best attractions.`,
                isOwner: false,
                amenities: [
                    AMENITIES_POOL[globalIndex % AMENITIES_POOL.length],
                    AMENITIES_POOL[(globalIndex + 1) % AMENITIES_POOL.length],
                    AMENITIES_POOL[(globalIndex + 2) % AMENITIES_POOL.length],
                    AMENITIES_POOL[(globalIndex + 3) % AMENITIES_POOL.length],
                ],
                images: [img1, img2],
                serviceFee: Math.round(rent * 0.1),
                cleaningFee: Math.round(rent * 0.15),
            });

            globalIndex++;
        }
    }

    return hotels;
}

async function seedHotels() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_CONNECTION_STRING environment variable is not set');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const admin = await User.findOne({ email: 'admin@gmail.com' });
        if (!admin) {
            throw new Error('Admin user not found - run seed-users.js first');
        }

        const hotels = buildHotels(admin._id);

        let created = 0;
        let updated = 0;
        for (const hotel of hotels) {
            const result = await Hotel.updateOne(
                { title: hotel.title, location: hotel.location },
                { $set: hotel },
                { upsert: true }
            );
            if (result.upsertedCount > 0) created++;
            else updated++;
        }

        console.log(`\nSeed completed! Created: ${created}, Updated: ${updated}, Total: ${hotels.length}`);
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedHotels();
