# Hotel Redesign — Phase 6: Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the admin/host dashboard — sidebar, overview page, charts, and every `app/dashboard/*` sub-route — to the luxury-minimal design system. Fix the `HotelsListManage.jsx`/`ManageHotelList.jsx` duplicate flagged at the end of Phase 5 (the dashboard's `HotelSearch.jsx` was silently pointed at the stale, un-restyled copy). Fix the same premature-form-submit bug in `app/dashboard/create-hotel/page.js` that Phase 5 fixed in `app/add-hotel/page.js` (these are two separate files with identical code, not shared). Remove fabricated trend percentages on the dashboard overview and two live-but-non-functional buttons on the dashboard profile page.

## Corrections to the Spec's Phase 6 File List

1. **`components/Create.jsx` does NOT belong in this phase — it's dead code.** It is not imported anywhere in the app (`grep` across `app/` and `components/` for any import of it returns nothing). It's a static placeholder page with no state, no submit handler, no working "Save" affordance anywhere — a prototype that was superseded by `app/add-hotel/page.js` / `app/dashboard/create-hotel/page.js` and never deleted. This plan does not restyle it (restyling dead code is pure waste); it's flagged as a Phase 8 (Polish) deletion candidate instead.
2. **`components/EditModal.jsx` does NOT belong in this phase — it's Phase 7 (Payment) scope.** Its only consumer is `app/paymentProcess/page.js`, not anything under `app/dashboard/`. It moves to the Phase 7 plan instead.

## Bugs Found While Reading These Files (fixed as part of this phase)

1. **`components/HotelSearch.jsx` imports `ManageHotelList` from `@/components/HotelsListManage`** — the stale, un-restyled duplicate flagged in Phase 5's final review, not from `@/components/ManageHotelList` (the one Phase 5 actually restyled). Since `HotelSearch.jsx` is the component both `app/dashboard/manage-hotels/page.js` and `app/dashboard/hotels-list/page.js` render for non-admin users, every non-admin dashboard hotel list has been rendering the old Font-Awesome-icon, pre-luxury-token version this whole time, regardless of Phase 5 having "restyled" `ManageHotelList.jsx`. Fixed in Task 10 by repointing the import and deleting `components/HotelsListManage.jsx` entirely (its only consumer was this one wrong import).
2. **`app/dashboard/create-hotel/page.js` has the exact same bug Phase 5 fixed in `app/add-hotel/page.js`**: all 9 per-field "Save" toggle buttons are missing `type="button"`, so clicking any one of them submits the whole form instead of just toggling that field. These are two separate files with duplicated logic (not a shared component), so Phase 5's fix to the other file did not touch this one. Fixed in Task 12.
3. **`app/dashboard/page.js` shows four fabricated trend percentages** ("+12% from last month", "+8% from last month", "-2% from last month", "+15% from last month") under the stat cards — hardcoded strings with no backing computation anywhere in the codebase (no previous-period query, no stored history). This is presented as real analytics to hosts/admins making business decisions, which is worse than Phase 2's fake countdown timer (already removed as a dark pattern) since here it's fabricated *data*, not just fabricated urgency copy. Fixed in Task 2 by removing all four lines rather than either building real trend computation (out of scope — there's no historical data source to compute it from) or leaving fabricated numbers in place.
4. **`app/dashboard/profile/page.js` has two live buttons with no `onClick` at all**: "Edit Profile" and "Settings". Unlike Phase 5's `app/profile/[id]/page.js` (which had the *same* block but only as dead commented-out code), here the buttons actually render and are clickable — they just silently do nothing, since neither an edit-profile flow nor a settings page exists anywhere in this app. Fixed in Task 13 by removing them (building the missing features is out of scope for a redesign pass; a dead-end button that looks actionable is worse than no button).

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`. `brass` decorative-only; text/icon contrast uses `brass-dark`.
- No emoji/Font Awesome/react-icons — lucide-react only.
- **Chart colors are validated, not chosen by eye.** Per the `dataviz` skill: the categorical/sequential hex values used in `components/Chart.jsx` and the two `ChartComponent` call sites in `app/dashboard/page.js` come from the skill's pre-validated reference palette (`references/palette.md`), independently re-validated in this session against this app's actual card surface (`#FFFFFF`) with `scripts/validate_palette.js` — all six checks pass (one contrast WARN on 2 of 6 slots, mitigated by Chart.js's built-in legend text labels, which is the documented "relief" for that WARN). Do not substitute different hex values for these slots without re-running the validator.
- **Explicitly OUT OF SCOPE:** the blocking `alert()`/`confirm()` browser dialogs in `components/HotelsList.jsx`'s and `components/HotelsListManage.jsx`'s (deleted, see Task 10) delete flows — same precedent as Phase 5, old-fashioned but not broken, deferred to Phase 8.
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.
- All data-fetching, role-based filtering, redirects, pagination math, and pdf-lib receipt generation are preserved byte-identical in every task — only markup/classes/icons change, plus the specific fixes named above.

---

### Task 1: Restyle `components/Sidebar.jsx` and `app/dashboard/layout.jsx`

**Files:**
- Modify: `components/Sidebar.jsx`
- Modify: `app/dashboard/layout.jsx`

**Interfaces:**
- No exports change — same default exports `Sidebar` and `DashboardLayout`. `isOpen`/`user`/`isAdmin`/`filteredNav`/`toggleSidebar` state and role-filter logic unchanged.

- [ ] **Step 1: Replace `components/Sidebar.jsx`**

```jsx
"use client";

import { session } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Home,
  PlusSquare,
  Hotel,
  ClipboardList,
  Users,
  Heart,
  CalendarCheck,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const auth = await session();
      if (auth && auth.user) setUser(auth.user);
    };
    fetchUser();
  }, []);

  const isAdmin = user?.role === "admin";
  const toggleSidebar = () => setIsOpen(!isOpen);

  const navItems = [
    { name: "Home", icon: Home, path: "/", roles: ["all"] },
    { name: "Add Hotel", icon: PlusSquare, path: "/dashboard/create-hotel", roles: ["all"] },
    { name: "Hotels List", icon: Hotel, path: "/dashboard/hotels-list", roles: ["admin"] },
    { name: "Bookings List", icon: ClipboardList, path: "/dashboard/bookings-list", roles: ["admin"] },
    { name: "Users List", icon: Users, path: "/dashboard/users-list", roles: ["admin"] },
    { name: "Manage Hotels", icon: Hotel, path: "/dashboard/manage-hotels", roles: ["user"] },
    { name: "Profile", icon: UserCircle, path: "/dashboard/profile", roles: ["user"] },
    { name: "Bookings", icon: CalendarCheck, path: "/dashboard/bookings", roles: ["user"] },
    { name: "Wishlists", icon: Heart, path: "/dashboard/wishlists", roles: ["user"] },
    { name: "Logout", icon: LogOut, path: "/api/auth/signout", roles: ["all"] },
  ];

  const filteredNav = navItems.filter(({ roles }) =>
    roles.includes("all") || roles.includes(isAdmin ? "admin" : "user")
  );

  return (
    <div
      className={`bg-ink text-cream h-screen ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col transition-all duration-300 ease-in-out shadow-luxe`}
    >
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none hover:bg-cream/10 p-2 rounded-full transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      <div className="p-4 flex items-center space-x-2 border-b border-cream/10">
        {isOpen && (
          <>
            <div className="w-10 h-10 bg-brass-dark rounded-full flex items-center justify-center text-cream font-serif text-xl">
              A
            </div>
            <span className="font-serif text-xl">AirBnB</span>
          </>
        )}
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNav.map(({ name, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <li key={name}>
                <Link
                  href={path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-brass-dark text-cream font-semibold"
                      : "hover:bg-cream/10"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span>{name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {isOpen && user && (
        <div className="p-4 border-t border-cream/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-brass-dark rounded-full flex items-center justify-center text-cream font-serif">
              {(user?.name || "U").charAt(0)}
            </div>
            <div>
              <p className="font-medium truncate max-w-[10rem]">{user?.name}</p>
              <p className="text-sm text-cream/60 truncate max-w-[10rem]">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
```

- [ ] **Step 2: Replace `app/dashboard/layout.jsx`**

```jsx
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-cream">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "react-icons\|#02877A\|bg-gray-100" components/Sidebar.jsx app/dashboard/layout.jsx
```
Expected:
```
components/Sidebar.jsx:0
app/dashboard/layout.jsx:0
```

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/Sidebar.jsx app/dashboard/layout.jsx
git commit -m "feat: restyle dashboard Sidebar and layout with luxury tokens"
```

---

### Task 2: Restyle `app/dashboard/page.js` (and remove fabricated trend percentages)

**Files:**
- Modify: `app/dashboard/page.js`

**Interfaces:**
- No exports change — same default export `Dashboard` (async server component).
- Consumes `ChartComponent` from `@/components/Chart` (Task 3 of this phase restyles its internals; this task only changes the `color` prop values passed to it).
- **Bug fix:** all four hardcoded "+X% from last month" / "-X% from last month" lines removed (fabricated data, no backing computation exists).
- All data-fetching (`getAllHotels`, `getBookings`, `getWishlists`, `session`), role/filter logic (`isAdmin`, `filteredHotels`/`filteredBookings`/`filteredWishlists`), and chart-data preparation (`monthlyBookings`, `bookingChartData`, `hotelStatusData`, `pieChartData`, `revenueByMonth`, `revenueChartData`, `recentBookings`) are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
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
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "from last month\|react-icons" app/dashboard/page.js
grep -q '"#2a78d6"' app/dashboard/page.js && echo BAR_OK
grep -q '"#eb6834"' app/dashboard/page.js && echo LINE_OK
```
Expected:
```
0
BAR_OK
LINE_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.js
git commit -m "fix: remove fabricated trend percentages from dashboard, restyle to luxury tokens"
```

---

### Task 3: Restyle `components/Chart.jsx` (validated data-viz palette)

**Files:**
- Modify: `components/Chart.jsx`

**Interfaces:**
- No exports change — same default export `ChartComponent`, same `{ type, data, dataKey, xAxisKey, nameKey, color }` props. `chart.js`/`react-chartjs-2` registration and the bar/line/pie branching logic unchanged — only the pie chart's fixed color arrays and the default `color` prop value change, both to the validated hex values documented in the Global Constraints.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ChartComponent = ({ type, data, dataKey, xAxisKey, nameKey, color = '#2a78d6' }) => {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            if (type === 'pie') {
              return `${context.label}: ${context.parsed}`;
            }
            return `${context.dataset.label}: ${context.parsed.y || context.parsed}`;
          }
        }
      }
    },
    scales: type !== 'pie' ? {
      y: {
        beginAtZero: true,
      },
    } : {},
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}`;
          }
        }
      }
    },
  };

  if (type === 'bar') {
    const chartData = {
      labels: data.map(item => item[xAxisKey]),
      datasets: [
        {
          label: 'Bookings',
          data: data.map(item => item[dataKey]),
          backgroundColor: `${color}80`, // Add transparency
          borderColor: color,
          borderWidth: 1,
        },
      ],
    };

    return <Bar data={chartData} options={chartOptions} />;
  }

  if (type === 'line') {
    const chartData = {
      labels: data.map(item => item[xAxisKey]),
      datasets: [
        {
          label: 'Amount ($)',
          data: data.map(item => item[dataKey]),
          borderColor: color,
          backgroundColor: `${color}20`,
          tension: 0.4,
          fill: true,
        },
      ],
    };

    return <Line data={chartData} options={chartOptions} />;
  }

  if (type === 'pie') {
    const chartData = {
      labels: data.map(item => item[nameKey]),
      datasets: [
        {
          data: data.map(item => item[dataKey]),
          backgroundColor: [
            'rgba(42, 120, 214, 0.6)',
            'rgba(27, 175, 122, 0.6)',
            'rgba(237, 161, 0, 0.6)',
            'rgba(0, 131, 0, 0.6)',
            'rgba(74, 58, 167, 0.6)',
            'rgba(227, 73, 72, 0.6)',
          ],
          borderColor: [
            'rgba(42, 120, 214, 1)',
            'rgba(27, 175, 122, 1)',
            'rgba(237, 161, 0, 1)',
            'rgba(0, 131, 0, 1)',
            'rgba(74, 58, 167, 1)',
            'rgba(227, 73, 72, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return <Pie data={chartData} options={pieOptions} />;
  }

  return null;
};

export default ChartComponent;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "3B82F6\|34, 197, 94" components/Chart.jsx
grep -q "2a78d6" components/Chart.jsx && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/Chart.jsx
git commit -m "feat: restyle Chart with validated data-viz palette"
```

---

### Task 4: Restyle `app/dashboard/bookings/page.js` and `app/dashboard/bookings-list/page.js`

**Files:**
- Modify: `app/dashboard/bookings/page.js`
- Modify: `app/dashboard/bookings-list/page.js`

**Interfaces:**
- No exports change. Both remain thin server-component wrappers — `session()`/`getBookings()`/redirect logic and the `BookingDetailsModal` (Phase 5, already restyled) / `BookingsList` (Task 5 of this phase) child-component calls are unchanged.

- [ ] **Step 1: Replace `app/dashboard/bookings/page.js`**

```jsx
import React from "react";
import { getBookings, session } from "../../action";
import { redirect } from "next/navigation";
import BookingDetailsModal from "@/components/BookingDetailsModal";

export default async function Bookings() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  const { user } = authResult;
  const { bookings } = await getBookings();
  const filteredBookings = bookings.filter(
    (booking) => booking.userId === user.id
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-3xl text-ink mb-6">My Bookings</h1>
      <BookingDetailsModal bookings={filteredBookings} />
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/dashboard/bookings-list/page.js`**

```jsx
import React from "react";
import { getBookings, session } from "../../action";
import { redirect } from "next/navigation";
import BookingsList from "@/components/BookingsList";

export default async function Bookings() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }
  const { bookings } = await getBookings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-4 sm:mb-6">Bookings</h1>
      <BookingsList bookings={bookings} />
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "text-3xl font-bold\|font-bold mb-4" app/dashboard/bookings/page.js app/dashboard/bookings-list/page.js
```
Expected:
```
app/dashboard/bookings/page.js:0
app/dashboard/bookings-list/page.js:0
```

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/bookings/page.js app/dashboard/bookings-list/page.js
git commit -m "feat: restyle dashboard bookings wrapper pages with luxury tokens"
```

---

### Task 5: Restyle `components/BookingsList.jsx`

**Files:**
- Modify: `components/BookingsList.jsx`

**Interfaces:**
- No exports change — same default export `BookingsList`, same `{ bookings }` prop.
- Consumes `Pagination` (Phase 3, unchanged import path `./Pagination`).
- The entire `pdf-lib` `downloadReceipt` closure and the per-user `getUserById` fetch-and-cache logic (`users` state, `useEffect`) are preserved byte-identical — this is the admin-wide bookings table, showing a customer column that Phase 5's `BookingDetailsModal` didn't need.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Eye, Download, X } from "lucide-react";
import Pagination from "./Pagination";
import { getUserById } from "@/app/action";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingsList = ({ bookings }) => {
  const [users, setUsers] = useState({});
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Get unique user IDs from bookings
        const uniqueUserIds = [
          ...new Set(bookings.map((booking) => booking.userId)),
        ];

        // Fetch all users
        const userPromises = uniqueUserIds.map(async (userId) => {
          try {
            const response = await getUserById(userId);
            return { userId, user: response?.user };
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return { userId, user: null };
          }
        });

        const userResults = await Promise.all(userPromises);

        // Create users object with userId as key
        const usersObject = userResults.reduce((acc, { userId, user }) => {
          acc[userId] = user;
          return acc;
        }, {});

        setUsers(usersObject);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (bookings.length > 0) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [bookings]);

  const bookingsPerPage = 8;
  const totalPages = Math.ceil(bookings.length / bookingsPerPage);

  const paginatedBookings = bookings.slice(
    (currentPage - 1) * bookingsPerPage,
    currentPage * bookingsPerPage
  );

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setModalOpen(false);
  };

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const downloadReceipt = async (booking) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);
    const { width, height } = page.getSize();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(0.95, 0.95, 0.95),
    });

    page.drawText("Reservation Receipt", {
      x: 50,
      y: height - 50,
      size: 20,
      font: boldFont,
      color: rgb(0, 0.4, 0.7),
    });

    let yPos = height - 100;
    const drawDetail = (label, value, bold = false) => {
      const font = bold ? boldFont : helveticaFont;
      page.drawText(label, {
        x: 50,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(value), {
        x: 250,
        y: yPos,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPos -= 20;
    };

    // Get user info for this booking
    const user = users[booking.userId];

    drawDetail("Booking ID:", booking?._id?.slice(0, 8), true);
    drawDetail("Customer Name:", user?.name || "N/A");
    drawDetail("Customer Email:", user?.email || "N/A");
    drawDetail("Customer Location:", user?.location || "N/A");
    drawDetail("Property:", booking?.bookingDetails?.title || "N/A");
    drawDetail("Total Guests:", booking?.bookingDetails?.guests || "N/A");
    drawDetail(
      "Check-in:",
      formatDate(booking?.bookingDetails?.checkInDate) || "N/A"
    );
    drawDetail(
      "Check-out:",
      formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"
    );
    drawDetail("Total Paid:", `$${booking?.totalPrice || "N/A"}`, true);
    drawDetail("Hotel ID:", booking?.hotelId || "N/A");
    drawDetail("User ID:", booking?.userId || "N/A");
    drawDetail(
      "Rating:",
      `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${
        booking?.bookingDetails?.totalReviews
      } review(s))`
    );
    drawDetail("Card Number:", booking?.paymentDetails?.cardNumber || "N/A");
    drawDetail(
      "Billing Address:",
      `${booking?.paymentDetails?.billingAddress?.streetAddress}, ${booking?.paymentDetails?.billingAddress?.city}, ${booking?.paymentDetails?.billingAddress?.state},\n${booking?.paymentDetails?.billingAddress?.zipCode}`
    );

    yPos = 50;
    page.drawText("Thank you for your booking!", {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0, 0.4, 0.7),
    });

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `receipt_${booking?._id}.pdf`;
    link.click();
  };

  // Skeleton Loading Component
  const SkeletonRow = () => (
    <tr className="border-t border-hairline">
      <td className="p-2 sm:p-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-surface-alt rounded-md animate-pulse"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="space-y-2">
          <div className="h-4 bg-surface-alt rounded animate-pulse w-3/4"></div>
          <div className="h-3 bg-surface-alt rounded animate-pulse w-1/2 xl:hidden"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden xl:table-cell">
        <div className="space-y-2">
          <div className="h-4 bg-surface-alt rounded animate-pulse w-2/3"></div>
          <div className="h-3 bg-surface-alt rounded animate-pulse w-1/2"></div>
        </div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-surface-alt rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4 hidden md:table-cell">
        <div className="h-4 bg-surface-alt rounded animate-pulse w-8"></div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-surface-alt rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4 hidden lg:table-cell">
        <div className="h-4 bg-surface-alt rounded animate-pulse w-20"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="h-4 bg-surface-alt rounded animate-pulse w-16"></div>
      </td>
      <td className="p-2 sm:p-4">
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-surface-alt rounded animate-pulse"></div>
          <div className="w-6 h-6 bg-surface-alt rounded animate-pulse"></div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="space-y-4 px-4 sm:px-0">
        <div className="border border-hairline rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-surface-alt">
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Image</th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Property</th>
                <th className="p-2 sm:p-4 hidden xl:table-cell text-xs sm:text-sm">
                  Customer
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Booking Date
                </th>
                <th className="p-2 sm:p-4 hidden md:table-cell text-xs sm:text-sm">
                  Guests
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Check-In
                </th>
                <th className="p-2 sm:p-4 hidden lg:table-cell text-xs sm:text-sm">
                  Check-Out
                </th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Total Cost</th>
                <th className="p-2 sm:p-4 text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <SkeletonRow key={index} />
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 px-4 sm:px-0">
        {paginatedBookings.length > 0 ? (
          <div className="border border-hairline rounded-lg overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Image
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Property
                  </th>
                  <th className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm font-medium">
                    Customer
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Booking Date
                  </th>
                  <th className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm font-medium">
                    Guests
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Check-In
                  </th>
                  <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                    Check-Out
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Total Cost
                  </th>
                  <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking) => {
                  const user = users[booking.userId];
                  return (
                    <tr key={booking._id} className="border-t border-hairline hover:bg-surface-alt">
                      <td className="p-2 sm:p-3">
                        {booking?.bookingDetails?.hotelImage && (
                          <Image
                            width={64}
                            height={64}
                            src={booking.bookingDetails.hotelImage}
                            alt="Property Thumbnail"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                            sizes="(max-width: 640px) 48px, 64px"
                            priority={false}
                          />
                        )}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm">
                        <div className="font-semibold text-ink mb-1 max-w-[200px] truncate">
                          {booking?.bookingDetails?.title || "N/A"}
                        </div>
                        <div className="xl:hidden text-xs text-muted mb-1">
                          Customer: {user?.name || "Loading..."}
                        </div>
                        <div className="lg:hidden text-xs text-muted mb-1">
                          Booked: {formatDate(booking?.createdAt) || "N/A"}
                        </div>
                        <div className="md:hidden text-xs text-muted mb-1">
                          Guests: {booking?.bookingDetails?.guests || "N/A"}
                        </div>
                        <div className="lg:hidden text-xs text-muted mb-1">
                          {formatDate(booking?.bookingDetails?.checkInDate) ||
                            "N/A"}{" "}
                          -{" "}
                          {formatDate(booking?.bookingDetails?.checkOutDate) ||
                            "N/A"}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm text-muted max-w-[150px]">
                        <div className="font-medium text-ink truncate">
                          {user?.name || "Loading..."}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {user?.email || ""}
                        </div>
                        <div className="text-xs text-muted">
                          {user?.location || ""}
                        </div>
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-muted">
                        {formatDate(booking?.createdAt) || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm text-muted">
                        {booking?.bookingDetails?.guests || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-muted">
                        {formatDate(booking?.bookingDetails?.checkInDate) ||
                          "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-muted">
                        {formatDate(booking?.bookingDetails?.checkOutDate) ||
                          "N/A"}
                      </td>
                      <td className="p-2 sm:p-3 text-xs sm:text-sm text-brass-dark font-semibold">
                        ${booking?.totalPrice || "N/A"}
                      </td>
                      <td className="p-2 sm:p-3">
                        <div className="flex space-x-2">
                          <button
                            className="text-brass-dark hover:text-brass text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                            onClick={() => openModal(booking)}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="text-muted hover:text-ink text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                            onClick={() => downloadReceipt(booking)}
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div id="empty-state" className="text-center py-8 sm:py-12">
            <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
              No Bookings Yet
            </h2>
            <p className="text-muted text-sm sm:text-base">
              You made no bookings. Start exploring amazing stays!
            </p>
          </div>
        )}
        {paginatedBookings.length > 0 && (
          <div className="mt-4 sm:mt-6 text-center">
            <Pagination
              handlePageChange={handlePageChange}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
      {isModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="bg-surface border border-hairline shadow-luxe w-full max-w-md sm:max-w-lg rounded-2xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-base sm:text-lg text-ink">
                Booking Details
              </h2>
              <button
                className="text-muted hover:text-ink transition-colors"
                onClick={closeModal}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm sm:text-base">
              {/* Customer Information */}
              <div className="bg-surface-alt p-3 rounded-md mb-4">
                <h3 className="font-semibold text-ink mb-2">
                  Customer Information
                </h3>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Name: </span>
                  {users[selectedBooking.userId]?.name || "Loading..."}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Email: </span>
                  {users[selectedBooking.userId]?.email || "Loading..."}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Location: </span>
                  {users[selectedBooking.userId]?.location || "Loading..."}
                </p>
              </div>

              {/* Booking Information */}
              <div className="bg-surface-alt p-3 rounded-md">
                <h3 className="font-semibold text-ink mb-2">
                  Booking Information
                </h3>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Title: </span>
                  {selectedBooking.bookingDetails.title}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Description: </span>
                  {selectedBooking.bookingDetails.description}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Guests: </span>
                  {selectedBooking.bookingDetails.guests}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Check-In: </span>
                  {formatDate(selectedBooking.bookingDetails.checkInDate)}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Check-Out: </span>
                  {formatDate(selectedBooking.bookingDetails.checkOutDate)}
                </p>
                <p className="text-muted">
                  <span className="font-semibold text-ink">Total Price: </span>$
                  {selectedBooking.totalPrice}
                </p>
              </div>
            </div>
            <button
              className="mt-4 w-full px-4 py-2 text-sm sm:text-base bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BookingsList;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-\|✕" components/BookingsList.jsx
grep -q "getUserById" components/BookingsList.jsx && echo USERS_OK
grep -q "PDFDocument.create" components/BookingsList.jsx && echo PDF_OK
```
Expected:
```
0
USERS_OK
PDF_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/BookingsList.jsx
git commit -m "feat: restyle BookingsList with luxury tokens and lucide icons"
```

---

### Task 6: Restyle `app/dashboard/wishlists/page.js`

**Files:**
- Modify: `app/dashboard/wishlists/page.js`

**Interfaces:**
- No exports change — same default export `WishlistPage`, same `{ searchParams }` prop.
- Consumes `WishlistList` (Task 7 of this phase). All data-fetching/filter logic (`getWishlists`, `getBookings`, `filteredWishlists`, `wishlistNotBooked`) and its own error-fallback branch are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { getBookings, getWishlists, session } from "../../action";
import { redirect } from "next/navigation";
import WishlistList from "@/components/WishlistList";

export default async function WishlistPage({ searchParams }) {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  let wishlistsData, bookingsData;
  try {
    [wishlistsData, bookingsData] = await Promise.all([
      getWishlists(),
      getBookings(),
    ]);
  } catch (error) {
    console.error("Error fetching data:", error);
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
        <div className="text-center py-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-red-500">
            Error loading wishlists
          </h2>
          <p className="text-muted text-sm sm:text-base mt-2">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const wishlists = wishlistsData?.wishlists || [];
  const bookings = bookingsData?.bookings || [];

  const filteredWishlists =
    wishlists.length > 0
      ? wishlists.filter((wishlist) => wishlist.userId === authResult?.user?.id)
      : [];

  const wishlistNotBooked = filteredWishlists.filter(
    (wishlist) =>
      !bookings.some(
        (booking) =>
          booking.hotelId === wishlist.hotelId &&
          booking.userId === authResult?.user?.id
      )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
      <WishlistList wishlistNotBooked={wishlistNotBooked} searchParams={searchParams} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "text-2xl font-bold mb-6" app/dashboard/wishlists/page.js
```
Expected:
```
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/wishlists/page.js
git commit -m "feat: restyle dashboard wishlists wrapper page with luxury tokens"
```

---

### Task 7: Restyle `components/WishlistList.jsx`

**Files:**
- Modify: `components/WishlistList.jsx`

**Interfaces:**
- No exports change — same default export `WishlistList`, same `{ wishlistNotBooked, searchParams }` props.
- Consumes `DeleteWishlistButton` (Phase 5, already restyled) and `Pagination` (Phase 3, already restyled) unchanged. This file already uses `lucide-react` (`MapPin`, `HeartOff`) — only token colors change, no icon-library migration needed here.
- Pagination math (`currentPage`, `totalPages`, `indexOfFirstItem`/`indexOfLastItem`) and the `router.replace`/`router.push` URL-based paging are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";
import Pagination from "@/components/Pagination";
import { MapPin, HeartOff } from "lucide-react";

const WishlistList = ({ wishlistNotBooked, searchParams }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const currentPage = parseInt(searchParams.page || "1", 10);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(wishlistNotBooked.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishlistNotBooked.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    if (currentPage < 1 || currentPage > totalPages) {
      router.replace(`/dashboard/wishlists?page=1`);
      return;
    }

    // Only show loading skeleton if there are items to display
    if (wishlistNotBooked.length > 0) {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    } else {
      // If no items, immediately set loading to false
      setLoading(false);
    }
  }, [currentPage, totalPages, router, wishlistNotBooked.length]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setLoading(true);
    router.push(`/dashboard/wishlists?page=${page}`);
  };

  const skeletonLoader = (
    <div className="border border-hairline rounded-xl overflow-hidden animate-pulse">
      <div className="divide-y divide-hairline">
        {[...Array(itemsPerPage)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:px-6"
          >
            <div className="w-20 h-20 bg-surface-alt rounded-md" />
            <div className="flex-1 space-y-2 w-full">
              <div className="h-6 w-2/3 bg-surface-alt rounded" />
              <div className="h-4 w-1/3 bg-surface-alt rounded" />
            </div>
            <div className="w-24 h-6 bg-surface-alt rounded" />
            <div className="w-16 h-8 bg-surface-alt rounded-lg" />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <div className="inline-flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 bg-surface-alt rounded border border-hairline" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading && wishlistNotBooked.length > 0 ? (
        skeletonLoader
      ) : currentItems.length > 0 ? (
        <>
          <div className="border border-hairline rounded-xl overflow-hidden">
            <div className="divide-y divide-hairline">
              {currentItems.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row items-center sm:items-center py-4 px-4 sm:px-6 gap-4 hover:bg-surface-alt transition"
                >
                  <Link href={`/details/${item.hotelId}`} className="block">
                    {item.images?.[0] ? (
                      <Image
                        src={item.images[0]}
                        alt={item.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-surface-alt rounded-md flex items-center justify-center text-xs text-muted">
                        No Image
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 w-full">
                    <Link href={`/details/${item.hotelId}`} className="block">
                      <h2 className="text-lg font-semibold text-ink line-clamp-1">
                        {item.title}
                      </h2>
                      <div className="text-sm text-muted flex items-center mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {item.location}
                      </div>
                    </Link>
                  </div>

                  <div className="text-lg font-bold text-brass-dark whitespace-nowrap">
                    ${item.rent}
                    <span className="text-sm text-muted font-normal ml-1">/night</span>
                  </div>

                  <div className="ml-2">
                    <DeleteWishlistButton id={item._id} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-surface-alt rounded-xl border border-dashed border-hairline">
          <HeartOff className="w-12 h-12 mx-auto text-brass-dark mb-4" />
          <h2 className="font-serif text-2xl text-ink mb-2">
            No Wishlists Available
          </h2>
          <p className="text-muted text-sm max-w-md mx-auto">
            You haven&apos;t added any hotels to your wishlist yet. Explore hotels and save your favorites!
          </p>
        </div>
      )}
    </>
  );
};

export default WishlistList;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "text-primary\|bg-gray-100\|bg-gray-200" components/WishlistList.jsx
grep -q "MapPin, HeartOff } from \"lucide-react\"" components/WishlistList.jsx && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/WishlistList.jsx
git commit -m "feat: restyle WishlistList with luxury tokens"
```

---

### Task 8: Restyle `app/dashboard/wishlists-list/page.js`

**Files:**
- Modify: `app/dashboard/wishlists-list/page.js`

**Interfaces:**
- No exports change — same default export `WishlistPage` (client component), no props.
- Consumes `DeleteWishlistButton` (Phase 5, already restyled) and `Pagination` (Phase 3, already restyled) unchanged. The `useEffect` data-fetch (`session`, `getWishlists`, `getBookings`, the not-booked filter) and pagination math are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../../action";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Loader2 } from "lucide-react";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";
import Pagination from "@/components/Pagination";

export default function WishlistPage() {
  const [wishlistNotBooked, setWishlistNotBooked] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResult = await session();
        if (!authResult || !authResult.user) {
          redirect("/login");
          return;
        }

        const [wishlistsData, bookingsData] = await Promise.all([
          getWishlists(),
          getBookings(),
        ]);

        const wishlists = wishlistsData?.wishlists || [];
        const bookings = bookingsData?.bookings || [];

        const filteredWishlists = wishlists.length > 0 ? wishlists : [];

        const filteredNotBooked = filteredWishlists.filter(
          (wishlist) =>
            !bookings.some(
              (booking) =>
                booking.hotelId === wishlist.hotelId &&
                booking.userId === authResult?.user?.id
            )
        );

        setWishlistNotBooked(filteredNotBooked);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(wishlistNotBooked.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWishlists = wishlistNotBooked.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-brass-dark" />
          <p className="mt-4 text-muted">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="font-serif text-2xl text-ink mb-6">Wishlists</h1>
      {wishlistNotBooked.length > 0 ? (
        <>
          <div className="border border-hairline rounded-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-alt">
                  <th className="p-4 text-ink">Image</th>
                  <th className="p-4 text-ink">Hotel Name</th>
                  <th className="p-4 text-ink">Location</th>
                  <th className="p-4 text-ink">Price/Night</th>
                  <th className="p-4 text-ink">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentWishlists.map((item) => (
                  <tr key={item._id} className="border-t border-hairline hover:bg-surface-alt">
                    <td className="p-4">
                      {item.images && item.images.length > 0 ? (
                        <Link href={`/details/${item.hotelId}`}>
                          <Image
                            src={item.images[0]}
                            alt={`${item.title} image`}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-md"
                            loading="lazy"
                          />
                        </Link>
                      ) : (
                        <div className="w-20 h-20 bg-surface-alt flex items-center justify-center rounded-md">
                          <span className="text-muted text-sm">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-ink">
                      <Link href={`/details/${item.hotelId}`} className="hover:text-brass-dark">
                        {item.title}
                      </Link>
                    </td>
                    <td className="p-4 text-muted flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {item.location}
                    </td>
                    <td className="p-4 text-brass-dark font-semibold">${item.rent}</td>
                    <td className="p-4">
                      <DeleteWishlistButton id={item._id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          )}

          {/* Results info */}
          <div className="mt-4 text-sm text-muted text-center">
            Showing {startIndex + 1}-{Math.min(endIndex, wishlistNotBooked.length)} of {wishlistNotBooked.length} items
          </div>
        </>
      ) : (
        <div id="empty-state" className="text-center py-12">
          <h2 className="font-serif text-2xl text-ink mb-2">
            No Wishlists Available
          </h2>
          <p className="text-muted text-sm">
            You can add hotels to your wishlist by clicking the button on the
            hotel details page.
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "animate-spin rounded-full h-12 w-12 border-b-2\|bg-gray-100\|bg-gray-300" app/dashboard/wishlists-list/page.js
grep -q "MapPin, Loader2 } from \"lucide-react\"" app/dashboard/wishlists-list/page.js && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/wishlists-list/page.js
git commit -m "feat: restyle dashboard wishlists-list page with luxury tokens"
```

---

### Task 9: Restyle `app/dashboard/manage-hotels/page.js` and `app/dashboard/hotels-list/page.js`

**Files:**
- Modify: `app/dashboard/manage-hotels/page.js`
- Modify: `app/dashboard/hotels-list/page.js`

**Interfaces:**
- No exports change. Both remain thin server-component wrappers around `HotelSearch` (Task 10 of this phase). `manage-hotels` keeps its owner-only `ownerHotels` filter; `hotels-list` keeps its all-hotels (admin) scope. The dead commented-out `<HotelsList filteredHotels={hotels} reviews={reviews} />` line in `hotels-list/page.js` is removed (it was never active — `HotelSearch` was already doing the rendering).

- [ ] **Step 1: Replace `app/dashboard/manage-hotels/page.js`**

```jsx
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { getAllHotels, getReviews, session } from '../../action';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Plus } from 'lucide-react';
import HotelSearch from '@/components/HotelSearch';

export default async function ManageHotel() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect('/login');
  }

  const { user } = authResult;
  const { hotels } = await getAllHotels();
  const { reviews } = await getReviews();

  // only this owner's properties
  const ownerHotels = hotels.filter(
    h => String(h.ownerId) === String(user.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-ink">
          Manage Hotels
        </h1>

        <Link
          href="/dashboard/create-hotel"
          className="flex items-center gap-1 bg-brass-dark text-cream px-4 py-2 rounded-lg hover:bg-brass transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />
          Create Hotel
        </Link>
      </div>
      <HotelSearch hotels={ownerHotels} reviews={reviews} />
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/dashboard/hotels-list/page.js`**

```jsx
/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { getAllHotels, getReviews, session } from '../../action'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import HotelSearch from '@/components/HotelSearch'

export default async function ManageHotel() {
    const authResult = await session();
    if (!authResult || !authResult.user) {
        redirect('/login');
    }

    const { hotels } = await getAllHotels();
    const { reviews } = await getReviews();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-4">
                <h1 className="font-serif text-2xl sm:text-3xl text-ink">Manage Hotels</h1>
                <Link
                    href='/dashboard/create-hotel'
                    className="flex items-center gap-1 bg-brass-dark text-cream px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-brass transition-colors text-sm sm:text-base"
                >
                    <Plus className="w-4 h-4" />
                    Create Hotel
                </Link>
            </div>
            <HotelSearch hotels={hotels} reviews={reviews} />
        </div>
    );
}
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "bg-primary\|HotelsList filteredHotels" app/dashboard/manage-hotels/page.js app/dashboard/hotels-list/page.js
```
Expected:
```
app/dashboard/manage-hotels/page.js:0
app/dashboard/hotels-list/page.js:0
```

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/manage-hotels/page.js app/dashboard/hotels-list/page.js
git commit -m "feat: restyle dashboard manage-hotels and hotels-list wrapper pages"
```

---

### Task 10: Restyle `components/HotelSearch.jsx`, repoint its import, and delete `components/HotelsListManage.jsx`

**Files:**
- Modify: `components/HotelSearch.jsx`
- Delete: `components/HotelsListManage.jsx`

**Interfaces:**
- No exports change for `HotelSearch` — same default export, same `{ hotels, reviews }` props, same role-based `ListComponent` selection (`HotelsList` for admin, `ManageHotelList` for non-admin) and search-filter logic.
- **Bug fix:** the non-admin branch's import moves from `@/components/HotelsListManage` (the stale duplicate, never touched by Phase 5's restyle) to `@/components/ManageHotelList` (the file Phase 5 actually restyled). `components/HotelsListManage.jsx` is deleted entirely — its only consumer was this one wrong import, confirmed by `grep -rl "HotelsListManage" app components` returning only `components/HotelSearch.jsx` before this change.

- [ ] **Step 1: Replace `components/HotelSearch.jsx`**

```jsx
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import ManageHotelList from '@/components/ManageHotelList';
import { session } from '@/app/action';
import HotelsList from './HotelsList';

export default function HotelSearch({ hotels = [], reviews = [] }) {
  const [query, setQuery] = useState('');
  const [user, setUser] = useState(null);

  const role = user?.role;

  useEffect(() => {
      const fetchUser = async () => {
        try {
          const userData = await session();
          if (userData?.user) {
            setUser({
              ...userData.user,
              role: userData.user.role || 'user'
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to fetch user session:", error);
        }
      };

      fetchUser();
    }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return hotels;

    return hotels.filter(hotel =>
      (hotel.title || '').toLowerCase().includes(q) ||
      (hotel.location || '').toLowerCase().includes(q) ||
      (hotel.category || '').toLowerCase().includes(q)
    );
  }, [query, hotels]);

  const ListComponent = role === 'admin' ? HotelsList : ManageHotelList;

  return (
    <div className="w-full">
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, location, or category…"
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-hairline
                     focus:outline-none focus:ring-2 focus:ring-brass text-sm"
        />
      </div>
      <ListComponent filteredHotels={filtered} reviews={reviews} />
    </div>
  );
}
```

- [ ] **Step 2: Delete the stale duplicate**

```bash
git rm components/HotelsListManage.jsx
```

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "HotelsListManage" components/HotelSearch.jsx
grep -q "from '@/components/ManageHotelList'" components/HotelSearch.jsx && echo IMPORT_OK
test -f components/HotelsListManage.jsx && echo STILL_EXISTS || echo DELETED_OK
grep -rl "HotelsListManage" app components 2>/dev/null | wc -l | tr -d ' '
```
Expected:
```
0
IMPORT_OK
DELETED_OK
0
```

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/HotelSearch.jsx
git commit -m "fix: HotelSearch pointed at stale HotelsListManage duplicate, repoint to restyled ManageHotelList and delete the duplicate"
```

---

### Task 11: Restyle `components/HotelsList.jsx`

**Files:**
- Modify: `components/HotelsList.jsx`

**Interfaces:**
- No exports change — same default export `HotelsList`, same `{ filteredHotels, reviews }` props (this is the admin-only branch `HotelSearch.jsx` renders).
- `deleteHotelById`/`confirm()`/`alert()` delete flow preserved exactly (out of scope per Global Constraints). `Pagination` import path (`./Pagination`) unchanged.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";

const HotelsList = ({ filteredHotels, reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 8;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(
    indexOfFirstHotel,
    indexOfLastHotel
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (hotelId, hotelTitle) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete ${hotelTitle}?`
    );
    if (!confirmDelete) return;

    try {
      const result = await deleteHotelById(hotelId);
      alert(result.message || "Hotel deleted successfully!");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel!");
    }
  };

  return (
    <div className="space-y-4 px-4 sm:px-0">
      {currentHotels.length > 0 ? (
        <div className="border border-hairline rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead>
              <tr className="bg-surface-alt">
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Image
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Hotel Name
                </th>
                <th className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm font-medium">
                  Location
                </th>
                <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                  Rooms
                </th>
                <th className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm font-medium">
                  Price/Night
                </th>
                <th className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm font-medium">
                  Rating
                </th>
                <th className="p-2 sm:p-3 text-xs sm:text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentHotels.map((hotel) => {
                const filteredReviews = reviews.filter(
                  (review) => review.hotelId === hotel._id
                );
                const totalReviews = filteredReviews.length;
                const averageRating =
                  totalReviews > 0
                    ? filteredReviews.reduce(
                        (acc, review) => acc + review.ratings,
                        0
                      ) / totalReviews
                    : 0;
                const hotelImage =
                  hotel.images &&
                  hotel.images.length > 0 &&
                  hotel.images[Math.floor(Math.random() * hotel.images.length)];

                return (
                  <tr key={hotel._id} className="border-t border-hairline hover:bg-surface-alt">
                    <td className="p-2 sm:p-3">
                      {hotelImage && (
                        <Link href={`/details/${hotel._id}`}>
                          <Image
                            width={64}
                            height={64}
                            src={hotelImage}
                            alt="Hotel Property"
                            className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                            sizes="(max-width: 640px) 48px, 64px"
                            priority={false}
                          />
                        </Link>
                      )}
                    </td>
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">
                      <div className="font-semibold text-ink mb-1 max-w-[200px] truncate">
                        <Link href={`/details/${hotel._id}`}>{hotel.title}</Link>
                      </div>
                      <div className="xl:hidden text-xs text-muted mb-1">
                        Location: {hotel.location}
                      </div>
                      <div className="lg:hidden text-xs text-muted mb-1">
                        Rooms: {hotel.bedroomCapacity}
                      </div>
                      <div className="md:hidden text-xs text-muted mb-1">
                        Price: ${hotel.rent}/night
                      </div>
                      <div className="lg:hidden text-xs text-muted mb-1">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-brass-dark fill-current" />
                          {Number(averageRating)?.toFixed(1)} ({totalReviews} reviews)
                        </span>
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 hidden xl:table-cell text-xs sm:text-sm text-muted">
                      {hotel.location}
                    </td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm text-muted">
                      {hotel.bedroomCapacity} Rooms
                    </td>
                    <td className="p-2 sm:p-3 hidden md:table-cell text-xs sm:text-sm text-brass-dark font-semibold">
                      ${hotel.rent}
                    </td>
                    <td className="p-2 sm:p-3 hidden lg:table-cell text-xs sm:text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-brass-dark fill-current" />
                        {Number(averageRating)?.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3">
                      <div className="flex space-x-2">
                        <Link
                          href={{
                            pathname: "/dashboard/create-hotel",
                            query: { hotelId: hotel._id },
                          }}
                          className="text-brass-dark hover:text-brass text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                          title="Edit Hotel"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel._id, hotel.title)}
                          className="text-red-500 hover:text-red-600 text-sm p-1 rounded hover:bg-surface-alt transition-colors"
                          title="Delete Hotel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div id="empty-state" className="text-center py-8 sm:py-12">
          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
            No Hotels Found
          </h2>
          <p className="text-muted text-sm sm:text-base">
            It seems there are no hotels available at the moment. Please try
            again later!
          </p>
        </div>
      )}
      {currentHotels.length > 0 && (
        <div className="mt-4 sm:mt-6 text-center">
          <Pagination
            handlePageChange={handlePageChange}
            currentPage={currentPage}
            totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
          />
        </div>
      )}
    </div>
  );
};

export default HotelsList;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-star\|fas fa-edit\|fas fa-trash" components/HotelsList.jsx
grep -q "Star, Pencil, Trash2 } from \"lucide-react\"" components/HotelsList.jsx && echo OK
```
Expected:
```
0
OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/HotelsList.jsx
git commit -m "feat: restyle HotelsList with luxury tokens and lucide icons"
```

---

### Task 12: Restyle `app/dashboard/create-hotel/page.js` (and fix the premature-submit bug)

**Files:**
- Modify: `app/dashboard/create-hotel/page.js`

**Interfaces:**
- No exports change — same default export `HotelForm`, no props.
- **Bug fix, identical in nature to Phase 5's fix in `app/add-hotel/page.js`** (a separate file with duplicated logic, not shared): all 9 per-field "Save" toggle buttons get `type="button"` added, since the default button type inside the `<form onSubmit={handleSubmit}>` is `"submit"`.
- All state, effects, `handleChange`, `handleSubmit`, `resetForm`, `debounce`/`debounceValidateUrl` logic preserved byte-identical. This file has no `Navbar`/`Footer` (the dashboard layout already provides chrome via `Sidebar`) — that absence is pre-existing and unchanged by this task.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useEffect, useState } from "react";
import { addHotel, getHotelById, session, updateHotelById } from "../../action";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Save,
  Pencil,
  Users,
  DoorOpen,
  BedDouble,
  Sparkles,
  Bell,
  Umbrella,
  Waves,
  Wifi,
  Utensils,
  Car,
  Dumbbell,
} from "lucide-react";

const AMENITY_ICONS = {
  "Beach access": Umbrella,
  "Private pool": Waves,
  "Free Wi-Fi": Wifi,
  Kitchen: Utensils,
  "Free Parking": Car,
  "Fitness Center": Dumbbell,
};

const HotelForm = () => {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [hotelId, setHotelId] = useState(null);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [hostName, setHostName] = useState(null);
  const [isInputVisible, setIsInputVisible] = useState({
    propertyName: false,
    propertyLocation: false,
    propertyPrice: false,
    availableRoom: false,
    guestCapacity: false,
    bedroomCapacity: false,
    bedCapacity: false,
    description: false,
    serviceFee: false,
    cleaningFee: false,
  });
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    rent: "",
    hostName: "",
    guestCapacity: "",
    bedroomCapacity: "",
    bedCapacity: "",
    description: "",
    amenities: [],
    images: [],
    serviceFee: "",
    cleaningFee: "",
    category: "urban",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setHotelId(params.get("hotelId"));
    }
  }, []);

  useEffect(() => {
    if (hotelId) {
      const fetchHotel = async () => {
        try {
          const hotelData = await getHotelById(hotelId);
          setHotel(hotelData);
        } catch (error) {
          console.error("Error fetching hotel:", error);
        }
      };
      fetchHotel();
    }
  }, [hotelId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await session();
        if (!userData) {
          router.push("/login");
          return;
        }
        setUserId(userData?.user?.id || null);
        setHostName(userData?.user?.name || null);
      } catch (error) {
        console.error("Failed to fetch user session:", error);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userId && hostName) {
      setFormData((prev) => ({ ...prev, ownerId: userId, hostName: hostName }));
    }
  }, [userId, hostName]);

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      rent: "",
      hostName: "",
      guestCapacity: "",
      bedroomCapacity: "",
      bedCapacity: "",
      description: "",
      amenities: [],
      images: [],
      serviceFee: "",
      cleaningFee: "",
      ownerId: userId,
      hostName: hostName,
      category: "urban",
    });
  };

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        amenities: checked
          ? [...(prev.amenities || []), value]
          : (prev.amenities || []).filter((item) => item !== value),
      }));
    } else if (name.startsWith("image")) {
      const index = parseInt(name.replace("image", ""), 10);
      setFormData((prev) => {
        const updatedImages = [...prev.images];
        updatedImages[index] = value;
        return { ...prev, images: updatedImages };
      });
      debounceValidateUrl(index, value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const debounceValidateUrl = debounce((index, value) => {
    setIsValidUrl(false);
    const urlPattern = /^(http|https):\/\//;
    if (!urlPattern.test(value)) {
      setIsValidUrl(true);
    }
  }, 500);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isValidUrl) {
      toast.error("Please Provide Valid URL!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    try {
      setLoading(true);
      const form = new FormData();
      for (const [key, value] of Object.entries(formData)) {
        if (key === "amenities") {
          form.append(key, JSON.stringify(value));
        } else if (key === "images") {
          if (hotelId) {
            form.append(key, JSON.stringify(value));
          } else {
            value.forEach((image) => {
              form.append("images[]", image);
            });
          }
        } else {
          form.append(key, value);
        }
      }
      if (hotelId) {
        await updateHotelById(hotelId, Object.fromEntries(form.entries()));
      } else {
        await addHotel(form);
      }
      resetForm();
      toast.success(
        hotelId ? "Hotel Updated Successfully!" : "Hotel Added Successfully!",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } catch (error) {
      console.error("Error adding hotel:", error);
      toast.error("Failed to add hotel. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleInputVisibility = (field) => {
    setIsInputVisible((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative bg-cream">
          <button
            type="submit"
            className={`flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg absolute top-4 right-4 sm:right-6 text-sm sm:text-base transition-colors ${
              loading
                ? "bg-hairline text-muted cursor-not-allowed"
                : "bg-brass-dark text-cream hover:bg-brass"
            }`}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1 sm:mr-2" />
            )}
            {loading ? "Saving..." : hotelId ? "Update" : "Publish"}
          </button>
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isInputVisible.propertyName ? (
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Property Name"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl text-muted mb-2">
                  {(hotelId && !formData.title && hotel?.title) ||
                    formData.title ||
                    "Property Name"}
                </h1>
              )}
              {isInputVisible.propertyName ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyName")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyName")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-muted mt-2">
              {isInputVisible.propertyLocation ? (
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Property Location"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <span className="text-sm sm:text-base">
                  {(hotelId && !formData.location && hotel?.location) ||
                    formData.location ||
                    "Property Location"}
                </span>
              )}
              {isInputVisible.propertyLocation ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyLocation")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyLocation")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={
                  index === 0
                    ? "col-span-1 sm:col-span-2 row-span-2"
                    : "col-span-1"
                }
              >
                <div className="relative w-full h-auto aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] overflow-hidden rounded-lg bg-surface-alt">
                  <Image
                    fill
                    src={
                      (hotelId &&
                        !formData.images[index] &&
                        hotel?.images[index]) ||
                      formData.images[index] ||
                      "https://placehold.co/600x400"
                    }
                    alt={`Room ${index}`}
                    className="object-cover rounded-lg"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    priority={index === 0}
                    unoptimized={true}
                  />
                  <input
                    type="text"
                    name={`image${index}`}
                    placeholder="https://placehold.co/600x400"
                    value={formData.images[index] || ""}
                    onChange={handleChange}
                    className="w-11/12 p-1.5 sm:p-2 border border-brass rounded-lg absolute left-1/2 -translate-x-1/2 bottom-2 bg-surface text-xs sm:text-sm z-10"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="w-full sm:w-auto my-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-ink mb-1"
            >
              Property Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full sm:w-72 px-4 py-2 border border-hairline rounded-lg shadow-sm bg-surface text-sm sm:text-base text-ink focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass transition duration-150"
            >
              <option value="" disabled>
                Select Category
              </option>
              <option value="urban">Urban</option>
              <option value="beach">Beach</option>
              <option value="mountain">Mountain</option>
              <option value="luxury">Luxury</option>
              <option value="rustic">Rustic</option>
              <option value="countryside">Countryside</option>
              <option value="lakeside">Lakeside</option>
            </select>
          </div>

          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              {isInputVisible.propertyPrice ? (
                <input
                  type="number"
                  id="rent"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  placeholder="Property Rent"
                  className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                />
              ) : (
                <span className="text-lg sm:text-xl font-serif text-ink">
                  {hotelId
                    ? formData.rent
                      ? `$${formData.rent}`
                      : `$${hotel?.rent || "Price in USD"}`
                    : formData.rent
                    ? `$${formData.rent}`
                    : "Price in USD"}
                </span>
              )}
              {isInputVisible.propertyPrice ? (
                <button
                  type="button"
                  onClick={() => toggleInputVisibility("propertyPrice")}
                  className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                >
                  Save
                </button>
              ) : (
                <Pencil
                  onClick={() => toggleInputVisibility("propertyPrice")}
                  className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                />
              )}
              <span className="text-muted text-sm sm:text-base">per night</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="col-span-1 lg:col-span-2">
              <div className="border-b border-hairline pb-4 sm:pb-6 mb-4 sm:mb-6">
                <div className="grid grid-cols-1 gap-4 text-muted">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {isInputVisible.guestCapacity ? (
                        <input
                          type="number"
                          id="guestCapacity"
                          name="guestCapacity"
                          value={formData.guestCapacity}
                          onChange={handleChange}
                          placeholder="Guest Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.guestCapacity &&
                            hotel?.guestCapacity) ||
                            formData.guestCapacity ||
                            "How many Guests can Stay?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.guestCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("guestCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("guestCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4" />
                      {isInputVisible.bedroomCapacity ? (
                        <input
                          type="number"
                          id="bedroomCapacity"
                          name="bedroomCapacity"
                          value={formData.bedroomCapacity}
                          onChange={handleChange}
                          placeholder="Bedroom Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.bedroomCapacity &&
                            hotel?.bedroomCapacity) ||
                            formData.bedroomCapacity ||
                            "How many Bedrooms?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.bedroomCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("bedroomCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("bedroomCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-4 h-4" />
                      {isInputVisible.bedCapacity ? (
                        <input
                          type="number"
                          id="bedCapacity"
                          name="bedCapacity"
                          value={formData.bedCapacity}
                          onChange={handleChange}
                          placeholder="Bed Capacity"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {(hotelId &&
                            !formData.bedCapacity &&
                            hotel?.bedCapacity) ||
                            formData.bedCapacity ||
                            "How many beds available?"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.bedCapacity ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("bedCapacity")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("bedCapacity")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {isInputVisible.serviceFee ? (
                        <input
                          type="number"
                          id="serviceFee"
                          name="serviceFee"
                          value={formData.serviceFee}
                          onChange={handleChange}
                          placeholder="Service Fee"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {hotelId &&
                          (!formData.serviceFee
                            ? hotel?.serviceFee
                            : formData.serviceFee)
                            ? `$${formData.serviceFee || hotel?.serviceFee}`
                            : "Service Fee"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.serviceFee ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("serviceFee")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("serviceFee")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      {isInputVisible.cleaningFee ? (
                        <input
                          type="number"
                          id="cleaningFee"
                          name="cleaningFee"
                          value={formData.cleaningFee}
                          onChange={handleChange}
                          placeholder="Cleaning Fee"
                          className="w-full sm:w-auto mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                        />
                      ) : (
                        <span className="text-sm sm:text-base">
                          {hotelId &&
                          (!formData.cleaningFee
                            ? hotel?.cleaningFee
                            : formData.cleaningFee)
                            ? `$${formData.cleaningFee || hotel?.cleaningFee}`
                            : "Cleaning Fee"}
                        </span>
                      )}
                    </div>
                    {isInputVisible.cleaningFee ? (
                      <button
                        type="button"
                        onClick={() => toggleInputVisibility("cleaningFee")}
                        className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                      >
                        Save
                      </button>
                    ) : (
                      <Pencil
                        onClick={() => toggleInputVisibility("cleaningFee")}
                        className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                  About this place
                </h3>
                <div className="flex flex-col sm:flex-row items-start gap-2">
                  {isInputVisible.description ? (
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write a short description about this place"
                      className="w-full mt-2 p-2 border border-brass rounded-lg text-sm sm:text-base"
                      rows="6"
                    />
                  ) : (
                    <p className="text-ink/80 leading-relaxed text-sm sm:text-base">
                      {(hotelId &&
                        !formData.description &&
                        hotel?.description) ||
                        formData.description ||
                        "Write a short description about this place"}
                    </p>
                  )}
                  {isInputVisible.description ? (
                    <button
                      type="button"
                      onClick={() => toggleInputVisibility("description")}
                      className="p-1.5 sm:p-2 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-all text-sm"
                    >
                      Save
                    </button>
                  ) : (
                    <Pencil
                      onClick={() => toggleInputVisibility("description")}
                      className="w-4 h-4 text-muted cursor-pointer hover:scale-110 transition-all shrink-0"
                    />
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-ink mb-4">
                  What this place offers
                </h3>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  id="amenities"
                >
                  {[
                    "Beach access",
                    "Private pool",
                    "Free Wi-Fi",
                    "Kitchen",
                    "Free Parking",
                    "Fitness Center",
                  ].map((amenity) => {
                    const Icon = AMENITY_ICONS[amenity];
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          id={amenity}
                          name="amenities"
                          value={amenity}
                          checked={
                            (hotelId &&
                              hotel?.amenities &&
                              hotel.amenities.includes(amenity)) ||
                            formData.amenities.includes(amenity)
                          }
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <Icon className="w-4 h-4 text-brass-dark" />
                        <label htmlFor={amenity} className="text-sm sm:text-base text-ink">
                          {amenity}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default HotelForm;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c 'fas fa-\|🏙\|🏖\|⛰\|💎\|🌲\|🌄\|🏞' app/dashboard/create-hotel/page.js
grep -c 'type="button"' app/dashboard/create-hotel/page.js
```
Expected:
```
0
9
```
(9 = the 9 Save toggle buttons — see Task 6 of Phase 5's plan for why the `onClick={() => toggleInputVisibility` count is 18, not 9: each field has that same handler on both its Save button and its Pencil icon, but only the 9 `<button>` elements get `type="button"`.)

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/create-hotel/page.js
git commit -m "fix: dashboard create-hotel Save toggles were submitting the form, add type=button; restyle to luxury tokens"
```

---

### Task 13: Restyle `app/dashboard/profile/page.js` (and remove the dead-end buttons)

**Files:**
- Modify: `app/dashboard/profile/page.js`

**Interfaces:**
- No exports change — same default export `Profile`, no props.
- **Bug fix:** the live "Edit Profile" and "Settings" buttons (no `onClick`, no backing feature anywhere in the app) are removed.
- All data-fetching (`getWishlists`, `getBookings`, `getAllHotels`, `session`) and derived filters (`filteredWishlists`, `filteredBookings`, `filteredHotels`) preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "Edit Profile\|>Settings<\|bg-gradient-to-br from-blue-50" app/dashboard/profile/page.js
```
Expected:
```
0
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/profile/page.js
git commit -m "fix: remove dead-end Edit Profile/Settings buttons from dashboard profile, restyle to luxury tokens"
```

---

### Task 14: Restyle `app/dashboard/users-list/page.js`

**Files:**
- Modify: `app/dashboard/users-list/page.js`

**Interfaces:**
- No exports change — same default export `UsersList`, no props.
- Consumes `Pagination` (Phase 3, already restyled). `getUsers` fetch, `debounce`-based search, `filteredUsers` derivation, and pagination math preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { getUsers } from "@/app/action";
import Pagination from "@/components/Pagination";
import Link from "next/link";
import { Search, AlertTriangle, RotateCw, Mail, MapPin, Calendar, Users2 } from "lucide-react";
import Skeleton from "@/components/skeletons/Skeleton";

// Debounce utility function
const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Skeleton Components
const SkeletonRow = () => (
  <tr className="border-t border-hairline">
    <td className="p-2 sm:p-4">
      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
    </td>
    <td className="p-2 sm:p-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <div className="sm:hidden space-y-1">
          <Skeleton className="h-3 w-40 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
      </div>
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-48 rounded" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-28 rounded" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-6 w-16 rounded-full" />
    </td>
    <td className="p-2 sm:p-4 hidden sm:table-cell">
      <Skeleton className="h-4 w-24 rounded" />
    </td>
  </tr>
);

const SkeletonTable = () => (
  <div className="bg-surface rounded-xl overflow-x-auto border border-hairline">
    <table className="w-full text-left text-sm sm:text-base">
      <thead className="bg-surface-alt border-b border-hairline">
        <tr>
          <th className="p-3 sm:p-4 font-semibold text-ink">Profile</th>
          <th className="p-3 sm:p-4 font-semibold text-ink">Name</th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Email
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Location
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Role
          </th>
          <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
            Joined
          </th>
        </tr>
      </thead>
      <tbody>
        {[...Array(8)].map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </tbody>
    </table>
  </div>
);

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();

        if (!data || !data.success) {
          setError("Failed to load users");
          return;
        }

        setUsers(data.users || []);
      } catch (err) {
        setError("Failed to load users");
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Debounced search handler
  const handleSearch = debounce((value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, 300);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users.filter((user) => user.role !== "admin");

    return users.filter((user) => {
      if (user.role === "admin") return false;
      const nameMatch = user.name?.toLowerCase().includes(query);
      const emailMatch = user.email?.toLowerCase().includes(query);
      return nameMatch || emailMatch;
    });
  }, [users, searchQuery]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const getRoleColor = (role) => {
    const colors = {
      user: "bg-brass-light/30 text-brass-dark",
      moderator: "bg-surface-alt text-ink",
      premium: "bg-brass-light/30 text-brass-dark",
      default: "bg-surface-alt text-muted",
    };
    return colors[role] || colors.default;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <Skeleton className="h-8 sm:h-10 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 mt-2 rounded" />
        </div>
        <SkeletonTable />
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-2">
            Users List
          </h1>
          <p className="text-muted">Manage and view all registered users</p>
        </div>

        <div className="bg-surface rounded-xl border border-hairline p-8 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
              Oops! Something went wrong
            </h2>
            <p className="text-muted mb-6">
              We couldn't load the users. Please check your connection and try
              again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-cream bg-brass-dark hover:bg-brass transition-colors"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-1 sm:mb-2">
            Users List
          </h1>
          <p className="text-sm sm:text-base text-muted">
            Manage and view all registered users
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-auto">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="By Name/ Email"
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 pl-10 text-sm sm:text-base border border-hairline rounded-lg focus:ring-2 focus:ring-brass focus:border-brass transition-all duration-200 bg-surface"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          </div>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          <div className="bg-surface rounded-xl overflow-x-auto border border-hairline">
            <table className="w-full text-left text-sm sm:text-base">
              <thead className="bg-surface-alt border-b border-hairline">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-ink">
                    Profile
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink">
                    Name
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Email
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Location
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Role
                  </th>
                  <th className="p-3 sm:p-4 font-semibold text-ink hidden sm:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-surface-alt transition-all duration-200 group"
                  >
                    <td className="p-3 sm:p-4">
                      <Link href={`/profile/${user._id}`}>
                        <div className="relative">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={`${user.name} profile`}
                              width={40}
                              height={40}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer ring-2 ring-hairline group-hover:ring-brass-light transition-all duration-200"
                              sizes="(max-width: 640px) 100vw, 48px"
                              priority={false}
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brass-dark rounded-full flex items-center justify-center cursor-pointer ring-2 ring-hairline group-hover:ring-brass-light transition-all duration-200">
                              <span className="text-cream text-sm sm:text-base font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || "U"}
                              </span>
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-surface"></div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4">
                      <Link href={`/profile/${user._id}`} className="block">
                        <div className="font-semibold text-ink group-hover:text-brass-dark transition-colors cursor-pointer">
                          {user.name}
                        </div>
                        <div className="sm:hidden mt-2 space-y-1">
                          <div className="text-xs text-muted flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                          </div>
                          <div className="text-xs text-muted flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {user.location || "Not specified"}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            <span className="text-xs text-muted">
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-muted" />
                        {user.email}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted" />
                        {user.location || "Not specified"}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-muted hidden sm:table-cell">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted" />
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )
                          : "N/A"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface rounded-lg p-4 border border-hairline">
            <div className="flex items-center text-sm text-muted">
              <Users2 className="w-4 h-4 mr-2 text-muted" />
              Showing{" "}
              <span className="font-medium text-ink mx-1">
                {startIndex + 1}
              </span>
              to{" "}
              <span className="font-medium text-ink mx-1">
                {Math.min(endIndex, filteredUsers.length)}
              </span>
              of{" "}
              <span className="font-medium text-ink mx-1">
                {filteredUsers.length}
              </span>{" "}
              {searchQuery ? "matching" : ""} users
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                handlePageChange={handlePageChange}
              />
            )}
          </div>
        </>
      ) : (
        <div className="bg-surface rounded-xl border border-hairline p-8 sm:p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
              <Users2 className="w-8 h-8 text-muted" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
              {searchQuery ? "No Matching Users" : "No Users Yet"}
            </h2>
            <p className="text-muted mb-6">
              {searchQuery
                ? `No users found matching "${searchQuery}"`
                : "Your community is just getting started. Users will appear here once they register."}
            </p>
            {!searchQuery && (
              <div className="text-sm text-muted">
                Check back later or invite people to join your platform!
              </div>
            )}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-cream bg-brass-dark hover:bg-brass transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "<svg" app/dashboard/users-list/page.js
grep -q 'from "@/components/skeletons/Skeleton"' app/dashboard/users-list/page.js && echo SKELETON_OK
```
Expected:
```
0
SKELETON_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/users-list/page.js
git commit -m "feat: restyle users-list with luxury tokens, lucide icons, and Skeleton primitive"
```

---

### Task 15: Restyle all 10 dashboard `loading.js` files

**Files:**
- Modify: `app/dashboard/loading.js`
- Modify: `app/dashboard/bookings/loading.js`
- Modify: `app/dashboard/bookings-list/loading.js`
- Modify: `app/dashboard/wishlists/loading.js`
- Modify: `app/dashboard/wishlists-list/loading.js`
- Modify: `app/dashboard/manage-hotels/loading.js`
- Modify: `app/dashboard/hotels-list/loading.js`
- Modify: `app/dashboard/create-hotel/loading.js`
- Modify: `app/dashboard/profile/loading.js`
- Modify: `app/dashboard/users-list/loading.js`

**Interfaces:**
- All 10 remain `export default function Loading()`. All 10 are currently byte-identical to each other and to the ones already restyled in Phases 3-5; this task applies the same replacement to all 10.

- [ ] **Step 1: Replace all 10 files' contents with this (same content for all)**

```jsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-hairline border-t-brass-dark" />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "border-t-primary" app/dashboard/loading.js app/dashboard/bookings/loading.js app/dashboard/bookings-list/loading.js app/dashboard/wishlists/loading.js app/dashboard/wishlists-list/loading.js app/dashboard/manage-hotels/loading.js app/dashboard/hotels-list/loading.js app/dashboard/create-hotel/loading.js app/dashboard/profile/loading.js app/dashboard/users-list/loading.js
```
Expected: `0` for every listed file.

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/loading.js app/dashboard/bookings/loading.js app/dashboard/bookings-list/loading.js app/dashboard/wishlists/loading.js app/dashboard/wishlists-list/loading.js app/dashboard/manage-hotels/loading.js app/dashboard/hotels-list/loading.js app/dashboard/create-hotel/loading.js app/dashboard/profile/loading.js app/dashboard/users-list/loading.js
git commit -m "feat: restyle all dashboard loading spinners with luxury tokens"
```

---

### Task 16: Restyle all 10 dashboard `error.js` files

**Files:**
- Modify: `app/dashboard/error.js`
- Modify: `app/dashboard/bookings/error.js`
- Modify: `app/dashboard/bookings-list/error.js`
- Modify: `app/dashboard/wishlists/error.js`
- Modify: `app/dashboard/wishlists-list/error.js`
- Modify: `app/dashboard/manage-hotels/error.js`
- Modify: `app/dashboard/hotels-list/error.js`
- Modify: `app/dashboard/create-hotel/error.js`
- Modify: `app/dashboard/profile/error.js`
- Modify: `app/dashboard/users-list/error.js`

**Interfaces:**
- All 10 remain `export default function Error({ error, reset })`. All 10 are currently byte-identical to each other and to the ones already restyled in Phases 3-5; this task applies the same replacement to all 10.

- [ ] **Step 1: Replace all 10 files' contents with this (same content for all)**

```jsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="font-serif text-lg text-ink mb-2">Something went wrong</h2>
      <p className="text-sm text-muted mb-4">{error?.message || "Please try again."}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 rounded-lg bg-brass-dark text-cream hover:bg-brass transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary" app/dashboard/error.js app/dashboard/bookings/error.js app/dashboard/bookings-list/error.js app/dashboard/wishlists/error.js app/dashboard/wishlists-list/error.js app/dashboard/manage-hotels/error.js app/dashboard/hotels-list/error.js app/dashboard/create-hotel/error.js app/dashboard/profile/error.js app/dashboard/users-list/error.js
```
Expected: `0` for every listed file.

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/error.js app/dashboard/bookings/error.js app/dashboard/bookings-list/error.js app/dashboard/wishlists/error.js app/dashboard/wishlists-list/error.js app/dashboard/manage-hotels/error.js app/dashboard/hotels-list/error.js app/dashboard/create-hotel/error.js app/dashboard/profile/error.js app/dashboard/users-list/error.js
git commit -m "feat: restyle all dashboard error boundaries with luxury tokens"
```

---

## Self-Review

**Spec coverage:** §7 Phase 6 lists `Sidebar`, `app/dashboard/*` pages, `Chart.jsx`, `EditModal`, `Create.jsx` — corrected above (`EditModal.jsx` moves to Phase 7, `Create.jsx` is dead code, neither restyled here). All 10 dashboard route directories covered across Tasks 1-16. `HotelSearch.jsx` (reassigned here from the Phase 3 spec correction) is restyled and its stale-duplicate bug fixed in Task 10.

**Bug-fix scope check:** All four fixes (HotelSearch/HotelsListManage duplicate, create-hotel `type="button"`, fabricated dashboard trend percentages, dead profile buttons) are narrowly scoped to the files already being restyled — no speculative fixes elsewhere.

**Chart color validation:** The `dataviz` skill's validator (`scripts/validate_palette.js`) was run against the exact 6-hex categorical set used in `components/Chart.jsx`'s pie chart, re-validated against this app's actual white card surface (not just the skill's own reference surface) — all checks pass. The bar/line `color` prop values (`#2a78d6`, `#eb6834`) are drawn from the same validated reference set (categorical slots 1 and 8).

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected output, including the worked-out `type="button"` count in Task 12 (cross-referencing Phase 5's identical arithmetic note).

**Type/name consistency:** `Pagination`, `DeleteWishlistButton`, `BookingDetailsModal` imports all match their Phase 3/5 export names and paths exactly. `ManageHotelList` in `HotelSearch.jsx` now points at the file Phase 5 actually restyled, confirmed by the post-fix `grep -rl "HotelsListManage"` verification step returning zero matches.

**Out-of-scope check:** `components/Create.jsx` and `components/EditModal.jsx` do not appear in any task's file list — confirmed correctly deferred (dead-code flag and Phase 7 reassignment respectively). `alert()`/`confirm()` delete flows in `HotelsList.jsx` preserved verbatim per Global Constraints.

---

## Next Phases

Phase 7 (Payment flow: `app/paymentProcess`, `app/payment-success`, `PaymentAndBillingForm`, `Success.jsx`, plus `EditModal.jsx` reassigned here from this phase's spec correction) gets its own plan, written next.
