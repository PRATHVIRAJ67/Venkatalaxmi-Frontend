import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuSection.css';

import { fetchMenuItems } from '../../../services/menuService';

const MenuSection = () => {
  const [activeTab, setActiveTab] = useState('menu-starters');
  const [menuItemsFromDB, setMenuItemsFromDB] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [itemsPerPage] = useState(6); // Show 6 items per category on landing
  const navigate = useNavigate();

  const menuCategories = [
    { id: 'menu-starters', title: 'Sweets', icon: 'fas fa-cookie-bite' },
    { id: 'menu-breakfast', title: 'Breakfast', icon: 'fas fa-coffee' },
    { id: 'menu-lunch', title: 'Lunch', icon: 'fas fa-utensils' },
    { id: 'menu-dinner', title: 'Snacks', icon: 'fas fa-hamburger' }
  ];

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const { data, error } = await fetchMenuItems();
      console.log(data);

      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setMenuItemsFromDB(data || []);
      }
      setIsLoading(false);
    };

    fetchItems();
  }, []);

  const getMenuItemsByCategory = () => {
    const result = {
      'menu-starters': [],
      'menu-breakfast': [],
      'menu-lunch': [],
      'menu-dinner': []
    };

    if (!menuItemsFromDB.length) return result;

    // Simply categorize all items — no day filtering needed for landing page preview
    menuItemsFromDB.forEach(item => {
      const categoryId = item.category;
      if (categoryId && result[categoryId]) {
        result[categoryId].push({
          ...item,
          price: `₹${item.price}`,
          img: item.img || item.image_url || "/img/menu/placeholder.jpg"
        });
      }
    });

    return result;
  };

  const menuItems = getMenuItemsByCategory();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleCardClick = () => {
    navigate('/order', { state: { category: activeTab } });
  };

  const getDisplayItems = (categoryId) => {
    const items = menuItems[categoryId] || [];
    return items.slice(0, itemsPerPage);
  };

  return (
    <section id="menu" className="menu-section">
      <div className="container" data-aos="fade-up">

        <div className="section-header text-center mb-5">
          <span className="sub-title">Our Menu</span>
          <h2 className="title">Discover our <span className="text-primary">Delicious Menu</span></h2>
          <p className="description">Fresh, tasty, and prepared with love. Explore our daily specials.</p>
        </div>

        {/* Improved Tabs */}
        <div className="tabs-wrapper">
          <div className="menu-tabs">
            {menuCategories.map((category) => (
              <button
                key={category.id}
                className={`tab-btn ${activeTab === category.id ? 'active' : ''}`}
                onClick={() => handleTabChange(category.id)}
              >
                <div className="icon-box">
                  <i className={category.icon}></i>
                </div>
                <span>{category.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="menu-content mt-4">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="row g-4 justify-content-center">
              {getDisplayItems(activeTab).length > 0 ? (
                getDisplayItems(activeTab).map((item, index) => (
                  <div key={item.id || index} className="col-lg-3 col-md-4 col-6 animate-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="product-card" onClick={handleCardClick}>
                      <div className="card-image">
                        <img
                          src={item.img || "/img/menu/placeholder.jpg"}
                          alt={item.name}
                          onError={(e) => { e.target.onerror = null; e.target.src = "/img/menu/placeholder.jpg"; }}
                        />
                        <span className="price-tag">{item.price}</span>
                      </div>
                      <div className="card-details">
                        <h3 className="product-name">{item.name}</h3>
                        <p className="product-desc">{item.description || "Delicious South Indian delicacy."}</p>
                        <button className="add-btn">
                          Add <i className="fas fa-plus ms-1"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <div className="empty-state">
                    <i className="fas fa-utensils mb-3"></i>
                    <p>No items available in this category today.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-5">
          <button className="btn-view-all" onClick={() => navigate('/order', { state: { category: activeTab } })}>
            View Full Menu <i className="fas fa-arrow-right ms-2"></i>
          </button>
        </div>

      </div>
    </section>
  );
};

export default MenuSection;