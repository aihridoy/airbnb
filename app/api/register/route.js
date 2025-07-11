import { NextResponse } from "next/server";
import { User } from "@/models/user-model";
import { dbConnect } from "@/service/mongo";

export async function POST(req) {
    try {
        await dbConnect();

        const { name, email, password, location, role = "user" } = await req.json();

        // Validate required fields only (role is optional with default)
        if (!name || !email || !password || !location) {
            return NextResponse.json(
                { message: "Name, email, password, and location are required" },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }

        const newUser = await User.create({
            name,
            email,
            password,
            location,
            role
        });

        return NextResponse.json(
            { message: "User registered successfully", user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error during registration:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}