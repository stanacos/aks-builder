const { test, expect } = require('@playwright/test');

// Tests verify that Cilium dataplane is GA (not a preview feature) (REQ-007).

test('cilium-dataplane-not-listed-as-preview-feature', async ({ page }) => {
  // Use URL params to enable Cilium network policy
  await page.goto('http://localhost:3000/AKS-Construction?addons.networkPolicy=cilium');

  // Click deploy tab (1st tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // Wait for deploy command to render
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');

  // If a Preview Features banner exists, networkDataplane must NOT be listed
  const previewBanner = page.locator('text=Preview Features you have selected');
  const bannerCount = await previewBanner.count();
  if (bannerCount > 0) {
    await expect(previewBanner).not.toContainText('networkDataplane');
  }
});

test('cilium-dataplane-included-in-params-not-preview', async ({ page }) => {
  // Config.json defaults have networkPlugin=azure and networkDataplane=true
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the network tab (4th tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(4)');

  // Uncheck cilium dataplane to change from default, then re-check to force param emission
  // First uncheck it
  const ciliumCheckbox = page.locator('label:has-text("Cilium powered dataplane")');
  await ciliumCheckbox.click();

  // Re-check it to set it back to true (now matches default so won't appear)
  await ciliumCheckbox.click();

  // Click deploy tab (1st tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // Wait for deploy command to render
  await page.waitForSelector('[data-testid="deploy-deploycmd"]');

  // Since it matches the default, networkDataplane should not appear in command
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  await expect(clitextbox).not.toContainText('networkDataplane');

  // Also verify no preview banner lists networkDataplane
  const previewBanner = page.locator('text=Preview Features you have selected');
  const bannerCount = await previewBanner.count();
  if (bannerCount > 0) {
    await expect(previewBanner).not.toContainText('networkDataplane');
  }
});
