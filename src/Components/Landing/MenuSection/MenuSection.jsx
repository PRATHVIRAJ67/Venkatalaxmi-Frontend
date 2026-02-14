import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuSection.css';
import { supabase } from '../../utils/supabaseClient';
import { getCurrentDayOfWeek } from '../../OrderPage/menuData';

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState('menu-starters');
  const [menuItemsFromDB, setMenuItemsFromDB] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  const navigate = useNavigate();

  const menuCategories = [
    { id: 'menu-starters', title: 'Sweets', icon: 'bi-cup-hot' },
    { id: 'menu-breakfast', title: 'Breakfast', icon: 'bi-egg-fried' },
    { id: 'menu-lunch', title: 'Lunch', icon: 'bi-cup-straw' },
    { id: 'menu-dinner', title: 'Snacks', icon: 'bi-palette' }
  ];

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        // Check if we have cached menu items and if they're from today
        const today = new Date().toDateString();
        const cachedDay = sessionStorage.getItem('menuItemsCachedDay');
        const cachedItems = sessionStorage.getItem('menuItems');
        
        // Use cached items if they exist and are from today
        if (cachedItems && cachedDay === today) {
          setMenuItemsFromDB(JSON.parse(cachedItems));
          setIsLoading(false);
          return;
        }
        
        // Fetch from database if no cache or cache is from a different day
        console.log("MenuSection: Fetching menu items from database...");
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching menu items:', error);
          return;
        }
        
        if (data) {
          // Process the fetched data to handle different types of days data
          const processedData = data.map(item => {
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
          
          // Cache in session storage with today's date
          sessionStorage.setItem('menuItems', JSON.stringify(processedData));
          sessionStorage.setItem('menuItemsCachedDay', today);
          
          setMenuItemsFromDB(processedData);
        }
      } catch (error) {
        console.error('Error processing menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
    
    // Subscribe to the table for real-time updates
    const subscription = supabase
      .channel('menu_items_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'menu_items' 
      }, payload => {
        // Clear cache and refresh the menu when database changes
        sessionStorage.removeItem('menuItems');
        sessionStorage.removeItem('menuItemsCachedDay');
        fetchMenuItems();
      })
      .subscribe();
    
    // Update at midnight to get new day's menu
    const setupMidnightRefresh = () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeUntilMidnight = tomorrow - new Date();
      
      return setTimeout(() => {
        // Clear cache at midnight
        sessionStorage.removeItem('menuItems');
        sessionStorage.removeItem('menuItemsCachedDay');
        fetchMenuItems();
        
        // Setup for the next day
        setupMidnightRefresh();
      }, timeUntilMidnight);
    };
    
    const midnightTimer = setupMidnightRefresh();
    
    return () => {
      clearTimeout(midnightTimer);
      subscription.unsubscribe();
    };
  }, []);

  const getMenuItemsByCategory = () => {
    const result = {
      'menu-starters': [],
      'menu-breakfast': [],
      'menu-lunch': [],
      'menu-dinner': []
    };

    if (!menuItemsFromDB.length) return result;

    // Get current day as both string and number
    const currentDay = getCurrentDayOfWeek(); // Returns string like "Monday"
    const currentDayNumber = new Date().getDay(); // Returns number 0-6
    

    
    // Create a map of all items by category for fallback
    const allItemsByCategory = {
      'menu-starters': [],
      'menu-breakfast': [],
      'menu-lunch': [],
      'menu-dinner': []
    };
    
    // First categorize all items
    menuItemsFromDB.forEach(item => {
      const categoryId = item.category;
      if (categoryId && allItemsByCategory[categoryId]) {
        const formattedPrice = `₹${item.price}`;
          
        allItemsByCategory[categoryId].push({
          ...item,
          price: formattedPrice,
          img: item.img || item.image_url || "/img/menu/placeholder.jpg"
        });
      }
    });

    // Filter by day
    menuItemsFromDB.forEach(item => {
      // Get the category based on the category field
      const categoryId = item.category;
      
      // If no valid category, skip
      if (!categoryId || !result[categoryId]) {
        return;
      }
      
      // Default to being available every day if days is not specified
      if (!item.days || item.days.length === 0) {
        const formattedPrice = `₹${item.price}`;
        
        result[categoryId].push({
          ...item,
          price: formattedPrice,
          img: item.img || item.image_url || "/img/menu/placeholder.jpg"
        });
        return;
      }
      
      try {
        let shouldInclude = false;
        
        // If days is a number
        if (typeof item.days === 'number') {
          shouldInclude = item.days === currentDayNumber;
        } 
        // If days is an array
        else if (Array.isArray(item.days)) {
          // Check both numeric days and string days
          shouldInclude = item.days.includes(currentDayNumber) || 
                         item.days.includes(currentDay) || 
                         item.days.includes(String(currentDayNumber));
        } 
        // If days is a string, try to parse it
        else if (typeof item.days === 'string') {
          try {
            // Try to parse as JSON first
            const parsedDays = JSON.parse(item.days);
            if (Array.isArray(parsedDays)) {
              shouldInclude = parsedDays.includes(currentDayNumber) || 
                             parsedDays.includes(currentDay) ||
                             parsedDays.includes(String(currentDayNumber));
            }
          } catch (e) {
            // If JSON parsing fails, try comma-separated values
            const daysArray = item.days.split(',').map(d => d.trim());
            shouldInclude = daysArray.includes(String(currentDayNumber)) || 
                           daysArray.includes(currentDay) ||
                           daysArray.some(d => parseInt(d) === currentDayNumber);
          }
        }
        
        if (shouldInclude) {
          const formattedPrice = `₹${item.price}`;
          
          result[categoryId].push({
            ...item,
            price: formattedPrice,
            img: item.img || item.image_url || "/img/menu/placeholder.jpg"
          });
        }
      } catch (e) {
        console.error('Error processing days for item:', item.name, e);
        // Include it anyway if there's an error
        const formattedPrice = `₹${item.price}`;
        
        result[categoryId].push({
          ...item,
          price: formattedPrice,
          img: item.img || item.image_url || "/img/menu/placeholder.jpg"
        });
      }
    });
    
    // Add fallback items if any category is empty
    Object.keys(result).forEach(category => {
      if (result[category].length === 0 && allItemsByCategory[category].length > 0) {

        // Add up to 3 items as fallback
        const itemsToAdd = allItemsByCategory[category].slice(0, 3);
        result[category].push(...itemsToAdd);
      }
    });

    return result;
  };

  const menuItems = getMenuItemsByCategory();
  
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when changing category
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.AOS) {
      window.AOS.refresh();
    }
  }, [activeTab]);

  const handleCardClick = () => {
    navigate('/order');
  };

  // Pagination logic
  const getPaginatedItems = (categoryId) => {
    const items = menuItems[categoryId] || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = (categoryId) => {
    return Math.ceil((menuItems[categoryId]?.length || 0) / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the menu section for better UX
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <section id="menu" className="menu-section">
        <div className="container section-title" data-aos="fade-up">
          <h2>Our Menu</h2>
          <div className="loading-spinner"></div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="menu-section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Our Menu</h2>
        <p><span>Check Our</span> <span className="description-title">Yummy Menu</span></p>
      </div>

      <div className="container">
        <div className="menu-tcabs-wrapper" data-aos="fade-up" data-aos-delay="100">
          <ul className="menu-tabs">
            {menuCategories.map((category) => (
              <li key={category.id} className="menu-tab-item">
                <button 
                  className={`menu-tab-button ${activeTab === category.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(category.id)}
                >
                  <i className={`bi ${category.icon}`}></i>
                  <h4>{category.title}</h4>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="menu-content" data-aos="fade-up" data-aos-delay="200">
          {menuCategories.map((category) => (
            <div 
              key={category.id}
              className={`menu-tab-content ${activeTab === category.id ? 'active' : ''}`}
              id={category.id}
            >
              <div className="menu-header">
                <p>Our Selection</p>
                <h3>{category.title}</h3>
              </div>

              <div className="menu-items-grid">
                {getPaginatedItems(category.id).length > 0 ? (
                  getPaginatedItems(category.id).map((item, index) => (
                    <div className="menu-item" key={item.id || index} onClick={handleCardClick}>
                      <div className="menu-item-img-container">
                        <img
                          src={item.img || "/img/menu/placeholder.jpg"}
                          className="menu-img"
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/img/menu/placeholder.jpg";
                          }}
                          loading={index < 3 ? "eager" : "lazy"}
                        />
                        <div className="menu-item-overlay">
                          <button className="view-button">
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </div>
                      <div className="menu-item-info">
                        <h4>{item.name}</h4>
                        <p className="ingredients">{item.description}</p>
                        <p className="price">{item.price}</p>
                      </div>
                      <button className="buy-now-button" onClick={handleCardClick}>
                        Buy Now
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-items-message">
                    <p>No items available for this category today.</p>
                  </div>
                )}
              </div>
              
              {/* Pagination controls */}
              {totalPages(category.id) > 1 && (
                <div className="simple-pagination">
                  <button 
                    className="pagination-arrow" 
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  
                  <div className="pagination-numbers">
                    {[...Array(totalPages(category.id))].map((_, i) => (
                      <button
                        key={i + 1}
                        className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    className="pagination-arrow" 
                    disabled={currentPage === totalPages(category.id)}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MenuSection;