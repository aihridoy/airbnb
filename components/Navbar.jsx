"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import SignOutButton from "./SignOutButton";
import { session } from "@/app/action";
import { useSearch } from "@/contexts/SearchContext";
import useDebounce from "@/hooks/useDebounce";

const Navbar = () => {
  const { setSearchQuery } = useSearch();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [user, setUser] = useState(null);
  const dummyImg = "https://via.placeholder.com/100";

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

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
  };

  const hidePopup = (e) => {
    if (e.target.closest(".popup-container") === null) {
      setIsPopupVisible(false);
    }
  };

  useEffect(() => {
    if (isPopupVisible) {
      document.addEventListener("click", hidePopup);
    }
    return () => {
      document.removeEventListener("click", hidePopup);
    };
  }, [isPopupVisible]);

  const debouncedHandleSearchChange = useDebounce((value) => {
    setSearchQuery(value);
  }, 800);

  const handleSearchChange = (e) => {
    debouncedHandleSearchChange(e.target.value);
  };

  return (
    <nav className="grid grid-cols-2 md:flex justify-between items-center py-3 bg-white border-b mb-6 md:gap-8 px-4 md:px-8 lg:px-20">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Hotel Logo"
            className="h-8 w-auto"
            width={200}
            height={200}
          />
        </Link>
      </div>

      <div className="row-start-2 col-span-2 border-0 md:border flex shadow-sm hover:shadow-md transition-all md:rounded-full items-center px-2 mt-2 sm:md:mt-0">
        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 divide-x py-2 md:px-2 flex-grow">
          <input
            type="text"
            placeholder="Where to?"
            className="px-3 bg-transparent focus:outline-none lg:col-span-3 placeholder:text-sm"
            onChange={handleSearchChange}
          />
        </div>

        <button className="bg-primary w-9 h-9 rounded-full grid place-items-center text-sm text-center transition-all hover:brightness-90 shrink-0">
          <i className="fas fa-search text-white"></i>
        </button>
      </div>

      <div className="flex items-center space-x-4 relative justify-end">
        <button>
          <i className="fas fa-language text-zinc-700 text-xl"></i>
        </button>
        <button
          onClick={togglePopup}
          className="bg-white border border-zinc-300 text-zinc-800 px-4 py-2 rounded-full hover:shadow-md flex gap-3 items-center justify-center"
        >
          <i className="fas fa-bars"></i>
          {user ? (
            <span className="bg-zinc-600 w-6 h-6 rounded-full overflow-hidden">
              <Image
                src={user?.image || dummyImg}
                alt="Profile"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </span>
          ) : (
            <span className="bg-zinc-600 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white">
              <i className="fas fa-user text-white"></i>
            </span>
          )}
        </button>

        {/* Popup */}
        <div
          className={`max-w-48 w-48 bg-white shadow-sm border rounded-md absolute right-0 top-full max-h-fit mt-2 z-50 ${
            isPopupVisible ? "block" : "hidden"
          }`}
        >
          <ul className="popup-container">
            {!user ? (
              <>
                <Link href="/login">
                  <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                    <i className="fas fa-sign-in-alt"></i>
                    Login
                  </li>
                </Link>

                <Link href="/register">
                  <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                    <i className="fas fa-user-plus"></i>
                    Signup
                  </li>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                    <i className="fas fa-tachometer-alt"></i>
                    Dashboard
                  </li>
                </Link>

                <Link href="/add-hotel">
                      <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                        <i className="fas fa-hotel"></i>
                        Create Hotel
                      </li>
                    </Link>

                {user?.role === "user" && (
                  <>
                    <Link href="/manage-hotels">
                      <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                        <i className="fas fa-tools"></i>
                        Manage Hotels
                      </li>
                    </Link>

                    <Link href="/bookings">
                      <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                        <i className="fas fa-book"></i>
                        Bookings
                      </li>
                    </Link>

                    <Link href="/wishlists">
                      <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                        <i className="fas fa-heart"></i>
                        Wishlists
                      </li>
                    </Link>

                    <Link href={`/profile/${user?.id}`}>
                      <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                        <i className="fas fa-user"></i>
                        Profile
                      </li>
                    </Link>
                  </>
                )}

                <li className="px-3 py-2 text-sm text-zinc-700 transition-all hover:bg-zinc-50 hover:text-zinc-800 hover:pl-4 flex items-center gap-2">
                  <SignOutButton />
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
