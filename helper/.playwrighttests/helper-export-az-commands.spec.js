const { test, expect } = require('@playwright/test');
const fs = require('fs');

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //fluentui dom hack to navigate to the checkbox

test('export-az-cmd-defaults', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction');

  //Change the name of the resource group
  await page.waitForSelector('#azResourceGroup')
  await page.click('#azResourceGroup')
  await page.fill('#azResourceGroup', 'Automation-Actions-AksPublishCI')

  //Telemetry defaults to off (config.json default is false)
  const telemetryCheckboxLab = page.locator('[data-testid="akscTelemetryOpt-Checkbox"]');
  await expect(telemetryCheckboxLab).not.toBeChecked();

  //Save the contents of the az cmd box to file
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  const azcmdLab = await clitextbox.innerText();
  console.log(azcmdLab);
  fs.writeFileSync('azcmd-defaults.sh', azcmdLab);

});

test('export-az-cmd-secure-config', async ({ page }) => {

  await page.goto('http://localhost:3000/AKS-Construction?addons.azurepolicy=audit&addons.networkPolicy=cilium&addons.registry=Basic&addons.monitor=aci&addons.csisecret=akvNew&addons.workloadIdentity=true&cluster.autoscale=true&cluster.agentCount=1&cluster.maxCount=3');

  //Change the name of the resource group
  await page.waitForSelector('#azResourceGroup')
  await page.click('#azResourceGroup')
  await page.fill('#azResourceGroup', 'Automation-Actions-AksPublishCI')

  //Telemetry defaults to off (config.json default is false)
  const telemetryCheckboxSecLab = page.locator('[data-testid="akscTelemetryOpt-Checkbox"]');
  await expect(telemetryCheckboxSecLab).not.toBeChecked();

  //Save the contents of the az cmd box to file
  const clitextbox = page.locator('[data-testid="deploy-deploycmd"]');
  await expect(clitextbox).toBeVisible();
  const azcmdSecureLab = await clitextbox.innerText();
  console.log(azcmdSecureLab);
  fs.writeFileSync('azcmd-secure-config.sh', azcmdSecureLab);

});
