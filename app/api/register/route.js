import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            location,
            role,
        });

        const { password: _password, ...userWithoutPassword } = newUser.toObject();

        return NextResponse.json(
            { message: "User registered successfully", user: userWithoutPassword },
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
