import { useState, useEffect } from 'react';
import { 
  getCart, 
  saveCart, 
  clearCart as clearCartService,
  updateCartItemQuantity,
  removeCartItem,
  calculateCartTotal 
} from '../../services/cartService';
import { 
  QUANTITY_INCREMENTS, 
  MIN_QUANTITIES,
  DEFAULT_DELIVERY_FEE 
} from '../../constants';

/**
 * Custom hook for cart management
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoSave - Whether to auto-save cart changes
 * @param {number} options.initialDeliveryFee - Initial delivery fee
 * @returns {Object} Cart state and methods
 */
export const useCart = (options = {}) => {
  const { 
    autoSave = true,
    initialDeliveryFee = DEFAULT_DELIVERY_FEE 
  } = options;
  
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [deliveryFee, setDeliveryFee] = useState(initialDeliveryFee);
  
  // Load cart on initial mount
  useEffect(() => {
    const initialCart = getCart();
    if (initialCart.length > 0) {
      setCart(initialCart);
      
      // Calculate initial total
      const { total } = calculateCartTotal(
        initialCart, 
        deliveryOption === 'delivery' ? deliveryFee : 0, 
        isPromoApplied ? discount : 0
      );
      setTotalAmount(total);
    }
  }, []);
  
  // Update totals when cart or related options change
  useEffect(() => {
    if (autoSave && cart.length > 0) {
      saveCart(cart);
    }
    
    // Calculate totals
    const { total } = calculateCartTotal(
      cart, 
      deliveryOption === 'delivery' ? deliveryFee : 0, 
      isPromoApplied ? discount : 0
    );
    
    setTotalAmount(total);
  }, [cart, discount, isPromoApplied, deliveryOption, deliveryFee, autoSave]);
  
  // Add an item to the cart
  const addToCart = (item) => {
    const existingItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedCart = [...cart];
      updatedCart[existingItemIndex] = {
        ...updatedCart[existingItemIndex],
        quantity: updatedCart[existingItemIndex].quantity + item.quantity
      };
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, item]);
    }
  };
  
  // Update an item's quantity
  const updateQuantity = (itemId, action) => {
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) return;
    
    const item = cart[itemIndex];
    const isSweetsCategory = item.category === 'menu-starters';
    const increment = QUANTITY_INCREMENTS[item.category] || QUANTITY_INCREMENTS.default;
    const minQuantity = MIN_QUANTITIES[item.category] || MIN_QUANTITIES.default;
    
    if (action === 'add') {
      const updatedCart = [...cart];
      updatedCart[itemIndex] = {
        ...item,
        quantity: item.quantity + increment
      };
      setCart(updatedCart);
    } else if (action === 'subtract') {
      const newQuantity = item.quantity - increment;
      if (newQuantity < minQuantity) {
        // Remove item if below minimum
        setCart(cart.filter(item => item.id !== itemId));
      } else {
        const updatedCart = [...cart];
        updatedCart[itemIndex] = {
          ...item,
          quantity: newQuantity
        };
        setCart(updatedCart);
      }
    }
  };
  
  // Remove an item from the cart
  const removeItem = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };
  
  // Clear the cart
  const clearCart = () => {
    setCart([]);
    clearCartService();
  };
  
  // Apply a promo code
  const applyPromo = (code, discountPercent, affectsDelivery = false) => {
    setDiscount(discountPercent);
    setIsPromoApplied(true);
    
    if (affectsDelivery) {
      setDeliveryFee(0);
    }
  };
  
  // Remove promo code
  const removePromo = (resetDeliveryFee = DEFAULT_DELIVERY_FEE) => {
    setDiscount(0);
    setIsPromoApplied(false);
    setDeliveryFee(resetDeliveryFee);
  };
  
  // Set delivery option
  const setDelivery = (option, fee = DEFAULT_DELIVERY_FEE) => {
    setDeliveryOption(option);
    if (option === 'delivery' && !isPromoApplied) {
      setDeliveryFee(fee);
    } else if (option === 'pickup') {
      setDeliveryFee(0);
    }
  };
  
  return {
    cart,
    totalAmount,
    discount,
    isPromoApplied,
    deliveryOption,
    deliveryFee,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyPromo,
    removePromo,
    setDelivery,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0)
  };
}; 