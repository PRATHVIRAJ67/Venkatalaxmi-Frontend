import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper function to get the current day of the week
export const getCurrentDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

// Helper function to get current time information
export const getCurrentTimeInfo = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;

  let timeMessage = '';
  if (hours >= 5 && hours < 11) {
    timeMessage = 'Breakfast time';
  } else if (hours >= 11 && hours < 17) {
    timeMessage = 'Lunch time';
  } else {
    timeMessage = 'Dinner time';
  }

  return { time: formattedTime, message: timeMessage };
};

// Get available categories based on time of day
export const getAvailableCategories = () => {
  const currentHour = new Date().getHours();
  // Always include starters in available categories
  let available = ['menu-starters'];

  // Morning (5am-11am): Breakfast is available
  if (currentHour >= 5 && currentHour < 13) {
    available.push('menu-breakfast');
  }
  // Afternoon (11am-5pm): Lunch is available
  else if (currentHour >= 11 && currentHour < 17) {
    available.push('menu-lunch');
  }
  // Evening/Night (5pm-5am): Dinner is available
  else {
    available.push('menu-dinner');
  }

  return available;
};

// Landing page preview cache. The home page only shows a preview, so it is
// served from localStorage; the order page always fetches fresh data.
const PREVIEW_CACHE_KEY = 'vm_menu_preview_v1';
const PREVIEW_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // refresh in the background after a day

export const getCachedMenuPreview = () => {
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    if (!raw) return null;
    const { savedAt, items } = JSON.parse(raw);
    if (!Array.isArray(items) || items.length === 0) return null;
    return { items, isStale: Date.now() - savedAt > PREVIEW_CACHE_TTL_MS };
  } catch {
    return null;
  }
};

const saveMenuPreview = (items) => {
  try {
    localStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // Storage full or blocked (private mode) — the page still works without the cache
  }
};

// Fetch menu items for landing page preview (6 items per category)
export const fetchMenuItems = async () => {
  try {
    const categories = ['menu-starters', 'menu-breakfast', 'menu-lunch', 'menu-dinner'];

    // Fetch 6 items for each category in parallel
    const responses = await Promise.all(
      categories.map((category) =>
        axios.get(`${API_BASE_URL}/menu-items`, {
          params: { category, limit: 6, page: 1 }
        })
      )
    );

    const allItems = responses.flatMap((response) => {
      const categoryData = response.data;
      return Array.isArray(categoryData)
        ? categoryData
        : (categoryData.menuItems || categoryData.data || []);
    });

    if (allItems.length > 0) saveMenuPreview(allItems);

    return { data: allItems, error: null };
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return { data: null, error: error.message || 'Failed to fetch menu items' };
  }
}; 