import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { sitemapViteHandler } from './src/services/sitemapService'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'bootstrap-icons': 'bootstrap-icons/font/bootstrap-icons.css',
    },
  },
  server: {
    allowedHosts: ['alien-exotic-marmoset.ngrok-free.app'],
    // Add history API fallback for SPA routing
    historyApiFallback: true,
    host: true,
    proxy: {
      '/sitemap.xml': {
        bypass: (req, res) => {
          const handler = sitemapViteHandler({
            baseUrl: 'https://www.venkatalaxmimess.in/',
            staticPages: ['/', '/order', '/cart', '/contact', '/about']
          });
          return handler(req, res);
        }
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      // Configure custom Rollup options
      output: {
        manualChunks: (id) => {
          // Create more granular chunks for better performance
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react-vendor';
            if (id.includes('bootstrap')) return 'bootstrap-vendor';
            if (id.includes('fontawesome')) return 'icons-vendor';
            if (id.includes('swiper') || id.includes('aos')) return 'animation-vendor';
            return 'vendor'; // all other packages
          }

          // Split app components logically
          if (id.includes('/Components/Landing/')) return 'landing';
          if (id.includes('/Components/OrderPage/')) return 'order';
          if (id.includes('/Components/Cart/')) return 'cart';
        },
        inlineDynamicImports: false,
        // Improve cache control with content hashing
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // Enable source maps in production for better error tracking
    sourcemap: true
  }
})
