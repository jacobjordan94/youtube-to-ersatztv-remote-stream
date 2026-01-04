import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    // Enable minification
    minify: 'esbuild',

    // Generate source maps for production debugging
    sourcemap: false,

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
          ],
          'syntax-highlighter': ['react-syntax-highlighter'],
          'jszip': ['jszip'],
        },
      },
    },

    // Set chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Target modern browsers for smaller bundle
    target: 'es2020',
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@youtube-to-ersatztv/shared',
    ],
  },
});
