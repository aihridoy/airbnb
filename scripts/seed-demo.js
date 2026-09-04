/**
 * Seeds (or repairs) the two public demo accounts.
 *
 *   npm run seed:demo
 *
 * Idempotent: run it as often as you like. It upserts by email, always resets
 * the password to the published one, and always re-asserts role and isDemo, so
 * a poked-at demo account can be restored without touching anything else.
 *
 * Separate from seed-users.js, which creates development fixtures on real
 * gmail.com addresses. Public credentials should never point at a domain
 * somebody else owns, so these live on a non-routable one.
 *
 * The passwords are intentionally public. What makes that safe is the
 * server-side rules in lib/demo-guard.js and lib/demo-account.js, not secrecy.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const DEMO_ADMIN_EMAIL = "admin@demo.staybnb";
const DEMO_GUEST_EMAIL = "guest@demo.staybnb";
const DEMO_PASSWORD = "demo1234";

const accounts = [
  { name: "Demo Admin", email: DEMO_ADMIN_EMAIL, role: "admin", location: "Sylhet, Bangladesh" },
  { name: "Demo Guest", email: DEMO_GUEST_EMAIL, role: "user", location: "Sylhet, Bangladesh" },
];

async function main() {
  const uri = process.env.MONGODB_CONNECTION_STRING || process.env.MONGODB_URI;
  if (!uri) {
    console.error("No Mongo connection string found.");
    console.error("Expected MONGODB_CONNECTION_STRING (or MONGODB_URI) in .env or .env.local.");
    process.exit(1);
  }

  await mongoose.connect(uri, { maxPoolSize: 5 });

  // Loose schema on purpose: this script only needs the handful of fields it
  // writes, and must not fall out of step with the app's model over time.
  const User =
    mongoose.models.users ??
    mongoose.model("users", new mongoose.Schema({}, { strict: false, collection: "users" }));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const account of accounts) {
    const result = await User.updateOne(
      { email: account.email },
      {
        $set: {
          name: account.name,
          email: account.email,
          location: account.location,
          password: passwordHash,
          role: account.role,
          isDemo: true,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    const action = result.upsertedCount ? "created" : "updated";
    console.log(`${action.padEnd(7)} ${account.role.padEnd(5)} ${account.email}`);
  }

  console.log(`\nPassword for both: ${DEMO_PASSWORD}`);
  console.log("Demo admin is read-only.");
  console.log("Demo guest can browse, book and use its wishlist, but cannot edit hotels or post reviews.");

  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
