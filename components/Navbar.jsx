"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Globe,
  Menu,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Hotel,
  Wrench,
  BookOpen,
  Heart,
  UserCircle,
  PlusCircle,
  Users,
  CalendarCheck,
} from "lucide-react";
import SignOutButton from "./SignOutButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAllHotels } from "@/app/action";

const CATEGORY_LABELS = {
  urban: "Urban",
  beach: "Beach",
  mountain: "Mountain",
  luxury: "Luxury",
  rustic: "Rustic",
  countryside: "Countryside",
  lakeside: "Lakeside",
  desert: "Desert",
  island: "Island",
  ski: "Ski",
};

const Navbar = () => {
  const router = useRouter();
  const { data: sessionData } = useSession();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const user = sessionData?.user || null;

  const dummyImg =
    "https://img.freepik.com/premium-vector/vector-flat-illustration-grayscale-avatar-user-profile-person-icon-gender-neutral-silhouette-profile-picture-suitable-social-media-profiles-icons-screensavers-as-templatex9xa_719432-2210.jpg?semt=ais_hybrid&w=740";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [hotelsReady, setHotelsReady] = useState(false);
  const hotelsLoaded = useRef(false);
  const searchRef = useRef(null);

  // Lazily load the hotel list the first time the user engages the search -
  // avoids fetching on every page just to power the navbar typeahead.
  const loadHotels = async () => {
    if (hotelsLoaded.current) return;
    hotelsLoaded.current = true;
    try {
      const res = await getAllHotels();
      setHotels(res?.hotels ?? []);
      setHotelsReady(true);
    } catch (e) {
      console.error("Failed to load hotels for search:", e);
      hotelsLoaded.current = false;
    }
  };

  const query = searchValue.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!query) return [];
    return hotels
      .filter(
        (h) =>
          h.title?.toLowerCase().includes(query) ||
          h.location?.toLowerCase().includes(query) ||
          h.category?.toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [query, hotels]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const submitSearch = () => {
    const q = searchValue.trim();
    setSearchOpen(false);
    router.push(q ? `/search?location=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <nav
      className={`sticky top-0 grid grid-cols-2 md:flex justify-between items-center transition-all duration-300 md:gap-8 px-4 md:px-8 lg:px-20 z-30 border-b border-hairline ${
        isScrolled
          ? "py-2 bg-cream/90 backdrop-blur-md shadow-luxe"
          : "py-3 bg-cream"
      }`}
    >
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

      <div
        ref={searchRef}
        className="row-start-2 col-span-2 relative border-0 md:border md:border-hairline flex shadow-sm hover:shadow-md transition-all md:rounded-full items-center px-2 mt-2 sm:md:mt-0 bg-surface"
      >
        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 divide-x divide-hairline py-2 md:px-2 flex-grow">
          <input
            type="text"
            placeholder="Search a city or hotel"
            value={searchValue}
            className="px-3 bg-transparent focus:outline-none lg:col-span-3 placeholder:text-sm text-ink font-sans"
            onFocus={() => {
              loadHotels();
              setSearchOpen(true);
            }}
            onChange={(e) => {
              setSearchValue(e.target.value);
              setSearchOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
          />
        </div>

        {searchOpen && query && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-surface border border-hairline rounded-2xl shadow-luxe overflow-hidden z-50 text-left">
            {!hotelsReady ? (
              <p className="px-4 py-3 text-sm text-muted">Searching…</p>
            ) : matches.length > 0 ? (
              <ul className="max-h-96 overflow-y-auto">
                {matches.map((h) => (
                  <li key={h._id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(`/details/${h._id}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-alt transition-colors text-left"
                    >
                      <span className="relative w-12 h-12 rounded-lg overflow-hidden bg-surface-alt flex-shrink-0">
                        <Image
                          src={h.images?.[0] || "https://placehold.co/96x96"}
                          alt={h.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink truncate">
                          {h.title}
                        </span>
                        <span className="block text-xs text-muted truncate">
                          {h.location}
                          {h.category ? ` · ${CATEGORY_LABELS[h.category] || h.category}` : ""}
                        </span>
                      </span>
                      <span className="text-sm font-semibold text-ink flex-shrink-0">
                        ${h.rent}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-4 py-3 text-sm text-muted">No matches for "{searchValue.trim()}"</p>
            )}
            <button
              type="button"
              onClick={submitSearch}
              className="w-full flex items-center gap-2 px-4 py-2.5 border-t border-hairline text-sm text-brass-dark hover:bg-surface-alt transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              Search all stays for "{searchValue.trim()}"
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label="Search"
          onClick={submitSearch}
          className="bg-ink w-9 h-9 rounded-full grid place-items-center text-sm text-center transition-all hover:bg-brass-dark shrink-0"
        >
          <Search className="w-4 h-4 text-cream" />
        </button>
      </div>

      <div className="flex items-center space-x-4 relative justify-end">
        <button aria-label="Language">
          <Globe className="w-5 h-5 text-ink" />
        </button>
        <button
          onClick={togglePopup}
          className="bg-surface border border-hairline text-ink px-4 py-2 rounded-full hover:shadow-md flex gap-3 items-center justify-center"
        >
          <Menu className="w-4 h-4" />
          {user ? (
            <span className="w-6 h-6 rounded-full overflow-hidden bg-surface-alt">
              <Image
                src={user?.image || dummyImg}
                alt="Profile"
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </span>
          ) : (
            <span className="bg-ink w-6 h-6 rounded-full flex items-center justify-center text-xs text-cream">
              <User className="w-3 h-3" />
            </span>
          )}
        </button>

        {/* Popup */}
        <div
          className={`max-w-48 w-48 bg-surface shadow-luxe border border-hairline rounded-xl absolute right-0 top-full max-h-fit mt-2 z-50 ${
            isPopupVisible ? "block" : "hidden"
          }`}
        >
          <ul className="popup-container py-1">
            {!user ? (
              <>
                <Link href="/login">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Login
                  </li>
                </Link>

                <Link href="/register">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Signup
                  </li>
                </Link>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </li>
                </Link>

                {user?.role === "user" && (
                  <>
                    <Link href="/add-hotel">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Create Hotel
                      </li>
                    </Link>

                    <Link href="/manage-hotels">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Manage Hotels
                      </li>
                    </Link>

                    <Link href="/bookings">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Bookings
                      </li>
                    </Link>

                    <Link href="/wishlists">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Wishlists
                      </li>
                    </Link>

                    <Link href={`/profile/${user?.id}`}>
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </li>
                    </Link>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <Link href="/add-hotel">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" />
                        Create Hotel
                      </li>
                    </Link>

                    <Link href="/dashboard/hotels-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Hotel className="w-4 h-4" />
                        Hotels List
                      </li>
                    </Link>

                    <Link href="/dashboard/bookings-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4" />
                        Bookings List
                      </li>
                    </Link>

                    <Link href="/dashboard/users-list">
                      <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Users List
                      </li>
                    </Link>
                  </>
                )}

                <li className="px-3 py-2 text-sm text-ink transition-all hover:bg-surface-alt hover:text-brass-dark hover:pl-4 flex items-center gap-2">
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
