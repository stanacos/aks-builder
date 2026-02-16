const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainBicepPath = path.resolve(__dirname, '../../bicep/main.bicep');
const mainBicepContent = fs.readFileSync(mainBicepPath, 'utf-8');

// API Version Upgrade Map from PRD REQ-001
const expectedApiVersions = [
  { resource: 'Microsoft.ContainerService/managedClusters', version: '2025-10-01' },
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2025-05-01' },
  { resource: 'Microsoft.Network/applicationGateways', version: '2025-05-01' },
  { resource: 'Microsoft.KeyVault/vaults', version: '2025-05-01' },
  { resource: 'Microsoft.ManagedIdentity/userAssignedIdentities', version: '2024-11-30' },
  { resource: 'Microsoft.ContainerRegistry/registries', version: '2025-11-01' },
  { resource: 'Microsoft.OperationalInsights/workspaces', version: '2025-07-01' },
  { resource: 'Microsoft.Insights/dataCollectionRules', version: '2024-03-11' },
  { resource: 'Microsoft.Insights/dataCollectionRuleAssociations', version: '2024-03-11' },
  { resource: 'Microsoft.KubernetesConfiguration/extensions', version: '2024-11-01' },
  { resource: 'Microsoft.EventGrid/systemTopics', version: '2025-02-15' },
];

// These API versions should remain unchanged
const unchangedApiVersions = [
  { resource: 'Microsoft.Authorization/roleAssignments', version: '2022-04-01' },
  { resource: 'Microsoft.Insights/diagnosticSettings', version: '2021-05-01-preview' },
];

// Old API versions that must NOT be present (excluding comments)
const deprecatedApiVersions = [
  { resource: 'Microsoft.ContainerService/managedClusters', version: '2024-01-01' },
  { resource: 'Microsoft.ManagedIdentity/userAssignedIdentities', version: '2023-01-31' },
  { resource: 'Microsoft.KeyVault/vaults', version: '2022-07-01' },
  { resource: 'Microsoft.ContainerRegistry/registries', version: '2023-07-01' },
  { resource: 'Microsoft.Network/publicIPAddresses', version: '2023-04-01' },
  { resource: 'Microsoft.Network/applicationGateways', version: '2023-04-01' },
  { resource: 'Microsoft.KubernetesConfiguration/extensions', version: '2022-11-01' },
  { resource: 'Microsoft.Insights/dataCollectionRules', version: '2022-06-01' },
  { resource: 'Microsoft.OperationalInsights/workspaces', version: '2022-10-01' },
  { resource: 'Microsoft.EventGrid/systemTopics', version: '2023-06-01-preview' },
];

function getNonCommentLines(content) {
  return content.split('\n').filter(line => !line.trimStart().startsWith('//'));
}

test.describe('Bicep API Versions - REQ-001', () => {

  for (const { resource, version } of expectedApiVersions) {
    test(`${resource} uses API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(mainBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of unchangedApiVersions) {
    test(`${resource} stays at API version ${version}`, () => {
      const pattern = `${resource}@${version}`;
      expect(mainBicepContent).toContain(pattern);
    });
  }

  for (const { resource, version } of deprecatedApiVersions) {
    test(`${resource} no longer uses deprecated ${version}`, () => {
      const pattern = `${resource}@${version}`;
      const nonCommentLines = getNonCommentLines(mainBicepContent);
      const found = nonCommentLines.some(line => line.includes(pattern));
      expect(found).toBe(false);
    });
  }
});
