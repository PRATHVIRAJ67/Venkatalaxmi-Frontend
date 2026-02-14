import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fetch menu items from the backend with pagination and optional category filter
const fetchMenuItems = async (page = 1, limit = 15, category = '') => {
    try {
        const params = { page, limit };
        if (category) {
            params.category = category;
        }
        const response = await axios.get(`${API_BASE_URL}/menu-items`, {
            params,
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error.response?.data || { error: error.message };
    }
};

export { fetchMenuItems };
