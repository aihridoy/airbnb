import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/service/mongo";
import { User } from "@/models/user-model";
import { redactUsersForDemo } from "@/lib/demo-account";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", success: false },
        { status: 401 }
      );
    }

    // Extract user ID from params
    const { id } = params;

    if (session.user.role !== "admin" && session.user.id !== id) {
      return NextResponse.json(
        { error: "Forbidden", success: false },
        { status: 403 }
      );
    }

    // Connect to MongoDB
    await dbConnect();

    // Fetch user by ID from the User model
    const user = await User.findById(id, "-password").lean(); // Exclude password field for security

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // A demo admin may look at any profile, but never at the real person
    // behind it. Its own record is left readable so the account still makes
    // sense when it opens its own profile page.
    const isOwnRecord = session.user.id === id;
    return NextResponse.json(
      {
        user: isOwnRecord ? user : redactUsersForDemo([user], session)[0],
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", success: false },
      { status: 500 }
    );
  }
}
