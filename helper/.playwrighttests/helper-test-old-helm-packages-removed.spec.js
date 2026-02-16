const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Verify old Helm chart packages have been removed and references updated (REQ-010).

const helmDir = path.resolve(__dirname, '../../postdeploy/helm');

const removedPackages = [
  'Az-CertManagerIssuer-0.3.0.tgz',
  'externaldns-0.3.0.tgz',
  'externaldns-0.2.0.tgz',
];

for (const pkg of removedPackages) {
  test(`old helm package ${pkg} does not exist`, async () => {
    const pkgPath = path.join(helmDir, pkg);
    expect(fs.existsSync(pkgPath)).toBe(false);
  });
}

test('Az-CertManagerIssuer-0.4.0.tgz exists', async () => {
  const pkgPath = path.join(helmDir, 'Az-CertManagerIssuer-0.4.0.tgz');
  expect(fs.existsSync(pkgPath)).toBe(true);
});

test('externaldns-0.4.0.tgz exists', async () => {
  const pkgPath = path.join(helmDir, 'externaldns-0.4.0.tgz');
  expect(fs.existsSync(pkgPath)).toBe(true);
});

test('PostDeploy workflow references Az-CertManagerIssuer-0.4.0', async () => {
  const workflowPath = path.resolve(__dirname, '../../.github/workflows/PostDeploy.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('release workflow references Az-CertManagerIssuer-0.4.0', async () => {
  const workflowPath = path.resolve(__dirname, '../../.github/workflows/release.yml');
  const content = fs.readFileSync(workflowPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('postdeploy.sh references Az-CertManagerIssuer-0.4.0', async () => {
  const scriptPath = path.resolve(__dirname, '../../postdeploy/scripts/postdeploy.sh');
  const content = fs.readFileSync(scriptPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('postdeploy.ps1 references Az-CertManagerIssuer-0.4.0', async () => {
  const scriptPath = path.resolve(__dirname, '../../postdeploy/scripts/postdeploy.ps1');
  const content = fs.readFileSync(scriptPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});

test('deployTab.js references Az-CertManagerIssuer-0.4.0', async () => {
  const deployTabPath = path.resolve(__dirname, '../src/components/deployTab.js');
  const content = fs.readFileSync(deployTabPath, 'utf8');
  expect(content).toContain('Az-CertManagerIssuer-0.4.0.tgz');
  expect(content).not.toContain('Az-CertManagerIssuer-0.3.0.tgz');
});
