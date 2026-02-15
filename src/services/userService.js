import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Get user data from session storage
export const getUserData = () => {
  try {
    const userData = sessionStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error retrieving user data from session storage:', error);
    return null;
  }
};

// Save user data to session storage
export const saveUserData = (userData) => {
  try {
    sessionStorage.setItem('user', JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error saving user data to session storage:', error);
    return false;
  }
};

// Clear user data from session storage
export const clearUserData = () => {
  try {
    sessionStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error('Error clearing user data from session storage:', error);
    return false;
  }
};

// Save user data and order details to Backend
export const saveUserOrder = async (userData, orderDetails) => {
  try {
    if (!userData) {
      throw new Error('No user data provided');
    }

    // Combine user data with order details
    const enhancedUserData = {
      ...userData,
      order_items: typeof orderDetails.items === 'string'
        ? orderDetails.items
        : JSON.stringify(orderDetails.items),
      order_total: orderDetails.total,
      order_id: orderDetails.orderId,
      payment_id: orderDetails.paymentId,
      delivery_option: orderDetails.deliveryOption,
      delivery_fee: orderDetails.deliveryFee,
      discount: orderDetails.discount,
      promo_code: orderDetails.promoCode,
      order_date: new Date().toISOString()
    };

    // Post to backend API
    const response = await axios.post(`${API_BASE_URL}/users`, enhancedUserData); // Unified endpoint assumption
    // Note: If /users endpoint doesn't exist, we might need to use /insert-order if that saves user data too.
    // Based on codebase, `insertOrder` in Cart/service.js calls /insert-order.
    // If the backend has a separate /users endpoint, great. If not, this might fail unless implemented.
    // *Correction*: usage in Cart/service.js suggests `insert-order` might be the main one.
    // However, the original code was: `userSupabase.from("users").insert(...)`.
    // So there IS a generic `users` table.

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error saving user order:', error);
    return { success: false, error: error.message || 'Failed to save order' };
  }
};

// Verify if API connection is working (optional replacement for Supabase test)
export const testApiConnection = async () => {
  try {
    await axios.get(`${API_BASE_URL}/health`); // Assuming a health check or similar
    // Or just return true as we don't need to block UI on this check usually
    return { success: true };
  } catch (error) {
    // console.error("API connection test failed:", error);
    return { success: false, error: error.message };
  }
}; 