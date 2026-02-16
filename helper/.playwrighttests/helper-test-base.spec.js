const { test, expect } = require('@playwright/test');

test('test', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction');

  await expect(page.locator('#mainContent')).toBeVisible();
});
