/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@components": new URL("./src/components", import.meta.url).pathname,
      "@/components": new URL("./src/shared", import.meta.url).pathname,
      "@/lib": new URL("./src/shared/lib", import.meta.url).pathname,
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
  },
});
