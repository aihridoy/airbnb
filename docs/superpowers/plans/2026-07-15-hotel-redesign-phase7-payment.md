# Hotel Redesign — Phase 7: Payment Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the checkout/payment flow — the "review & pay" page, the billing form, the edit-booking modal, and the payment-success/receipt page — to the luxury-minimal design system, and fix a missing-chrome bug found on the success page.

## Corrections to the Spec's Phase 7 File List

1. **`components/Success.jsx` does NOT belong in this phase — it's dead code.** `grep -rn "components/Success\b" app components` returns zero imports anywhere in the app. It's a fully static mock (hardcoded "Sea View Room", "Jan 3, 2025", "BOOK123456") superseded by the real `app/payment-success/page.js`, which fetches the actual booking and generates a real PDF receipt. This plan does not restyle it; it's flagged as a Phase 8 (Polish) deletion candidate, same treatment as `components/Create.jsx` in Phase 6.
2. **`components/EditModal.jsx` is correctly in scope here** — it was reassigned to this phase during Phase 6's investigation, since its only consumer is `app/paymentProcess/page.js`.

## Bug Found While Reading These Files (fixed as part of this phase)

**`app/payment-success/page.js` renders with no `Navbar` or `Footer` at all.** Every other standalone top-level page in this app that isn't a dashboard route or an auth modal (`app/bookings`, `app/wishlists`, `app/manage-hotels`, `app/add-hotel`, and this flow's own `app/paymentProcess/page.js`) renders `<Navbar />` (and, for full-page forms like `add-hotel`/`paymentProcess`, `<Footer />` too). The success page — the very last step of the flow the user just came from `paymentProcess` through — is the only one left with no way to navigate anywhere except the one "Back to home" link at the bottom. Fixed in Task 4 by adding `<Navbar />` and `<Footer />`, matching `paymentProcess`'s own chrome.

## Global Constraints

- Tokens from Phase 0: `cream`, `surface`, `surface-alt`, `ink`, `muted`, `brass`, `brass-dark`, `brass-light`, `hairline`, `font-serif`, `shadow-luxe`. `brass` decorative-only; text/icon contrast uses `brass-dark`.
- No emoji/Font Awesome/react-icons — lucide-react only.
- Modal chrome (established in Phase 5's `BookingDetailsModal.jsx`): overlay `bg-ink/60 backdrop-blur-sm`, panel `bg-surface border border-hairline shadow-luxe rounded-2xl`, header row with a lucide `X` close button (`text-muted hover:text-ink`, `aria-label="Close"`).
- `EditModal.jsx`'s `handleSave`/`onClose`/`newDate`/`newGuests` state logic must be preserved byte-identical — only markup/classes/icons change.
- `PaymentAndBillingForm.jsx`'s `handleSubmit`/`createBooking`/`sendEmail`/booking-payload construction and the `handleChange`/`formData` state must be preserved byte-identical — only markup/classes change. The confirmation email's inline HTML template is unrelated UI (an email client renders it, not this app's Tailwind) and is explicitly out of scope.
- `app/payment-success/page.js`'s `downloadReceipt` pdf-lib closure and its booking-fetch `useEffect`s must be preserved byte-identical — only markup/classes/icons change, plus the Navbar/Footer addition.
- No test framework — verification is lint + targeted `grep`.
- **Known environment issue:** in a nested git worktree, `npm run lint` gives a false "Plugin @next/next was conflicted" error — use `npx eslint --no-eslintrc -c .eslintrc.json <file>` instead there.

---

### Task 1: Restyle `components/EditModal.jsx`

**Files:**
- Modify: `components/EditModal.jsx`

**Interfaces:**
- No exports change — same default export `EditModal`, same `{ type, onClose, updateBookingDetails, guests, checkIn, checkOut }` props. `handleSave`/`newDate`/`newGuests` state logic unchanged. Consumed by `app/paymentProcess/page.js` (Task 3) with the exact same prop names — do not rename any prop.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

const EditModal = ({ type, onClose, updateBookingDetails, guests, checkIn, checkOut }) => {
    const [newDate, setNewDate] = useState({ checkIn: checkIn, checkOut: checkOut });
    const [newGuests, setNewGuests] = useState(guests || 0);

    const handleSave = () => {
        if (type === 'dates') {
            updateBookingDetails({ checkIn: newDate.checkIn, checkOut: newDate.checkOut });
        } else if (type === 'guests') {
            updateBookingDetails({ guests: newGuests });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
            <div className="bg-surface border border-hairline shadow-luxe w-full max-w-md rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="font-serif text-lg text-ink">
                        Edit {type === 'dates' ? 'Dates' : 'Guests'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-ink transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                {type === 'dates' && (
                    <div className="space-y-4">
                        <input
                            type="date"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newDate.checkIn}
                            onChange={(e) => setNewDate({ ...newDate, checkIn: e.target.value })}
                        />
                        <input
                            type="date"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newDate.checkOut}
                            onChange={(e) => setNewDate({ ...newDate, checkOut: e.target.value })}
                        />
                    </div>
                )}
                {type === 'guests' && (
                    <div className="space-y-4">
                        <input
                            type="number"
                            className="border border-hairline rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-brass"
                            value={newGuests}
                            onChange={(e) => setNewGuests(e.target.value)}
                        />
                    </div>
                )}
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="text-muted hover:text-ink transition-colors text-sm">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-brass-dark text-cream px-4 py-2 rounded-lg hover:bg-brass transition-colors text-sm"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditModal;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-black bg-opacity-50\|bg-blue-500" components/EditModal.jsx
grep -q "X } from 'lucide-react'" components/EditModal.jsx && echo OK
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
git add components/EditModal.jsx
git commit -m "feat: restyle EditModal with luxury tokens and lucide close icon"
```

---

### Task 2: Restyle `components/PaymentAndBillingForm.jsx`

**Files:**
- Modify: `components/PaymentAndBillingForm.jsx`

**Interfaces:**
- No exports change — same default export `PaymentAndBillingForm`, same `{ totalPrice, bookingDetails }` props. `handleChange`/`handleSubmit`/`formData`/`user` state, the `createBooking`/`sendEmail` calls, the booking-payload object shape, and the `router.push('/payment-success?bookingId=...')` navigation are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import { createBooking, sendEmail, session } from "@/app/action";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentAndBillingForm = ({ totalPrice, bookingDetails }) => {
    const [user, setUser] = useState(null);
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await session();
                setUser(userData?.user || null);
            } catch (error) {
                console.error("Failed to fetch user session:", error);
            }
        };

        fetchUser();
    }, []);
    const {
        title,
        description,
        guests,
        averageRating,
        checkIn,
        checkOut,
        totalReviews,
        ownerId,
        hotelId,
        cleaningFee,
        serviceFee,
        hotelImage,
    } = bookingDetails;
    const [formData, setFormData] = useState({
        cardNumber: "",
        expiration: "",
        cvv: "",
        streetAddress: "",
        aptSuite: "",
        city: "",
        state: "",
        zipCode: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const bookingPayload = {
            hotelId,
            userId: user?.id,
            bookingDetails: {
                title,
                description,
                guests,
                averageRating,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                totalReviews,
                hotelImage,
                cleaningFee,
                serviceFee,
            },
            paymentDetails: {
                cardNumber: formData.cardNumber,
                expiration: formData.expiration,
                cvv: formData.cvv,
                billingAddress: {
                    streetAddress: formData.streetAddress,
                    aptSuite: formData.aptSuite,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                },
            },
            totalPrice,
        };

        try {
            const response = await createBooking(bookingPayload);
            if (response) {
                await sendEmail({
                    to: user?.email,
                    subject: "Booking Confirmation",
                    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h1 style="color: #0056b3;">Reservation Receipt</h1>
            <p><strong>Booking ID:</strong> ${response.bookingId || "N/A"}</p>
            <p><strong>Property:</strong> ${title || "N/A"}</p>
            <p><strong>Total Guests:</strong> ${guests || "N/A"}</p>
            <p><strong>Check-in:</strong> ${new Date(checkIn).toLocaleDateString("en-US") || "N/A"
                        }</p>
            <p><strong>Check-out:</strong> ${new Date(checkOut).toLocaleDateString("en-US") || "N/A"
                        }</p>
            <p><strong>Total Paid:</strong> $${totalPrice || "N/A"}</p>
            <p><strong>Hotel ID:</strong> ${hotelId || "N/A"}</p>
            <p><strong>User ID:</strong> ${user?.id || "N/A"}</p>
            <p><strong>Rating:</strong> ${averageRating || "N/A"} (${totalReviews || 0
                        } review(s))</p>
            <p><strong>Card Number:</strong> **** **** **** ${formData.cardNumber.slice(-4) || "N/A"
                        }</p>
        </div>
    `,
                });
                toast.success(response.message || "Booking created successfully!");
                setIsLoading(false);
                router.push(`/payment-success?bookingId=${response.bookingId}`);
            } else {
                toast.error("Failed to create booking. Please try again.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Error submitting booking:", error);
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    };

    return (
        <section className="mb-8">
            <ToastContainer position="top-right" autoClose={3000} />
            <form onSubmit={handleSubmit}>
                <div className="mb-8">
                    <h2 className="font-serif text-xl text-ink mb-4">
                        Pay with American Express
                    </h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="Card number"
                            className="w-full p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="expiration"
                                value={formData.expiration}
                                onChange={handleChange}
                                placeholder="Expiration"
                                className="p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <input
                                type="text"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                placeholder="CVV"
                                className="p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="font-serif text-xl text-ink mb-4">Billing address</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleChange}
                            placeholder="Street address"
                            className="w-full p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                        />
                        <input
                            type="text"
                            name="aptSuite"
                            value={formData.aptSuite}
                            onChange={handleChange}
                            placeholder="Apt or suite number"
                            className="w-full p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                        />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className="p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                placeholder="ZIP code"
                                className="p-3 border border-hairline rounded-lg focus:outline-none focus:ring-2 focus:ring-brass"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full block text-center bg-brass-dark text-cream py-3 rounded-lg mt-6 transition-colors ${isLoading
                                ? "cursor-not-allowed opacity-50"
                                : "hover:bg-brass"
                            }`}
                        disabled={isLoading}
                    >
                        {isLoading ? "Processing..." : "Request to book"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default PaymentAndBillingForm;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "bg-primary\|border rounded-lg\"" components/PaymentAndBillingForm.jsx
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
git add components/PaymentAndBillingForm.jsx
git commit -m "feat: restyle PaymentAndBillingForm with luxury tokens"
```

---

### Task 3: Restyle `app/paymentProcess/page.js`

**Files:**
- Modify: `app/paymentProcess/page.js`

**Interfaces:**
- No exports change — same default export `PaymentProcessPage`, no props. `BookingContext` usage, `formattedDateRange`/`nights`/`totalPrice` calculations, and the `openModal`/`isModalOpen`/`editType` state are preserved byte-identical. Consumes `PaymentAndBillingForm` (Task 2) and `EditModal` (Task 1) with unchanged props.

- [ ] **Step 1: Replace the file contents**

```jsx
"use client";

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Image from 'next/image';
import { format, parseISO, differenceInDays } from 'date-fns';
import { useContext, useState } from 'react';
import { BookingContext } from '@/contexts/BookingContext';
import PaymentAndBillingForm from '@/components/PaymentAndBillingForm';
import EditModal from '@/components/EditModal';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Star } from 'lucide-react';

const PaymentProcessPage = () => {
    const router = useRouter();
    const handleGoBack = () => {
        router.back();
    };

    const { bookingDetails, updateBookingDetails } = useContext(BookingContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editType, setEditType] = useState(null);

    const formattedCheckIn = bookingDetails.checkIn ? format(parseISO(bookingDetails.checkIn), 'MMM d') : '';
    const formattedCheckOut = bookingDetails.checkOut ? format(parseISO(bookingDetails.checkOut), 'd, yyyy') : '';
    const formattedDateRange = (bookingDetails.checkIn && bookingDetails.checkOut)
        ? `${formattedCheckIn} - ${formattedCheckOut}`
        : 'Date Range Not Available';

    let nights = 0;
    if (bookingDetails.checkIn && bookingDetails.checkOut) {
        const checkInDate = parseISO(bookingDetails.checkIn);
        const checkOutDate = parseISO(bookingDetails.checkOut);
        nights = differenceInDays(checkOutDate, checkInDate);
    }

    const pricePerNight = parseFloat(bookingDetails.rent || 0);
    const totalPricePerNight = pricePerNight * nights;
    const totalPrice = totalPricePerNight + parseFloat(bookingDetails.cleaningFee) + parseFloat(bookingDetails.serviceFee);

    const openModal = (type) => {
        setEditType(type);
        setIsModalOpen(true);
    };

    return (
        <>
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-8 bg-cream">
                <div className="mb-8">
                    <button onClick={handleGoBack} className="flex items-center text-ink hover:text-brass-dark transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Request to book
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                        <section className="mb-8">
                            <h2 className="font-serif text-xl text-ink mb-4">Your trip</h2>

                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h3 className="font-medium text-ink">Dates</h3>
                                    <p className="text-muted text-sm">{formattedDateRange}</p>
                                </div>
                                <button
                                    onClick={() => openModal('dates')}
                                    className="text-brass-dark underline text-sm hover:text-brass"
                                >
                                    Edit
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-ink">Guests</h3>
                                    <p className="text-muted text-sm">{bookingDetails?.guests} guest</p>
                                </div>
                                <button
                                    onClick={() => openModal('guests')}
                                    className="text-brass-dark underline text-sm hover:text-brass"
                                >
                                    Edit
                                </button>
                            </div>
                        </section>
                        <PaymentAndBillingForm totalPrice={totalPrice} bookingDetails={bookingDetails} />
                    </div>

                    <div>
                        <div className="bg-surface border border-hairline p-6 rounded-2xl mb-8 sticky top-0">
                            <div className="flex items-start gap-4 mb-6">
                                <Image
                                    width={500}
                                    height={500}
                                    src={bookingDetails?.hotelImage}
                                    alt="Property"
                                    className="w-20 h-20 rounded-lg object-cover"
                                    unoptimized={true}
                                />
                                <div>
                                    <p className="text-sm text-ink">
                                        {bookingDetails?.title}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <Star className="w-3.5 h-3.5 mr-1 text-brass-dark fill-current" />
                                        <span className="text-xs text-muted"
                                        >{bookingDetails?.averageRating?.toFixed(1)} ({bookingDetails?.totalReviews} Reviews)</span
                                        >
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-hairline pt-4">
                                <h3 className="font-semibold text-ink mb-4">Price details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-ink">
                                        <span>${bookingDetails?.rent} x {nights} nights</span>
                                        <span>${totalPricePerNight}</span>
                                    </div>
                                    <div className="flex justify-between text-ink">
                                        <span>Cleaning fee</span>
                                        <span>${bookingDetails?.cleaningFee}</span>
                                    </div>
                                    <div className="flex justify-between text-ink">
                                        <span>Service fee</span>
                                        <span>${bookingDetails?.serviceFee}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-ink pt-3 border-t border-hairline">
                                        <span>Total (USD)</span>
                                        <span>${totalPrice.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            {isModalOpen && (
                <EditModal
                    type={editType}
                    onClose={() => setIsModalOpen(false)}
                    guests={bookingDetails?.guests}
                    checkIn={bookingDetails.checkIn}
                    checkOut={bookingDetails.checkOut}
                    updateBookingDetails={updateBookingDetails}
                />
            )}
        </>
    );
};

export default PaymentProcessPage;
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-\|text-zinc-\|bg-white" app/paymentProcess/page.js
grep -q "ChevronLeft, Star } from 'lucide-react'" app/paymentProcess/page.js && echo OK
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
git add app/paymentProcess/page.js
git commit -m "feat: restyle paymentProcess page with luxury tokens and lucide icons"
```

---

### Task 4: Restyle `app/payment-success/page.js` (and add missing Navbar/Footer)

**Files:**
- Modify: `app/payment-success/page.js`

**Interfaces:**
- No exports change — same default export `PaymentSuccess`, no props.
- **Bug fix:** adds `<Navbar />` and `<Footer />`, matching every other standalone page in the flow (this page previously rendered with none).
- The `downloadReceipt` pdf-lib closure and the two `useEffect`s (`bookingId` from URL params, `getBooking` fetch) are preserved byte-identical.

- [ ] **Step 1: Replace the file contents**

```jsx
/* eslint-disable react/no-unescaped-entities */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getBooking } from "../action";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Star, Mail, MessageCircle, Briefcase, Download } from "lucide-react";

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function PaymentSuccess() {
  const [booking, setBooking] = useState({});
  const [bookingId, setBookingId] = useState(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setBookingId(params.get("bookingId"));
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      const response = await getBooking(bookingId);
      setBooking(response?.booking);
    };

    fetchBookings();
  }, [bookingId]);

  const downloadReceipt = async () => {
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
      size: 24,
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

    drawDetail("Booking ID:", bookingId?.slice(0, 8), true);
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
      `${booking?.bookingDetails?.averageRating?.toFixed(1)} (${booking?.bookingDetails?.totalReviews} review(s))`
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
    link.download = `receipt_${bookingId}.pdf`;
    link.click();
  };

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 bg-cream">
        <div className="text-center my-12">
          <div className="inline-block p-4 bg-brass-light/20 rounded-full mb-6">
            <CheckCircle2 className="w-10 h-10 text-brass-dark" />
          </div>
          <h1 className="font-serif text-3xl text-ink mb-4">Payment Successful!</h1>
          <p className="text-muted mb-8">
            Your booking has been confirmed. Check your email for details.
          </p>
        </div>

        <div className="bg-surface border border-hairline rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-6 mb-6 pb-6 border-b border-hairline">
            <Image
              width={500}
              height={500}
              src={booking?.bookingDetails?.hotelImage}
              alt="Property"
              className="w-32 h-32 rounded-lg object-cover"
              unoptimized={true}
            />
            <div>
              <h2 className="font-serif text-2xl text-ink mb-2">
                {booking?.bookingDetails?.title}
              </h2>
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 mr-1 text-brass-dark fill-current" />
                <span className="text-sm text-ink">
                  {booking?.bookingDetails?.averageRating?.toFixed(1)} (
                  {booking?.bookingDetails?.totalReviews}+ reviews)
                </span>
              </div>
              <p className="text-muted">
                {booking?.bookingDetails?.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-ink mb-4">Reservation Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Check-in</span>
                  <span className="text-ink text-sm">
                    {formatDate(booking?.bookingDetails?.checkInDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Check-out</span>
                  <span className="text-ink text-sm">
                    {formatDate(booking?.bookingDetails?.checkOutDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted text-sm">Guests</span>
                  <span className="text-ink text-sm">
                    {booking?.bookingDetails?.guests} guest
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-ink mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Total amount paid</span>
                  <span className="font-semibold text-ink">${booking?.totalPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted text-sm">Booking ID</span>
                  <span className="text-ink">{bookingId?.slice(0, 8)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-hairline rounded-2xl p-6 mb-8">
          <h3 className="font-serif text-xl text-ink mb-6">Next Steps</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-brass-dark">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-ink mb-1">Check your email</h4>
                <p className="text-muted">
                  We've sent your confirmation and trip details to your email
                  address.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-brass-dark">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-ink mb-1">Message your host</h4>
                <p className="text-muted">
                  Introduce yourself and let them know your travel plans.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-brass-dark">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-ink mb-1">Plan your trip</h4>
                <p className="text-muted">
                  Review house rules and check-in instructions in your trip
                  details.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={downloadReceipt}
            className="flex items-center justify-center px-6 py-3 bg-brass-dark text-cream rounded-lg hover:bg-brass transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </button>
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted">Need help with your booking?</p>
          <a href="#" className="text-brass-dark hover:underline">
            Visit our Help Center
          </a>
          <br />
          <Link href="/" className="text-brass-dark hover:underline">
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run:
```bash
grep -c "fas fa-\|text-zinc-\|bg-white" app/payment-success/page.js
grep -q "import Navbar from \"@/components/Navbar\"" app/payment-success/page.js && echo NAVBAR_OK
grep -q "import Footer from \"@/components/Footer\"" app/payment-success/page.js && echo FOOTER_OK
grep -q "PDFDocument.create" app/payment-success/page.js && echo PDF_OK
```
Expected:
```
0
NAVBAR_OK
FOOTER_OK
PDF_OK
```

- [ ] **Step 3: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/payment-success/page.js
git commit -m "fix: add missing Navbar/Footer to payment-success page, restyle to luxury tokens"
```

---

### Task 5: Restyle the 4 payment-flow `loading.js`/`error.js` files

**Files:**
- Modify: `app/paymentProcess/loading.js`
- Modify: `app/paymentProcess/error.js`
- Modify: `app/payment-success/loading.js`
- Modify: `app/payment-success/error.js`

**Interfaces:**
- `loading.js` files remain `export default function Loading()`. `error.js` files remain `export default function Error({ error, reset })`. All four are currently the same generic spinner/error-boundary pattern already restyled in Phases 3-6; this task applies the identical replacement.

- [ ] **Step 1: Replace both `loading.js` files with this (same content for both)**

```jsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-hairline border-t-brass-dark" />
    </div>
  );
}
```

- [ ] **Step 2: Replace both `error.js` files with this (same content for both)**

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

- [ ] **Step 3: Verify**

Run:
```bash
grep -c "border-t-primary\|bg-primary" app/paymentProcess/loading.js app/paymentProcess/error.js app/payment-success/loading.js app/payment-success/error.js
```
Expected: `0` for every listed file.

- [ ] **Step 4: Lint**

Run: `npm run lint` (or the nested-worktree workaround)
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add app/paymentProcess/loading.js app/paymentProcess/error.js app/payment-success/loading.js app/payment-success/error.js
git commit -m "feat: restyle payment-flow loading spinners and error boundaries with luxury tokens"
```

---

## Self-Review

**Spec coverage:** All files in the master spec's Phase 7 scope are covered, with the two corrections (`Success.jsx` excluded as dead code, `EditModal.jsx` correctly included per its Phase 6 reassignment) documented above.

**Bug-fix scope check:** The one fix (missing Navbar/Footer on payment-success) is narrowly scoped to that page, matching the chrome pattern already established on every sibling standalone page.

**Placeholder scan:** No TBD/TODO. Every step has literal file contents and literal expected output.

**Type/name consistency:** `EditModal`'s props (`type, onClose, updateBookingDetails, guests, checkIn, checkOut`) are unchanged between Task 1's definition and Task 3's consumption. `PaymentAndBillingForm`'s props (`totalPrice, bookingDetails`) are unchanged between Task 2's definition and Task 3's consumption.

**Out-of-scope check:** `components/Success.jsx` does not appear in any task's file list — confirmed correctly deferred as dead code (Phase 8 deletion candidate). The confirmation-email HTML template inside `PaymentAndBillingForm.jsx` is left untouched (out of scope — it's email-client-rendered markup, not this app's UI).

---

## Next Phase

Phase 8 (Polish) is the final phase — it should sweep up all deferred cleanup items flagged across Phases 5-7: delete `components/Create.jsx` (dead, Phase 6), delete `components/Success.jsx` (dead, this phase), and cover anything else the master spec calls for that hasn't been touched by Phases 1-7.
