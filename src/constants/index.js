// Menu categories
export const MENU_CATEGORIES = [
  { id: 'menu-starters', title: 'Sweets', icon: 'bi-cake2-fill' },
  { id: 'menu-breakfast', title: 'Breakfast', icon: 'bi-cup-hot-fill' },
  { id: 'menu-lunch', title: 'Lunch', icon: 'bi-egg-fried' },
  { id: 'menu-dinner', title: 'Snacks', icon: 'bi-basket3-fill' }
];

// Promo codes with their discount percentages
export const PROMO_CODES = {
  'WELCOME10': 50,
  'SPECIAL25': 25,
  'FREESHIP': 100  
};

// Default delivery fee
export const DEFAULT_DELIVERY_FEE = 0;

// Minimum quantities by category
export const MIN_QUANTITIES = {
  'menu-starters': 50,
  'menu-dinner': 10,
  'default': 1
};

// Quantity increments by category
export const QUANTITY_INCREMENTS = {
  'menu-starters': 10,
  'menu-dinner': 1,
  'default': 1
};

// Time slots for each meal period
export const TIME_SLOTS = {
  BREAKFAST: {
    start: 5, // 5 AM
    end: 13,  // 1 PM
  },
  LUNCH: {
    start: 11, // 11 AM
    end: 17,   // 5 PM
  },
  DINNER: {
    start: 17, // 5 PM
    end: 5,    // 5 AM next day
  }
};

// API endpoints
export const API_ENDPOINTS = {
  CREATE_ORDER: '/create-order',
  VERIFY_PAYMENT: '/verify-payment',
};

// App constants
export const APP_CONSTANTS = {
  BUSINESS_NAME: 'Venkatalakmi Mess',
  SUPPORT_EMAIL: 'support@venkatalakshmimess.com',
  LOGO_PATH: '/your-logo.png',
  CART_DEFAULT_POSITION: {
    top: 80,
    left: 40
  }
};

// SessionStorage keys
export const STORAGE_KEYS = {
  CART: 'cart',
  USER: 'user',
  MENU_ITEMS: 'menuItems',
  MENU_ITEMS_CACHED_DAY: 'menuItemsCachedDay'
};

// Payment gateway configuration
export const PAYMENT_CONFIG = {
  GATEWAY: 'Razorpay',
  CURRENCY: 'INR',
  THEME_COLOR: '#3399cc'
};

// Error messages
export const ERROR_MESSAGES = {
  EMPTY_CART: 'Your cart is empty',
  PAYMENT_FAILED: 'Payment failed: ',
  CONNECTION_ERROR: 'Warning: There might be issues with our database connection. Your order can be processed but data storage might be affected.',
  ORDER_PROCESSING_ERROR: 'Unable to process order: missing user details',
  INVALID_PROMO: 'Invalid promo code'
};

// Order success messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Your order was placed successfully. We appreciate your trust in us!',
  REDIRECTING: 'Redirecting to main menu in',
}; 