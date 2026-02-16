const { test, expect } = require('@playwright/test');

test('default-outbound-option-is-natgateway', async ({ page }) => {

  // The lean preset does not override aksOutboundTrafficType, so config.json default (natGateway) applies
  await page.goto('http://localhost:3000/AKS-Construction');

  // Click the 4th Tab in the portal Navigation Pivot (network)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(4)');

  // Check that config.json default of natGateway is shown
  const dropdown = page.locator('[data-testid="net-aksEgressType"]')
  await expect(dropdown).toBeVisible()
  await expect(dropdown).toContainText('NAT Gateway')

  // Click the 1st Tab in the portal Navigation Pivot (deploy)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)');

  // Check aksOutboundTrafficType parameter is absent (matches default, not emitted)
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()
  await expect(clitextbox).not.toContainText('natGateway')

});
