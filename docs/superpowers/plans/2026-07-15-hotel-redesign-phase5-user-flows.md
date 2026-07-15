# Hotel Redesign — Phase 5: User Flows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the logged-in user surfaces — bookings, wishlists, profile, add/edit hotel form, manage hotels — to the luxury-minimal design system, and fix a real bug found while reading the add-hotel form: every inline per-field "Save" toggle button submits the entire form instead of just toggling that field.

**Architecture:** 10 files, no cross-task dependencies within this phase (each route/component is independent; all consume only already-merged Phase 0-4 tokens/icons/`Pagination`). Tasks are ordered by surface for readability, not because of a build dependency.

**Tech Stack:** Next.js 14, Tailwind CSS 3.4 (Phase 0 tokens), lucide-react, `pdf-lib` (receipt generation, untouched), react-toastify.

**Spec:** `docs/superpowers/specs/2026-07-14-hotel-management-redesign-design.md` — spec §7 Phase 5.

## Bugs Found While Reading These Files (fixed as part of this phase)

1. **`app/add-hotel/page.js` (`HotelForm`) — every inline "Save" toggle button is missing `type="button"`.** The whole form is wrapped in a single `<form onSubmit={handleSubmit}>`. Inside it, each editable field (property name, location, price, guest/bedroom/bed capacity, service fee, cleaning fee, description) has its own little "Save" button that's meant to just flip that one field back to read-only display (`toggleInputVisibility`). Because none of those buttons specify `type="button"`, their default type inside a `<form>` is `"submit"` — clicking any single field's "Save" button actually submits the *entire* form (calls `handleSubmit`, which calls `addHotel`/`updateHotelById`) instead of just toggling that field. Fixed in Task 6 by adding `type="button"` to all of them.
2. **`app/wishlists/page.js`** uses the deprecated `next/image` `layout="fill" objectFit="cover"` API (same class of bug already fixed twice in Phase 3 — `next/image` removed these props in Next 13+ in favor of the `fill` prop + `object-cover` class). Fixed in Task 3.

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`. `brass` decorative-only; text/icon contrast uses `brass-dark`.
- No emoji/Font Awesome icon classes — lucide-react only. This includes the emoji category-option prefixes (🏙🏖⛰💎🌲🌄🏞) in `add-hotel`'s category `<select>` — plain text option labels replace them (native `<option>` elements can't render icons anyway; the emoji were purely decorative text).
- `Pagination` (Phase 3, already merged) is reused as-is by `BookingDetailsModal` and `ManageHotelList` — no changes needed there.
- **Explicitly OUT OF SCOPE for this phase:** the blocking `alert()`/`confirm()` browser dialogs used by `DeleteWishlistButton` and `ManageHotelList`'s delete flow. These are old-fashioned UX, not broken — replacing them with toast/custom-confirm UI would be a behavior change beyond "restyle the visuals," and is a reasonable Phase 8 (Polish) candidate, not this phase's job.
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.
- All data-fetching, redirects, form state, PDF generation, and delete/confirm logic are preserved byte-identical in every task — only markup/classes/icons change (plus the one `type="button"` bug fix in Task 6).

---

### Task 1: Restyle `app/bookings/page.js`

**Files:**
- Modify: `app/bookings/page.js`

**Interfaces:**
- No exports change — same default export `Bookings` (async server component).

- [ ] **Step 1: Replace the file contents**

```jsx
import Navbar from "@/components/Navbar";
import React from "react";
import { getBookings, session } from "../action";
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
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-serif text-3xl text-ink mb-6">My Bookings</h1>
          <BookingDetailsModal bookings={filteredBookings} />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "text-3xl font-bold mb-6" app/bookings/page.js
grep -q "bg-cream" app/bookings/page.js && echo OK
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
git add app/bookings/page.js
git commit -m "feat: restyle bookings page with luxury tokens"
```

---

### Task 2: Restyle `components/BookingDetailsModal.jsx`

**Files:**
- Modify: `components/BookingDetailsModal.jsx`

**Interfaces:**
- No new exports — same default export `BookingDetailsModal`, same `{ bookings }` prop.
- Consumes `Pagination` (Phase 3, unchanged import path `./Pagination`).
- The entire `pdf-lib` receipt-generation closure (`downloadReceipt`) is preserved byte-identical — only its trigger button's icon/classes change.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { Download, X } from "lucide-react";
import Pagination from "./Pagination";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const BookingDetailsModal = ({ bookings }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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

  return (
    <>
      <div className="space-y-4 px-4 sm:px-6 lg:px-8">
        {bookings.length > 0 ? (
          <>
            {paginatedBookings.map((booking) => {
              const downloadReceipt = async () => {
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([612, 792]);
                const { width, height } = page.getSize();
                const helveticaFont = await pdfDoc.embedFont(
                  StandardFonts.Helvetica
                );
                const boldFont = await pdfDoc.embedFont(
                  StandardFonts.HelveticaBold
                );

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

                drawDetail("Booking ID:", booking?._id?.slice(0, 8), true);
                drawDetail(
                  "Property:",
                  booking?.bookingDetails?.title || "N/A"
                );
                drawDetail(
                  "Total Guests:",
                  booking?.bookingDetails?.guests || "N/A"
                );
                drawDetail(
                  "Check-in:",
                  formatDate(booking?.bookingDetails?.checkInDate) || "N/A"
                );
                drawDetail(
                  "Check-out:",
                  formatDate(booking?.bookingDetails?.checkOutDate) || "N/A"
                );
                drawDetail(
                  "Total Paid:",
                  `$${booking?.totalPrice || "N/A"}`,
                  true
                );
                drawDetail("Hotel ID:", booking?.hotelId || "N/A");
                drawDetail("User ID:", booking?.userId || "N/A");
                drawDetail(
                  "Rating:",
                  `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${
                    booking?.bookingDetails?.totalReviews
                  } review(s))`
                );
                drawDetail(
                  "Card Number:",
                  booking?.paymentDetails?.cardNumber || "N/A"
                );
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

              return (
                <div
                  key={booking._id}
                  className="bg-surface border border-hairline rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-luxe transition-shadow"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <Image
                      width={300}
                      height={200}
                      src={booking?.bookingDetails?.hotelImage}
                      alt="Property Thumbnail"
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                      sizes="(max-width: 640px) 100vw, 150px"
                      priority={false}
                    />
                    <div className="flex-1">
                      <h2 className="font-serif text-base sm:text-lg text-ink truncate">
                        {booking?.bookingDetails?.title}
                      </h2>
                      <p className="text-muted text-xs sm:text-sm">
                        Booking Date: {formatDate(booking?.createdAt)}
                      </p>
                      <p className="text-muted text-xs sm:text-sm">
                        Booking Cost: ${booking.totalPrice}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                    <button
                      className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors"
                      onClick={() => openModal(booking)}
                    >
                      View Trip Details
                    </button>
                    <button
                      onClick={downloadReceipt}
                      className="flex items-center justify-center px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-hairline rounded-lg text-ink hover:bg-surface-alt transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1 sm:mr-2" />
                      Download Receipt
                    </button>
                  </div>
                </div>
              );
            })}
            <div className="mt-4 sm:mt-6 text-center">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>
          </>
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
      </div>
      {isModalOpen && (
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
            {selectedBooking && (
              <div className="space-y-2 text-sm sm:text-base text-ink">
                <p>
                  <span className="font-semibold">Title: </span>
                  {selectedBooking.bookingDetails.title}
                </p>
                <p>
                  <span className="font-semibold">Description: </span>
                  {selectedBooking.bookingDetails.description}
                </p>
                <p>
                  <span className="font-semibold">Guests: </span>
                  {selectedBooking.bookingDetails.guests}
                </p>
                <p>
                  <span className="font-semibold">Check-In: </span>
                  {formatDate(selectedBooking.bookingDetails.checkInDate)}
                </p>
                <p>
                  <span className="font-semibold">Check-Out: </span>
                  {formatDate(selectedBooking.bookingDetails.checkOutDate)}
                </p>
                <p>
                  <span className="font-semibold">Total Price: </span>$
                  {selectedBooking.totalPrice}
                </p>
              </div>
            )}
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

export default BookingDetailsModal;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-download\|bg-black bg-opacity-50" components/BookingDetailsModal.jsx
grep -q "Download, X } from \"lucide-react\"" components/BookingDetailsModal.jsx && echo OK
grep -q "PDFDocument.create" components/BookingDetailsModal.jsx && echo PDF_OK
```
Expected:
```
0
OK
PDF_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/BookingDetailsModal.jsx
git commit -m "feat: restyle BookingDetailsModal with luxury tokens and lucide icons"
```

---

### Task 3: Restyle `app/wishlists/page.js` (and fix the deprecated `next/image` API)

**Files:**
- Modify: `app/wishlists/page.js`

**Interfaces:**
- No exports change — same default export `WishlistPage` (async server component).
- **Bug fix:** `layout="fill" objectFit="cover"` (deprecated since Next 13) replaced with the `fill` prop + `object-cover` class.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Image from "next/image";
import { getBookings, getWishlists, session } from "../action";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin } from "lucide-react";
import DeleteWishlistButton from "@/components/DeleteWishlistButton";

export default async function WishlistPage() {
  const authResult = await session();
  if (!authResult || !authResult.user) {
    redirect("/login");
  }
  const wishlistsData = await getWishlists();
  const bookingsData = await getBookings();

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
    <>
      <Navbar />
      <div className="min-h-screen bg-cream">
        <div className="container mx-auto px-4 py-8">
          <h1 className="font-serif text-2xl text-ink mb-6">My Wishlist</h1>
          {wishlistNotBooked.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistNotBooked.map((item) => (
                <div
                  key={item._id}
                  className="bg-surface border border-hairline rounded-2xl hover:shadow-luxe transition-shadow duration-300 overflow-hidden"
                >
                  <div>
                    <Link
                      href={`/details/${item.hotelId}`}
                      className="block relative"
                    >
                      {item.images && item.images.length > 0 ? (
                        <div className="relative h-64">
                          <Image
                            src={item.images[0]}
                            alt={`${item.title} image`}
                            fill
                            className="object-cover transition-transform transform hover:scale-105"
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink to-transparent h-20 flex items-end p-4">
                            <h2 className="text-cream font-serif text-lg">
                              {item.title}
                            </h2>
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 bg-surface-alt flex items-center justify-center">
                          <span className="text-muted text-sm">
                            No Image Available
                          </span>
                        </div>
                      )}
                    </Link>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 text-sm text-muted flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <p className="text-ink font-bold text-lg mb-2">
                      ${item.rent}{" "}
                      <span className="text-sm text-muted font-normal">/night</span>
                    </p>
                  </div>
                  <DeleteWishlistButton id={item._id} />
                </div>
              ))}
            </div>
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
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c 'layout="fill"' app/wishlists/page.js
grep -q 'MapPin } from "lucide-react"' app/wishlists/page.js && echo OK
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
git add app/wishlists/page.js
git commit -m "fix: migrate wishlists page off deprecated next/image API, restyle to luxury tokens"
```

---

### Task 4: Restyle `components/DeleteWishlistButton.jsx`

**Files:**
- Modify: `components/DeleteWishlistButton.jsx`

**Interfaces:**
- No exports change — same default export `DeleteWishlistButton`, same `{ id }` prop. `deleteWishlist` call and `alert()`-based feedback preserved exactly (out of scope per Global Constraints).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { deleteWishlist } from "@/app/action";
import React from "react";

const DeleteWishlistButton = ({ id }) => {
  const handleDeleteWishlist = async () => {
    try {
      await deleteWishlist(id);
      alert("Wishlist item deleted successfully!");
    } catch (error) {
      console.error("Failed to delete wishlist item:", error);
      alert("Failed to delete wishlist item. Please try again.");
    }
  };

  return (
    <div className="p-4 pt-0">
      <button
        onClick={handleDeleteWishlist}
        className="w-full bg-brass-dark hover:bg-brass text-cream font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brass transition-colors duration-300"
      >
        Remove from Wishlist
      </button>
    </div>
  );
};

export default DeleteWishlistButton;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "from-red-500 to-pink-500" components/DeleteWishlistButton.jsx
grep -q "deleteWishlist(id)" components/DeleteWishlistButton.jsx && echo OK
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
git add components/DeleteWishlistButton.jsx
git commit -m "feat: restyle DeleteWishlistButton with luxury tokens"
```

---

### Task 5: Restyle `app/profile/[id]/page.js`

**Files:**
- Modify: `app/profile/[id]/page.js`

**Interfaces:**
- No exports change — same default export `Profile`, same `{ params }` prop.
- All data-fetching (`getUserById`, `getWishlists`, `getBookings`, `getAllHotels`) and derived filters (`filteredWishlists`, `filteredBookings`, `filteredHotels`) unchanged.
- The dead commented-out "Edit Profile / Settings" button block is removed (it was never rendered — pure cleanup, not a behavior change).

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { getAllHotels, getBookings, getUserById, getWishlists, session } from "../../action";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { Mail, MapPin, Calendar, Heart, CalendarCheck, Building2, Plus } from "lucide-react";

const Profile = async ({ params }) => {
  const { id } = params;
  const authResult = await session();

  if (!authResult || !authResult.user) {
    redirect("/login");
  }

  const { user } = await getUserById(id);

  const wishlistsData = await getWishlists();
  const bookingsData = await getBookings();
  const hotelsData = await getAllHotels();

  const wishlists = wishlistsData?.wishlists || [];
  const bookings = bookingsData?.bookings || [];
  const hotels = hotelsData?.hotels || [];

  const filteredWishlists =
    wishlists.length > 0
      ? wishlists.filter((wishlist) => wishlist.userId === id)
      : [];

  const filteredBookings =
    bookings.length > 0
      ? bookings.filter((booking) => booking.userId === id)
      : [];

  const filteredHotels = hotels.filter(
    (hotel) => String(hotel.ownerId) === String(id)
  );

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-0 py-8">
        <div className="relative bg-surface rounded-2xl border border-hairline shadow-sm overflow-hidden mb-8">
          <div className="relative p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-brass-dark rounded-full flex items-center justify-center shadow-luxe ring-4 ring-cream">
                  <span className="text-cream text-2xl font-serif">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-cream flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="mb-3">
                  <h1 className="font-serif text-3xl text-ink mb-2">
                    {user?.name}
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">{user?.email}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {user?.location || "Location not set"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-alt rounded-full border border-hairline text-sm text-muted">
                  <Calendar className="w-4 h-4 text-brass-dark" />
                  <span>
                    Member since{" "}
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                      "en-US",
                      { month: "short", year: "numeric" }
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

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

        {authResult.user?.role !== "admin" && (
          <div className="bg-surface rounded-2xl border border-hairline p-6">
            <h2 className="font-serif text-lg text-ink mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/wishlists"
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
                href="/bookings"
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
                href="/add-hotel"
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
        )}
      </div>
    </div>
  );
};

export default Profile;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-gradient-to-br from-blue-50\|Edit Profile" "app/profile/[id]/page.js"
grep -q "Mail, MapPin, Calendar, Heart, CalendarCheck, Building2, Plus" "app/profile/[id]/page.js" && echo OK
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
git add "app/profile/[id]/page.js"
git commit -m "feat: restyle profile page with luxury tokens and lucide icons"
```

---

### Task 6: Restyle `app/add-hotel/page.js` (and fix the premature-submit bug)

**Files:**
- Modify: `app/add-hotel/page.js`

**Interfaces:**
- No exports change — same default export `HotelForm`, no props.
- **Bug fix, not just a restyle:** every inline per-field "Save" toggle button (`propertyName`, `propertyLocation`, `propertyPrice`, `guestCapacity`, `bedroomCapacity`, `bedCapacity`, `serviceFee`, `cleaningFee`, `description`) gets `type="button"` added. Without it, clicking any single field's "Save" button submits the whole form (since the default button type inside a `<form>` is `"submit"`), calling `handleSubmit` prematurely instead of just toggling that one field back to read-only via `toggleInputVisibility`.
- All other logic (`resetForm`, `debounce`/`debounceValidateUrl`, `handleChange`, `handleSubmit`, the `useEffect`s for `hotelId`/`hotel`/`userId`/`hostName`) is preserved byte-identical.
- `getIconClass` (the old Font Awesome amenity-icon switch) is replaced by an `AMENITY_ICONS` lookup object (same 6 amenities, same one-to-one mapping intent, now returning lucide components instead of class-name strings).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import React, { useEffect, useState } from "react";
import { addHotel, getHotelById, session, updateHotelById } from "../action";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      <Navbar />
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
      <Footer />
      <ToastContainer />
    </>
  );
};

export default HotelForm;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c 'fas fa-\|🏙\|🏖\|⛰\|💎\|🌲\|🌄\|🏞' app/add-hotel/page.js
grep -c 'onClick={() => toggleInputVisibility' app/add-hotel/page.js
grep -c 'type="button"' app/add-hotel/page.js
```
Expected:
```
0
9
9
```
(9 = the 9 fields with a toggle: propertyName, propertyLocation, propertyPrice, guestCapacity, bedroomCapacity, bedCapacity, serviceFee, cleaningFee, description — each has exactly one `onClick={() => toggleInputVisibility(...)}` on its "Save" button, now paired 1:1 with `type="button"` on that same button. The `Pencil` icons also call `toggleInputVisibility` via `onClick` but are not `<button>` elements, so they don't add to the `type="button"` count — only the 9 "Save" buttons do.)

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/add-hotel/page.js
git commit -m "fix: add-hotel Save toggles were submitting the form, add type=button; restyle to luxury tokens"
```

---

### Task 7: Restyle `app/manage-hotels/page.js`

**Files:**
- Modify: `app/manage-hotels/page.js`

**Interfaces:**
- No exports change — same default export `ManageHotel` (async server component).

- [ ] **Step 1: Replace the file contents**

```jsx
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
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary" app/manage-hotels/page.js
grep -q 'Plus } from "lucide-react"' app/manage-hotels/page.js && echo OK
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
git add app/manage-hotels/page.js
git commit -m "feat: restyle manage-hotels page with luxury tokens"
```

---

### Task 8: Restyle `components/ManageHotelList.jsx`

**Files:**
- Modify: `components/ManageHotelList.jsx`

**Interfaces:**
- No exports change — same default export `ManageHotelList`, same `{ filteredHotels, reviews }` props.
- Consumes `Pagination` (Phase 3, unchanged import path `./Pagination`).
- `deleteHotelById` call and the `confirm()`/`alert()`-based delete flow preserved exactly (out of scope per Global Constraints).

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { deleteHotelById } from "@/app/action";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Star, Pencil, Trash2 } from "lucide-react";
import Pagination from "./Pagination";

const ManageHotelList = ({ filteredHotels, reviews }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const hotelsPerPage = 12;
  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setLoading(true);
  };

  const handleDelete = async (hotelId, hotelTitle) => {
    const confirmDelete = confirm(`Are you sure you want to delete ${hotelTitle}?`);
    if (!confirmDelete) return;

    try {
      const result = await deleteHotelById(hotelId);
      alert(result.message || "Hotel deleted successfully!");
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Failed to delete hotel!");
    }
  };

  const skeletonLoader = (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
      {[...Array(hotelsPerPage)].map((_, index) => (
        <div
          key={index}
          className="overflow-hidden bg-surface rounded-xl border border-hairline"
        >
          <div className="relative">
            <div className="w-full h-40 sm:h-48 bg-surface-alt rounded-t-xl"></div>
            <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-surface-alt px-2 sm:px-3 py-1 rounded-full h-6 w-16"></div>
          </div>
          <div className="p-3 sm:p-4">
            <div className="h-5 w-3/4 bg-surface-alt rounded mb-2"></div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
              <div className="h-4 w-1/2 bg-surface-alt rounded"></div>
              <div className="h-4 w-1/4 bg-surface-alt rounded"></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-2">
              <div className="h-4 w-2/3 bg-surface-alt rounded"></div>
              <div className="flex space-x-2 sm:space-x-3">
                <div className="h-4 w-4 bg-surface-alt rounded"></div>
                <div className="h-4 w-4 bg-surface-alt rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {loading ? (
        skeletonLoader
      ) : currentHotels.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                <div
                  key={hotel._id}
                  className="overflow-hidden bg-surface rounded-xl border border-hairline hover:shadow-luxe transition-shadow"
                >
                  <div className="relative">
                    <Image
                      width={500}
                      height={500}
                      src={hotelImage}
                      alt="Hotel Property"
                      className="w-full h-40 sm:h-48 object-cover rounded-t-xl transition-all hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={false}
                    />
                    <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-cream/90 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold text-ink flex items-center gap-1">
                      <Star className="w-3 h-3 text-brass-dark fill-current" />
                      {Number(averageRating)?.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h2 className="text-base sm:text-lg font-semibold text-ink mb-2 truncate">
                      {hotel.title}
                    </h2>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                      <span className="text-muted text-sm sm:text-base">
                        {hotel.bedroomCapacity} Rooms Available
                      </span>
                      <span className="text-brass-dark font-semibold text-sm sm:text-base">
                        ${hotel.rent}/night
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-2">
                      <span className="text-muted text-sm">
                        Location: {hotel.location}
                      </span>
                      <div className="flex space-x-2 sm:space-x-3">
                        <Link
                          href={{
                            pathname: "/add-hotel",
                            query: { hotelId: hotel._id },
                          }}
                          className="text-brass-dark hover:text-brass"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(hotel._id, hotel.title)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {currentHotels.length > 0 && (
            <div className="mt-4 sm:mt-6 text-center">
              <Pagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredHotels.length / hotelsPerPage)}
              />
            </div>
          )}
        </>
      ) : (
        <div id="empty-state" className="text-center py-8 sm:py-12 w-full">
          <h2 className="font-serif text-xl sm:text-2xl text-ink mb-2">
            No Hotels Found
          </h2>
          <p className="text-muted text-sm sm:text-base">
            It seems there are no hotels available at the moment. Please try again later!
          </p>
        </div>
      )}
    </>
  );
};

export default ManageHotelList;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-star\|fas fa-edit\|fas fa-trash\|bg-gray-200" components/ManageHotelList.jsx
grep -q "Star, Pencil, Trash2 } from \"lucide-react\"" components/ManageHotelList.jsx && echo OK
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
git add components/ManageHotelList.jsx
git commit -m "feat: restyle ManageHotelList with luxury tokens and lucide icons"
```

---

### Task 9: Restyle all 5 route `loading.js` files

**Files:**
- Modify: `app/bookings/loading.js`
- Modify: `app/wishlists/loading.js`
- Modify: `app/profile/[id]/loading.js`
- Modify: `app/add-hotel/loading.js`
- Modify: `app/manage-hotels/loading.js`

**Interfaces:**
- All 5 remain `export default function Loading()`. All 5 are currently byte-identical to each other and to the ones already restyled in Phases 3-4; this task applies the same replacement to all 5.

- [ ] **Step 1: Replace all 5 files' contents with this (same content for all)**

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
grep -c "border-t-primary" app/bookings/loading.js app/wishlists/loading.js "app/profile/[id]/loading.js" app/add-hotel/loading.js app/manage-hotels/loading.js
```
Expected: `0` for every listed file.

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/bookings/loading.js app/wishlists/loading.js "app/profile/[id]/loading.js" app/add-hotel/loading.js app/manage-hotels/loading.js
git commit -m "feat: restyle all Phase 5 loading spinners with luxury tokens"
```

---

### Task 10: Restyle all 5 route `error.js` files

**Files:**
- Modify: `app/bookings/error.js`
- Modify: `app/wishlists/error.js`
- Modify: `app/profile/[id]/error.js`
- Modify: `app/add-hotel/error.js`
- Modify: `app/manage-hotels/error.js`

**Interfaces:**
- All 5 remain `export default function Error({ error, reset })`. All 5 are currently byte-identical to each other and to the ones already restyled in Phases 3-4; this task applies the same replacement to all 5.

- [ ] **Step 1: Replace all 5 files' contents with this (same content for all)**

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
grep -c "bg-primary" app/bookings/error.js app/wishlists/error.js "app/profile/[id]/error.js" app/add-hotel/error.js app/manage-hotels/error.js
```
Expected: `0` for every listed file.

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/bookings/error.js app/wishlists/error.js "app/profile/[id]/error.js" app/add-hotel/error.js app/manage-hotels/error.js
git commit -m "feat: restyle all Phase 5 error boundaries with luxury tokens"
```

---

## Self-Review

**Spec coverage:** §7 Phase 5 lists `app/bookings`, `app/wishlists`, `app/profile/[id]`, `app/add-hotel`, `app/manage-hotels` + related components + `loading.js` for each — all covered: `BookingDetailsModal` (Task 2), `DeleteWishlistButton` (Task 4), `ManageHotelList` (Task 8), and all 5 routes' `loading.js`/`error.js` (Tasks 9-10).

**Bug-fix scope check:** Both fixes (add-hotel `type="button"`, wishlists deprecated Image API) are narrowly scoped to the files already being restyled — no speculative fixes elsewhere.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected output, including the worked-out arithmetic in Task 6's verify step (9 toggle fields → 9 `type="button"` additions).

**Type/name consistency:** `Pagination` imported from `./Pagination` unchanged in both Task 2 and Task 8 (same relative path both components already used). No new shared components introduced in this phase — each file's restyle is self-contained.

**Out-of-scope check:** `alert()`/`confirm()` browser dialogs in `DeleteWishlistButton` and `ManageHotelList` are explicitly preserved per Global Constraints — not silently "improved" into toasts, which would be an undiscussed behavior change.

---

## Next Phases

Phase 6 (Dashboard: `Sidebar`, `app/dashboard/*` admin pages, `Chart.jsx`, `EditModal`, `Create.jsx`, plus `HotelSearch.jsx` reassigned here from the Phase 3 spec correction) gets its own plan, written next.
