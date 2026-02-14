import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrder, verifyPayment as verifyPaymentService, insertOrder } from './service';

/**
 * Custom hook that encapsulates all Razorpay payment logic.
 * Handles order creation, Razorpay checkout, payment verification,
 * and post-payment order insertion.
 */
const useRazorpay = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // ---------- Internal helpers ----------

    /**
     * Resolve userData from multiple sources (param → sessionStorage).
     */
    const resolveUserData = (formDataParam, userDataState) => {
        if (formDataParam) return formDataParam;
        if (userDataState) return userDataState;
        try {
            const stored = sessionStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
        } catch (err) {
            console.error('Error retrieving user data:', err);
            return null;
        }
    };

    /**
     * Load the Razorpay checkout script if it isn't loaded yet.
     * Returns a promise that resolves once the script is ready.
     */
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (window.Razorpay) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
            document.body.appendChild(script);
        });
    };

    /**
     * Open the Razorpay checkout modal.
     */
    const openCheckout = (orderIdVal, amount, currency, keyId, user, cartContext) => {
        const options = {
            key: keyId,
            amount,
            currency,
            name: 'Venkatalakmi Mess',
            description: 'Food Order Payment',
            image: '/v.png',
            order_id: orderIdVal,
            handler: (response) => {
                handlePaymentSuccess(response, user, cartContext);
            },
            prefill: {
                name: user.name || '',
                email: user.email || '',
                contact: user.phone || '',
            },
            notes: {
                deliveryOption: cartContext.deliveryOption,
                address: user.address || '',
            },
            theme: { color: '#3399cc' },
            modal: {
                ondismiss: () => setLoading(false),
            },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();

        razorpay.on('payment.failed', (response) => {
            alert(`Payment failed: ${response.error.description}`);
            console.error('Payment failed:', response.error);
            setLoading(false);
        });
    };

    /**
     * Verify payment with the backend & save order details.
     */
    const handlePaymentSuccess = async (paymentResponse, user, cartContext) => {
        const {
            cart, totalAmount, deliveryOption, deliveryFee,
            isPromoApplied, discount, promoCode, clearCart,
        } = cartContext;

        try {
            setLoading(true);

            const data = await verifyPaymentService({
                orderId: paymentResponse.razorpay_order_id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
            });

            if (data.verified) {
                // Save order details via backend
                if (user) {
                    try {
                        const orderPayload = {
                            ...user,
                            order_items: JSON.stringify(cart),
                            order_total: totalAmount,
                            order_id: data.orderId || paymentResponse.razorpay_order_id,
                            payment_id: paymentResponse.razorpay_payment_id,
                            delivery_option: deliveryOption,
                            delivery_fee: deliveryOption === 'delivery' ? deliveryFee : 0,
                            discount: isPromoApplied ? discount : 0,
                            promo_code: isPromoApplied ? promoCode : null,
                            order_date: new Date().toISOString(),
                        };

                        const result = await insertOrder(orderPayload);

                        if (!result.success && result.error) {
                            console.error('Error saving order details:', result.error);
                            alert('Your order was processed, but we had trouble saving your details: ' + result.error);
                        }
                    } catch (orderError) {
                        console.error('Unexpected error saving order:', orderError);
                        alert('Order successful but there was an error saving your details.');
                    }
                } else {
                    console.warn('No user data available to save');
                    alert('Order processed successfully but user details are missing.');
                }

                // Copy cart items before clearing
                const cartItemsCopy = [...cart];

                // Clean up session & state
                sessionStorage.removeItem('user');
                clearCart();

                // Navigate to success page
                navigate('/success', {
                    state: {
                        orderId: data.orderId || paymentResponse.razorpay_order_id,
                        amount: totalAmount,
                        paymentId: paymentResponse.razorpay_payment_id,
                        items: cartItemsCopy,
                        deliveryOption,
                        deliveryFee: deliveryOption === 'delivery' ? deliveryFee : 0,
                    },
                });
            } else {
                alert('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            alert('Payment verification failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ---------- Public API ----------

    /**
     * Create a Razorpay order and open the checkout modal.
     *
     * @param {Object}   formDataParam  – fresh form data (highest priority)
     * @param {Object}   userDataState  – current React state userData
     * @param {Function} setUserData    – setter to sync state
     * @param {Function} setFormVisible – setter to re-show form if data is missing
     * @param {Object}   cartContext    – { cart, totalAmount, deliveryOption, deliveryFee,
     *                                      isPromoApplied, discount, promoCode, clearCart }
     */
    const initiatePayment = async (formDataParam, userDataState, setUserData, setFormVisible, cartContext) => {
        try {
            setLoading(true);

            const userDataToUse = resolveUserData(formDataParam, userDataState);

            if (!userDataToUse) {
                alert('Unable to process order: missing user details');
                setLoading(false);
                setFormVisible(true);
                return;
            }

            // Keep state in sync
            setUserData(userDataToUse);

            // Build order payload for the backend
            const orderData = {
                amount: cartContext.totalAmount * 100, // Razorpay expects paise
                currency: 'INR',
                items: cartContext.cart.map((item) => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                })),
                deliveryOption: cartContext.deliveryOption,
                deliveryFee: cartContext.deliveryFee,
                discount: cartContext.isPromoApplied ? cartContext.discount : 0,
                promoCode: cartContext.isPromoApplied ? cartContext.promoCode : null,
            };

            const data = await createOrder(orderData);
            setOrderId(data.orderId);

            // Load Razorpay SDK (if needed) then open checkout
            await loadRazorpayScript();
            openCheckout(data.orderId, data.amount, data.currency, data.keyId, userDataToUse, cartContext);
        } catch (error) {
            console.error('Error creating order:', error);
            alert('Something went wrong. Please try again: ' + error.message);
            setLoading(false);
        }
    };

    return { loading, orderId, initiatePayment };
};

export default useRazorpay;
