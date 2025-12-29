import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: '0.0.0.0', // Allow network access from other devices
    port: 5000,
    strictPort: true,
    hmr: {
      clientPort: 5000,
      host: 'localhost', // Force HMR to use localhost
    },
    cors: true,
    fs: {
      strict: false, // Less strict for network access
      allow: ['..'],
    },
  },
});
