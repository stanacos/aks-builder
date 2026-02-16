const { test, expect } = require('@playwright/test');

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //fluentui dom hack to navigate to the checkbox

test('bastion-checkbox-enables-bastion-in-deploy-command', async ({ page }) => {
  // Use custom vnet so bastion parameter is emitted in deploy command
  await page.goto('http://localhost:3000/AKS-Construction?net.vnet_opt=custom');

  //Is the CLI textarea there and visible?
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextbox).toBeVisible()

  //It shouldn't yet contain the bastion text
  await expect(clitextbox).not.toContainText('bastion');

  //But custom_vnet should be present
  await expect(clitextbox).toContainText('custom_vnet=true')

  // Click the 4th Tab in the portal Navigation Pivot (networking)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(4)')

  //Inspect the bastion checkbox, make sure its unchecked
  const bastioncheckbox = page.locator('[data-testid="network-bastion-Checkbox"]')
  await expect(bastioncheckbox).not.toBeChecked();
  await expect(bastioncheckbox).toBeVisible();

  //Enable Bastion Checkbox
  await page.click('[data-testid="network-bastion-Checkbox"]' + chk)
  await expect(bastioncheckbox).toBeChecked();

  //Go back to the deploy tab.
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)')

  //The setting for bastion should be there now
  const clitextboxrevisted = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextboxrevisted).toContainText('bastion');
});
