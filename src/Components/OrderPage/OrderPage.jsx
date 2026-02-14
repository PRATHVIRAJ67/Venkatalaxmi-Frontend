import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './OrderPage.css';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineArrowLeft } from 'react-icons/ai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../utils/supabaseClient';
import useSEO from '../hooks/useSEO';
import { useCart } from '../hooks/useCart';
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import Header from '../Landing/Header/Header';
import Footer from '../Landing/Footer/Footer';
import ChatBotIcon from '../Landing/Chatbot/ChatBotIcon';

// Menu categories with their icons
const menuCategories = [
  { id: 'menu-starters', title: 'Sweets', icon: 'bi-cake2-fill' },
  { id: 'menu-breakfast', title: 'Breakfast', icon: 'bi-cup-hot-fill' },
  { id: 'menu-lunch', title: 'Lunch', icon: 'bi-egg-fried' },
  { id: 'menu-dinner', title: 'Snacks', icon: 'bi-basket3-fill' }
];

// Helper functions
const getCurrentDayOfWeek = () => {
  // Using the same format as menuData.js
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
};

const getCurrentTimeInfo = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  
  // Convert to 24-hour format for easy comparison
  const time = hours * 100 + minutes; // e.g., 9:30 AM = 930, 2:45 PM = 1445
  
  return {
    hours,
    minutes,
    time
  };
};

const getAvailableCategories = () => {
  const { time } = getCurrentTimeInfo();
  const day = getCurrentDayOfWeek();
  
  // Default to all categories available
  const categories = [];
  
  // Always show starters/sweets regardless of time
  categories.push('menu-starters','menu-dinner');
  
  // Breakfast: 7 AM to 11:30 AM (700 to 1130)
  if (time >= 700 && time <= 1130) {
    categories.push('menu-breakfast');
  }
  
  // Lunch: 11:30 AM to 4 PM (1130 to 1600)
  if (time >= 1130 && time <= 1600) {
    categories.push('menu-lunch');
  }
  
  // Dinner: 4 PM to 10 PM (1600 to 2200)
  // if (time >= 1600 && time <= 2200) {
  //   categories.push('menu-dinner');
  // }
  
  return categories;
};

const OrderPage = () => {
  // Apply SEO metadata for the order page
  useSEO('ORDER');
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('menu-starters');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(getCurrentDayOfWeek());
  const [menuItemsFromDB, setMenuItemsFromDB] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(17);
  
  const cartRef = useRef(null);
  const [position, setPosition] = useState({ top: 80, left: 0 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const { cart: cartFromUseCart, setCart: setCartFromUseCart } = useCart();
  const [daySpecificMenu, setDaySpecificMenu] = useState({});

  // Fetch menu items from session storage or Supabase
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        
        // Get initial list of available menu categories based on time
        setAvailableCategories(getAvailableCategories());
        
        // Check if we have cached menu items and if they're from today
        const today = new Date().toDateString();
        const cachedDay = sessionStorage.getItem('menuItemsCachedDay');
        const cachedItems = sessionStorage.getItem('menuItems');
        
        // Use cached items if they exist and are from today
        if (cachedItems && cachedDay === today) {
          const parsedItems = JSON.parse(cachedItems);
          setMenuItemsFromDB(parsedItems);
          const processedMenu = processDaysString(parsedItems);
          setDaySpecificMenu(processedMenu);
        } else {
          // Fetch from database if no cache or cache is from a different day
          console.log("OrderPage: Fetching menu items from database...");
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching menu items:', error);
            return;
          }
          
          // Store all menu items from database
          const menuData = data || [];
          setMenuItemsFromDB(menuData);
          
          // Cache in session storage with today's date
          sessionStorage.setItem('menuItems', JSON.stringify(menuData));
          sessionStorage.setItem('menuItemsCachedDay', today);
          
          // Process menu items to get day-specific menu
          const processedMenu = processDaysString(menuData);
          setDaySpecificMenu(processedMenu);
        }
        
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
        
        // Clean up subscription when component unmounts
        return () => {
          subscription.unsubscribe();
        };
        
      } catch (error) {
        console.error('Error processing menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMenuItems();
    
    // Set up an interval to update available categories based on time
    const intervalId = setInterval(() => {
      setAvailableCategories(getAvailableCategories());
    }, 60000); // Check every minute
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Set responsive initial position once cartRef is available
    const setInitialPosition = () => {
      if (cartRef.current) {
        const isMobile = window.innerWidth <= 768;
        const cartWidth = cartRef.current.offsetWidth;
        const cartHeight = cartRef.current.offsetHeight;

        const defaultLeft = isMobile
          ? window.innerWidth - cartWidth - 20
          : window.innerWidth - cartWidth - 40;

        const defaultTop = 80;

        setPosition({
          top: Math.min(defaultTop, window.innerHeight - cartHeight),
          left: Math.min(defaultLeft, window.innerWidth - cartWidth),
        });
      }
    };

    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);

    return () => {
      window.removeEventListener('resize', setInitialPosition);
    };
  }, []);

  const handleDragStart = (e) => {
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

    setDragging(true);
    setOffset({
      x: clientX - cartRef.current.getBoundingClientRect().left,
      y: clientY - cartRef.current.getBoundingClientRect().top,
    });
  };

  const handleDragMove = (e) => {
    if (!dragging) return;

    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

    const newLeft = clientX - offset.x;
    const newTop = clientY - offset.y;

    setPosition({
      top: Math.min(Math.max(newTop, 0), window.innerHeight - cartRef.current.offsetHeight),
      left: Math.min(Math.max(newLeft, 0), window.innerWidth - cartRef.current.offsetWidth),
    });
  };

  const handleDragEnd = () => setDragging(false);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragging, offset]);

  useEffect(() => {
    // Get the current day of the week
    const currentDay = getCurrentDayOfWeek();
    setCurrentDayOfWeek(currentDay);
    
    // Check if we need to clear the cache based on date change
    const today = new Date().toDateString();
    const cachedDay = sessionStorage.getItem('menuItemsCachedDay');
    
    // If cached day doesn't match today, clear the cache
    if (cachedDay && cachedDay !== today) {
      sessionStorage.removeItem('menuItems');
      sessionStorage.removeItem('menuItemsCachedDay');
    }
    
    // Update day of week every day at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - new Date();
    
    const dayTimer = setTimeout(() => {
      const newDay = getCurrentDayOfWeek();
      setCurrentDayOfWeek(newDay);
      
      // Clear cache at midnight
      sessionStorage.removeItem('menuItems');
      sessionStorage.removeItem('menuItemsCachedDay');
      
      // Refresh menu items for the new day
      window.location.reload();
    }, timeUntilMidnight);
    
    return () => clearTimeout(dayTimer);
  }, []);

  // Function to check available categories based on current time
  const updateAvailableCategories = () => {
    const available = getAvailableCategories();
    setAvailableCategories(available);
    
    // If the current active tab is not available, switch to an available one
    if (!available.includes(activeTab)) {
      setActiveTab(available[0]);
    }
  };

  // Initialize available categories and set up an interval to update them
  useEffect(() => {
    updateAvailableCategories();
    
    // Update available categories every minute
    const intervalId = setInterval(updateAvailableCategories, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
      
      const total = JSON.parse(storedCart).reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);
      setTotalAmount(total);
    }
    
    // Set initial active tab based on available categories
    if (availableCategories.length > 0 && !availableCategories.includes(activeTab)) {
      setActiveTab(availableCategories[0]);
    }
  }, [availableCategories]);

  const handleTabChange = (tabId) => {
    if (availableCategories.includes(tabId)) {
      setActiveTab(tabId);
      setCurrentPage(1); // Reset to first page when changing category
      window.scrollTo({
        top: document.getElementById('menu-tabs').offsetTop - 100,
        behavior: 'smooth'
      });
    } else {
      // Show a message that this category is not available now
      const notification = document.getElementById('cart-notification');
      if (notification) {
        notification.innerHTML = `<i class="bi bi-x-circle"></i> This menu is not available now`;
        notification.classList.add('show');
        setTimeout(() => {
          notification.classList.remove('show');
        }, 2000);
      }
    }
  };

  const handleBackToMenu = () => {
    navigate('/');
  };

  const updateCart = (newCart) => {
    setCart(newCart);
    sessionStorage.setItem('cart', JSON.stringify(newCart));
  };

  // Modified handleQuantityChange function to handle special rules for sweets and snacks
  const handleQuantityChange = (itemId, action, category) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      const updatedCart = [...cart];
      const isSweetsCategory = category === 'menu-starters';
      const isSnacksCategory = category === 'menu-dinner';
      
      if (action === 'add') {
        // For sweets, increment by 10; for others by 1
        const incrementAmount = isSweetsCategory ? 10 : 1;
        updatedCart[itemIndex].quantity += incrementAmount;
      } else if (action === 'subtract') {
        // For sweets, decrement by 10, and ensure minimum quantity is 50 or remove
        if (isSweetsCategory) {
          if (updatedCart[itemIndex].quantity > 60) { // If more than minimum (50) + increment (10)
            updatedCart[itemIndex].quantity -= 10;
          } else {
            // If quantity would go below 50, remove the item
            updatedCart.splice(itemIndex, 1);
          }
        } else if (isSnacksCategory) {
          // For snacks, decrement by 1, and ensure minimum quantity is 10 or remove
          if (updatedCart[itemIndex].quantity > 11) { // If more than minimum (10) + 1
            updatedCart[itemIndex].quantity -= 1;
          } else {
            // If quantity would go below 10, remove the item
            updatedCart.splice(itemIndex, 1);
          }
        } else {
          // Normal items - decrement by 1 as usual
          if (updatedCart[itemIndex].quantity > 1) {
            updatedCart[itemIndex].quantity -= 1;
          } else {
            updatedCart.splice(itemIndex, 1);
          }
        }
      }
      
      updateCart(updatedCart);
    }
  };

  // Handle manual quantity input
  const handleManualQuantityChange = (itemId, value, category) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    const isSweetsCategory = category === 'menu-starters';
    const isSnacksCategory = category === 'menu-dinner';
    let minQuantity = 1;
    
    if (isSweetsCategory) {
      minQuantity = 50;
    } else if (isSnacksCategory) {
      minQuantity = 10;
    }
    
    // Parse input as integer
    let newQuantity = parseInt(value, 10);
    
    // If input is not a valid number, keep existing quantity
    if (isNaN(newQuantity)) {
      return;
    }
    
    // Enforce minimum quantity rules
    if (isSweetsCategory) {
      // Ensure quantity is a multiple of 10 for sweets
      newQuantity = Math.ceil(newQuantity / 10) * 10;
      
      // Enforce minimum quantity of 50 for sweets
      if (newQuantity < 50) {
        newQuantity = 50;
      }
    } else if (isSnacksCategory) {
      // Ensure minimum quantity of 10 for snacks
      if (newQuantity < 10) {
        newQuantity = 10;
      }
    } else {
      // Ensure minimum quantity of 1 for other items
      if (newQuantity < 1) {
        newQuantity = 1;
      }
    }
    
    if (itemIndex !== -1) {
      const updatedCart = [...cart];
      updatedCart[itemIndex].quantity = newQuantity;
      updateCart(updatedCart);
    }
    
    // Exit edit mode
    setEditingQuantity(null);
  };

  // Handle quantity input focus events
  const handleQuantityInputFocus = (itemId) => {
    setEditingQuantity(itemId);
  };

  const handleQuantityInputBlur = (itemId, value, category) => {
    handleManualQuantityChange(itemId, value, category);
  };

  const handleQuantityInputKeyDown = (e, itemId, value, category) => {
    if (e.key === 'Enter') {
      handleManualQuantityChange(itemId, value, category);
      e.target.blur();
    }
  };

  // Modified addToCart function to handle special rules for sweets and snacks
  const addToCart = (item, category) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    const isSweetsCategory = category === 'menu-starters';
    const isSnacksCategory = category === 'menu-dinner';
    let initialQuantity = 1;
    
    // Set initial quantity based on category
    if (isSweetsCategory) {
      initialQuantity = 50;
    } else if (isSnacksCategory) {
      initialQuantity = 10;
    }
    
    if (existingItemIndex !== -1) {
      const updatedCart = [...cart];
      // For sweets, increment by 10, for others by 1
      const incrementAmount = isSweetsCategory ? 10 : 1;
      updatedCart[existingItemIndex].quantity += incrementAmount;
      updateCart(updatedCart);
    } else {
      updateCart([...cart, { ...item, quantity: initialQuantity }]);
    }
    
    const notification = document.getElementById('cart-notification');
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 2000);
  };

  useEffect(() => {
    const total = cart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);
    setTotalAmount(total);
  }, [cart]);

  const handleCheckout = () => {
    navigate('/cart');
    setCartOpen(false);
  };

  // Pagination logic
  const getPaginatedItems = (categoryId) => {
    const items = daySpecificMenu[categoryId] || [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const totalPages = (categoryId) => {
    return Math.ceil((daySpecificMenu[categoryId]?.length || 0) / itemsPerPage);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the menu section for better UX
    document.getElementById('menu-tabs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const timeInfo = getCurrentTimeInfo();

  // Helper function to parse the days string from database
  const processDaysString = (menuItems) => {
    // Initialize day-specific menu
    const result = {
      'menu-starters': [],
      'menu-breakfast': [],
      'menu-lunch': [],
      'menu-dinner': []
    };
    
    // Get current day as both string and number
    const currentDay = getCurrentDayOfWeek(); // Returns string like "Monday"
    const currentDayNumber = new Date().getDay(); // Returns number 0-6
    

    
    // Create a map to categorize all items first
    const allItemsByCategory = {
      'menu-starters': [],
      'menu-breakfast': [],
      'menu-lunch': [],
      'menu-dinner': []
    };
    
    // First pass - add all items to their categories
    menuItems.forEach(item => {
      if (item.category && allItemsByCategory[item.category]) {
        allItemsByCategory[item.category].push(item);
      }
    });
    
    // Second pass - filter by day
    menuItems.forEach(item => {
      // If no category, skip item
      if (!item.category || !result[item.category]) {
        return;
      }
      
      // Default to being available every day if days is not specified
      if (!item.days || item.days.length === 0) {
        result[item.category].push(item);
        return;
      }
      
      try {
        let shouldInclude = false;
        
        // If days is a number or array of numbers, check against currentDayNumber
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
          result[item.category].push(item);
        }
      } catch (e) {
        console.error('Error processing days for item:', item.name, e);
        // Just include it if there's an error
        result[item.category].push(item);
      }
    });
    
    // FALLBACK: If any category is empty, add at least 2 items from all items
    Object.keys(result).forEach(category => {
      if (result[category].length === 0 && allItemsByCategory[category].length > 0) {

        // Add up to 3 items as fallback
        const itemsToAdd = allItemsByCategory[category].slice(0, 3);
        result[category].push(...itemsToAdd);
      }
    });
    
    return result;
  };

  return (
    <div className="order-page">
      <div id="cart-notification" className="cart-notification">
        <i className="bi bi-check-circle"></i> Item added to cart
      </div>
    
      {/* Desktop Cart Button */}
      <div className="cart-section desktop-only"
        ref={cartRef}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          position: 'fixed',
          cursor: 'grab',
        }}>
        <Link to="/cart" className="cart-view-wrapper">
          <div className="cart-toggle">
            <i className="bi bi-cart-fill cart-icon-bootstrap"></i>
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </div>
          <div className="view-cart-link">
            <i className="bi bi-bag-fill"></i> View Cart
          </div>
        </Link>
      </div>
      
      {/* Mobile Cart Button (circular) */}
      <Link to="/cart" className="mobile-cart-button mobile-only">
        <div className="mobile-cart-icon">
          <i className="bi bi-cart-fill"></i>
          {cart.length > 0 && <span className="mobile-cart-badge">{cart.length}</span>}
        </div>
        <span className="mobile-cart-text">View Cart</span>
      </Link>
      
      <div className="container">
        <div className="order-header">
          <Link to="/" className="back-button" title="Back to menu">
            <i className="bi bi-arrow-left-circle-fill"></i> Back
          </Link>
          <h1>Order Your Food</h1>
          <div className="spacer"></div>
        </div>
        
        <div className="menu-tabs-wrapper" id="menu-tabs">
          <ul className="menu-tabs">
            {menuCategories.map((category) => {
              const isAvailable = availableCategories.includes(category.id);
              return (
                <li key={category.id} className="menu-tab-item">
                  <button 
                    className={`menu-tab-button ${activeTab === category.id ? 'active' : ''} ${!isAvailable ? 'disabled' : ''}`}
                    onClick={() => handleTabChange(category.id)}
                    disabled={!isAvailable}
                  >
                    <i className={`bi ${category.icon}`}></i>
                    <h4>{category.title}</h4>
                    {!isAvailable && (
                      <span className="lock-icon">
                        <FontAwesomeIcon icon={faLock} />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="menu-content">
          {isLoading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            menuCategories.map((category) => (
              <div 
                key={category.id}
                className={`menu-tab-content ${activeTab === category.id ? 'active' : ''}`}
                id={category.id}
                style={{ display: activeTab === category.id ? 'block' : 'none' }}
              >
                <div className="menu-header">
                  <p>Our {currentDayOfWeek} Selection</p>
                  <h3>{category.title}</h3>
                  {/* {category.id === 'menu-starters' && (
                    <div className="menu-available-message">
                      <p><strong> Note:</strong> For Sweets minimum order quantity is 50 pieces </p>
                    </div>
                  )} */}
                  {!availableCategories.includes(category.id) && (
                    <div className="menu-unavailable-message">
                      <i className="bi bi-clock"></i> This menu is not available at this time
                    </div>
                  )}
                </div>
                
                {availableCategories.includes(category.id) ? (
                  <>
                    <div className="order-items-grid">
                      {getPaginatedItems(category.id).length > 0 ? (
                        getPaginatedItems(category.id).map((item) => {
                          const cartItem = cart.find(cartItem => cartItem.id === item.id);
                          const quantity = cartItem ? cartItem.quantity : 0;
                          const isSweetsCategory = category.id === 'menu-starters';
                          
                          return (
                            <div className="order-item" key={item.id}>
                              <div className="order-item-img-container">
                                <img
                                  src={item.img && item.img.startsWith('http') ? item.img : `/img/menu/${item.img || 'placeholder.jpg'}`}
                                  className="order-img"
                                  alt={item.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/img/menu/placeholder.jpg";
                                  }}
                                  loading="lazy"
                                />
                                <div className="order-item-overlay">
                                  {/* <button className="view-details-button">
                                    <i className="bi bi-eye"></i>
                                  </button> */}
                                </div>
                              </div>
                              <div className="order-item-info">
                                <h4>{item.name.replace(/([a-zA-Z])\(/, '$1      (')}</h4>
                                <p className="ingredients">{item.description}</p>
                                <p className="price">₹{item.price} {item.unit && `(${item.unit})`}</p>
                                
                                <div className="order-actions">
                                  {quantity > 0 ? (
                                    <div className="quantity-selector">
                                      <button
                                        onClick={() => handleQuantityChange(item.id, 'subtract', category.id)}
                                        className="quantity-btn"
                                        aria-label="Decrease quantity"
                                      >
                                        <AiOutlineMinus style={{ color: 'black' }} />
                                      </button>
                                      
                                      {editingQuantity === item.id ? (
                                        <input
                                          type="number"
                                          className="quantity-input"
                                          defaultValue={quantity}
                                          min={isSweetsCategory ? 50 : (category.id === 'menu-dinner' ? 10 : 1)}
                                          step={isSweetsCategory ? 10 : 1}
                                          onBlur={(e) => handleQuantityInputBlur(item.id, e.target.value, category.id)}
                                          onKeyDown={(e) => handleQuantityInputKeyDown(e, item.id, e.target.value, category.id)}
                                          autoFocus
                                          aria-label="Edit quantity"
                                          readOnly={isSweetsCategory}
                                        />
                                      ) : (
                                        <>
                                          <span 
                                            className="quantity"
                                            onClick={() => !isSweetsCategory && handleQuantityInputFocus(item.id)}
                                          >
                                            {quantity}
                                          </span>
                                          { (
                                            <button
                                              className="quantity-edit-btn"
                                              onClick={() => handleQuantityInputFocus(item.id)}
                                              title="Enter quantity manually"
                                              aria-label="Edit quantity manually"
                                            >
                                              <i className="bi bi-pencil"></i>
                                              <span> Enter quantity manually</span>
                                            </button>
                                          )}
                                        </>
                                      )}
                                      
                                      <button
                                        onClick={() => handleQuantityChange(item.id, 'add', category.id)}
                                        className="quantity-btn"
                                        aria-label="Increase quantity"
                                      >
                                        <AiOutlinePlus style={{ color: 'black' }} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      className="add-to-cart-button" 
                                      onClick={() => addToCart(item, category.id)}
                                      aria-label={isSweetsCategory ? 'Add 50 pieces to cart' : (category.id === 'menu-dinner' ? 'Add 10 packs to cart' : 'Add to cart')}
                                    >
                                      <i className="bi bi-cart-plus-fill"></i> {isSweetsCategory ? 'Add 50 pieces' : (category.id === 'menu-dinner' ? 'Add 10 pack' : 'Add to Cart')}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-items-message">
                          <p>No special menu items available for {currentDayOfWeek} in this category.</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Simple pagination controls */}
                    {totalPages(category.id) > 1 && (
                      <div className="simple-pagination">
                        <button 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="pagination-arrow"
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
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages(category.id)}
                          className="pagination-arrow"
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="locked-menu-content">
                    <div className="locked-menu-message">
                      <i className="bi bi-lock-fill"></i>
                      <h3>This menu is currently unavailable</h3>
                      <p>Please check back during the appropriate hours:</p>
                      <ul>
                        <li><strong>Breakfast:</strong> 5:00 AM - 11:00 AM</li>
                        <li><strong>Lunch:</strong> 11:00 AM - 5:00 PM</li>
                        <li><strong>Dinner:</strong> 5:00 PM - 5:00 AM</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;