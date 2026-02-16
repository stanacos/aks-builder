const { test, expect } = require('@playwright/test');

// Tests verify config.json defaults match Bicep parameter defaults (REQ-003).
// Uses the lean preset (default) which has minimal overrides on networking fields.

test('config-default-kubernetesVersion', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the deploy tab (1st tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // Check deploy command does not contain kubernetesVersion (default matches Bicep)
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('kubernetesVersion')
});

test('config-default-osSKU-is-AzureLinux', async ({ page }) => {
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // osSKU should not appear in deploy command when it matches Bicep default
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('osSKU')
});

test('config-default-networkPluginMode-is-overlay', async ({ page }) => {
  // The lean preset does not override networking defaults, so config.json defaults apply
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // networkPluginMode should not appear in deploy command (default matches Bicep Overlay)
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('networkPluginMode')
});

test('config-default-networkDataplane-is-cilium', async ({ page }) => {
  // The lean preset does not override networking defaults, so config.json defaults apply
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click deploy tab
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // networkDataplane should not appear in deploy command (default matches Bicep cilium)
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('networkDataplane')
});

test('config-default-natGw-values-match-bicep', async ({ page }) => {
  // The lean preset does not override egress type, so config.json default (natGateway) applies
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the network tab (4th tab)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(4)');

  // Check NAT Gateway is the default egress type
  const dropdown = page.locator('[data-testid="net-aksEgressType"]')
  await expect(dropdown).toBeVisible()
  await expect(dropdown).toContainText('NAT Gateway')

  // Click deploy tab to verify natGw params are not emitted (match defaults)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('natGwIpCount')
  await expect(clitextbox).not.toContainText('natGwIdleTimeout')
});
