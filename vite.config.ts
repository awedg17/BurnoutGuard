import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    prerender: {
      enabled: true,
      crawlLinks: true,
    },
  },
  vite: {
    base: "/BurnoutGuard/",
    environments: {
      client: {
        build: {
          outDir: "docs",
        },
      },
    },
  },
});
