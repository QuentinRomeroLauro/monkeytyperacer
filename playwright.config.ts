import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  use: {
    baseURL: process.env.TEST_URL ?? "http://localhost:3002",
    headless: true,
    viewport: { width: 1280, height: 800 },
  },
  reporter: "list",
  timeout: 30000,
});
