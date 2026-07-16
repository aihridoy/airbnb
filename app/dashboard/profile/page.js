import React from "react";
import { getAllHotels, getBookings, getWishlists, session } from "../../action";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, Calendar, Heart, CalendarCheck, Building2, Plus } from "lucide-react";

const Profile = async () => {
  const authResult = await session();

  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  const wishlistsData = await getWishlists();
  const bookingsData = await getBookings();
  const hotelsData = await getAllHotels();

  const wishlists = wishlistsData?.wishlists || [];
  const bookings = bookingsData?.bookings || [];
  const hotels = hotelsData?.hotels || [];

  const filteredWishlists =
    wishlists.length > 0
      ? wishlists.filter((wishlist) => wishlist.userId === authResult?.user?.id)
      : [];

  const filteredBookings =
    bookings.length > 0
      ? bookings.filter((booking) => booking.userId === authResult?.user?.id)
      : [];

  const filteredHotels = hotels.filter(
    (hotel) => String(hotel.ownerId) === String(authResult?.user?.id)
  );

  return (
    <div className="min-h-screen bg-cream">
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-surface rounded-2xl border border-hairline shadow-sm overflow-hidden mb-8">
          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-brass-dark rounded-full flex items-center justify-center shadow-luxe ring-4 ring-cream">
                  <span className="text-cream text-2xl font-serif">
                    {authResult.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-cream flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="mb-3">
                  <h1 className="font-serif text-3xl text-ink mb-2">
                    {authResult.user.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {authResult.user.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {authResult.user.location || "Location not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-alt rounded-full border border-hairline text-sm text-muted">
                  <Calendar className="w-4 h-4 text-brass-dark" />
                  <span>
                    Member since{" "}
                    {new Date(
                      authResult.user.createdAt || Date.now()
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface rounded-2xl border border-hairline p-6 hover:shadow-luxe transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Wishlists</p>
                <p className="text-3xl font-serif text-ink mt-1">
                  {filteredWishlists.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-brass-light/30 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted">
                {filteredWishlists.length === 0
                  ? "No saved properties yet"
                  : "Properties saved for later"}
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-hairline p-6 hover:shadow-luxe transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Bookings</p>
                <p className="text-3xl font-serif text-ink mt-1">
                  {filteredBookings.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-brass-light/30 rounded-lg flex items-center justify-center">
                <CalendarCheck className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted">
                {filteredBookings.length === 0
                  ? "No bookings made yet"
                  : "Total reservations made"}
              </p>
            </div>
          </div>

          <div className="bg-surface rounded-2xl border border-hairline p-6 hover:shadow-luxe transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">My Hotels</p>
                <p className="text-3xl font-serif text-ink mt-1">
                  {filteredHotels.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-brass-light/30 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted">
                {filteredHotels.length === 0
                  ? "No properties listed yet"
                  : "Properties you manage"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface rounded-2xl border border-hairline p-6">
          <h2 className="font-serif text-lg text-ink mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/dashboard/wishlists"
              className="flex items-center p-4 border border-hairline rounded-lg hover:bg-surface-alt transition-colors"
            >
              <div className="w-10 h-10 bg-brass-light/30 rounded-lg flex items-center justify-center mr-3">
                <Heart className="w-5 h-5 text-brass-dark" />
              </div>
              <span className="text-sm font-medium text-ink">
                View Wishlists
              </span>
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex items-center p-4 border border-hairline rounded-lg hover:bg-surface-alt transition-colors"
            >
              <div className="w-10 h-10 bg-brass-light/30 rounded-lg flex items-center justify-center mr-3">
                <CalendarCheck className="w-5 h-5 text-brass-dark" />
              </div>
              <span className="text-sm font-medium text-ink">
                My Bookings
              </span>
            </Link>

            <Link
              href="/dashboard/create-hotel"
              className="flex items-center p-4 border border-hairline rounded-lg hover:bg-surface-alt transition-colors"
            >
              <div className="w-10 h-10 bg-brass-light/30 rounded-lg flex items-center justify-center mr-3">
                <Plus className="w-5 h-5 text-brass-dark" />
              </div>
              <span className="text-sm font-medium text-ink">
                Add New Hotel
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
