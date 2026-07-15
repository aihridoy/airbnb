import Navbar from "@/components/Navbar";
import React from "react";
import { getAllHotels, getReviews, session } from "../action";
import Link from "next/link";
import ManageHotelList from "@/components/ManageHotelList";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

export default async function ManageHotel() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  const { user } = authResult;
  const { hotels } = await getAllHotels();
  const { reviews } = await getReviews();
  const filteredHotels = hotels.filter(
    (hotel) => String(hotel.ownerId) === String(user.id)
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        <div className="max-w-7xl mx-auto px-4 pb-8 pt-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="font-serif text-3xl text-ink">Manage Hotels</h1>
            <Link
              href="/add-hotel"
              className="flex items-center gap-1 bg-brass-dark text-cream px-4 py-2 rounded-lg hover:bg-brass transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Hotel
            </Link>
          </div>
          <ManageHotelList filteredHotels={filteredHotels} reviews={reviews} />
        </div>
      </div>
    </>
  );
}
