const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const mainBicepPath = path.resolve(__dirname, '../../bicep/main.bicep');
const mainBicepContent = fs.readFileSync(mainBicepPath, 'utf-8');

/**
 * Extract the systemPoolPresets variable block from main.bicep
 * and parse a specific preset by name.
 */
function getSystemPoolPreset(content, presetName) {
  const presetBlockRegex = new RegExp(
    `var systemPoolPresets = \\{([\\s\\S]*?)\\n\\}`,
  );
  const blockMatch = content.match(presetBlockRegex);
  if (!blockMatch) throw new Error('systemPoolPresets block not found');

  const block = blockMatch[1];

  // Extract the named preset sub-block
  const presetRegex = new RegExp(
    `${presetName}\\s*:\\s*\\{([\\s\\S]*?)\\n  \\}`,
  );
  const presetMatch = block.match(presetRegex);
  if (!presetMatch) throw new Error(`Preset '${presetName}' not found`);

  const presetBody = presetMatch[1];

  // Parse key-value pairs
  const result = {};
  for (const line of presetBody.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;

    const kvMatch = trimmed.match(/^(\w+)\s*:\s*(.+)$/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();
      // Remove trailing comma if present
      if (value.endsWith(',')) value = value.slice(0, -1).trim();

      if (value === 'true') result[key] = true;
      else if (value === 'false') result[key] = false;
      else if (/^\d+$/.test(value)) result[key] = parseInt(value, 10);
      else result[key] = value.replace(/^'|'$/g, '');
    }
  }
  return result;
}

function getSystemPoolPresetAvailabilityZones(content, presetName) {
  const presetBlockRegex = new RegExp(
    `var systemPoolPresets = \\{([\\s\\S]*?)\\n\\}`,
  );
  const blockMatch = content.match(presetBlockRegex);
  if (!blockMatch) throw new Error('systemPoolPresets block not found');

  const block = blockMatch[1];

  const presetRegex = new RegExp(
    `${presetName}\\s*:\\s*\\{([\\s\\S]*?)\\n  \\}`,
  );
  const presetMatch = block.match(presetRegex);
  if (!presetMatch) throw new Error(`Preset '${presetName}' not found`);

  const presetBody = presetMatch[1];

  // Check if availabilityZones is an empty array
  if (/availabilityZones\s*:\s*\[\s*\]/.test(presetBody)) {
    return [];
  }

  // Extract non-empty array values
  const azMatch = presetBody.match(/availabilityZones\s*:\s*\[([\s\S]*?)\]/);
  if (!azMatch) return undefined;

  const zones = azMatch[1].match(/'(\d+)'/g);
  return zones ? zones.map(z => z.replace(/'/g, '')) : [];
}

test.describe('System Pool Presets - REQ-002', () => {

  test('Standard preset uses v6 VM SKU', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.vmSize).toBe('Standard_D4ds_v6');
  });

  test('Standard preset count is 1', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.count).toBe(1);
  });

  test('Standard preset minCount is 1', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.minCount).toBe(1);
  });

  test('Standard preset maxCount is 3', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.maxCount).toBe(3);
  });

  test('Standard preset has autoscaling enabled', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.enableAutoScaling).toBe(true);
  });

  test('Standard preset has no availability zones', () => {
    const zones = getSystemPoolPresetAvailabilityZones(mainBicepContent, 'Standard');
    expect(zones).toEqual([]);
  });

  test('Standard preset does not use deprecated v4 or v5 VM SKUs', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'Standard');
    expect(preset.vmSize).not.toContain('_v4');
    expect(preset.vmSize).not.toContain('_v5');
  });

  test('CostOptimised preset remains unchanged', () => {
    const preset = getSystemPoolPreset(mainBicepContent, 'CostOptimised');
    expect(preset.vmSize).toBe('Standard_B4s_v2');
    expect(preset.count).toBe(1);
    expect(preset.minCount).toBe(1);
    expect(preset.maxCount).toBe(3);
    expect(preset.enableAutoScaling).toBe(true);
    const zones = getSystemPoolPresetAvailabilityZones(mainBicepContent, 'CostOptimised');
    expect(zones).toEqual([]);
  });

  test('HighSpec preset retains availability zones', () => {
    const zones = getSystemPoolPresetAvailabilityZones(mainBicepContent, 'HighSpec');
    expect(zones).toEqual(['1', '2', '3']);
  });
});
