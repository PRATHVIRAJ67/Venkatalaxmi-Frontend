import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Components/Landing/Header/Header';
import Home from './Components/Landing/Home';
import Footer from './Components/Landing/Footer/Footer';
import { LoadingSpinner } from './Components/common/LoadingSpinner';
import ChatBotIcon from './Components/Landing/Chatbot/ChatBotIcon'; 
import UserForm from './Components/form/ResponsiveForm';
import ErrorBoundary from './Components/common/ErrorBoundary';
import { updateSEO, SEO_CONFIG } from './services/seoService';

// Use lazy loading for better performance
const OrderPage = lazy(() => import('./Components/OrderPage/OrderPage'));
const CartPage = lazy(() => import('./Components/Cart/Cart'));
const OrderSuccess = lazy(() => import('./Components/order-sucess/ordersucess'));

// Main layout component that wraps pages with header, footer and chatbot
function MainLayout({ children }) {
  return (
    <>
      <Header />
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <Footer />
      <ChatBotIcon /> 
    </>
  );
}

function App() {
  // Set default SEO meta tags on app load
  useEffect(() => {
    // Update the meta tags with default SEO settings
    updateSEO(SEO_CONFIG.HOME);
    
    // Listen for route changes to update SEO
    const handleRouteChange = () => {
      const path = window.location.pathname;
      
      // Update SEO based on current route
      if (path === '/') {
        updateSEO(SEO_CONFIG.HOME);
      } else if (path === '/order') {
        updateSEO(SEO_CONFIG.ORDER);
      }
    };
    
    // Add popstate event listener to handle browser navigation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/order"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div className="loading-spinner-container"><LoadingSpinner /></div>}>
                  <OrderPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/form"
            element={
              <ErrorBoundary>
                <UserForm />
              </ErrorBoundary>
            }
          />
          <Route
            path="/cart"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div className="loading-spinner-container"><LoadingSpinner /></div>}>
                  <CartPage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="/success"
            element={
              <ErrorBoundary>
                <Suspense fallback={<div className="loading-spinner-container"><LoadingSpinner /></div>}>
                  <OrderSuccess />
                </Suspense>
              </ErrorBoundary>
            }
          />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
