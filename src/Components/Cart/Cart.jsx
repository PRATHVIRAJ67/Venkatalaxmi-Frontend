import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineArrowLeft } from 'react-icons/ai';
import UserFormModal from '../form/ResponsiveForm';
import useRazorpay from './useRazorpay';
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import {
  getCart, saveCart, clearCart as clearCartService,
  calculateCartTotal
} from '../../services/cartService';
import { getUserData, saveUserData } from '../../services/userService';
import { getErrorMessage } from '../../services/uiService';
import {
  PROMO_CODES,
  DEFAULT_DELIVERY_FEE,
  ERROR_MESSAGES
} from '../../constants';
// import useSEO from '../hooks/useSEO';

const CartPage = () => {
  // Apply SEO metadata for the cart page
  // useSEO('CART');

  const navigate = useNavigate();
  // Initialize with an empty array but don't rely on useState's initial value for data persistence
  const [cart, setCart] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [deliveryOption, setDeliveryOption] = useState('delivery');
  const [deliveryFee, setDeliveryFee] = useState(DEFAULT_DELIVERY_FEE);
  const [formVisible, setFormVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  const [userData, setUserData] = useState(null); // Store form data to use after payment success
  // const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState(null); // REMOVED
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null); // null = clear all, string = single item id

  // Razorpay payment hook
  const { loading, initiatePayment } = useRazorpay();

  // Test Connection on component mount (OPTIONAL/REMOVED since main flow uses API now)
  useEffect(() => {
    // We can rely on API failure handling during checkout instead of pre-check
    // Or implement testApiConnection() from userService if strict check needed

    // Try to load saved user data if available
    const savedUserData = getUserData();
    if (savedUserData) {
      setUserData(savedUserData);
    }
  }, []);

  // Load cart data immediately - synchronously - at the top level
  let initialCart = [];
  try {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
      initialCart = JSON.parse(storedCart);
      if (!Array.isArray(initialCart)) {
        initialCart = [];
      }
    }
  } catch (e) {
    console.error("Error loading initial cart:", e);
  }

  // Use useEffect to set the state after the component mounts
  useEffect(() => {
    if (initialCart.length > 0) {
      setCart(initialCart);

      // Calculate initial total
      const subtotal = initialCart.reduce((acc, item) => {
        return acc + (item.price * item.quantity);
      }, 0);

      const total = subtotal + deliveryFee;
      setTotalAmount(total);
    }
  }, []);

  // Update sessionStorage and recalculate totals whenever cart changes
  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem('cart', JSON.stringify(cart));
    } else {
      sessionStorage.removeItem('cart');
    }

    // Calculate totals
    const subtotal = cart.reduce((acc, item) => {
      return acc + (item.price * item.quantity);
    }, 0);

    const discountAmount = isPromoApplied ? subtotal * (discount / 100) : 0;
    const total = subtotal - discountAmount + (deliveryOption === 'delivery' ? deliveryFee : 0);

    setTotalAmount(total);
  }, [cart, discount, isPromoApplied, deliveryOption, deliveryFee]);

  // Build the cart context object that the Razorpay hook needs
  const buildCartContext = () => ({
    cart,
    totalAmount,
    deliveryOption,
    deliveryFee,
    isPromoApplied,
    discount,
    promoCode,
    clearCart,
  });

  // Handle form submission → kick off Razorpay payment
  const handleFormSubmit = async (formData) => {
    try {
      // Store the form data in state AND sessionStorage
      setUserData(formData);
      sessionStorage.setItem('user', JSON.stringify(formData));

      // Close form and initiate payment
      setTimeout(() => {
        setFormVisible(false);
        initiatePayment(formData, userData, setUserData, setFormVisible, buildCartContext());
      }, 100);
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleQuantityChange = (itemId, action) => {
    setCart(prevCart => {
      const updatedCart = [...prevCart];
      const itemIndex = updatedCart.findIndex(item => item.id === itemId);

      if (itemIndex === -1) return updatedCart;

      const item = updatedCart[itemIndex];
      const isSweetsCategory = item.category === 'menu-starters';
      const isSnacksCategory = item.category === 'menu-dinner';
      const increment = isSweetsCategory ? 10 : 1;
      let minQuantity = 1;

      if (isSweetsCategory) {
        minQuantity = 50;
      } else if (isSnacksCategory) {
        minQuantity = 10;
      }

      if (action === 'add') {
        updatedCart[itemIndex] = {
          ...item,
          quantity: item.quantity + increment
        };
      } else if (action === 'subtract') {
        const newQuantity = item.quantity - increment;
        if (newQuantity < minQuantity) {
          // Remove item from cart if below minimum
          updatedCart.splice(itemIndex, 1);
        } else {
          updatedCart[itemIndex] = {
            ...item,
            quantity: newQuantity
          };
        }
      }

      return updatedCart;
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const applyPromoCode = () => {
    if (PROMO_CODES[promoCode]) {
      setDiscount(PROMO_CODES[promoCode]);
      setIsPromoApplied(true);

      if (promoCode === 'FREESHIP') {
        setDeliveryFee(0);
      }
    } else {
      alert(ERROR_MESSAGES.INVALID_PROMO);
    }
  };

  const handleContinueShopping = () => {
    navigate('/order');
  };

  const clearCart = () => {
    setCart([]);
    clearCartService();
    setShowClearConfirm(false);
    setPendingDeleteId(null);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      removeFromCart(pendingDeleteId);
    } else {
      clearCart();
    }
    setShowClearConfirm(false);
    setPendingDeleteId(null);
  };

  const handleClearCartClick = () => {
    setPendingDeleteId(null);
    setShowClearConfirm(true);
  };

  const handleRemoveItemClick = (itemId) => {
    setPendingDeleteId(itemId);
    setShowClearConfirm(true);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(ERROR_MESSAGES.EMPTY_CART);
      return;
    }

    // if (supabaseConnectionStatus === 'failed') {
    //   alert(ERROR_MESSAGES.CONNECTION_ERROR);
    // }

    // Show the form to collect user details
    setFormVisible(true);
  };

  return (
    <div className="cart-page" key={renderKey}>
      {loading && <LoadingOverlay />}
      <div className="container">
        <div className="cart-header">
          <button className="back-button" onClick={handleContinueShopping}>
            <AiOutlineArrowLeft /> Back to Menu
          </button>
          <h1>Your Cart</h1>
          <p className='review'>Please review and modify your selected items before checkout</p>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart-message">
            <i className="bi bi-cart-x"></i>
            <h3>Your cart is empty</h3>
            <p>Add some delicious items to get started</p>
            <button className="browse-menu-button" onClick={handleContinueShopping}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items-section">
              <div className="cart-items-header">
                <div className="item-col">Item</div>
                <div className="price-col">Price</div>
                <div className="quantity-col">Quantity</div>
                <div className="subtotal-col">Subtotal</div>
                <div className="action-col"></div>
              </div>

              {cart.map(item => (
                <div className="cart-item-row" key={item.id}>
                  <div className="item-col">
                    <div className="item-info">
                      <img
                        src={item.img && item.img.startsWith('http') ? item.img : `/img/menu/${item.img}`}
                        alt={item.name}
                        className="item-image"
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-description">{item.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="price-col">₹{item.price}</div>

                  <div className="quantity-col">
                    <div className="quantity-selector">
                      <button onClick={() => handleQuantityChange(item.id, 'subtract')}>
                        <AiOutlineMinus />
                      </button>

                      <span>{item.quantity}</span>

                      <button onClick={() => handleQuantityChange(item.id, 'add')}>
                        <AiOutlinePlus />
                      </button>
                    </div>
                  </div>

                  <div className="subtotal-col">₹{item.price * item.quantity}</div>

                  <div className="action-col">
                    <button className="remove-item-button" onClick={() => handleRemoveItemClick(item.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}

              <div className="cart-actions">
                <button className="clear-cart-button" onClick={handleClearCartClick}>
                  <i className="bi bi-x-circle"></i> Clear Cart
                </button>
              </div>
            </div>

            <div className="cart-summary">
              <h3>Order Summary</h3>

              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
              </div>

              {isPromoApplied && (
                <div className="summary-row discount">
                  <span>Discount:</span>
                  <span>-₹{(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * (discount / 100)).toFixed(2)}</span>
                </div>
              )}

              <div className="delivery-options">
                <h4>Delivery Options</h4>
                <div className="delivery-option">
                  <input
                    type="radio"
                    id="delivery"
                    name="delivery-option"
                    value="delivery"
                    checked={deliveryOption === 'delivery'}
                    onChange={() => setDeliveryOption('delivery')}
                  />
                  <label
                    htmlFor="delivery"
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#333',
                      marginBottom: '8px',
                    }}
                  >
                    Home Delivery{' '}
                    <span
                      style={{
                        display: 'block',
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      (Delivery fee varies based on your location and will be collected at the time of delivery)
                    </span>
                  </label>


                </div>
                <div className="delivery-option">
                  <input
                    type="radio"
                    id="pickup"
                    name="delivery-option"
                    value="pickup"
                    checked={deliveryOption === 'pickup'}
                    onChange={() => setDeliveryOption('pickup')}
                  />

                  <label htmlFor="pickup">Self Pickup (Free)</label>
                </div>
              </div>

              <div className="promo-code-section">
                <h4>Promo Code</h4>
                <div className="promo-input">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    disabled={isPromoApplied}
                  />
                  {isPromoApplied ? (
                    <button
                      className="promo-button applied"
                      onClick={() => { setIsPromoApplied(false); setDiscount(0); setPromoCode(''); setDeliveryFee(0); }}
                    >
                      Remove
                    </button>
                  ) : (
                    <button className="promo-button" onClick={applyPromoCode}>Apply</button>
                  )}
                </div>
                {isPromoApplied && (
                  <div className="promo-applied-message">
                    <i className="bi bi-check-circle"></i> {discount}% discount applied
                  </div>
                )}
              </div>

              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              <button
                className={`checkout-button ${loading ? 'btn-loading' : ''}`}
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "" : "Proceed to Payment"}
                {!loading && <i className="bi bi-arrow-right"></i>}
              </button>
              <UserFormModal
                isOpen={formVisible}
                onClose={() => setFormVisible(false)}
                onSubmit={handleFormSubmit}
                loading={loading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Dialog */}
      {showClearConfirm && (
        <div className="confirm-dialog-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <h3>{pendingDeleteId ? 'Remove Item?' : 'Clear Cart?'}</h3>
            <p>
              {pendingDeleteId
                ? 'Are you sure you want to remove this item from your cart?'
                : 'Are you sure you want to clear all items from your cart?'}
            </p>
            <div className="confirm-dialog-actions">
              <button
                className="confirm-dialog-cancel"
                onClick={() => { setShowClearConfirm(false); setPendingDeleteId(null); }}
              >
                Cancel
              </button>
              <button
                className="confirm-dialog-confirm"
                onClick={handleConfirmDelete}
              >
                {pendingDeleteId ? 'Remove' : 'Clear Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;