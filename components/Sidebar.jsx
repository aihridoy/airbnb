"use client";

import React, { useState } from 'react';
import { FaHome, FaUser, FaCog, FaList, FaSignOutAlt } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Home', icon: <FaHome />, path: '/' },
    { name: 'Profile', icon: <FaUser />, path: '/profile' },
    { name: 'Listings', icon: <FaList />, path: '/listings' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
    { name: 'Logout', icon: <FaSignOutAlt />, path: '/logout' },
  ];

  return (
    <div
      className={`bg-[#02877A] text-white h-screen ${
        isOpen ? 'w-64' : 'w-20'
      } flex flex-col transition-all duration-300 ease-in-out shadow-lg`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={toggleSidebar}
          className="text-2xl focus:outline-none hover:bg-[#026d62] p-2 rounded-full transition-colors"
        >
          {isOpen ? <HiX /> : <HiMenuAlt3 />}
        </button>
      </div>

      {/* Logo/Brand */}
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

      {/* Navigation Links */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <a
                href={item.path}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-[#026d62] transition-colors"
              >
                <span className="text-xl">{item.icon}</span>
                {isOpen && <span>{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer (Optional User Info) */}
      {isOpen && (
        <div className="p-4 border-t border-[#026d62]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#02877A] font-bold">
              U
            </div>
            <div>
              <p className="font-medium">John Doe</p>
              <p className="text-sm text-gray-200">john@example.com</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;