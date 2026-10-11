import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { contentPlugin } from "./src/content/vite-plugin";
import { cardPlugin } from "./src/card/vite-plugin";

export default defineConfig({
  // Tests read fixture content, so they do not depend on what is published.
  plugins: [react(), contentPlugin(path.resolve(__dirname, "src/test/fixtures")), cardPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
