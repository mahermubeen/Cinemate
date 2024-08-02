import { viteConfig } from "vite";

export default viteConfig({
  plugins: [
    {
      name: "react",
      configure: (config) => {
        config.plugins.push({
          name: "react",
          setup: (build) => {
            build.rollupOptions.plugins.push({
              name: "react",
              resolveId: (source, importer) => {
                if (source === "react") {
                  return {
                    id: "react",
                    external: true,
                  };
                }
                return null;
              },
            });
          },
        });
      },
    },
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
      },
    },
  },
});
