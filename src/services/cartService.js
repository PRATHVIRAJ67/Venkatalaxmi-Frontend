// Cart management service

// Get cart from session storage
export const getCart = () => {
  try {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      return Array.isArray(parsedCart) ? parsedCart : [];
    }
    return [];
  } catch (error) {
    console.error('Error retrieving cart from session storage:', error);
    return [];
  }
};

// Save cart to session storage
export const saveCart = (cart) => {
  try {
    if (cart.length > 0) {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    } else {
      sessionStorage.removeItem('cart');
    }
    return true;
  } catch (error) {
    console.error('Error saving cart to session storage:', error);
    return false;
  }
};

// Clear cart from session storage
export const clearCart = () => {
  try {
    sessionStorage.removeItem('cart');
    return true;
  } catch (error) {
    console.error('Error clearing cart from session storage:', error);
    return false;
  }
};

// Add item to cart
export const addToCart = (item, currentCart) => {
  try {
    const cart = [...currentCart];
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      cart[existingItemIndex] = {
        ...cart[existingItemIndex],
        quantity: cart[existingItemIndex].quantity + item.quantity
      };
    } else {
      // Add new item to cart
      cart.push(item);
    }
    
    saveCart(cart);
    return cart;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return currentCart;
  }
};

// Update item quantity in cart
export const updateCartItemQuantity = (itemId, quantity, currentCart) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is zero or negative
      const cart = currentCart.filter(item => item.id !== itemId);
      saveCart(cart);
      return cart;
    }
    
    const cart = currentCart.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          quantity
        };
      }
      return item;
    });
    
    saveCart(cart);
    return cart;
  } catch (error) {
    console.error('Error updating item quantity:', error);
    return currentCart;
  }
};

// Remove item from cart
export const removeCartItem = (itemId, currentCart) => {
  try {
    const cart = currentCart.filter(item => item.id !== itemId);
    saveCart(cart);
    return cart;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return currentCart;
  }
};

// Calculate cart total
export const calculateCartTotal = (cart, deliveryFee = 0, discount = 0) => {
  try {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (discount / 100);
    const total = subtotal - discountAmount + deliveryFee;
    
    return {
      subtotal,
      discountAmount,
      total,
      itemCount: cart.reduce((count, item) => count + item.quantity, 0)
    };
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return {
      subtotal: 0,
      discountAmount: 0,
      total: 0,
      itemCount: 0
    };
  }
}; 