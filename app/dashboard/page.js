import React from "react";
import { getAllHotels, getBookings, getWishlists, session } from "../action";
import Link from "next/link";
import {
  Hotel,
  PlusSquare,
  ClipboardList,
  Heart,
  CalendarCheck,
  DollarSign,
  BarChart3,
  PieChart,
} from "lucide-react";
import ChartComponent from "@/components/Chart";

const Dashboard = async () => {
  const auth = await session();
  const isAdmin = auth?.user?.role === "admin";
  const userId = auth?.user?.id;
  const userName = auth?.user?.name;

  // Fetch all data
  const { hotels } = await getAllHotels();
  const { bookings } = await getBookings();
  const { wishlists } = await getWishlists();

  // quick action config:
  const quickActions = isAdmin
    ? [
        {
          label: "View All Hotels",
          path: "/dashboard/hotels-list",
          Icon: Hotel,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
        {
          label: "View All Bookings",
          path: "/dashboard/bookings-list",
          Icon: ClipboardList,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
        {
          label: "View All Wishlists",
          path: "/dashboard/wishlists-list",
          Icon: Heart,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
      ]
    : [
        {
          label: "Add New Hotel",
          path: "/dashboard/create-hotel",
          Icon: PlusSquare,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
        {
          label: "View My Bookings",
          path: "/dashboard/bookings",
          Icon: CalendarCheck,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
        {
          label: "View My Wishlists",
          path: "/dashboard/wishlists",
          Icon: Heart,
          bg: "bg-brass-light/20 hover:bg-brass-light/30",
          text: "text-brass-dark",
        },
      ];

  // Filter data based on user role
  const filteredHotels = isAdmin
    ? hotels
    : hotels.filter((hotel) => String(hotel.ownerId) === String(userId));
  const filteredBookings = isAdmin
    ? bookings
    : bookings.filter((booking) => String(booking.userId) === String(userId));
  const filteredWishlists = isAdmin
    ? wishlists
    : wishlists.filter((wishlist) => String(wishlist.userId) === String(userId));

  // Calculate metrics
  const totalHotels = filteredHotels.length;
  const totalBookings = filteredBookings.length;
  const totalWishlists = filteredWishlists.length;
  const totalRevenue = filteredBookings.reduce(
    (sum, booking) => sum + (booking.totalPrice || 0),
    0
  );

  // Prepare chart data
  const monthlyBookings = filteredBookings.reduce((acc, booking) => {
    const month = new Date(booking.createdAt || booking.bookingDetails?.checkInDate).toLocaleString(
      "default",
      { month: "short" }
    );
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const bookingChartData = Object.entries(monthlyBookings).map(
    ([month, count]) => ({
      month,
      bookings: count,
    })
  );

  const hotelStatusData = filteredHotels.reduce((acc, hotel) => {
    const status = hotel.status || "active";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(hotelStatusData).map(
    ([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  // Revenue trend data
  const revenueByMonth = filteredBookings.reduce((acc, booking) => {
    const month = new Date(booking.createdAt || booking.bookingDetails?.checkInDate).toLocaleString(
      "default",
      { month: "short" }
    );
    acc[month] = (acc[month] || 0) + (booking.totalPrice || 0);
    return acc;
  }, {});

  const revenueChartData = Object.entries(revenueByMonth).map(
    ([month, amount]) => ({
      month,
      amount,
    })
  );

  // Recent bookings for table
  const recentBookings = filteredBookings
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-cream">
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-ink">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-muted mt-2">
            Welcome back, {userName}! Here&#39;s your overview.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  {isAdmin ? "Total Hotels" : "My Hotels"}
                </p>
                <p className="text-2xl font-serif text-ink">
                  {totalHotels}
                </p>
              </div>
              <div className="p-3 bg-brass-light/20 rounded-full">
                <Hotel className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  {isAdmin ? "Total Bookings" : "My Bookings"}
                </p>
                <p className="text-2xl font-serif text-ink">
                  {totalBookings}
                </p>
              </div>
              <div className="p-3 bg-brass-light/20 rounded-full">
                <CalendarCheck className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  {isAdmin ? "Total Wishlists" : "My Wishlists"}
                </p>
                <p className="text-2xl font-serif text-ink">
                  {totalWishlists}
                </p>
              </div>
              <div className="p-3 bg-brass-light/20 rounded-full">
                <Heart className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">
                  {isAdmin ? "Total Revenue" : "My Expenditure"}
                </p>
                <p className="text-2xl font-serif text-ink">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-brass-light/20 rounded-full">
                <DollarSign className="w-6 h-6 text-brass-dark" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Bookings Chart */}
          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">
              Monthly Bookings
            </h3>
            <div className="h-64">
              {bookingChartData.length > 0 ? (
                <ChartComponent
                  type="bar"
                  data={bookingChartData}
                  dataKey="bookings"
                  xAxisKey="month"
                  color="#2a78d6"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-surface-alt rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto text-muted mb-4" />
                    <p className="text-muted">No booking data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hotel Status Distribution */}
          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">
              Hotel Status Distribution
            </h3>
            <div className="h-64">
              {pieChartData.length > 0 ? (
                <ChartComponent
                  type="pie"
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-surface-alt rounded-lg">
                  <div className="text-center">
                    <PieChart className="w-12 h-12 mx-auto text-muted mb-4" />
                    <p className="text-muted">No hotel data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-surface p-6 rounded-2xl border border-hairline mb-8">
          <h3 className="text-lg font-semibold text-ink mb-4">
            {isAdmin ? "Revenue Trend" : "Expenditure Trend"}
          </h3>
          <div className="h-64">
            {revenueChartData.length > 0 ? (
              <ChartComponent
                type="line"
                data={revenueChartData}
                dataKey="amount"
                xAxisKey="month"
                color="#eb6834"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-surface-alt rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted mb-4" />
                  <p className="text-muted">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Bookings Table */}
          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">
              Recent Bookings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-alt">
                  <tr>
                    <th className="p-3 text-sm font-medium text-ink">
                      Hotel
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Guests
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Amount
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr key={booking._id} className="border-t border-hairline">
                        <td className="p-3 text-sm text-ink">
                          {booking.bookingDetails?.title || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          {booking.bookingDetails?.guests || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-ink">
                          ${booking.totalPrice || 0}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-muted">
                        No recent bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Hotels Table */}
          <div className="bg-surface p-6 rounded-2xl border border-hairline">
            <h3 className="text-lg font-semibold text-ink mb-4">
              {isAdmin ? "Top Hotels" : "My Hotels"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-alt">
                  <tr>
                    <th className="p-3 text-sm font-medium text-ink">
                      Hotel
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Location
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Rent
                    </th>
                    <th className="p-3 text-sm font-medium text-ink">
                      Capacity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.length > 0 ? (
                    filteredHotels.slice(0, 5).map((hotel) => (
                      <tr key={hotel._id} className="border-t border-hairline">
                        <td className="p-3 text-sm text-ink">
                          {hotel.title || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          {hotel.location || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          ${hotel.rent || 0}
                        </td>
                        <td className="p-3 text-sm text-muted">
                          {hotel.guestCapacity || 0} guests
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-muted">
                        No hotels found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface p-6 rounded-2xl border border-hairline">
          <h3 className="text-lg font-semibold text-ink mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map(({ label, path, Icon, bg, text }) => (
              <Link
                key={label}
                href={path}
                className={`flex items-center justify-center p-4 rounded-lg transition-colors ${bg}`}
              >
                <Icon className={`w-5 h-5 mr-2 ${text}`} />
                <span className={`${text} font-medium`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;