// Helper functions for menu management
export const getAvailableCategories = () => {
  const currentHour = new Date().getHours();
  // Always include starters in available categories
  let available = ['menu-starters','menu-dinner']; 
  
  // Morning (5am-11am): Breakfast is available
  if (currentHour >= 7 && currentHour < 12) {
    available.push('menu-breakfast');
  } 
  // Afternoon (11am-5pm): Lunch is available
  else if (currentHour >= 12 && currentHour < 17) {
    available.push('menu-lunch');
  } 
  // Evening/Night (5pm-5am): Dinner is available
  // else {
  //   available.push('menu-dinner');
  // }
  
  return available;
};

/**
 * Gets the current day of the week
 * @returns {String} Current day name (Monday, Tuesday, etc.)
 */
export const getCurrentDayOfWeek = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

/**
 * Gets information about current time period
 * @returns {Object} Contains time and message about current meal period
 */
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
    timeMessage = 'Dinner ';
  }
  
  return { time: formattedTime, message: timeMessage };
};

/**
 * Merges database items with hardcoded base menu items
 * @param {Array} dbItems - Menu items fetched from database
 * @param {String} currentDay - Current day of week
 * @returns {Object} Combined menu items filtered by day
 */
export const getDaySpecificMenuItems = (dbItems = [], currentDay = getCurrentDayOfWeek()) => {
  // Start with base menu items
  const allMenuItems = JSON.parse(JSON.stringify(baseMenuItems));

  // Merge DB items with hardcoded items
  dbItems.forEach(dbItem => {
    // Determine which category to add this to
    const category = dbItem.category;  // This should match schema: menu-breakfast, menu-lunch, etc.
    
    if (allMenuItems[category]) {
      // Check if this item already exists in our hardcoded items (by id)
      const existingItemIndex = allMenuItems[category].findIndex(item => item.id === dbItem.id);
      
      if (existingItemIndex !== -1) {
        // Update existing item
        allMenuItems[category][existingItemIndex] = {
          ...dbItem,
          // Make sure days is an array
          days: Array.isArray(dbItem.days) ? dbItem.days : JSON.parse(dbItem.days || '[]')
        };
      } else {
        // Add new item
        allMenuItems[category].push({
          ...dbItem,
          // Make sure days is an array
          days: Array.isArray(dbItem.days) ? dbItem.days : JSON.parse(dbItem.days || '[]')
        });
      }
    }
  });

  // Filter the menu items based on the current day
  const filteredMenuItems = {};
  Object.keys(allMenuItems).forEach(category => {
    filteredMenuItems[category] = allMenuItems[category].filter(item => 
      item.days && item.days.includes(currentDay)
    );
  });

  return filteredMenuItems;
};