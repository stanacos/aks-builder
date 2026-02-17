const { test, expect } = require('@playwright/test');

const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //dom hack to get to the checkbox
const sliderFirstBubbleSelector='[data-testid="cluster-agentCount-slider"] .ms-Slider-line .ms-Slider-thumb:first-child';
const sliderSelector='[data-testid="cluster-agentCount-slider"]';

test('scale-can-be-set-to-zero-by-default', async ({ page }) => {

  // Use cluster.maxCount param to widen slider range (config.json default maxCount=3 overlaps with agentCount=1)
  await page.goto('http://localhost:3000/AKS-Construction?cluster.maxCount=20');

  // Click the 2nd Tab in the portal Navigation Pivot (cluster details)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(2)');

  //Scale to zero
  await page.waitForSelector(sliderFirstBubbleSelector);
  await page.click(sliderFirstBubbleSelector);
  await page.mouse.down();
  await page.mouse.move(-100,0);
  await page.mouse.up();

  const agentCountSliderLocator = page.locator(sliderFirstBubbleSelector);
  await expect(agentCountSliderLocator).toHaveAttribute("aria-valuenow", "0");

  //Go back to the deploy tab.
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)')

  //Check parameter is absent
  const clitextboxrevisted = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextboxrevisted).toBeVisible()
  await expect(clitextboxrevisted).toContainText('agentCount=0')

});

test('manual-scale-prevents-autoscale-from-zero', async ({ page }) => {

  const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //dom hack to get to the checkbox

  // Use cluster.maxCount param to widen slider range (config.json default maxCount=3 overlaps with agentCount=1)
  await page.goto('http://localhost:3000/AKS-Construction?cluster.maxCount=20');

  // Click the 2nd Tab in the portal Navigation Pivot (cluster details)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(2)');

  //Scale to zero
  await page.waitForSelector(sliderFirstBubbleSelector)
  await page.click(sliderFirstBubbleSelector);
  await page.mouse.down();
  await page.mouse.move(-100,0);
  await page.mouse.up();

  const agentCountSliderLocator = page.locator(sliderFirstBubbleSelector);
  await expect(agentCountSliderLocator).toHaveAttribute("aria-valuenow", "0");

  //Turn off AutoScale
  //Need to select the sibling element because of this choicebox mess
  const manualScaleSelector ='[data-testid="cluster-manual-scale"]  + .ms-ChoiceField-field'
  const manualScale = page.locator(manualScaleSelector);
  await expect(manualScale).not.toBeChecked();
  await page.click(manualScaleSelector);
  await expect(manualScale).toBeChecked();

  //MinScale should have jumped back to 1, and the slider will have become a simple slider
  const agentCountSliderLocator2 = page.locator(sliderSelector);
  await expect(agentCountSliderLocator2).toHaveAttribute("aria-valuenow", "1");

  //Go back to the deploy tab.
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)')

  //Check agentCount=1 matches default so is not emitted
  const clitextboxrevisted = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextboxrevisted).toBeVisible()
  await expect(clitextboxrevisted).not.toContainText('agentCount=')

});


test('no-user-pool-prevents-autoscale-from-zero', async ({ page }) => {

  const chk = '+ label > .ms-Checkbox-checkbox > .ms-Checkbox-checkmark' //dom hack to get to the checkbox

  // Use cluster.maxCount param to widen slider range (config.json default maxCount=3 overlaps with agentCount=1)
  await page.goto('http://localhost:3000/AKS-Construction?cluster.maxCount=20');

  // Click the 2nd Tab in the portal Navigation Pivot (cluster details)
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(2)');

  //Scale to zero
  await page.waitForSelector(sliderFirstBubbleSelector)
  await page.click(sliderFirstBubbleSelector);
  await page.mouse.down();
  await page.mouse.move(-100,0);
  await page.mouse.up();

  const agentCountSliderLocator = page.locator(sliderFirstBubbleSelector);
  await expect(agentCountSliderLocator).toHaveAttribute("aria-valuenow", "0");

  //No separate system pool
  //Need to select the sibling element
  const sysPoolSelector ='[data-testid="cluster-systempool-none"]  + .ms-ChoiceField-field'
  const noSysPool = page.locator(sysPoolSelector);
  await expect(noSysPool).not.toBeChecked();
  await page.click(sysPoolSelector);
  await expect(noSysPool).toBeChecked();

  //MinScale should have jumped back to 1, and the slider will have become a simple slider
  const agentCountSliderLocator3 = page.locator(sliderFirstBubbleSelector);
  console.log(await agentCountSliderLocator3.innerHTML());
  await expect(agentCountSliderLocator3).toHaveAttribute("aria-valuenow", "1");

  //Go back to the deploy tab.
  await page.click('[data-testid="portalnav-Pivot"] > button:nth-child(1)')

  //Check parameter is absent
  const clitextboxrevisted = page.locator('[data-testid="deploy-deploycmd"]')
  await expect(clitextboxrevisted).toBeVisible()
  //console.log(await clitextboxrevisted.textContent());
  // agentCount=1 matches default so is not emitted
  await expect(clitextboxrevisted).not.toContainText('agentCount=')

});
