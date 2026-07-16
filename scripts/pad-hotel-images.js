/* eslint-disable no-console */
// One-time migration: ensure every hotel has exactly 5 images. Hotels with
// fewer are padded from a category-appropriate stock pool (skipping any URL
// the hotel already uses). Idempotent - re-running changes nothing once all
// hotels have >= 5 images.
//
// Usage:
//   node scripts/pad-hotel-images.js          # dry run (reports only)
//   node scripts/pad-hotel-images.js --write   # actually update the DB
//
// Reads MONGODB_CONNECTION_STRING from .env.local.

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

// Minimal .env.local loader (no dotenv dependency).
const envPath = path.join(__dirname, "..", ".env.local");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const Hotel = require("../models/hotel-model");

const TARGET = 5;
const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// Curated, verified Unsplash shots grouped loosely by vibe. Each hotel draws
// from its category list first, then the shared pool, until it reaches 5.
const CATEGORY_POOL = {
  beach: ["1507525428034-b723cf961d3e", "1519046904884-53103b34b206", "1520250497591-112f2f40a3f4"],
  island: ["1439066615861-d1af74d74000", "1505881502353-a1986add3762", "1573843981267-be1999ff37cd"],
  lakeside: ["1439066615861-d1af74d74000", "1470071459604-3b5ec3a7fe05", "1501785888041-af3ef285b470"],
  mountain: ["1464822759023-fed622ff2c3b", "1506905925346-21bda4d32df4", "1454496522488-7a8e488e8606"],
  ski: ["1551524559-8af4e6624178", "1548013146-72479768bada", "1517299321609-52687d1bc55a"],
  desert: ["1509316785289-025f5b846b35", "1473580044384-7ba9967e16a0", "1542401886-65d6c61db217"],
  urban: ["1522708323590-d24dbb6b0267", "1502672260266-1c1ef2d93688", "1560448204-e02f11c3d0e2"],
  luxury: ["1566073771259-6a8506099945", "1582719478250-c89cae4dc85b", "1596394516093-501ba68a0ba6"],
  rustic: ["1470770841072-f978cf4d019e", "1449158743715-0a90ebb6d2d8", "1518732714860-b62714ce0c59"],
  countryside: ["1469474968028-56623f02e42e", "1501785888041-af3ef285b470", "1472396961693-142e6e269027"],
};

// Shared fallback pool (distinct hotel/interior shots) for any gaps.
const BASE_POOL = [
  "1566073771259-6a8506099945",
  "1571896349842-33c89424de2d",
  "1618773928121-c32242e63f39",
  "1611892440504-42a792e24d32",
  "1512918728675-ed5a9ecdebfd",
  "1540541338287-41700207dee6",
  "1445019980597-93fa8acb246c",
  "1551882547-ff40c63fe5fa",
];

async function main() {
  const write = process.argv.includes("--write");
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);

  const hotels = await Hotel.find({}, { images: 1, category: 1, title: 1 });
  let padded = 0;

  for (const hotel of hotels) {
    const current = Array.isArray(hotel.images) ? [...hotel.images] : [];
    if (current.length >= TARGET) continue;

    const candidates = [
      ...(CATEGORY_POOL[hotel.category] || []),
      ...BASE_POOL,
    ].map(u);

    const seen = new Set(current);
    for (const url of candidates) {
      if (current.length >= TARGET) break;
      if (seen.has(url)) continue;
      current.push(url);
      seen.add(url);
    }

    console.log(
      `${write ? "UPDATE" : "WOULD PAD"}: "${hotel.title}" (${hotel.category}) ${hotel.images?.length || 0} -> ${current.length}`
    );
    padded++;

    if (write) {
      hotel.images = current;
      await hotel.save();
    }
  }

  console.log(
    `\n${padded} hotel(s) ${write ? "updated" : "would be padded"} out of ${hotels.length}.`
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
