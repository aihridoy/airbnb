import { auth } from "@/auth";
import { isDemoSession } from "@/lib/demo-account";

/**
 * Explains why the dashboard's controls refuse to do anything.
 *
 * Without this a reviewer clicks Delete, gets an error toast, and reasonably
 * concludes the app is broken. The server-side guard is the actual control;
 * this is so the refusal reads as intentional.
 */
export default async function DemoBanner() {
  const session = await auth();
  if (!isDemoSession(session)) return null;

  const isAdmin = session.user.role === "admin";

  return (
    <div className="border-b border-brass/40 bg-brass/10 px-4 py-3 text-sm text-ink">
      <div className="mx-auto flex max-w-6xl items-start gap-3">
        <span aria-hidden="true" className="mt-0.5">
          👀
        </span>
        <p>
          <span className="font-semibold">Demo account.</span>{" "}
          {isAdmin
            ? "Browse every dashboard freely — editing hotels and removing reviews are disabled, and guest names, emails and locations are masked."
            : "Browse and book as much as you like. Editing hotels and posting reviews are disabled on the shared demo account."}
        </p>
      </div>
    </div>
  );
}
