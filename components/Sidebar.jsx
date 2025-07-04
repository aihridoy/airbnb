"use client";

import { session } from "@/app/action";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaPlusSquare,
  FaHotel,
  FaClipboardList,
  FaUsers,
  FaHeart,
  FaCalendarCheck,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch session once on mount
  useEffect(() => {
    const fetchUser = async () => {
      const auth = await session();
      console.log("Auth data:", auth);
      if (auth && auth.user) setUser(auth.user);
    };
    fetchUser();
  }, []);

  const isAdmin = user?._doc?.role === "admin";
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Master nav list with role tags
  const navItems = [
    // always visible
    { name: "Home", icon: FaHome, path: "/", roles: ["all"] },

    // admin-only routes
    { name: "Add Hotel", icon: FaPlusSquare, path: "/dashboard/create-hotel", roles: ["admin"] },
    { name: "Hotels List", icon: FaHotel, path: "/dashboard/hotels-list", roles: ["admin"] },
    { name: "Bookings List", icon: FaClipboardList, path: "/dashboard/bookings-list", roles: ["admin"] },
    { name: "Wishlists List", icon: FaHeart, path: "/dashboard/wishlists-list", roles: ["admin"] },
    { name: "Users List", icon: FaUsers, path: "/dashboard/users-list", roles: ["admin"] },

    // regular user routes
    { name: "Manage Hotels", icon: FaHotel, path: "/dashboard/manage-hotels", roles: ["user"] },
    { name: "Profile", icon: FaUserCircle, path: "/dashboard/profile", roles: ["user"] },
    { name: "Bookings", icon: FaCalendarCheck, path: "/dashboard/bookings", roles: ["user"] },
    { name: "Wishlists", icon: FaHeart, path: "/dashboard/wishlists", roles: ["user"] },

    // always visible
    { name: "Logout", icon: FaSignOutAlt, path: "/api/auth/signout", roles: ["all"] },
  ];

  // filter list by role
  const filteredNav = navItems.filter(({ roles }) =>
    roles.includes("all") || roles.includes(isAdmin ? "admin" : "user")
  );

  return (
    <div
      className={`bg-[#02877A] text-white h-screen overflow-hidden ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col transition-all duration-300 ease-in-out shadow-lg`}
    >
      {/* Toggle button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none hover:bg-[#026d62] p-2 rounded-full transition-colors"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Logo */}
      <div className="p-4 flex items-center space-x-2 border-b border-[#026d62]">
        {isOpen && (
          <>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02877A] font-bold text-xl">
              H
            </div>
            <span className="text-xl font-semibold">HotelHub</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNav.map(({ name, path, icon: Icon }) => (
            <li key={name}>
              <Link
                href={path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#026d62] transition-colors"
              >
                <Icon className="text-xl" />
                {isOpen && <span>{name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer with user info */}
      {isOpen && user && (
        <div className="p-4 border-t border-[#026d62]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02877A] font-bold">
              {(user._doc?.name || "U").charAt(0)}
            </div>
            <div>
              <p className="font-medium truncate max-w-[10rem]">{user._doc?.name}</p>
              <p className="text-sm text-gray-200 truncate max-w-[10rem]">{user._doc?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;