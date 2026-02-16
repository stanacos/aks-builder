// @ts-check
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './.playwrighttests',
  // Limit workers to avoid overwhelming the CRA dev server
  workers: 4,
  // Retry flaky tests once
  retries: 1,
  use: {
    baseURL: 'http://localhost:3000',
  },
});
