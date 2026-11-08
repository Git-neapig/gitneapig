import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    react(),
    tailwind(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "prompt",
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,woff2,png,webmanifest}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
      manifest: {
        name: "GitneaPig",
        short_name: "GitneaPig",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#17181c",
        background_color: "#17181c",
        icons: [
          {
            src: "/mascots/logo/navbar-mascot.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
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
