const { test, expect } = require('@playwright/test');
const path = require('path');
const { execSync } = require('child_process');

// Verify both updated Helm charts pass helm lint without errors (REQ-010).

const helmDir = path.resolve(__dirname, '../../postdeploy/helm');

const charts = ['certmanagerissuer', 'externaldns'];

for (const chart of charts) {
  test(`helm lint passes for ${chart}`, async () => {
    const chartPath = path.join(helmDir, chart);
    const result = execSync(`helm lint "${chartPath}" 2>&1`, { encoding: 'utf8' });
    expect(result).toContain('1 chart(s) linted, 0 chart(s) failed');
    expect(result).not.toContain('[ERROR]');
    expect(result).not.toContain('[WARNING]');
  });
}
