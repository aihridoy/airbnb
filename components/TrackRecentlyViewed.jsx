"use client";

import { useEffect } from "react";
import { addRecentlyViewed } from "@/lib/recentlyViewed";

export default function TrackRecentlyViewed({ hotelId }) {
  useEffect(() => {
    if (hotelId) addRecentlyViewed(hotelId);
  }, [hotelId]);

  return null;
}
