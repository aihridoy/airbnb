import { NextResponse } from "next/server";
import { DEMO_WRITE_BLOCKED, isDemoSession } from "./demo-account";

/**
 * Refuse a write from a shared demo account.
 *
 * Returns a NextResponse to send back, or null when the request may proceed,
 * so routes read as:
 *
 *   const denied = denyDemoWrite(session, DEMO_REVIEW_BLOCKED);
 *   if (denied) return denied;
 *
 * Callers handle authentication themselves first — this only answers "is this
 * a demo account trying to change something shared".
 */
export function denyDemoWrite(session, message = DEMO_WRITE_BLOCKED) {
  if (isDemoSession(session)) {
    return NextResponse.json({ message, success: false }, { status: 403 });
  }
  return null;
}
