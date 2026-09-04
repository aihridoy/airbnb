/**
 * Public demo accounts.
 *
 * The booking flow and the admin dashboards are the parts of this project
 * worth showing, and both sit behind a signup. Two seeded accounts open them
 * up, under two constraints: neither may damage real data, and neither may
 * expose anyone's personal details.
 *
 * The rules, kept in one place so the routes and the UI cannot drift apart:
 *
 *   demo admin   reads every dashboard, writes nothing
 *   demo guest   browses and books, and can manage its own wishlist, because
 *                walking the booking flow end to end is the whole point.
 *                It cannot alter the hotel catalogue or post reviews, both of
 *                which are public and shared.
 *
 * Accounts are identified by an isDemo flag on the user document rather than a
 * hardcoded email, so they can be renamed without touching authorisation.
 */

export const DEMO_ADMIN_EMAIL = "admin@demo.staybnb";
export const DEMO_GUEST_EMAIL = "guest@demo.staybnb";

// Deliberately public — the accounts exist to be used by strangers. What makes
// that safe is the server-side rules, not this being secret. Keep in step with
// scripts/seed-demo.js.
export const DEMO_PASSWORD = "demo1234";

export const DEMO_WRITE_BLOCKED =
  "This is a shared demo account. Create your own account to make changes.";

export const DEMO_CATALOGUE_BLOCKED =
  "Editing hotels is disabled for the demo account — the catalogue is shared by everyone exploring the site.";

export const DEMO_REVIEW_BLOCKED =
  "Reviews are disabled for the demo account because they appear publicly on hotel pages.";

/** True when the signed-in session belongs to one of the seeded demo accounts. */
export function isDemoSession(session) {
  return session?.user?.isDemo === true;
}

/**
 * Mask an email for display: keeps the first character and the top-level
 * domain, so a reviewer sees the column is populated and correctly shaped
 * without learning who anyone is.
 *
 *   alice@gmail.com -> a••••@•••••.com
 */
export function maskEmail(email) {
  const value = String(email ?? "");
  const at = value.indexOf("@");
  if (at < 1) return "•••••";

  const localRest = "•".repeat(Math.max(at - 1, 1));
  const domain = value.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  const tld = dot > -1 ? domain.slice(dot) : "";
  const host = "•".repeat(Math.max((dot > -1 ? domain.slice(0, dot) : domain).length, 1));

  return `${value[0]}${localRest}@${host}${tld}`;
}

/** "Ada Lovelace" -> "A. L." */
export function maskName(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Guest";
  return parts.map((p) => `${p[0].toUpperCase()}.`).join(" ");
}

/**
 * Redact a user record for a demo viewer.
 *
 * Location is masked too: "Sylhet, Bangladesh" against a masked name is still
 * a meaningful clue about who someone is, and the demo admin has no reason to
 * need it.
 */
export function redactUserForDemo(user) {
  return {
    ...user,
    name: maskName(user?.name),
    email: maskEmail(user?.email),
    ...(user?.location === undefined ? {} : { location: "•••••" }),
  };
}

export function redactUsersForDemo(users, session) {
  if (!isDemoSession(session)) return users;
  return (users ?? []).map(redactUserForDemo);
}
