const { test, expect } = require('@playwright/test');

test('ingress-options-test-default-no-ingress', async ({ page }) => {

  // Config.json default sets ingress to 'none'
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the 3rd Tab in the portal Navigation Pivot (addons)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(3)');

  // Expect the AppGateway KV integration checkbox to not be visible (no ingress selected)
  await expect(page.locator('[data-testid="addons-ingress-appgwKVIntegration-Checkbox"]')).not.toBeVisible();

});
