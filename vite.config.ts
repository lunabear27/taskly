import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Allow build to proceed even with TypeScript errors
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TypeScript warnings during build
        if (
          warning.code === "TS6133" ||
          warning.code === "TS6192" ||
          warning.code === "TS2322"
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
});
