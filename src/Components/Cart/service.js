import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create Razorpay order via backend
const createOrder = async (orderData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/create-order`, orderData, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error creating order:", error);
        throw error.response?.data || { error: error.message };
    }
};

// Verify payment via backend
const verifyPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/verify-payment`, paymentData, {
            withCredentials: true
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying payment:", error);
        throw error.response?.data || { error: error.message };
    }
};

// Insert order details via backend
const insertOrder = async (data) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/insert-order`, data);
        return response.data;
    } catch (error) {
        console.error("Error inserting order:", error);
        return { success: false, error: error.message };
    }
};

export { createOrder, verifyPayment, insertOrder };