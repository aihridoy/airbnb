import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { User } from "@/models/user-model";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Extract user ID from params
    const { id } = params;

    // Fetch user by ID from the User model
    const user = await User.findById(id, "-password"); // Exclude password field for security

    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "User not found", success: false },
        { status: 404 }
      );
    }

    // Return the user as JSON
    return NextResponse.json({ user, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user", success: false },
      { status: 500 }
    );
  }
}