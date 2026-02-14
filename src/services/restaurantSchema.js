/**
 * Restaurant Schema Service
 * 
 * This service generates comprehensive JSON-LD schema markup for restaurant SEO
 * Based on the latest Schema.org and Google guidelines for 2025
 */

/**
 * Generate restaurant schema JSON-LD
 * 
 * @param {Object} restaurantData - Restaurant information
 * @returns {Object} JSON-LD schema object for the restaurant
 */
export const generateRestaurantSchema = (restaurantData = {}) => {
  const {
    name = 'Venkatalakshmi Mess',
    description = 'Authentic South Indian cuisine with traditional recipes handed down through generations. We serve fresh homemade food, sweets, and provide catering services in Kundapura, Udupi.',
    url = 'https://www.venkatalaxmimess.in',
    telephone = '+91-9876543210',
    email = 'info@venkatalakshmimess.com',
    logo = 'https://www.venkatalaxmimess.in/Venkatalakshmi-Logo.png',
    priceRange = '₹₹',
    address = {
      streetAddress: 'Main Street, Near Bus Stand',
      addressLocality: 'Kundapura',
      addressRegion: 'Karnataka',
      postalCode: '576201',
      addressCountry: 'IN'
    },
    geo = {
      latitude: 13.6223,
      longitude: 74.6923
    },
    openingHours = [
      {
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '07:00',
        closes: '22:00'
      },
      {
        dayOfWeek: ['Sunday'],
        opens: '08:00',
        closes: '22:00'
      }
    ],
    cuisines = ['South Indian', 'Vegetarian', 'Udupi Cuisine'],
    menus = [],
    specialDiets = ['vegetarian', 'vegan'],
    paymentAccepted = ['Cash', 'Credit Card', 'UPI'],
    photos = [],
    reviews = [],
    aggregateRating = {
      ratingValue: 4.8,
      reviewCount: 120
    },
    reservations = true,
    delivery = true,
    takeout = true
  } = restaurantData;

  // Base restaurant schema
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    '@id': `${url}#restaurant`,
    name,
    description,
    url,
    telephone,
    email,
    priceRange,
    servesCuisine: cuisines,
    image: photos && photos.length > 0 ? photos : [logo],
    logo: {
      '@type': 'ImageObject',
      url: logo
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address.streetAddress,
      addressLocality: address.addressLocality,
      addressRegion: address.addressRegion,
      postalCode: address.postalCode,
      addressCountry: address.addressCountry
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude
    },
    hasMenu: menus && menus.length > 0 ? menus.map(menu => ({
      '@type': 'Menu',
      name: menu.name,
      description: menu.description,
      hasMenuSection: menu.sections && menu.sections.map(section => ({
        '@type': 'MenuSection',
        name: section.name,
        description: section.description,
        hasMenuItem: section.items && section.items.map(item => ({
          '@type': 'MenuItem',
          name: item.name,
          description: item.description,
          offers: {
            '@type': 'Offer',
            price: item.price,
            priceCurrency: 'INR'
          },
          nutrition: item.nutrition ? {
            '@type': 'NutritionInformation',
            calories: item.nutrition.calories,
            fatContent: item.nutrition.fat,
            proteinContent: item.nutrition.protein,
            carbohydrateContent: item.nutrition.carbohydrates
          } : undefined,
          suitableForDiet: item.dietarySuitability
        }))
      }))
    })) : undefined,
    acceptsReservations: reservations ? 'Yes' : 'No',
    paymentAccepted: paymentAccepted.join(', '),
    openingHoursSpecification: openingHours.map(hours => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: hours.dayOfWeek,
      opens: hours.opens,
      closes: hours.closes
    })),
    review: reviews && reviews.map(review => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: '5'
      },
      author: {
        '@type': 'Person',
        name: review.author
      },
      datePublished: review.date,
      reviewBody: review.text
    })),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: aggregateRating.ratingValue,
      reviewCount: aggregateRating.reviewCount,
      bestRating: '5',
      worstRating: '1'
    },
    potentialAction: [
      {
        '@type': 'OrderAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/order`,
          inLanguage: 'en-US',
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/IOSPlatform',
            'http://schema.org/AndroidPlatform'
          ]
        },
        deliveryMethod: delivery ? [
          'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet'
        ] : undefined
      },
      {
        '@type': 'ReserveAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${url}/reservations`,
          inLanguage: 'en-US',
          actionPlatform: [
            'http://schema.org/DesktopWebPlatform',
            'http://schema.org/IOSPlatform',
            'http://schema.org/AndroidPlatform'
          ]
        }
      }
    ],
    // Additional enrichment data
    keywords: `${name}, ${cuisines.join(', ')}, ${address.addressLocality} restaurant, authentic food, traditional recipes`,
    sameAs: [
      'https://www.facebook.com/venkatalakshmimess',
      'https://www.instagram.com/venkatalakshmimess',
      'https://twitter.com/vkmess'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Menu',
      itemListElement: [
        {
          '@type': 'OfferCatalog',
          name: 'Popular Items',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MenuItem',
                name: 'Masala Dosa',
                description: 'Crispy rice pancake filled with spiced potato mixture'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'MenuItem',
                name: 'Idli Sambar',
                description: 'Steamed rice cakes served with lentil soup and coconut chutney'
              }
            }
          ]
        }
      ]
    },
    specialty: specialDiets,
    amenityFeature: [
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Air conditioning',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Outdoor seating',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Wheelchair accessible',
        value: true
      },
      {
        '@type': 'LocationFeatureSpecification',
        name: 'Contactless payment',
        value: true
      }
    ],
    // Advanced 2025 SEO features
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: geo.latitude,
        longitude: geo.longitude
      },
      geoRadius: '5000'
    },
    accessibilityFeatures: [
      'https://schema.org/accessibleToilets',
      'https://schema.org/wheelchairAccessible'
    ],
    publicAccess: true,
    isAccessibleForFree: true,
    slogan: 'Authentic South Indian cuisine served with love',
    founder: {
      '@type': 'Person',
      name: 'Venkataraman'
    }
  };

  return restaurantSchema;
};

/**
 * Generate LocalBusiness schema JSON-LD (alternative for restaurant)
 * 
 * @param {Object} businessData - Business information
 * @returns {Object} JSON-LD schema object for the business
 */
export const generateLocalBusinessSchema = (businessData = {}) => {
  const {
    name = 'Venkatalakshmi Mess',
    description = 'Authentic South Indian cuisine in Kundapura, Udupi. Traditional homemade meals, sweets, and catering services.',
    url = 'https://www.venkatalaxmimess.in',
    telephone = '+91-9876543210',
    email = 'info@venkatalakshmimess.com'
    // other parameters same as restaurant schema
  } = businessData;

  // Convert restaurant data to LocalBusiness schema
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'FoodEstablishment', 'Restaurant'],
    '@id': `${url}#localbusiness`,
    name,
    description,
    url,
    telephone,
    email,
  };

  return localBusinessSchema;
};

/**
 * Generate breadcrumb schema JSON-LD
 * 
 * @param {Array} items - Array of breadcrumb items with name and url
 * @param {string} baseUrl - Base URL of the website
 * @returns {Object} JSON-LD schema object for breadcrumbs
 */
export const generateBreadcrumbSchema = (items = [], baseUrl = 'https://www.venkatalaxmimess.in') => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`
    }))
  };
};

/**
 * Generate organization schema JSON-LD
 * 
 * @param {Object} orgData - Organization information
 * @returns {Object} JSON-LD schema object for the organization
 */
export const generateOrganizationSchema = (orgData = {}) => {
  const {
    name = 'Venkatalakshmi Mess',
    url = 'https://www.venkatalaxmimess.in',
    logo = 'https://www.venkatalaxmimess.in/Venkatalakshmi-Logo.png',
    socialProfiles = [
      'https://www.facebook.com/venkatalakshmimess',
      'https://www.instagram.com/venkatalakshmimess',
      'https://twitter.com/vkmess'
    ]
  } = orgData;

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${url}#organization`,
    name,
    url,
    logo: {
      '@type': 'ImageObject',
      url: logo
    },
    sameAs: socialProfiles
  };
};

/**
 * Generate FAQ schema JSON-LD
 * 
 * @param {Array} faqItems - Array of FAQ items with question and answer
 * @returns {Object} JSON-LD schema object for FAQs
 */
export const generateFAQSchema = (faqItems = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
};

/**
 * Generate multiple schema objects for a restaurant page
 * 
 * @param {Object} data - All restaurant data
 * @returns {Array} Array of JSON-LD schema objects
 */
export const generateAllSchemas = (data = {}) => {
  return [
    generateRestaurantSchema(data.restaurant),
    generateOrganizationSchema(data.organization),
    generateBreadcrumbSchema(data.breadcrumbs, data.baseUrl),
    data.faqs && data.faqs.length > 0 ? generateFAQSchema(data.faqs) : null
  ].filter(Boolean);
};

export default {
  generateRestaurantSchema,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateFAQSchema,
  generateAllSchemas
}; 