#!/usr/bin/env bash
# Test: REQ-002 - Verify updated parameter defaults in main.bicep
# This test compiles main.bicep and validates the compiled ARM JSON
# has the correct default parameter values per the modernization PRD.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BICEP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPILED_DIR="$BICEP_DIR/compiled"

echo "=== REQ-002: Parameter Defaults Test ==="
echo ""

# Step 1: Compile bicep
echo "Step 1: Compiling bicep/main.bicep..."
az bicep build --file "$BICEP_DIR/main.bicep" --outdir "$COMPILED_DIR" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "FAIL: az bicep build failed"
    exit 1
fi
echo "  Bicep compilation succeeded."
echo ""

# Step 2: Validate parameter defaults
echo "Step 2: Validating parameter defaults in compiled ARM JSON..."
FAILURES=0

validate_param() {
    local param_name="$1"
    local expected="$2"
    local actual
    actual=$(python3 -c "
import json, sys
with open('$COMPILED_DIR/main.json') as f:
    data = json.load(f)
v = data['parameters']['$param_name']['defaultValue']
print(json.dumps(v))
")
    if [ "$actual" = "$expected" ]; then
        echo "  PASS: $param_name = $actual"
    else
        echo "  FAIL: $param_name = $actual (expected $expected)"
        FAILURES=$((FAILURES + 1))
    fi
}

# Parameter defaults per REQ-002
validate_param "kubernetesVersion" '"1.34.2"'
validate_param "osSKU" '"AzureLinux"'
validate_param "networkPluginMode" '"Overlay"'
validate_param "networkDataplane" '"cilium"'
validate_param "aksOutboundTrafficType" '"natGateway"'
validate_param "natGwIpCount" '1'
validate_param "natGwIdleTimeout" '5'
validate_param "agentVMSize" '"Standard_D4ds_v6"'
validate_param "podCidr" '"10.244.0.0/16"'
validate_param "agentCount" '1'
validate_param "agentCountMax" '3'

echo ""

# Step 3: Validate systemPoolPresets Standard preset
echo "Step 3: Validating systemPoolPresets Standard preset..."

validate_pool_preset() {
    local field="$1"
    local expected="$2"
    local actual
    actual=$(python3 -c "
import json
with open('$COMPILED_DIR/main.json') as f:
    data = json.load(f)
v = data['variables']['systemPoolPresets']['Standard']['$field']
print(json.dumps(v))
")
    if [ "$actual" = "$expected" ]; then
        echo "  PASS: Standard.$field = $actual"
    else
        echo "  FAIL: Standard.$field = $actual (expected $expected)"
        FAILURES=$((FAILURES + 1))
    fi
}

validate_pool_preset "vmSize" '"Standard_D4ds_v6"'
validate_pool_preset "count" '1'
validate_pool_preset "minCount" '1'
validate_pool_preset "maxCount" '3'
validate_pool_preset "availabilityZones" '[]'

echo ""

# Step 4: Validate system pool OS SKU is hardcoded to AzureLinux
echo "Step 4: Validating system pool OS SKU is hardcoded to AzureLinux..."
OSSSKU_CHECK=$(python3 -c "
import json
with open('$COMPILED_DIR/main.json') as f:
    text = f.read()
# The old conditional pattern should NOT be present
if \"osSKU=='AzureLinux'\" in text or 'osSKU==' in text:
    print('CONDITIONAL')
else:
    print('HARDCODED')
")
if [ "$OSSSKU_CHECK" = "HARDCODED" ]; then
    echo "  PASS: System pool osSku is hardcoded (no conditional logic)"
else
    echo "  FAIL: System pool osSku still uses conditional logic"
    FAILURES=$((FAILURES + 1))
fi

echo ""

# Summary
if [ $FAILURES -eq 0 ]; then
    echo "=== ALL TESTS PASSED ==="
    exit 0
else
    echo "=== $FAILURES TEST(S) FAILED ==="
    exit 1
fi
