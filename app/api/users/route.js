import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { User } from "@/models/user-model";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Fetch all users from the User model
    const users = await User.find({}, "-password"); // Exclude password field for security

    // Return the users as JSON
    return NextResponse.json({ users, success: true }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", success: false },
      { status: 500 }
    );
  }
}
