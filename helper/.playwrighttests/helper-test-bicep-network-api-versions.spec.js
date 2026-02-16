const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const networkBicepPath = path.resolve(__dirname, '../../bicep/network.bicep');
const networkBicepContent = fs.readFileSync(networkBicepPath, 'utf-8');

// API Version Upgrade Map from PRD REQ-001 for network.bicep
const expectedApiVersions = [
  { resource: 'Microsoft.Network/routeTables', version: '2025-05-01' },
  { resource: 'Microsoft.Network/virtualNetworks', version: '2025-05-01' },
  { resource: 'Microsoft.Network/privateEndpoints', version: '2025-05-01' },
  { resource: 'Microsoft.Network/privateDnsZones', version: '2024-06-01' },
  { resource: 'Microsoft.Network/privateDnsZones/virtualNetworkLinks', version: '2024-06-01' },
  { resource: 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups', version: '2025-05-01' },
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2025-05-01' },
  { resource: 'Microsoft.Network/bastionHosts', version: '2025-05-01' },
  { resource: 'Microsoft.Network/natGateways', version: '2025-05-01' },
];

// These API versions should remain unchanged per PRD
const unchangedApiVersions = [
  { resource: 'Microsoft.Authorization/roleAssignments', version: '2022-04-01' },
];

// Old API versions that must NOT be present in resource declarations
const deprecatedApiVersions = [
  { resource: 'Microsoft.Network/routeTables', version: '2023-04-01' },
  { resource: 'Microsoft.Network/virtualNetworks', version: '2023-04-01' },
  { resource: 'Microsoft.Network/privateEndpoints', version: '2023-04-01' },
  { resource: 'Microsoft.Network/privateDnsZones', version: '2020-06-01' },
  { resource: 'Microsoft.Network/privateDnsZones/virtualNetworkLinks', version: '2020-06-01' },
  { resource: 'Microsoft.Network/privateEndpoints/privateDnsZoneGroups', version: '2023-04-01' },
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2023-04-01' },
  { resource: 'Microsoft.Network/bastionHosts', version: '2023-04-01' },
  { resource: 'Microsoft.Network/natGateways', version: '2023-04-01' },
];

function getNonCommentLines(content) {
  return content.split('\n').filter(line => !line.trimStart().startsWith('//'));
}

test.describe('Bicep network.bicep API Versions - REQ-001', () => {

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(networkBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(networkBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(networkBicepContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});
