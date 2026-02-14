import { userSupabase } from '../Components/utils/supabaseClinet2';

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

// Save user data and order details to Supabase
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
    
    // Insert user data with order details
    const { data, error } = await userSupabase
      .from("users")
      .insert([enhancedUserData])
      .select();
    
    if (error) {
      console.error("Error saving user and order details to Supabase:", error);
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Error saving user order:', error);
    return { success: false, error: error.message };
  }
};

// Verify if Supabase connection is working
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await userSupabase.from("users").select("*").limit(1);
    
    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error };
    } 
    
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error);
    return { success: false, error: error.message };
  }
}; 