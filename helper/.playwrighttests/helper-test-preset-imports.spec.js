const { test, expect } = require('@playwright/test');

// Tests verify that only lab.json and securelab.json presets are loaded (REQ-004).

test('default-preset-is-lean', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // The Lab preset section should render by default
  await expect(page.locator('[data-testid="stacklabenv"]')).toBeVisible();
});

test('old-presets-are-not-loaded', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Wait for the page to render
  await expect(page.locator('[data-testid="stacklabenv"]')).toBeVisible();

  // Old preset sections should not exist
  await expect(page.locator('[data-testid="stackops"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="stacksecure"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="stackenv"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="stackbaselineRI"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="stackentscale"]')).not.toBeVisible();
  await expect(page.locator('[data-testid="stackminecraft"]')).not.toBeVisible();
});

test('securelab-preset-accessible-via-url', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab');

  // The Secure Lab preset section should render
  await expect(page.locator('[data-testid="stackseclab"]')).toBeVisible();
});

test('lean-preset-deploy-command-is-minimal', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // The lean preset should produce a minimal deploy command (no monitoring, no registry, no ingress)
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();

  // These parameters should NOT appear because lean preset disables them (matching config.json defaults)
  await expect(clitextbox).not.toContainText('registries_sku');
  await expect(clitextbox).not.toContainText('omsagent=true');
});
