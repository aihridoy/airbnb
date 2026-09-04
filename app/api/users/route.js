import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import { User } from "@/models/user-model";
import { redactUsersForDemo } from "@/lib/demo-account";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", success: false },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Fetch all users from the User model
    const users = await User.find({}, "-password").lean(); // Exclude password field for security

    // The demo admin is a public login, so it must never expose real guests'
    // names, email addresses or locations. Redacted server-side: the response
    // itself never carries the values, so nothing leaks through devtools.
    return NextResponse.json(
      { users: redactUsersForDemo(users, session), success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", success: false },
      { status: 500 }
    );
  }
}
