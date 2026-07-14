"use client";
import React, { useContext, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { BookingContext } from "@/contexts/BookingContext";
import { session } from "@/app/action";
import { Star } from "lucide-react";

const Reserve = ({
  rent,
  title,
  description,
  serviceFee,
  cleaningFee,
  totalReviews,
  averageRating,
  ownerId,
  hotelId,
  hotelImage,
}) => {
  const [user, setUser] = useState(null);
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState("");
  const { setBookingDetails } = useContext(BookingContext);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const res = await session();
      setUser(res);
    };

    fetchUser();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    if (checkInDate && checkOutDate && guests) {
      const checkIn = format(checkInDate, "yyyy-MM-dd");
      const checkOut = format(checkOutDate, "yyyy-MM-dd");
      setBookingDetails({
        title,
        description,
        rent,
        guests,
        checkIn: checkIn,
        checkOut: checkOut,
        serviceFee,
        cleaningFee,
        totalReviews,
        averageRating,
        ownerId,
        hotelId,
        hotelImage,
      });
      router.push("/paymentProcess");
    } else {
      alert("Please fill out all fields.");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface shadow-luxe rounded-2xl p-6 border border-hairline">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xl font-bold text-ink">${rent}</span>
            <span className="text-muted ml-1">per night</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-brass-dark fill-current mr-1" />
            <span className="text-ink">{averageRating.toFixed(1)}</span>
          </div>
        </div>

        <div className="border border-hairline rounded-lg mb-4">
          <div className="grid grid-cols-2 border-b border-hairline">
            <div className="p-3 border-r border-hairline">
              <DatePicker
                selected={checkInDate}
                onChange={(date) => setCheckInDate(date)}
                selectsStart
                startDate={checkInDate}
                endDate={checkOutDate}
                placeholderText="Check in"
                className="w-full"
                dateFormat="MM/dd/yyyy"
              />
            </div>
            <div className="p-3">
              <DatePicker
                selected={checkOutDate}
                onChange={(date) => setCheckOutDate(date)}
                selectsEnd
                startDate={checkInDate}
                endDate={checkOutDate}
                minDate={checkInDate}
                placeholderText="Check out"
                className="w-full"
                dateFormat="MM/dd/yyyy"
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Guests"
            className="w-full p-3 rounded-b-lg focus:outline-none"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full block text-center bg-brass-dark text-cream py-3 rounded-lg transition-colors hover:bg-brass"
        >
          Reserve
        </button>

        <div className="text-center mt-4 text-muted">
          <p>You won&apos;t be charged yet</p>
        </div>
      </div>
    </form>
  );
};

export default Reserve;
