const { test, expect } = require('@playwright/test');
const fs = require('fs');

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //fluentui dom hack to navigate to the checkbox

test('export-az-cmd-lab-preset', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction?preset=lean&deploy.getCredentials=false');

  //Wait for the Lab preset section to render
  await page.waitForSelector('[data-testid="stacklabenv"]')

  //Verify the Lab preset card is checked
  const labCheckbox = page.locator('[data-testid="portalnav-presets-labenv-yourlab-Checkbox"]');
  await expect(labCheckbox).toBeAttached();
  await expect(labCheckbox).toBeChecked();

  //Change the name of the resource group
  await page.waitForSelector('#azResourceGroup')
  await page.click('#azResourceGroup')
  await page.fill('#azResourceGroup', 'Automation-Actions-AksPublishCI')

  //Opt out of telemetry
  await page.waitForSelector('[data-testid="akscTelemetryOpt-Checkbox"]')
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeTruthy()
  await page.click('[data-testid="akscTelemetryOpt-Checkbox"]' + chk)
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeFalsy()

  //Save the contents of the az cmd box to file
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  const azcmdLab = await clitextbox.innerText();
  console.log(azcmdLab);
  fs.writeFileSync('azcmd-lab.sh', azcmdLab);

});

test('export-az-cmd-securelab-preset', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction?preset=secureLab&deploy.getCredentials=false');

  //Wait for the Secure Lab preset section to render
  await page.waitForSelector('[data-testid="stackseclab"]')

  //Verify the Secure Lab preset card is checked
  const secLabCheckbox = page.locator('[data-testid="portalnav-presets-seclab-yourSecureLab-Checkbox"]');
  await expect(secLabCheckbox).toBeAttached();
  await expect(secLabCheckbox).toBeChecked();

  //Change the name of the resource group
  await page.waitForSelector('#azResourceGroup')
  await page.click('#azResourceGroup')
  await page.fill('#azResourceGroup', 'Automation-Actions-AksPublishCI')

  //Opt out of telemetry
  await page.waitForSelector('[data-testid="akscTelemetryOpt-Checkbox"]')
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeTruthy()
  await page.click('[data-testid="akscTelemetryOpt-Checkbox"]' + chk)
  expect(await page.locator('[data-testid="akscTelemetryOpt-Checkbox"]').isChecked()).toBeFalsy()

  //Save the contents of the az cmd box to file
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  const azcmdSecureLab = await clitextbox.innerText();
  console.log(azcmdSecureLab);
  fs.writeFileSync('azcmd-securelab.sh', azcmdSecureLab);

});
