const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure"
  },
  webServer: {
    command: "node tests/static-server.js",
    url: "http://127.0.0.1:4173/previews/seance-1-fusion.html",
    reuseExistingServer: !process.env.CI,
    timeout: 15000
  }
});
