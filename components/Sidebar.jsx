
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
    { name: "Home", icon: FaHome, path: "/", roles: ["all"] },
    { name: "Add Hotel", icon: FaPlusSquare, path: "/dashboard/create-hotel", roles: ["all"] },
    { name: "Hotels List", icon: FaHotel, path: "/dashboard/hotels-list", roles: ["admin"] },
    { name: "Bookings List", icon: FaClipboardList, path: "/dashboard/bookings-list", roles: ["admin"] },
    { name: "Wishlists List", icon: FaHeart, path: "/dashboard/wishlists-list", roles: ["admin"] },
    { name: "Users List", icon: FaUsers, path: "/dashboard/users-list", roles: ["admin"] },
    { name: "Manage Hotels", icon: FaHotel, path: "/dashboard/manage-hotels", roles: ["user"] },
    { name: "Profile", icon: FaUserCircle, path: "/dashboard/profile", roles: ["user"] },
    { name: "Bookings", icon: FaCalendarCheck, path: "/dashboard/bookings", roles: ["user"] },
    { name: "Wishlists", icon: FaHeart, path: "/dashboard/wishlists", roles: ["user"] },
    { name: "Logout", icon: FaSignOutAlt, path: "/api/auth/signout", roles: ["all"] },
  ];

  const filteredNav = navItems.filter(({ roles }) =>
    roles.includes("all") || roles.includes(isAdmin ? "admin" : "user")
  );

  return (
    <div
      className={`bg-gradient-to-b from-[#02877A] to-[#026d62] text-white h-screen ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col transition-all duration-300 ease-in-out shadow-xl`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none hover:bg-[#025b52] p-2 rounded-full transition-colors"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Logo */}
      <div className="p-4 flex items-center space-x-2 border-b border-[#025b52]">
        {isOpen && (
          <>
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02877A] font-bold text-xl">
              H
            </div>
            <span className="text-xl font-semibold">AirBnB</span>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNav.map(({ name, path, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <li key={name}>
                <Link
                  href={path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                  ${isActive ? "bg-white text-[#02877A] font-semibold" : "hover:bg-[#025b52]"}
                `}
                >
                  <Icon className={`text-xl ${isActive ? "text-[#02877A]" : "text-white"}`} />
                  {isOpen && <span>{name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Footer */}
      {isOpen && user && (
        <div className="p-4 border-t border-[#025b52]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02877A] font-bold">
              {(user?.name || "U").charAt(0)}
            </div>
            <div>
              <p className="font-medium truncate max-w-[10rem]">{user?.name}</p>
              <p className="text-sm text-gray-200 truncate max-w-[10rem]">{user?.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;