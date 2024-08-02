import { defineConfig } from "vite";
import { react } from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../public",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
      },
    },
  },
  optimizeDeps: {
    include: ["regenerator-runtime/runtime"],
  },
});
