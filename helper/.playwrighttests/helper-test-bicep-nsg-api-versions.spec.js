const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const nsgBicepPath = path.resolve(__dirname, '../../bicep/nsg.bicep');
const nsgBicepContent = fs.readFileSync(nsgBicepPath, 'utf-8');

// API Version Upgrade Map from PRD REQ-001 for nsg.bicep
const expectedApiVersions = [
  { resource: 'Microsoft.Network/networkSecurityGroups', version: '2025-05-01' },
  { resource: 'Microsoft.Network/networkSecurityGroups/securityRules', version: '2025-05-01' },
];

// These API versions should remain unchanged per PRD
const unchangedApiVersions = [
  { resource: 'Microsoft.Insights/diagnosticSettings', version: '2021-05-01-preview' },
];

// Old API versions that must NOT be present in resource declarations
const deprecatedApiVersions = [
  { resource: 'Microsoft.Network/networkSecurityGroups', version: '2023-04-01' },
  { resource: 'Microsoft.Network/networkSecurityGroups/securityRules', version: '2022-07-01' },
];

function getNonCommentLines(content) {
  return content.split('\n').filter(line => !line.trimStart().startsWith('//'));
}

test.describe('Bicep nsg.bicep API Versions - REQ-001', () => {

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(nsgBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(nsgBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(nsgBicepContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});
