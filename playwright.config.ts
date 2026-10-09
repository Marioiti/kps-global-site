import { defineConfig } from "@playwright/test";

/**
 * Browser checks against the built site (`npm run build` first): `npm run test:e2e`.
 * Uses the locally installed Google Chrome, so no browser download is needed.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  use: { baseURL: "http://localhost:4174", channel: "chrome" },
  webServer: {
    command: "npx vite preview --port 4174 --strictPort",
    url: "http://localhost:4174/",
    reuseExistingServer: true,
  },
});
