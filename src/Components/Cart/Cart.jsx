import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import { AiOutlinePlus, AiOutlineMinus, AiOutlineArrowLeft } from 'react-icons/ai';
import UserFormModal from '../form/ResponsiveForm';
import { userSupabase } from "../utils/supabaseClinet2";
import { LoadingSpinner, LoadingOverlay } from '../common/LoadingSpinner';
import { getCart, saveCart, clearCart as clearCartService, 
         calculateCartTotal } from '../../services/cartService';
import { getUserData, saveUserData, testSupabaseConnection as testConnection } from '../../services/userService';
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
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [renderKey, setRenderKey] = useState(0); // Force re-render key
  const [orderId, setOrderId] = useState(null);
  const [userData, setUserData] = useState(null); // Store form data to use after payment success
  const [supabaseConnectionStatus, setSupabaseConnectionStatus] = useState(null);
  
  // Test Supabase connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      const result = await testConnection();
      setSupabaseConnectionStatus(result.success ? 'success' : 'failed');
    };
    
    checkConnection();
    
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

  // Modified to store form data and proceed to payment without saving to Supabase yet
  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Store the form data in state AND sessionStorage with fresh data
      setUserData(formData);
      sessionStorage.setItem('user', JSON.stringify(formData));
      
      // Delay closing the form slightly to ensure data is set
      setTimeout(() => {
        setFormVisible(false);
        // Pass the formData directly to createRazorpayOrder to use the latest data
        createRazorpayOrder(formData);
      }, 100);
      
    } catch (error) {
      console.error("Form submission error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false);
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
};

  // Modified to accept direct formData parameter
  const createRazorpayOrder = async (formDataParam) => {
    try {
      setLoading(true);
      
      // Use the passed formData parameter first, then fall back to state, then sessionStorage
      const userDataToUse = formDataParam || userData || (() => {
        try {
          const storedUser = sessionStorage.getItem('user');
          return storedUser ? JSON.parse(storedUser) : null;
        } catch (err) {
          console.error("Error retrieving user data:", err);
          return null;
        }
      })();
      
      // If we still don't have user data, show the form again
      if (!userDataToUse) {
        alert("Unable to process order: missing user details");
        setLoading(false);
        setFormVisible(true);
        return;
      }
      
      // Always update state with the data we're using to ensure consistency
      setUserData(userDataToUse);
      
      // Prepare order data
      const orderData = {
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        deliveryOption,
        deliveryFee,
        discount: isPromoApplied ? discount : 0,
        promoCode: isPromoApplied ? promoCode : null
      };
      
      // Call backend API to create order
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      const data = await response.json();
      setOrderId(data.orderId);
      
      // Initialize Razorpay payment with the active userData
      initializeRazorpayPayment(data.orderId, data.amount, data.currency, data.keyId, userDataToUse);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Something went wrong. Please try again: ' + error.message);
      setLoading(false);
    }
  };

  // Updated to accept userData parameter directly
  const initializeRazorpayPayment = (orderId, amount, currency, keyId, userDataParam) => {
    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        openRazorpayCheckout(orderId, amount, currency, keyId, userDataParam);
      };
    } else {
      openRazorpayCheckout(orderId, amount, currency, keyId, userDataParam);
    }
  };

  // Updated to use passed userData parameter
  const openRazorpayCheckout = (orderId, amount, currency, keyId, userDataParam) => {
    // Use passed userData, fallback to state, then sessionStorage
    const user = userDataParam || userData || JSON.parse(sessionStorage.getItem('user')) || {};
    
    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: 'Venkatalakmi Mess',
      description: 'Food Order Payment',
      image: '/v.png',
      order_id: orderId,
      handler: function(response) {
        // Pass the current user data to payment verification to ensure consistency
        verifyPayment(response, user);
      },
      prefill: {
        name: user.name || '',
        email: user.email || '',
        contact: user.phone || ''
      },
      notes: {
        deliveryOption: deliveryOption,
        address: user.address || ''
      },
      theme: {
        color: '#3399cc'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      }
    };
    
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
    // Event handlers
    razorpay.on('payment.failed', function(response) {
      alert(`Payment failed: ${response.error.description}`);
      console.error('Payment failed:', response.error);
      setLoading(false);
    });
  };

  // Updated to accept userDataParam directly to ensure using current data
  const verifyPayment = async (paymentResponse, userDataParam) => {
    try {
      setLoading(true);
      
      // Use the passed userData parameter, then state, then sessionStorage
      let userDataToUse = userDataParam || userData;
      if (!userDataToUse) {
        try {
          const storedUser = sessionStorage.getItem('user');
          if (storedUser) {
            userDataToUse = JSON.parse(storedUser);
          }
        } catch (err) {
          console.error("Error reading user data from sessionStorage:", err);
        }
      }
      
      if (!userDataToUse) {
        throw new Error("No user data available for order processing");
      }
      
      // Send payment details to backend for verification
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentResponse.razorpay_order_id,
          paymentId: paymentResponse.razorpay_payment_id,
          signature: paymentResponse.razorpay_signature
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }
      
      if (data.verified) {
        // Payment is successful - save user data WITH order details to Supabase
        if (userDataToUse) {
          try {
            // Add order details directly to the user data object
            const enhancedUserData = {
              ...userDataToUse,
              order_items: JSON.stringify(cart), // Convert array to string to avoid issues
              order_total: totalAmount,
              order_id: data.orderId || paymentResponse.razorpay_order_id,
              payment_id: paymentResponse.razorpay_payment_id,
              delivery_option: deliveryOption,
              delivery_fee: deliveryOption === 'delivery' ? deliveryFee : 0,
              discount: isPromoApplied ? discount : 0,
              promo_code: isPromoApplied ? promoCode : null,
              order_date: new Date().toISOString(),
            };
            
            // Insert user data with order details
            const { data: insertedData, error } = await userSupabase
              .from("users")
              .insert([enhancedUserData])
              .select();
            
            if (error) {
              console.error("Error saving user and order details to Supabase:", error);
              alert("Your order was processed, but we had trouble saving your details: " + error.message);
              // Still proceed with order success because payment was successful
            }
          } catch (supabaseError) {
            console.error("Unexpected error with Supabase:", supabaseError);
            alert("Order successful but there was an error saving your details.");
          }
        } else {
          console.warn("No user data available to save to Supabase");
          alert("Order processed successfully but user details are missing.");
        }
        
        // Save the cart items copy before clearing the cart
        const cartItemsCopy = [...cart];
        
        // Clear user data from sessionStorage and state after successful order
        sessionStorage.removeItem('user');
        setUserData(null);
        
        // Clear the actual cart
        clearCart();
        
        // Navigate to success page with cart items included in the state
        navigate('/success', { 
          state: { 
            orderId: data.orderId || paymentResponse.razorpay_order_id,
            amount: totalAmount,
            paymentId: paymentResponse.razorpay_payment_id,
            items: cartItemsCopy,
            deliveryOption: deliveryOption,
            deliveryFee: deliveryOption === 'delivery' ? deliveryFee : 0
          }
        });
      } else {
        // Payment verification failed
        alert('Payment verification failed. Please contact support.');
      }
      
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Payment verification failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert(ERROR_MESSAGES.EMPTY_CART);
      return;
    }
    
    if (supabaseConnectionStatus === 'failed') {
      alert(ERROR_MESSAGES.CONNECTION_ERROR);
    }
    
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
                    <button className="remove-item-button" onClick={() => removeFromCart(item.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="cart-actions">
                <button className="clear-cart-button" onClick={clearCart}>
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
                      onClick={() => {setIsPromoApplied(false); setDiscount(0); setPromoCode(''); setDeliveryFee(0);}}
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
    </div>
  );
};

export default CartPage;