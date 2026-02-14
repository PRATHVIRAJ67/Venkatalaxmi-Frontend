/**
 * SEO Service
 * 
 * Advanced utility functions to update document title, meta tags, and structured data dynamically
 * Works without external libraries and is compatible with React 19 and Vite
 */

/**
 * Update page title, meta tags, and structured data for SEO
 * 
 * @param {Object} seoData - The SEO data to update
 * @param {string} seoData.title - The page title
 * @param {string} seoData.description - The meta description
 * @param {string} seoData.keywords - The meta keywords
 * @param {string} seoData.ogTitle - The Open Graph title
 * @param {string} seoData.ogDescription - The Open Graph description
 * @param {string} seoData.ogImage - The Open Graph image URL
 * @param {string} seoData.ogUrl - The canonical URL
 * @param {Object} seoData.structuredData - JSON-LD structured data
 * @param {string} seoData.locale - Page locale
 * @param {Array} seoData.alternateLanguages - Alternate language URLs
 * @param {string} seoData.viewport - Viewport meta tag content
 * @param {boolean} seoData.deferNonCriticalCSS - Whether to defer non-critical CSS
 * @param {string} seoData.preload - Elements to preload
 * @param {boolean} seoData.enableAccessibility - Whether to enhance accessibility tags
 */
export const updateSEO = ({
  title = "Venkatalakshmi Mess - Authentic South Indian Cuisine | Kundapura",
  description = "Experience authentic South Indian cuisine at Venkatalakshmi Mess in Kundapura, Udupi. Enjoy traditional homemade meals, sweets, and professional catering services with family recipes passed down through generations.",
  keywords = "Venkatalakshmi Mess, South Indian food, Kundapura restaurant, Udupi cuisine, homemade food, sweets, catering, vegetarian food, traditional meals, tiffin service",
  ogTitle,
  ogDescription,
  ogImage = "https://www.venkatalaxmimess.in/Venkatalakshmi-Logo.png",
  ogUrl = window.location.href,
  structuredData,
  locale = "en_US",
  alternateLanguages = [],
  viewport = "width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover",
  deferNonCriticalCSS = false,
  preload = [],
  enableAccessibility = true
}) => {
  // Update document title
  document.title = title;
  
  // Update meta description
  updateMetaTag('description', description);
  
  // Update meta keywords
  updateMetaTag('keywords', keywords);
  
  // Update viewport for better mobile experience and Core Web Vitals
  updateMetaTag('viewport', viewport);
  
  // Update locale
  updateMetaTag('og:locale', locale, true);
  
  // Update Open Graph meta tags
  updateMetaTag('og:title', ogTitle || title, true);
  updateMetaTag('og:description', ogDescription || description, true);
  updateMetaTag('og:image', ogImage, true);
  updateMetaTag('og:url', ogUrl, true);
  updateMetaTag('og:type', 'website', true);
  updateMetaTag('og:site_name', 'Venkatalakshmi Mess', true);
  
  // Update Twitter meta tags
  updateMetaTag('twitter:card', 'summary_large_image', true);
  updateMetaTag('twitter:title', ogTitle || title, true);
  updateMetaTag('twitter:description', ogDescription || description, true);
  updateMetaTag('twitter:image', ogImage, true);
  
  // Add accessibility meta tags
  if (enableAccessibility) {
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
    updateMetaTag('apple-mobile-web-app-title', 'Venkatalakshmi Mess');
    updateMetaTag('application-name', 'Venkatalakshmi Mess');
    updateMetaTag('format-detection', 'telephone=no');
    // WCAG conformance level
    updateMetaTag('accessibility-conformance', 'WCAG 2.1 AA');
  }
  
  // Core Web Vitals optimization - Preload critical resources
  if (preload && preload.length > 0) {
    preload.forEach(resource => {
      if (!resource.href || !resource.as) return;
      
      let link = document.querySelector(`link[rel="preload"][href="${resource.href}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'preload');
        link.setAttribute('href', resource.href);
        link.setAttribute('as', resource.as);
        
        if (resource.type) {
          link.setAttribute('type', resource.type);
        }
        
        if (resource.crossorigin) {
          link.setAttribute('crossorigin', resource.crossorigin);
        }
        
        if (resource.media) {
          link.setAttribute('media', resource.media);
        }
        
        document.head.appendChild(link);
      }
    });
  }
  
  // Defer non-critical CSS for better page loading performance
  if (deferNonCriticalCSS) {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical="true"])');
    stylesheets.forEach(stylesheet => {
      if (!stylesheet.hasAttribute('data-loaded')) {
        stylesheet.setAttribute('media', 'print');
        stylesheet.setAttribute('onload', "this.media='all'; this.setAttribute('data-loaded', 'true');");
        stylesheet.setAttribute('data-loaded', 'false');
      }
    });
  }
  
  // Update canonical URL
  updateCanonicalLink(ogUrl);
  
  // Add alternate language links
  updateAlternateLanguages(alternateLanguages);
  
  // Update structured data
  if (structuredData) {
    updateStructuredData(structuredData);
  } else {
    // Apply default structured data based on pathname
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      updateStructuredData(DEFAULT_STRUCTURED_DATA.HOME);
    } else if (path.includes('/menu')) {
      updateStructuredData(DEFAULT_STRUCTURED_DATA.MENU);
    } else if (path.includes('/order')) {
      updateStructuredData(DEFAULT_STRUCTURED_DATA.ORDER);
    }
  }
};

/**
 * Helper function to create or update a meta tag
 * 
 * @param {string} name - The meta tag name or property
 * @param {string} content - The content for the meta tag
 * @param {boolean} isProperty - Whether to use property attribute instead of name
 */
const updateMetaTag = (name, content, isProperty = false) => {
  if (!content) return;
  
  const attr = isProperty ? 'property' : 'name';
  let meta = document.querySelector(`meta[${attr}="${name}"]`);
  
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, name);
    document.head.appendChild(meta);
  }
  
  meta.setAttribute('content', content);
};

/**
 * Helper function to update the canonical link
 * 
 * @param {string} url - The canonical URL
 */
const updateCanonicalLink = (url) => {
  if (!url) return;
  
  let link = document.querySelector('link[rel="canonical"]');
  
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  
  link.setAttribute('href', url);
};

/**
 * Helper function to update alternate language links
 * 
 * @param {Array} languages - Array of {locale, url} objects
 */
const updateAlternateLanguages = (languages) => {
  if (!languages || !languages.length) return;
  
  // Remove any existing alternate language links
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  
  // Add new alternate language links
  languages.forEach(lang => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang.locale);
    link.setAttribute('href', lang.url);
    document.head.appendChild(link);
  });
};

/**
 * Helper function to update structured data
 * 
 * @param {Object} data - The structured data object
 */
const updateStructuredData = (data) => {
  if (!data) return;
  
  // Remove any existing structured data scripts
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => {
    // Only remove dynamically added scripts, not static ones in the HTML
    if (el.dataset.dynamic === 'true') {
      el.remove();
    }
  });
  
  // Add new structured data
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.setAttribute('data-dynamic', 'true');
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

/**
 * Default structured data for different pages
 */
export const DEFAULT_STRUCTURED_DATA = {
  HOME: {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Venkatalakshmi Mess",
    "image": [
      "https://www.venkatalaxmimess.in/images/restaurant-interior.jpg",
      "https://www.venkatalaxmimess.in/images/south-indian-thali.jpg",
      "https://www.venkatalaxmimess.in/images/restaurant-exterior.jpg"
    ],
    "description": "Venkatalakshmi Mess offers authentic South Indian cuisine with traditional recipes handed down through generations. We serve fresh homemade food, sweets, and provide catering services in Kundapura, Udupi.",
    "@id": "https://www.venkatalaxmimess.in",
    "url": "https://www.venkatalaxmimess.in",
    "telephone": "+91-9876543210",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Main Street, Near Bus Stand",
      "addressLocality": "Kundapura",
      "addressRegion": "Karnataka",
      "postalCode": "576201",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 13.6223,
      "longitude": 74.6923
    },
    "priceRange": "₹₹",
    "servesCuisine": ["South Indian", "Vegetarian", "Udupi Cuisine"],
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.venkatalaxmimess.in/order",
        "inLanguage": "en-US"
      },
      "deliveryMethod": [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
      ]
    },
    "accessibilityFeatures": [
      "https://schema.org/accessibleToilets",
      "https://schema.org/wheelchairAccessible"
    ]
  },
  MENU: {
    "@context": "https://schema.org",
    "@type": "Menu",
    "name": "Venkatalakshmi Mess Menu",
    "description": "Our authentic South Indian menu features traditional dishes prepared with fresh ingredients and family recipes.",
    "hasMenuSection": [
      {
        "@type": "MenuSection",
        "name": "Breakfast",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "Masala Dosa",
            "description": "Crispy rice pancake filled with spiced potato mixture",
            "offers": {
              "@type": "Offer",
              "price": 60,
              "priceCurrency": "INR"
            },
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "350 calories",
              "suitableForDiet": "https://schema.org/VegetarianDiet"
            }
          },
          {
            "@type": "MenuItem",
            "name": "Idli Sambar",
            "description": "Steamed rice cakes served with lentil soup and coconut chutney",
            "offers": {
              "@type": "Offer",
              "price": 50,
              "priceCurrency": "INR"
            },
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "220 calories",
              "suitableForDiet": "https://schema.org/VegetarianDiet"
            }
          }
        ]
      },
      {
        "@type": "MenuSection",
        "name": "Main Course",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "South Indian Thali",
            "description": "Complete meal with rice, sambar, rasam, vegetable curries, papad, and dessert",
            "offers": {
              "@type": "Offer",
              "price": 120,
              "priceCurrency": "INR"
            },
            "nutrition": {
              "@type": "NutritionInformation",
              "calories": "750 calories",
              "suitableForDiet": "https://schema.org/VegetarianDiet"
            }
          }
        ]
      }
    ]
  },
  ORDER: {
    "@context": "https://schema.org",
    "@type": "Order",
    "seller": {
      "@type": "Restaurant",
      "name": "Venkatalakshmi Mess",
      "url": "https://www.venkatalaxmimess.in"
    },
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.venkatalaxmimess.in/order",
        "inLanguage": "en-US"
      },
      "deliveryMethod": [
        "http://purl.org/goodrelations/v1#DeliveryModePickUp",
        "http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"
      ]
    },
    "acceptedPaymentMethod": [
      {
        "@type": "PaymentMethod",
        "name": "Cash"
      },
      {
        "@type": "PaymentMethod",
        "name": "Credit Card"
      },
      {
        "@type": "PaymentMethod",
        "name": "UPI"
      }
    ]
  }
};

/**
 * Predefined SEO configurations for different pages
 */
export const SEO_CONFIG = {
  HOME: {
    title: "Venkatalakshmi Mess - Authentic South Indian Cuisine | Kundapura",
    description: "Experience authentic South Indian cuisine at Venkatalakshmi Mess in Kundapura, Udupi. Enjoy traditional homemade meals, sweets, and professional catering services with family recipes.",
    keywords: "Venkatalakshmi Mess, South Indian food, Kundapura restaurant, online food ordering, Udupi cuisine, vegetarian food, traditional meals, tiffin service",
    structuredData: DEFAULT_STRUCTURED_DATA.HOME,
  },
  MENU: {
    title: "Menu - Venkatalakshmi Mess | Authentic South Indian Delicacies",
    description: "Explore our extensive menu of authentic South Indian dishes, meals, snacks and sweets at Venkatalakshmi Mess. Daily specials and seasonal favorites made with traditional recipes.",
    keywords: "South Indian menu, Kundapura food, meals, sweets, snacks, breakfast, lunch, dinner, dosa, idli, vada, thali, sambar",
    structuredData: DEFAULT_STRUCTURED_DATA.MENU,
  },
  ORDER: {
    title: "Order Online - Venkatalakshmi Mess | Fast Delivery in Kundapura",
    description: "Order online from Venkatalakshmi Mess for quick delivery or takeaway in Kundapura. Fresh, authentic South Indian food at your doorstep within 30 minutes.",
    keywords: "order online, food delivery, South Indian food delivery, Kundapura delivery, takeaway, online ordering, fast delivery",
    structuredData: DEFAULT_STRUCTURED_DATA.ORDER,
  },
  CART: {
    title: "Your Cart - Venkatalakshmi Mess | Secure Checkout",
    description: "Review your order and proceed to our secure checkout. Easy payment options and fast delivery from Venkatalakshmi Mess in Kundapura.",
    keywords: "food cart, checkout, online payment, food order, secure payment, cash on delivery, credit card payment"
  },
  SUCCESS: {
    title: "Order Confirmed - Venkatalakshmi Mess | Thank You",
    description: "Your order has been confirmed! Thank you for choosing Venkatalakshmi Mess. Track your delivery status and enjoy authentic South Indian cuisine soon.",
    keywords: "order confirmed, food delivery status, South Indian food, confirmation, order tracking"
  },
  CONTACT: {
    title: "Contact Us - Venkatalakshmi Mess | Location & Inquiries",
    description: "Get in touch with Venkatalakshmi Mess in Kundapura. Find our location, opening hours, phone number and send us your inquiries or feedback.",
    keywords: "contact restaurant, Kundapura restaurant location, restaurant phone number, restaurant hours, South Indian restaurant"
  },
  ABOUT: {
    title: "About Us - Venkatalakshmi Mess | Our Story & Heritage",
    description: "Learn about Venkatalakshmi Mess, our culinary heritage and commitment to authentic South Indian cuisine. Family-owned restaurant serving Kundapura since 1995.",
    keywords: "restaurant history, South Indian restaurant, family owned restaurant, Kundapura tradition, restaurant heritage, about restaurant"
  }
}; 