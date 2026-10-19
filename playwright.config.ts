import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3000";
const port = new URL(baseURL).port || "3000";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1080 },
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port " + port,
    url: baseURL,
    reuseExistingServer: process.env.FINPILOT_VERIFY_RUN !== "true",
    timeout: 120000,
  },
});
