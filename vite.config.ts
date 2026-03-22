import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  // ✅ Required for GitHub Pages
  base: '/EPICAL-LAYOUTS/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});