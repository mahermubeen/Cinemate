import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    build: {
      outDir: "../public",
    },
    server: {
      proxy: isProduction
        ? {} // No proxy in production, set API base URL directly in your code
        : {
            "/api": {
              target: "http://localhost:3000",
              changeOrigin: true,
            },
          },
    },
    define: {
      "process.env": {
        API_BASE_URL: isProduction
          ? "https://cinemate-eta.vercel.app"
          : "http://localhost:3000",
      },
    },
    optimizeDeps: {
      include: ["regenerator-runtime/runtime"],
    },
  };
});
