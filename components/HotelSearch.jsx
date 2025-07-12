'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import ManageHotelList from '@/components/HotelsListManage';
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
      {/* search box */}
      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by title, location, or category…"
          className="w-full pl-10 pr-3 py-2 rounded-lg border border-zinc-300
                     focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>
      <ListComponent filteredHotels={filtered} reviews={reviews} />
    </div>
  );
}