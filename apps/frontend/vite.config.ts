import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:3000",
      "/uploads": "http://127.0.0.1:3000",
    },
  },
  preview: {
    proxy: {
      "/api": "http://127.0.0.1:3000",
      "/uploads": "http://127.0.0.1:3000",
    },
  },
  optimizeDeps: { include: ["@gitneapig/shared", "@gitneapig/simulator"] },
  build: {
    assetsInlineLimit: 0,
    commonjsOptions: {
      include: [/node_modules/, /packages\/(shared|simulator)\/dist/],
    },
  },
});
