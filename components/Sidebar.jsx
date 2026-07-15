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
