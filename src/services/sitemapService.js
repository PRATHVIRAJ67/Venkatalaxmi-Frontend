/**
 * Sitemap Service
 * 
 * Service for generating a dynamic sitemap XML for the website
 * Works with React and Vite
 */

// Direct import to avoid environment variable issues during Vite config loading
// import { createClient } from "@supabase/supabase-js"; // REMOVED

// Use hardcoded fallbacks to ensure this works during config loading
// const supabaseUrl = ...; // REMOVED
// const supabaseKey = ...; // REMOVED

// Create a supabase client for sitemap generation
// const supabase = createClient(supabaseUrl, supabaseKey); // REMOVED

/**
 * Generate the sitemap XML content
 * 
 * @param {Object} options - The sitemap generation options
 * @param {string} options.baseUrl - The base URL of the website (e.g., https://venkatalakshmimess.com)
 * @param {string} options.apiBaseUrl - The base URL of the API (e.g., http://localhost:5000/api)
 * @param {Array} options.staticPages - Array of static page paths without the domain (e.g., ["/", "/about", "/contact"])
 * @param {boolean} options.includeDynamicMenu - Whether to include dynamic menu pages from the database
 * @returns {Promise<string>} The XML content of the sitemap
 */
export const generateSitemapXml = async ({
  baseUrl = 'https://www.venkatalaxmimess.in/',
  apiBaseUrl = 'http://localhost:5000/api', // Default API URL
  staticPages = [
    '/',
    '/order',
    '/cart',
    '/contact'
  ],
  includeDynamicMenu = true
}) => {
  // Start the XML content
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // Add static pages
  for (const path of staticPages) {
    xml += generateUrlEntry(`${baseUrl}${path}`, '1.0', 'daily');
  }

  // Add dynamic menu pages if requested
  if (includeDynamicMenu) {
    try {
      // Fetch menu categories from API
      // We'll use the native fetch API here to keep dependencies minimal in this service
      // Note: In Node.js environment (during build), fetch is available in newer versions (Node 18+)

      const categoriesResponse = await fetch(`${apiBaseUrl}/menu-categories`);

      if (!categoriesResponse.ok) {
        console.error('Error fetching menu categories for sitemap:', categoriesResponse.statusText);
      } else {
        const categories = await categoriesResponse.json();

        if (categories && categories.length > 0) {
          // Add category pages to sitemap
          for (const category of categories) {
            if (category.slug) {
              xml += generateUrlEntry(`${baseUrl}/menu/${category.slug}`, '0.8', 'weekly');
            }
          }
        }
      }

      // Fetch menu items for additional pages
      const itemsResponse = await fetch(`${apiBaseUrl}/menu-items`);

      if (!itemsResponse.ok) {
        console.error('Error fetching menu items for sitemap:', itemsResponse.statusText);
      } else {
        // API might return array directly or object with data
        let menuItems = await itemsResponse.json();
        if (menuItems.data) menuItems = menuItems.data;

        if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
          // Add individual menu item pages to sitemap
          for (const item of menuItems) {
            if (item.slug) {
              xml += generateUrlEntry(`${baseUrl}/menu/item/${item.slug}`, '0.7', 'weekly');
            }
          }
        }
      }

    } catch (err) {
      console.error('Error generating dynamic menu sitemap entries:', err);
    }
  }

  // Close the XML content
  xml += '</urlset>';

  return xml;
};

/**
 * Generate a URL entry for the sitemap
 * 
 * @param {string} url - The full URL of the page
 * @param {string} priority - The priority of the page (0.0 to 1.0)
 * @param {string} changefreq - How frequently the page changes (always, hourly, daily, weekly, monthly, yearly, never)
 * @returns {string} The XML entry for the URL
 */
const generateUrlEntry = (url, priority = '0.5', changefreq = 'monthly') => {
  const today = new Date().toISOString().split('T')[0];

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>\n`;
};

/**
 * Create a middleware function for Express to serve the sitemap
 * 
 * @param {Object} options - The sitemap generation options (same as generateSitemapXml)
 * @returns {Function} Express middleware function
 */
export const sitemapMiddleware = (options) => {
  return async (req, res) => {
    try {
      const xml = await generateSitemapXml(options);

      // Set the content type to XML
      res.setHeader('Content-Type', 'application/xml');
      res.send(xml);
    } catch (err) {
      console.error('Error serving sitemap:', err);
      res.status(500).send('Error generating sitemap');
    }
  };
};

/**
 * Handler for Vite development server to serve the sitemap
 * Can be used with Vite server.proxy configuration
 * 
 * @param {Object} options - The sitemap generation options (same as generateSitemapXml)
 * @returns {Function} Handler function for Vite server
 * 
 * Example Vite config:
 * server: {
 *   proxy: {
 *     '/sitemap.xml': {
 *       bypass: (req, res) => {
 *         const handler = sitemapViteHandler({ baseUrl: 'http://localhost:3000' });
 *         return handler(req, res);
 *       }
 *     }
 *   }
 * }
 */
export const sitemapViteHandler = (options) => {
  return async (req, res) => {
    try {
      const xml = await generateSitemapXml(options);

      // Set the content type to XML
      res.setHeader('Content-Type', 'application/xml');
      res.end(xml);
      return true; // Indicate that the request was handled
    } catch (err) {
      console.error('Error serving sitemap in Vite dev server:', err);
      res.statusCode = 500;
      res.end('Error generating sitemap');
      return true; // Indicate that the request was handled, even though it's an error
    }
  };
}; 