const { test, expect } = require('@playwright/test');

test('networkpolicy-test-default-is-cilium', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the 3rd Tab in the portal Navigation Pivot (addons)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(3)');

  // Expect 'cilium' network policy to be checked (config.json default)
  await expect(page.locator('[data-testid="addons-netpolicy-cilium"]')).toBeChecked();
});

test('networkpolicy-test-none-via-url-param', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?addons.networkPolicy=none');

  // Click the 3rd Tab in the portal Navigation Pivot (addons)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(3)');

  // Expect none network policy to be checked via URL parameter override
  await expect(page.locator('[data-testid="addons-netpolicy-none"]')).toBeChecked();
});
