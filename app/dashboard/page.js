import React from "react";
import { getAllHotels, getBookings, getWishlists, session } from "../action";
import Link from "next/link";
import {
  FaHotel,
  FaPlusSquare,
  FaClipboardList,
  FaHeart,
  FaCalendarCheck,
} from "react-icons/fa";
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
          Icon: FaHotel,
          bg: "bg-blue-50 hover:bg-blue-100",
          text: "text-blue-600",
        },
        {
          label: "View All Bookings",
          path: "/dashboard/bookings-list",
          Icon: FaClipboardList,
          bg: "bg-green-50 hover:bg-green-100",
          text: "text-green-600",
        },
        {
          label: "View All Wishlists",
          path: "/dashboard/wishlists-list",
          Icon: FaHeart,
          bg: "bg-red-50 hover:bg-red-100",
          text: "text-red-600",
        },
      ]
    : [
        {
          label: "Add New Hotel",
          path: "/dashboard/create-hotel",
          Icon: FaPlusSquare,
          bg: "bg-blue-50 hover:bg-blue-100",
          text: "text-blue-600",
        },
        {
          label: "View My Bookings",
          path: "/dashboard/bookings",
          Icon: FaCalendarCheck,
          bg: "bg-green-50 hover:bg-green-100",
          text: "text-green-600",
        },
        {
          label: "View My Wishlists",
          path: "/dashboard/wishlists",
          Icon: FaHeart,
          bg: "bg-red-50 hover:bg-red-100",
          text: "text-red-600",
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isAdmin ? "Admin Dashboard" : "My Dashboard"}
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {userName}! Here&#39;s your overview.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? "Total Hotels" : "My Hotels"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalHotels}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">
                +12% from last month
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? "Total Bookings" : "My Bookings"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalBookings}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">
                +8% from last month
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? "Total Wishlists" : "My Wishlists"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalWishlists}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-red-600">-2% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {isAdmin ? "Total Revenue" : "My Expenditure"}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">
                +15% from last month
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Bookings Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Bookings
            </h3>
            <div className="h-64">
              {bookingChartData.length > 0 ? (
                <ChartComponent 
                  type="bar" 
                  data={bookingChartData} 
                  dataKey="bookings"
                  xAxisKey="month"
                  color="#3B82F6"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <p className="text-gray-600">No booking data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hotel Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                    <p className="text-gray-600">No hotel data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isAdmin ? "Revenue Trend" : "Expenditure Trend"}
          </h3>
          <div className="h-64">
            {revenueChartData.length > 0 ? (
              <ChartComponent 
                type="line" 
                data={revenueChartData} 
                dataKey="amount"
                xAxisKey="month"
                color="#F59E0B"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <p className="text-gray-600">No revenue data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Bookings Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Bookings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Hotel
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Guests
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Amount
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-3 text-sm text-gray-900">
                          {booking.bookingDetails?.title || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {booking.bookingDetails?.guests || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-900">
                          ${booking.totalPrice || 0}
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-gray-500">
                        No recent bookings
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Hotels Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isAdmin ? "Top Hotels" : "My Hotels"}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Hotel
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Location
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Rent
                    </th>
                    <th className="p-3 text-sm font-medium text-gray-700">
                      Capacity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHotels.slice(0, 5).map((hotel, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 text-sm text-gray-900">
                        {hotel.title || "N/A"}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {hotel.location || "N/A"}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        ${hotel.rent || 0}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {hotel.guestCapacity || 0} guests
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
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