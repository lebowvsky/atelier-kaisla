import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  css: ["./app/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./app"),
        "~": path.resolve(__dirname, "./app"),
      },
    },
  },

  // Alias configuration for imports (Nuxt-level)
  alias: {
    "@": path.resolve(__dirname, "./app"),
    "~": path.resolve(__dirname, "./app"),
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disable for now to avoid blocking
  },
});
