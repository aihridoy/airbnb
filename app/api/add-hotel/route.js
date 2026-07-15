import { NextResponse } from "next/server";
import { dbConnect } from "@/service/mongo";
import { auth } from "@/auth";
import Hotel from "@/models/hotel-model";
import mongoose from "mongoose";

const ALLOWED_CATEGORIES = [
  "urban",
  "beach",
  "mountain",
  "luxury",
  "rustic",
  "countryside",
  "lakeside",
  "desert",
  "island",
  "ski",
];

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.formData();

    const category = body.get("category") || "urban";
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          message: `Invalid category. Allowed: ${ALLOWED_CATEGORIES.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    const rent = parseFloat(body.get("rent"));
    const guestCapacity = parseInt(body.get("guestCapacity"), 10);
    const bedroomCapacity = parseInt(body.get("bedroomCapacity"), 10);
    const bedCapacity = parseInt(body.get("bedCapacity"), 10);
    const serviceFee = parseFloat(body.get("serviceFee"));
    const cleaningFee = parseFloat(body.get("cleaningFee"));

    if (
      [rent, guestCapacity, bedroomCapacity, bedCapacity, serviceFee, cleaningFee].some(
        (n) => Number.isNaN(n)
      )
    ) {
      return NextResponse.json(
        { message: "rent, guestCapacity, bedroomCapacity, bedCapacity, serviceFee and cleaningFee must be valid numbers" },
        { status: 400 }
      );
    }

    const hotelData = {
      ownerId: mongoose.Types.ObjectId.createFromHexString(session.user.id),
      title: body.get("title"),
      location: body.get("location"),
      rent,
      hostName: body.get("hostName"),
      guestCapacity,
      bedroomCapacity,
      bedCapacity,
      description: body.get("description"),
      category,
      amenities: JSON.parse(body.get("amenities") || "[]"),
      images: body.getAll("images[]") || [],
      serviceFee,
      cleaningFee,
    };
    const newHotel = new Hotel(hotelData);
    await newHotel.save();
    return NextResponse.json(
      {
        message: "Hotel added successfully",
        hotel: newHotel,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST request:", error);
    return NextResponse.json(
      {
        message: "Failed to add hotel",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
