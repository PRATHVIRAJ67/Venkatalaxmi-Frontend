import { supabase } from '../Components/utils/supabaseClient';

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

// Process menu data to handle the days field
const processMenuData = (data) => {
  return data.map(item => {
    // Handle different types of days data
    let parsedDays = [0, 1, 2, 3, 4, 5, 6]; // Default to all days
    
    if (item.days) {
      try {
        // Check the type of days and handle accordingly
        if (Array.isArray(item.days)) {
          // If it's already an array, use it directly
          parsedDays = item.days;
        } else if (typeof item.days === 'string') {
          // If it's a string, try to parse as JSON or split by comma
          try {
            parsedDays = JSON.parse(item.days);
          } catch {
            // If JSON parsing fails, try comma splitting
            parsedDays = item.days.split(',').map(day => parseInt(day.trim(), 10));
          }
        } else if (typeof item.days === 'number') {
          // If it's a single number, make it an array
          parsedDays = [item.days];
        } else if (typeof item.days === 'object' && item.days.days) {
          // Handle nested days object
          parsedDays = item.days.days;
        }
      } catch (e) {
        console.error('Error parsing days for item:', item.name, e);
      }
    }
    
    return {
      ...item,
      days: parsedDays
    };
  });
};

// Fetch menu items from session storage or Supabase
export const fetchMenuItems = async () => {
  try {
    // Check if we have cached menu items and if they're from today
    const today = new Date().toDateString();
    const cachedDay = sessionStorage.getItem('menuItemsCachedDay');
    const cachedData = sessionStorage.getItem('menuItems');
    
    // Use cached items if they exist and are from today
    if (cachedData && cachedDay === today) {
      return { data: JSON.parse(cachedData), error: null, fromCache: true };
    }
    
    // Fetch from database if no cache or cache is from a different day
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching menu items:', error);
      return { data: null, error, fromCache: false };
    }
    
    if (data) {
      // Process the fetched data
      const processedData = processMenuData(data);
      
      // Cache in session storage with today's date
      sessionStorage.setItem('menuItems', JSON.stringify(processedData));
      sessionStorage.setItem('menuItemsCachedDay', today);
      
      return { data: processedData, error: null, fromCache: false };
    }

    return { data: [], error: null, fromCache: false };
  } catch (error) {
    console.error('Error processing menu items:', error);
    return { data: null, error, fromCache: false };
  }
};

// Filter menu items by day
export const filterMenuItemsByDay = (items) => {
  if (!items) return [];
  
  // Get both day number and name
  const dayNumber = new Date().getDay();
  const dayName = getCurrentDayOfWeek();
  const daysStringArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return items.filter(item => {
    // If no days specified or empty array, item is available every day
    if (!item.days || item.days.length === 0) return true;
    
    // Try all possible formats for compatibility
    return item.days.includes(dayNumber) || 
           item.days.includes(dayName) || 
           item.days.some(d => typeof d === 'string' && daysStringArray.includes(d));
  });
};

// Clear menu cache
export const clearMenuCache = () => {
  sessionStorage.removeItem('menuItems');
  sessionStorage.removeItem('menuItemsCachedDay');
}; 