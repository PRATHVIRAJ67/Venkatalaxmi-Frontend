import { useEffect } from 'react';
import { updateSEO, SEO_CONFIG, DEFAULT_STRUCTURED_DATA } from '../../services/seoService';

/**
 * Custom hook for updating SEO metadata and structured data on page render
 * Includes Core Web Vitals and accessibility optimizations
 * 
 * @param {Object|string} seoData - SEO data or predefined SEO key from SEO_CONFIG
 * @param {Object} options - Additional SEO options
 * @param {Array} options.alternateLanguages - Array of alternate language URLs and locales
 * @param {Object} options.structuredData - Custom structured data to override defaults
 * @param {string} options.locale - Page locale
 * @param {Array} options.preload - Resources to preload for better Core Web Vitals
 * @param {boolean} options.deferNonCriticalCSS - Whether to defer non-critical CSS
 * @param {boolean} options.enableAccessibility - Whether to enhance accessibility tags
 * @param {string} options.viewport - Custom viewport setting
 * @returns {void}
 * 
 * @example
 * // Using predefined config with Core Web Vitals optimization
 * useSEO('HOME', { 
 *   preload: [
 *     { href: "/logo.png", as: "image" }
 *   ]
 * });
 * 
 * @example
 * // Using custom data with structured data and accessibility
 * useSEO({
 *   title: 'My Custom Page',
 *   description: 'Custom description for this page',
 *   keywords: 'custom, keywords',
 * }, {
 *   structuredData: { '@type': 'WebPage', ... },
 *   locale: 'en_US',
 *   enableAccessibility: true,
 *   deferNonCriticalCSS: true
 * });
 */
const useSEO = (seoData, options = {}) => {
  const { 
    alternateLanguages = [], 
    structuredData, 
    locale,
    preload = [],
    deferNonCriticalCSS = false,
    enableAccessibility = true,
    viewport
  } = options;
  
  useEffect(() => {
    let seoConfig = {};
    
    // If seoData is a string, use predefined config
    if (typeof seoData === 'string' && SEO_CONFIG[seoData]) {
      seoConfig = { ...SEO_CONFIG[seoData] };
    }
    // If seoData is an object, use it directly
    else if (typeof seoData === 'object' && seoData !== null) {
      seoConfig = { ...seoData };
    }
    
    // Add additional options
    if (alternateLanguages.length) {
      seoConfig.alternateLanguages = alternateLanguages;
    }
    
    if (locale) {
      seoConfig.locale = locale;
    }
    
    // Core Web Vitals optimization
    if (preload && preload.length) {
      // Merge with existing preload if any
      const existingPreload = seoConfig.preload || [];
      seoConfig.preload = [...existingPreload, ...preload];
    }
    
    // Set Core Web Vitals optimization flags
    seoConfig.deferNonCriticalCSS = deferNonCriticalCSS;
    
    // Set accessibility optimization flag
    seoConfig.enableAccessibility = enableAccessibility;
    
    // Set custom viewport if provided
    if (viewport) {
      seoConfig.viewport = viewport;
    }
    
    // Override structured data if provided
    if (structuredData) {
      seoConfig.structuredData = structuredData;
    }
    
    // Update SEO
    updateSEO(seoConfig);
    
    // Cleanup function to remove dynamic structured data on unmount
    return () => {
      document.querySelectorAll('script[type="application/ld+json"][data-dynamic="true"]')
        .forEach(el => el.remove());
      
      // Reset any deferred CSS loading attributes
      if (deferNonCriticalCSS) {
        document.querySelectorAll('link[rel="stylesheet"][data-loaded="false"]')
          .forEach(el => {
            el.removeAttribute('media');
            el.removeAttribute('onload');
            el.removeAttribute('data-loaded');
          });
      }
    };
  }, [
    seoData, 
    alternateLanguages, 
    structuredData, 
    locale, 
    preload, 
    deferNonCriticalCSS, 
    enableAccessibility,
    viewport
  ]);
};

export default useSEO; 