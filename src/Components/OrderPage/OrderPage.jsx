import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './OrderPage.css';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { fetchMenuItems as fetchMenuItemsAPI } from './service';
import useSEO from '../hooks/useSEO';
import { useCart } from '../hooks/useCart';
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import Header from '../Landing/Header/Header';
import Footer from '../Landing/Footer/Footer';
import ChatBotIcon from '../Landing/Chatbot/ChatBotIcon';

// Menu categories with their icons
const menuCategories = [
  { id: 'menu-starters', title: 'Sweets', icon: 'fas fa-birthday-cake', hours: 'All day', minNote: 'Min. 50 pcs' },
  { id: 'menu-breakfast', title: 'Breakfast', icon: 'fas fa-mug-hot', hours: '7:00 – 11:30 AM' },
  { id: 'menu-lunch', title: 'Lunch', icon: 'fas fa-bowl-rice', hours: '11:30 AM – 4:00 PM' },
  { id: 'menu-dinner', title: 'Snacks', icon: 'fas fa-cookie-bite', hours: 'All day', minNote: 'Min. 10 packs' }
];

// Splits "Jilebi (ಜಿಲೇಬಿ)" into the English name and the Kannada name
const splitItemName = (name = '') => {
  const match = name.match(/^(.*?)\s*\((.+)\)\s*$/);
  return match ? { main: match[1], local: match[2] } : { main: name, local: '' };
};

const formatUnit = (unit) => (unit ? unit.replace(/-/g, ' ') : '');

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
  categories.push('menu-starters', 'menu-dinner');

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
  const location = useLocation();
  const initialCategory = location.state?.category || 'menu-starters';
  const [activeTab, setActiveTab] = useState(initialCategory);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(getCurrentDayOfWeek());

  const [isLoading, setIsLoading] = useState(true);
  const [editingQuantity, setEditingQuantity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesFromServer, setTotalPagesFromServer] = useState(1);

  const { cart: cartFromUseCart, setCart: setCartFromUseCart } = useCart();
  const [daySpecificMenu, setDaySpecificMenu] = useState({});

  // Fetch menu items from the backend API with server-side pagination per category
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setIsLoading(true);

        // Get initial list of available menu categories based on time
        setAvailableCategories(getAvailableCategories());

        // Fetch 15 items for the active category with server-side pagination
        const response = await fetchMenuItemsAPI(currentPage, 15, activeTab);
        const menuData = response?.data?.menuItems || response?.menuItems || [];
        const pagination = response?.data?.pagination || response?.pagination || {};

        // Store server pagination info
        setTotalPagesFromServer(pagination.totalPages || 1);

        // Process menu items to get day-specific menu grouped by category
        const processedMenu = processDaysString(menuData);
        setDaySpecificMenu(processedMenu);

      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuItems();

    // Set up an interval to update available categories based on time
    const intervalId = setInterval(() => {
      setAvailableCategories(getAvailableCategories());
    }, 60000); // Check every minute

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [currentPage, activeTab]);


  useEffect(() => {
    // Get the current day of the week
    const currentDay = getCurrentDayOfWeek();
    setCurrentDayOfWeek(currentDay);

    // Update day of week every day at midnight
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow - new Date();

    const dayTimer = setTimeout(() => {
      const newDay = getCurrentDayOfWeek();
      setCurrentDayOfWeek(newDay);

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
        notification.innerHTML = `<i class="fas fa-times-circle"></i> This menu is not available now`;
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

  // Items are already paginated from server, show directly
  const getItemsForCategory = (categoryId) => {
    return daySpecificMenu[categoryId] || [];
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

        // Normalize days: extract the array from object format { days: [...] }
        let daysValue = item.days;
        if (daysValue && typeof daysValue === 'object' && !Array.isArray(daysValue) && Array.isArray(daysValue.days)) {
          daysValue = daysValue.days;
        }

        // If days is a number, check against currentDayNumber
        if (typeof daysValue === 'number') {
          shouldInclude = daysValue === currentDayNumber;
        }
        // If days is an array (e.g. ["Monday", "Tuesday", ...])
        else if (Array.isArray(daysValue)) {
          shouldInclude = daysValue.includes(currentDayNumber) ||
            daysValue.includes(currentDay) ||
            daysValue.includes(String(currentDayNumber));
        }
        // If days is a string, try to parse it
        else if (typeof daysValue === 'string') {
          try {
            const parsedDays = JSON.parse(daysValue);
            if (Array.isArray(parsedDays)) {
              shouldInclude = parsedDays.includes(currentDayNumber) ||
                parsedDays.includes(currentDay) ||
                parsedDays.includes(String(currentDayNumber));
            } else if (parsedDays && typeof parsedDays === 'object' && Array.isArray(parsedDays.days)) {
              shouldInclude = parsedDays.days.includes(currentDayNumber) ||
                parsedDays.days.includes(currentDay) ||
                parsedDays.days.includes(String(currentDayNumber));
            }
          } catch (e) {
            const daysArray = daysValue.split(',').map(d => d.trim());
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

  const cartCount = cart.length;

  return (
    <div className="order-page">
      <div id="cart-notification" className="cart-notification">
        <i className="fas fa-check-circle"></i> Item added to cart
      </div>

      <div className="order-hero">
        <div className="container">
          <div className="order-topbar">
            <Link to="/" className="order-back" title="Back to home">
              <i className="fas fa-arrow-left"></i> <span>Back</span>
            </Link>
            <Link to="/" className="order-brand">
              <img src="/Venkatalakshmi-Logo.png" alt="Venkatalakshmi Mess" />
            </Link>
            <Link to="/cart" className="order-cart-chip" aria-label="View cart">
              <i className="fas fa-shopping-bag"></i>
              <span className="order-cart-chip-label">Cart</span>
              {cartCount > 0 && <span className="order-cart-chip-badge">{cartCount}</span>}
            </Link>
          </div>

          <div className="order-hero-text">
            <span className="order-eyebrow">Our {currentDayOfWeek} selection</span>
            <h1>Order your food</h1>
            <p>Freshly prepared, homely South Indian food — pick a category to get started.</p>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="order-tabs" id="menu-tabs" role="tablist">
          {menuCategories.map((category) => {
            const isAvailable = availableCategories.includes(category.id);
            const isActive = activeTab === category.id;
            return (
              <button
                key={category.id}
                role="tab"
                aria-selected={isActive}
                className={`order-tab ${isActive ? 'active' : ''} ${!isAvailable ? 'locked' : ''}`}
                onClick={() => handleTabChange(category.id)}
                disabled={!isAvailable}
              >
                <span className="order-tab-icon"><i className={category.icon}></i></span>
                <span className="order-tab-text">
                  <strong>{category.title}</strong>
                  <small>
                    {isAvailable ? category.hours : <><i className="fas fa-lock"></i> {category.hours}</>}
                  </small>
                </span>
              </button>
            );
          })}
        </div>

        <div className="menu-content">
          {isLoading ? (
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            menuCategories.map((category) => {
              if (activeTab !== category.id) return null;
              const items = getItemsForCategory(category.id);
              const isSweetsCategory = category.id === 'menu-starters';
              const isSnacksCategory = category.id === 'menu-dinner';

              return (
                <div key={category.id} className="menu-tab-content active" id={category.id}>
                  <div className="order-section-head">
                    <h2>{category.title}</h2>
                    {category.minNote && (
                      <span className="order-min-note">
                        <i className="fas fa-circle-info"></i> {category.minNote} per order
                      </span>
                    )}
                  </div>

                  {availableCategories.includes(category.id) ? (
                    <>
                      <div className="order-grid">
                        {items.length > 0 ? (
                          items.map((item) => {
                            const cartItem = cart.find(c => c.id === item.id);
                            const quantity = cartItem ? cartItem.quantity : 0;
                            const { main, local } = splitItemName(item.name);

                            return (
                              <article className={`food-card ${quantity > 0 ? 'in-cart' : ''}`} key={item.id}>
                                <div className="food-card-media">
                                  <img
                                    src={item.img && item.img.startsWith('http') ? item.img : `/img/menu/${item.img || 'placeholder.jpg'}`}
                                    alt={main}
                                    loading="lazy"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.style.display = 'none';
                                      e.target.parentElement.classList.add('no-image');
                                    }}
                                  />
                                  <span className="food-card-veg" title="Vegetarian"></span>
                                  {quantity > 0 && (
                                    <span className="food-card-incart">
                                      <i className="fas fa-check"></i> {quantity} in cart
                                    </span>
                                  )}
                                </div>

                                <div className="food-card-body">
                                  <h3 className="food-card-title">{main}</h3>
                                  {local && <p className="food-card-local">{local}</p>}
                                  {item.description && <p className="food-card-desc">{item.description}</p>}

                                  <div className="food-card-footer">
                                    <div className="food-card-price">
                                      <strong>₹{item.price}</strong>
                                      {item.unit && <span>/ {formatUnit(item.unit)}</span>}
                                    </div>

                                    {quantity > 0 ? (
                                      <div className="food-qty">
                                        <button
                                          onClick={() => handleQuantityChange(item.id, 'subtract', category.id)}
                                          aria-label="Decrease quantity"
                                        >
                                          <AiOutlineMinus />
                                        </button>

                                        {editingQuantity === item.id ? (
                                          <input
                                            type="number"
                                            defaultValue={quantity}
                                            min={isSweetsCategory ? 50 : (isSnacksCategory ? 10 : 1)}
                                            step={isSweetsCategory ? 10 : 1}
                                            onBlur={(e) => handleQuantityInputBlur(item.id, e.target.value, category.id)}
                                            onKeyDown={(e) => handleQuantityInputKeyDown(e, item.id, e.target.value, category.id)}
                                            autoFocus
                                            aria-label="Edit quantity"
                                          />
                                        ) : (
                                          <span
                                            className="food-qty-value"
                                            onClick={() => handleQuantityInputFocus(item.id)}
                                            title="Click to type a quantity"
                                          >
                                            {quantity}
                                          </span>
                                        )}

                                        <button
                                          onClick={() => handleQuantityChange(item.id, 'add', category.id)}
                                          aria-label="Increase quantity"
                                        >
                                          <AiOutlinePlus />
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        className="food-add"
                                        onClick={() => addToCart(item, category.id)}
                                        aria-label={isSweetsCategory ? 'Add 50 pieces to cart' : (isSnacksCategory ? 'Add 10 packs to cart' : 'Add to cart')}
                                      >
                                        <i className="fas fa-plus"></i> {isSweetsCategory ? 'Add 50' : (isSnacksCategory ? 'Add 10' : 'Add')}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </article>
                            );
                          })
                        ) : (
                          <div className="order-empty">
                            <i className="fas fa-utensils"></i>
                            <p>No items available for {currentDayOfWeek} in this category.</p>
                          </div>
                        )}
                      </div>

                      {totalPagesFromServer > 1 && (
                        <div className="order-pagination">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                          >
                            <i className="fas fa-chevron-left"></i>
                          </button>
                          {[...Array(totalPagesFromServer)].map((_, i) => (
                            <button
                              key={i + 1}
                              className={currentPage === i + 1 ? 'active' : ''}
                              onClick={() => handlePageChange(i + 1)}
                            >
                              {i + 1}
                            </button>
                          ))}
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPagesFromServer}
                            aria-label="Next page"
                          >
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="order-locked">
                      <i className="fas fa-clock"></i>
                      <h3>{category.title} isn’t being served right now</h3>
                      <p>Available {category.hours}. Sweets and snacks can be ordered any time.</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="order-cartbar">
          <div className="order-cartbar-inner">
            <div className="order-cartbar-info">
              <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
              <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
            </div>
            <button className="order-cartbar-btn" onClick={handleCheckout}>
              View Cart <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;