const KEY = "recentlyViewedHotels";
const MAX = 8;

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

export function addRecentlyViewed(hotelId) {
  try {
    const ids = getRecentlyViewed().filter((id) => id !== hotelId);
    ids.unshift(hotelId);
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    // localStorage unavailable (private mode, SSR edge case) - skip silently
  }
}
