# PRD: AKS-Construction Modernization

**Author:** Lab Owner
**Date:** 2026-02-16
**Status:** Draft
**Version:** 1.0
**Ralphy Compatible:** Yes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Functional Requirements](#functional-requirements)
6. [Non-Functional Requirements](#non-functional-requirements)
7. [Technical Considerations](#technical-considerations)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Out of Scope](#out-of-scope)
10. [Open Questions & Risks](#open-questions--risks)
11. [Validation Checkpoints](#validation-checkpoints)
12. [Tasks](#tasks)

---

## Executive Summary

The AKS-Construction project has not been updated since 2024 and uses outdated Azure API versions, Kubernetes 1.29.7, Ubuntu OS, and legacy VM SKUs. We are modernizing the entire project -- Bicep IaC templates, React Helper UI, and post-deploy tooling -- to current 2025/2026 standards with opinionated defaults for personal lab cluster use: Kubernetes 1.34.2, Azure CNI Overlay with Cilium, NAT Gateway egress, Azure Linux v3, Norway East region, and Nintendo-themed cluster names. The goal is to run everything locally without errors or warnings.

---

## Problem Statement

### Current Situation
The AKS-Construction project uses Azure resource API versions from 2020-2024, Kubernetes 1.29.7 (deprecated on AKS), Ubuntu as the default OS (Azure Linux v3 is now standard), D-series v5 VMs, LoadBalancer egress, and classic Azure CNI without Overlay or Cilium. The Helper UI defaults to West Europe, has 4 enterprise-focused preset categories, and npm dependencies (React 18.2, Playwright 1.28, FluentUI 8.103) are 2+ years behind. Post-deploy Helm charts reference cert-manager v1.8 (EOL) and external-dns v0.11 with the deprecated `k8s.gcr.io` registry.

### User Impact
- **Who is affected:** Single lab user deploying personal AKS clusters
- **How they're affected:** Cannot deploy clusters with current best practices; `az bicep build` produces API version warnings; Helper UI shows outdated options; post-deploy charts use EOL software
- **Severity:** High -- the project is effectively unusable for modern AKS deployments

### Business Impact
- **Cost of problem:** Wasted time manually overriding defaults on every deployment; risk of deploying deprecated configurations
- **Opportunity cost:** Cannot leverage Azure Linux v3 performance, Cilium observability, or latest AKS features
- **Strategic importance:** This is the primary tool for spinning up lab environments

### Why Solve This Now?
Kubernetes 1.29 is deprecated on AKS. Azure Linux v3 is GA and Azure Linux v2 support ended Nov 2025. The project needs a comprehensive refresh to remain functional.

---

## Goals & Success Metrics

### Goal 1: Zero-Error Local Build
- **Description:** `az bicep build` and `npm start` complete without errors or warnings
- **Metric:** Exit code 0 on both commands, 0 warnings in bicep build output
- **Baseline:** Multiple API version warnings, outdated linting failures
- **Target:** Clean build with 0 errors, 0 warnings
- **Timeframe:** End of implementation
- **Measurement Method:** Run `az bicep build --file bicep/main.bicep 2>&1 | grep -c "Warning\|Error"` = 0

### Goal 2: Modern AKS Defaults
- **Description:** Default deployment creates a modern AKS cluster with current best practices
- **Metric:** Default `az aks create` command uses K8s 1.34.2, CNI Overlay, Cilium, NAT Gateway, Azure Linux v3
- **Baseline:** K8s 1.29.7, standard CNI, LoadBalancer, Ubuntu
- **Target:** All 6 core defaults updated and verified in generated deploy commands
- **Timeframe:** End of Phase 2
- **Measurement Method:** Inspect generated CLI command from Helper UI default state

### Goal 3: Simplified Lab Experience
- **Description:** Two clean presets (Lab, Secure Lab) replace 4 enterprise preset categories
- **Metric:** Number of presets reduced from 4 categories to 2
- **Baseline:** 4 categories (Baselines, Enterprise Scale, Gaming, Principals) with 8+ sub-options
- **Target:** 2 presets (Lab, Secure Lab)
- **Timeframe:** End of Phase 2
- **Measurement Method:** Count preset files in `helper/src/configpresets/`

### Goal 4: All Playwright Tests Pass
- **Description:** Updated tests pass against new defaults
- **Metric:** `npx playwright test` exit code 0
- **Baseline:** Tests will fail after default changes
- **Target:** All tests green
- **Timeframe:** End of Phase 5
- **Measurement Method:** `npx playwright test --browser chromium .playwrighttests/ --reporter list`

---

## User Stories

### Story 1: Deploy a Lab Cluster with Modern Defaults

**As a** lab user,
**I want to** run the Helper UI and get a ready-to-use Azure CLI command for a modern AKS cluster,
**So that I can** spin up lab environments without manually configuring every parameter.

**Acceptance Criteria:**
- Default Kubernetes version is 1.34.2
- Default location is Norway East
- Default networking is Azure CNI Overlay with Cilium dataplane
- Default egress is NAT Gateway with 1 public IP and 5-minute idle timeout
- Default OS SKU is Azure Linux (v3)
- No ingress controller is configured by default
- Client IP is automatically detected and set as authorized IP range
- Cluster name is a randomly generated Nintendo character name (e.g., `kirby-742`)
- Subscription `1869051d-48fc-4985-8631-addf990c15da` is prepended to deploy commands
- Node pools: 1 system + 1 user node, autoscale to 3 each

**Dependencies:** REQ-001, REQ-002, REQ-003, REQ-004, REQ-005

### Story 2: Compile Bicep Without Errors

**As a** developer,
**I want to** run `az bicep build` and get zero errors and zero warnings,
**So that I can** trust the templates are valid against current Azure APIs.

**Acceptance Criteria:**
- All Azure resource API versions are updated to latest stable (2024-2025)
- `az bicep build --file bicep/main.bicep` exits with code 0
- No `use-recent-api-versions` warnings from bicepconfig.json linting
- Parameter defaults are valid for the target API versions

**Dependencies:** REQ-001

### Story 3: Run Helper UI Locally

**As a** developer,
**I want to** run `npm start` and see the Helper UI with updated defaults,
**So that I can** configure and generate deployment commands interactively.

**Acceptance Criteria:**
- `npm install` completes without critical vulnerabilities
- `npm start` launches the UI at localhost:3000/AKS-Construction
- Default view shows Lab preset with all modern defaults applied
- Two preset options: Lab and Secure Lab
- Nintendo cluster name appears in the cluster name field
- Deploy tab generates valid `az` commands with subscription set

**Dependencies:** REQ-002, REQ-003, REQ-004, REQ-005

---

## Functional Requirements

### Must Have (P0) - Critical for Launch

#### REQ-001: Update All Bicep API Versions
**Description:** Update every Azure resource provider API version in all Bicep files to the latest stable release.

**Acceptance Criteria:**
- `Microsoft.ContainerService/managedClusters` updated from `2024-01-01` to `2025-10-01`
- `Microsoft.ContainerService/managedClusters/agentPools` updated to `2025-10-01`
- `Microsoft.Network/*` resources updated from `2023-04-01` to `2025-05-01`
- `Microsoft.Network/privateDnsZones` updated from `2020-06-01` to `2024-06-01`
- `Microsoft.KeyVault/vaults` updated from `2022-07-01` to `2025-05-01`
- `Microsoft.ManagedIdentity/userAssignedIdentities` updated from `2023-01-31` to `2024-11-30`
- `Microsoft.ContainerRegistry/registries` updated from `2023-07-01` to `2025-11-01`
- `Microsoft.OperationalInsights/workspaces` updated from `2022-10-01` to `2025-07-01`
- `Microsoft.Insights/dataCollectionRules` updated from `2022-06-01` to `2024-03-11`
- `Microsoft.KubernetesConfiguration/extensions` updated from `2022-11-01` to `2024-11-01`
- `Microsoft.EventGrid/systemTopics` updated from `2023-06-01-preview` to `2025-02-15`
- `Microsoft.Authorization/roleAssignments` stays at `2022-04-01` (still latest)
- `Microsoft.Insights/diagnosticSettings` stays at `2021-05-01-preview` (still latest)
- `az bicep build --file bicep/main.bicep` produces 0 errors and 0 warnings

**Files to modify:**
- `bicep/main.bicep` (15+ API version strings)
- `bicep/network.bicep` (9 API version strings)
- `bicep/firewall.bicep` (4 API version strings)
- `bicep/nsg.bicep` (12 API version strings)
- `bicep/keyvault.bicep` (1), `bicep/keyvaultkey.bicep` (2)
- `bicep/aksagentpool.bicep` (2)
- `bicep/appgw.bicep` (2)
- `bicep/dnsZone.bicep` (3)
- `bicep/networkwatcherflowlog.bicep` (2)
- All other `bicep/*.bicep` files with API versions

**Dependencies:** None

---

#### REQ-002: Update Bicep Parameter Defaults
**Description:** Change default parameter values in `main.bicep` to reflect modern lab cluster configuration.

**Acceptance Criteria:**
- `kubernetesVersion` default: `'1.29.7'` -> `'1.34.2'`
- `osSKU` default: `'Ubuntu'` -> `'AzureLinux'`
- `networkPluginMode` default: `''` -> `'Overlay'`
- `networkDataplane` default: `''` -> `'cilium'`
- `aksOutboundTrafficType` default: `'loadBalancer'` -> `'natGateway'`
- `natGwIpCount` default: `2` -> `1`
- `natGwIdleTimeout` default: `30` -> `5`
- `agentVMSize` default: `'Standard_D4ds_v5'` -> `'Standard_D4ds_v6'` (if available in norwayeast, else `Standard_D4as_v6`)
- `podCidr` default: `'10.240.100.0/22'` -> `'10.244.0.0/16'` (standard Overlay CIDR)
- System pool presets updated: Standard pool count 3->1, maxCount 5->3, availability zones removed
- System pool OS SKU hardcoded to `'AzureLinux'`
- `agentCount` default: `3` -> `1`
- `maxCount` default: `20` -> `3`
- Verify `networkPolicy` default `''` can work with `networkDataplane: 'cilium'`

**Files to modify:**
- `bicep/main.bicep` (parameter declarations and `systemPoolPresets` variable)

**Dependencies:** REQ-001 (API versions must support new defaults)

---

#### REQ-003: Update Helper UI Config Defaults
**Description:** Mirror all Bicep default changes in the Helper UI configuration.

**Acceptance Criteria:**
- `config.json` `kubernetesVersion`: `"1.29.7"` -> `"1.34.2"`
- `config.json` `location`: `"westeurope"` -> `"norwayeast"`
- `config.json` `osSKU`: `"Ubuntu"` -> `"AzureLinux"`
- `config.json` `vmSize`: updated to v6 series
- `config.json` `agentCount`: `3` -> `1`
- `config.json` `maxCount`: `20` -> `3`
- `config.json` `networkPluginMode`: `false` -> `true` (enables Overlay)
- `config.json` `networkDataplane`: add field, set to `true` (enables Cilium)
- `config.json` `aksOutboundTrafficType`: `"loadBalancer"` -> `"natGateway"`
- `config.json` `natGwIpCount`: `2` -> `1`
- `config.json` `natGwIdleTimeout`: `30` -> `5`
- `config.json` `ingress`: ensure default is `"none"`
- `config.json` `podCidr`: `"10.240.100.0/22"` -> `"10.244.0.0/16"`
- `config.json` `maxPods`: `30` -> `250` (Overlay supports higher)
- All UI defaults match Bicep parameter defaults exactly

**Files to modify:**
- `helper/src/config.json`

**Dependencies:** REQ-002

---

#### REQ-004: Simplify Presets to Lab and Secure Lab
**Description:** Replace the 4 enterprise preset categories with 2 lab-focused presets.

**Acceptance Criteria:**
- New `lab.json` preset: lean AKS, no monitoring, no registry, no ingress, no network policy, stable upgrade channel, autoscale 1-3
- New `securelab.json` preset: AAD+RBAC, Azure Policy (audit), Cilium network policy, Basic ACR, Azure Monitor, Key Vault CSI, API IP whitelist, workload identity
- Old preset files (`baselines.json`, `entScale.json`, `gaming.json`, `principals.json`) removed
- `index.js` imports updated from 4 old presets to 2 new presets
- `portalnav.js` default preset key changed from `'defaultOps'` to `'lean'` (Lab preset default card)
- `presets.js` renders the 2 new presets correctly

**Files to create:**
- `helper/src/configpresets/lab.json`
- `helper/src/configpresets/securelab.json`

**Files to modify:**
- `helper/src/index.js` (import rewiring)
- `helper/src/components/portalnav.js` (default preset key)

**Files to remove:**
- `helper/src/configpresets/baselines.json`
- `helper/src/configpresets/entScale.json`
- `helper/src/configpresets/gaming.json`
- `helper/src/configpresets/principals.json`

**Dependencies:** REQ-003

---

#### REQ-005: Nintendo Character Cluster Names
**Description:** Generate random cluster names inspired by Nintendo characters instead of the current `az-k8s-XXXXX` format.

**Acceptance Criteria:**
- New `nintendoNames.js` utility exports `generateNintendoClusterName()` function
- Character pool includes 35+ Nintendo characters: Mario, Luigi, Peach, Toad, Yoshi, Link, Zelda, Kirby, Samus, Pikachu, Bowser, Wario, Fox, Ness, Marth, Pit, Inkling, Isabelle, etc.
- Format: `{character}-{3-digit-number}` (e.g., `kirby-742`, `samus-318`)
- All generated names are <= 20 characters (Bicep `resourceName` `@maxLength(20)` constraint)
- `portalnav.js` imports and uses the generator for initial cluster name
- Resource group follows pattern: `{clusterName}-rg`

**Files to create:**
- `helper/src/nintendoNames.js`

**Files to modify:**
- `helper/src/components/portalnav.js` (import generator, replace name logic)

**Dependencies:** None

---

#### REQ-006: Hardcode Subscription in Deploy Commands
**Description:** Prepend `az account set --subscription 1869051d-48fc-4985-8631-addf990c15da` to all generated deployment scripts.

**Acceptance Criteria:**
- Bash deploy command starts with `az account set --subscription 1869051d-48fc-4985-8631-addf990c15da`
- PowerShell deploy command includes equivalent subscription setting
- Subscription ID stored in `config.json` deploy defaults for maintainability

**Files to modify:**
- `helper/src/config.json` (add `subscription` field)
- `helper/src/components/deployTab.js` (prepend subscription command)

**Dependencies:** None

---

### Should Have (P1) - Important but Not Blocking

#### REQ-007: Move Cilium from Preview to GA Parameters
**Description:** In `deployTab.js`, Cilium `networkDataplane` is currently in `preview_params`. Since Cilium is GA on AKS, move it to the main `params` object.

**Acceptance Criteria:**
- `networkDataplane` parameter moved from `preview_params` to `params` in `deployTab.js`
- Deploy command correctly includes `networkDataplane=cilium` when enabled (and omits when matching default)
- No functional change to the parameter value logic

**Files to modify:**
- `helper/src/components/deployTab.js`

**Dependencies:** REQ-002, REQ-003

---

#### REQ-008: Upgrade npm Dependencies
**Description:** Update all npm packages to latest compatible versions.

**Acceptance Criteria:**
- `react`: `18.2.0` -> `18.3.1` (stay on 18.x for FluentUI v8 compatibility)
- `react-dom`: `18.2.0` -> `18.3.1`
- `@fluentui/react`: `8.103.2` -> `8.125.4`
- `@fluentui/azure-themes`: `8.5.30` -> latest 8.x
- `@playwright/test`: `1.28.1` -> `1.50.0`+
- `@microsoft/applicationinsights-web`: `2.8.9` -> `3.3.0`
- `web-vitals`: `2.1.4` -> `4.2.0`
- Remove deprecated `playwright-expect` package (built into Playwright since 1.30)
- `npm install` completes successfully
- `npm audit` shows no critical/high vulnerabilities

**Files to modify:**
- `helper/package.json`

**Dependencies:** None

---

#### REQ-009: Update Playwright Tests for New Defaults
**Description:** Fix all Playwright tests to work with the new default values and presets.

**Acceptance Criteria:**
- `helper-test-managednatgw.spec.js`: Update expected default from "Load Balancer" to "NAT Gateway"
- `helper-test-main-presets.spec.js`: Update preset URL params to use new `lab`/`secureLab` presets
- `helper-export-az-commands.spec.js`: Update `data-testid` selectors for new preset structure
- Remove `playwright-expect` imports; use native Playwright assertions (`toHaveText`, `toContainText`)
- Replace `toMatchText()` with `toHaveText()` across all test files
- All tests pass: `npx playwright test --browser chromium .playwrighttests/ --reporter list`

**Files to modify:**
- `helper/.playwrighttests/helper-test-managednatgw.spec.js`
- `helper/.playwrighttests/helper-test-main-presets.spec.js`
- `helper/.playwrighttests/helper-export-az-commands.spec.js`
- Any other test files referencing old presets or `playwright-expect`

**Dependencies:** REQ-003, REQ-004, REQ-008

---

#### REQ-010: Update Post-Deploy Helm Charts
**Description:** Update cert-manager and external-dns Helm charts to current versions.

**Acceptance Criteria:**
- cert-manager: reference version updated from v1.8.0 to v1.17.x (LTS) or v1.19.x (latest)
- external-dns: appVersion updated from v0.11.0 to v0.15.1 (stable) or v0.20.0 (latest)
- external-dns image registry changed from deprecated `k8s.gcr.io` to `registry.k8s.io`
- Chart versions bumped to 0.4.0
- Old `.tgz` chart packages removed
- New `.tgz` packages built with `helm package`

**Files to modify:**
- `postdeploy/helm/certmanagerissuer/Chart.yaml`
- `postdeploy/helm/externaldns/Chart.yaml`
- `postdeploy/helm/externaldns/values.yaml`
- `postdeploy/helm/externaldns/templates/deployment.yaml` (if image ref is there)
- `postdeploy/scripts/certmanager-install.sh`

**Files to remove:**
- `postdeploy/helm/Az-CertManagerIssuer-0.3.0.tgz`
- `postdeploy/helm/externaldns-0.3.0.tgz`
- `postdeploy/helm/externaldns-0.2.0.tgz`

**Dependencies:** None

---

### Nice to Have (P2) - Future Enhancement

#### REQ-011: Regenerate vmSKUs.json
**Description:** Run the VM SKU generation script to include v6 series VMs for all regions.

**Acceptance Criteria:**
- `postdeploy/scripts/generate-vm-sku-list-v2.sh` executed against current Azure inventory
- `helper/src/vmSKUs.json` includes D-series v6 entries (D4ds_v6, D4as_v6, etc.)
- Norway East region has complete VM SKU listings
- VM dropdown in clusterTab shows v6 options

**Files to modify:**
- `helper/src/vmSKUs.json` (regenerated)

**Dependencies:** REQ-003

---

#### REQ-012: Update Regression Parameter Files
**Description:** Update regression parameter files to use new defaults and API versions.

**Acceptance Criteria:**
- All parameter files in `.github/workflows_dep/regressionparams/` validate against updated Bicep
- `cilium-cni-overlay.json` still validates (already uses Cilium+Overlay)
- Add a new `lab-default.json` that tests the new default configuration
- `az bicep build` with each regression param file produces no errors

**Files to modify:**
- `.github/workflows_dep/regressionparams/*.json` (multiple files)

**Dependencies:** REQ-001, REQ-002

---

## Non-Functional Requirements

### Build Performance
- `az bicep build --file bicep/main.bicep` completes in < 30 seconds
- `npm install` completes in < 60 seconds
- `npm start` (dev server) starts in < 15 seconds
- Playwright test suite completes in < 120 seconds

### Compatibility
- Azure CLI 2.60+ required
- Bicep CLI 0.30+ required
- Node.js 18+ required (LTS)
- Chromium browser for Playwright tests

### Maintainability
- All API versions documented in a comment block at the top of each Bicep file
- Nintendo character list easily extensible (array in separate module)
- Subscription ID stored as a config value, not hardcoded in multiple places

---

## Technical Considerations

### Architecture

The project architecture remains unchanged -- two-component system:

```
Bicep IaC Templates          React Helper UI
  bicep/main.bicep      <->   helper/src/config.json
  bicep/*.bicep                helper/src/components/
                               helper/src/configpresets/
```

The Helper UI reads defaults from `config.json`, renders FluentUI controls, and generates Azure CLI commands. Parameter names in the UI must match `main.bicep` parameter names exactly. `deployTab.js` only emits parameters that differ from defaults.

### Key Technical Decisions

1. **React 18.3 (not 19):** FluentUI v8 is not compatible with React 19. Staying on 18.3.1 (latest 18.x LTS) avoids a full FluentUI v9 migration.

2. **API Version Jump:** Going from `2024-01-01` to `2025-10-01` for ContainerService is a large jump. If schema breaking changes are found during `az bicep build`, consider stepping through `2025-05-01` first.

3. **KeyVault API Version Warning:** The upcoming `2026-02-01` KeyVault API defaults `enableRbacAuthorization` to `true`. We're using `2025-05-01` which still defaults to `false`. If the project's templates rely on access policies, this is important for future upgrades.

4. **Cilium as Default:** Setting `networkDataplane: 'cilium'` as the Bicep default means all deployments get Cilium unless explicitly overridden. This is acceptable for a personal lab fork.

5. **Config-Driven Subscription:** Store subscription ID in `config.json` rather than hardcoding in `deployTab.js` template strings, so it's easily changeable.

### Azure API Version Upgrade Map

| Resource | Current | Target |
|----------|---------|--------|
| `Microsoft.ContainerService/managedClusters` | `2024-01-01` | `2025-10-01` |
| `Microsoft.ContainerService/.../agentPools` | `2024-01-01` | `2025-10-01` |
| `Microsoft.Network/virtualNetworks` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/networkSecurityGroups` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/publicIPAddresses` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/applicationGateways` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/azureFirewalls` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/routeTables` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/privateEndpoints` | `2023-04-01` | `2025-05-01` |
| `Microsoft.Network/privateDnsZones` | `2020-06-01` | `2024-06-01` |
| `Microsoft.KeyVault/vaults` | `2022-07-01` | `2025-05-01` |
| `Microsoft.ManagedIdentity/userAssignedIdentities` | `2023-01-31` | `2024-11-30` |
| `Microsoft.ContainerRegistry/registries` | `2023-07-01` | `2025-11-01` |
| `Microsoft.OperationalInsights/workspaces` | `2022-10-01` | `2025-07-01` |
| `Microsoft.Insights/dataCollectionRules` | `2022-06-01` | `2024-03-11` |
| `Microsoft.KubernetesConfiguration/extensions` | `2022-11-01` | `2024-11-01` |
| `Microsoft.EventGrid/systemTopics` | `2023-06-01-preview` | `2025-02-15` |
| `Microsoft.Authorization/roleAssignments` | `2022-04-01` | `2022-04-01` (no change) |
| `Microsoft.Insights/diagnosticSettings` | `2021-05-01-preview` | `2021-05-01-preview` (no change) |

### Testing Strategy

**Bicep Validation:**
- `az bicep build --file bicep/main.bicep --outdir bicep/compiled` -- confirms template compiles
- PSRule analysis against regression parameter files

**Helper UI:**
- `npm start` -- manual smoke test of default state
- Playwright automated tests (10 spec files) updated for new defaults
- Visual inspection of generated CLI commands

**Post-Deploy:**
- `helm lint` on updated chart directories
- Verify chart version and appVersion in Chart.yaml

---

## Implementation Roadmap

### Phase 1: Bicep API Versions and Defaults
**Goal:** All Bicep files compile cleanly with latest API versions and new default parameter values.

**Validation Checkpoint:** `az bicep build --file bicep/main.bicep` exits 0 with 0 warnings.

### Phase 2: Helper UI Config and Presets
**Goal:** UI config mirrors Bicep defaults; 2 new presets replace 4 old ones.

**Validation Checkpoint:** `npm start` loads UI; default deploy command shows correct parameters.

### Phase 3: Nintendo Names, Subscription, and Deploy Tab
**Goal:** Cluster names are Nintendo-themed; subscription is hardcoded; Cilium moved to GA params.

**Validation Checkpoint:** Generated deploy command includes `az account set --subscription ...` and Nintendo name.

### Phase 4: npm Dependency Upgrades
**Goal:** All npm packages at latest compatible versions; no critical vulnerabilities.

**Validation Checkpoint:** `npm install && npm start` succeeds.

### Phase 5: Playwright Test Updates
**Goal:** All tests pass against new defaults and presets.

**Validation Checkpoint:** `npx playwright test --browser chromium .playwrighttests/ --reporter list` all green.

### Phase 6: Post-Deploy Tooling
**Goal:** Helm charts and scripts reference current cert-manager and external-dns versions.

**Validation Checkpoint:** `helm lint` passes on both charts.

### Task Dependencies

```
Phase 1 (Bicep) --> Phase 2 (UI Config) --> Phase 3 (Names/Deploy)
                                       \--> Phase 4 (npm) --> Phase 5 (Tests)
Phase 6 (Post-Deploy) -- independent, parallel with Phases 3-5
```

---

## Out of Scope

1. **CI/CD Workflow Updates**
   - Reason: GitHub Actions workflows are not needed for local lab usage
   - Future: Update if project is shared or CI is re-enabled

2. **FluentUI v9 Migration**
   - Reason: Would require rewriting all UI components; v8 is in maintenance but functional
   - Future: Consider when v8 reaches EOL

3. **React 19 Upgrade**
   - Reason: FluentUI v8 is not compatible with React 19
   - Future: Migrate alongside FluentUI v9

4. **Terraform Output Updates**
   - Reason: Lab deployments use Azure CLI directly
   - Future: Update if Terraform output is needed

5. **Actual Azure Deployment Testing**
   - Reason: PRD focuses on local build/run validation; deployment testing is a separate activity
   - Future: Test deployment to Norway East after all local validation passes

6. **Multi-Subscription Support**
   - Reason: Single subscription for lab use
   - Future: Parameterize if needed

---

## Open Questions & Risks

### Open Questions

#### Q1: Is Standard_D4ds_v6 Available in Norway East?
- **Current Status:** D-series v6 is GA in 56+ regions but Norway East availability unconfirmed
- **Options:** (A) Use `Standard_D4ds_v6` and verify, (B) Use `Standard_D4as_v6` (AMD, cheaper), (C) Keep `Standard_D4ds_v5` as fallback
- **Resolution:** Run `az vm list-skus --location norwayeast --query "[?name=='Standard_D4ds_v6']"` before implementation
- **Impact:** Low -- fallback to v5 if unavailable

#### Q2: Is Kubernetes 1.34.2 the Exact Patch Available in Norway East?
- **Current Status:** K8s 1.34 is GA on AKS; exact patch varies by region
- **Resolution:** Run `az aks get-versions --location norwayeast --query "values[?version=='1.34'].patchVersions"` before implementation
- **Impact:** Low -- use whatever 1.34.x patch is available

#### Q3: Will the AKS API `2025-10-01` Introduce Breaking Schema Changes?
- **Current Status:** Large version jump from `2024-01-01`; property renames or new required fields possible
- **Options:** (A) Jump directly to `2025-10-01`, (B) Step through `2025-05-01` first
- **Resolution:** Attempt direct jump; fall back to intermediate version if `az bicep build` fails
- **Impact:** Medium -- may require iterating on Bicep resource definitions

### Risks & Mitigation

| Risk | Likelihood | Impact | Severity | Mitigation | Contingency |
|------|------------|--------|----------|------------|-------------|
| API version breaking changes in `2025-10-01` | Medium | High | **High** | Run `az bicep build` immediately after each API version change | Step through intermediate versions (e.g., `2025-05-01`) |
| FluentUI 8.125 introduces regressions | Low | Medium | **Medium** | Pin to exact working version if issues found | Roll back to 8.103.2 |
| Playwright 1.50 API changes break tests | Medium | Medium | **Medium** | Update assertions to native Playwright API | Pin to a working intermediate version |
| Azure Linux v3 not yet default for K8s 1.34 in Norway East | Low | Low | **Low** | Verify with `az aks get-versions` | Use `AzureLinux` (auto-selects v3 for 1.32+) |
| npm audit finds critical vulnerabilities in upgraded packages | Low | High | **Medium** | Run `npm audit fix`; review any remaining vulnerabilities | Pin specific package versions that are clean |

---

## Validation Checkpoints

### Checkpoint 1: End of Phase 1 (Bicep)
**Criteria:**
- `az bicep build --file bicep/main.bicep` exits 0
- No warnings in build output
- `bicep/compiled/main.json` is generated successfully

**If Failed:** Check API version compatibility; review Bicep changelog for breaking property changes; try intermediate API versions.

### Checkpoint 2: End of Phase 2 (UI Config)
**Criteria:**
- `npm start` launches without errors
- Default state shows: K8s 1.34.2, Norway East, Azure Linux, CNI Overlay, Cilium, NAT Gateway
- Lab and Secure Lab presets render correctly
- Deploy tab generates valid `az` commands

**If Failed:** Compare config.json values against Bicep parameter names; verify preset JSON structure matches expected schema.

### Checkpoint 3: End of Phase 3 (Names/Deploy)
**Criteria:**
- Cluster name field shows Nintendo character name on page load
- Generated name is <= 20 characters
- Deploy command starts with `az account set --subscription 1869051d-48fc-4985-8631-addf990c15da`
- Cilium parameter appears in main params (not preview)

**If Failed:** Check `nintendoNames.js` export; verify `portalnav.js` import path; check `deployTab.js` command template.

### Checkpoint 4: End of Phase 5 (Tests)
**Criteria:**
- `npx playwright test --browser chromium .playwrighttests/ --reporter list` all green
- No `playwright-expect` references remain
- Tests validate new defaults (NAT Gateway, new presets)

**If Failed:** Run individual failing tests with `--debug` flag; check data-testid selectors match new UI state.

### Checkpoint 5: End of Phase 6 (Post-Deploy)
**Criteria:**
- `helm lint postdeploy/helm/certmanagerissuer/` passes
- `helm lint postdeploy/helm/externaldns/` passes
- No references to `k8s.gcr.io` remain (use `registry.k8s.io`)
- Chart versions bumped to 0.4.0

**If Failed:** Check Chart.yaml syntax; verify Helm is installed locally.

---

## Tasks

> **Ralphy Format**: All tasks below use `- [ ]` at column 1. Ralphy parses these with `grep '^\- \[ \]'`.
> Section headers provide context but are ignored by Ralphy's parser.

### Phase 1: Bicep API Versions and Defaults

- [x] Run `az aks get-versions --location norwayeast` to confirm K8s 1.34.x availability and exact patch version (REQ-002)
- [x] Run `az vm list-skus --location norwayeast --size Standard_D4` to confirm D-series v6 availability (REQ-002)
- [x] Update all API versions in `bicep/main.bicep` per the API Version Upgrade Map table (REQ-001)
- [x] Update all API versions in `bicep/network.bicep` -- 9 resources from 2020/2023 to 2024/2025 (REQ-001)
- [x] Update all API versions in `bicep/firewall.bicep` -- 4 resources from 2023 to 2025 (REQ-001)
- [x] Update all API versions in `bicep/nsg.bicep` -- 12 resources from 2022/2023 to 2025 (REQ-001)
- [x] Update API versions in `bicep/keyvault.bicep` and `bicep/keyvaultkey.bicep` from 2022 to 2025 (REQ-001)
- [x] Update API versions in `bicep/aksagentpool.bicep` from 2024-01-01 to 2025-10-01 (REQ-001)
- [x] Update API versions in `bicep/appgw.bicep` from 2023 to 2025 (REQ-001)
- [x] Update API versions in `bicep/dnsZone.bicep` from 2018/2020 to 2023/2024 (REQ-001)
- [x] Update API versions in `bicep/networkwatcherflowlog.bicep` from 2022/2023 to 2025 (REQ-001)
- [x] Scan all remaining `bicep/*.bicep` files for outdated API versions and update them (REQ-001)
- [x] Update parameter defaults in `bicep/main.bicep`: kubernetesVersion, osSKU, networkPluginMode, networkDataplane, aksOutboundTrafficType, natGwIpCount, natGwIdleTimeout, agentVMSize, podCidr, agentCount, maxCount (REQ-002)
- [x] Update `systemPoolPresets` variable in `bicep/main.bicep`: Standard pool count 3->1, maxCount 5->3, remove availability zones, update VM SKU to v6 (REQ-002)
- [x] Update system pool OS SKU logic in `bicep/main.bicep` to hardcode `'AzureLinux'` (REQ-002)
- [x] Run `az bicep build --file bicep/main.bicep` and fix any errors or warnings until clean (REQ-001, REQ-002)

### Phase 2: Helper UI Config and Presets

- [x] Update all default values in `helper/src/config.json` to match new Bicep defaults: kubernetesVersion, location, osSKU, vmSize, agentCount, maxCount, networkPluginMode, networkDataplane, aksOutboundTrafficType, natGwIpCount, natGwIdleTimeout, podCidr, maxPods, ingress (REQ-003)
- [x] Create `helper/src/configpresets/lab.json` with Lab preset: lean cluster, no monitoring/registry/ingress, stable upgrade, autoscale 1-3 (REQ-004)
- [x] Create `helper/src/configpresets/securelab.json` with Secure Lab preset: AAD+RBAC, Azure Policy audit, Cilium network policy, Basic ACR, Azure Monitor, KV CSI, workload identity (REQ-004)
- [x] Update `helper/src/index.js` to import lab.json and securelab.json instead of the 4 old preset files (REQ-004)
- [x] Remove old preset files: `baselines.json`, `entScale.json`, `gaming.json`, `principals.json` (REQ-004)
- [x] Update default preset key in `helper/src/components/portalnav.js` from `'defaultOps'` to the Lab preset default card key (REQ-004)
- [x] Run `npm start` and verify UI loads with new defaults and presets render correctly (REQ-003, REQ-004)

### Phase 3: Nintendo Names, Subscription, and Deploy Tab

- [x] Create `helper/src/nintendoNames.js` with 35+ Nintendo characters and `generateNintendoClusterName()` function returning `{character}-{3digits}` format (REQ-005)
- [x] Verify all Nintendo character names produce cluster names <= 20 characters total (REQ-005)
- [x] Update `helper/src/components/portalnav.js` to import and use `generateNintendoClusterName()` for initial cluster name (REQ-005)
- [x] Add `subscription` field to `helper/src/config.json` deploy defaults with value `1869051d-48fc-4985-8631-addf990c15da` (REQ-006)
- [x] Update `helper/src/components/deployTab.js` to prepend `az account set --subscription` command in Bash output (REQ-006)
- [x] Update PowerShell deploy command in `deployTab.js` to include subscription setting (REQ-006)
- [x] Move `networkDataplane` from `preview_params` to `params` in `deployTab.js` since Cilium is GA (REQ-007)
- [x] Run `npm start` and verify: Nintendo name in cluster field, subscription in deploy command, Cilium in main params (REQ-005, REQ-006, REQ-007)

### Phase 4: npm Dependency Upgrades

- [x] Update `helper/package.json` dependencies: react 18.3.1, react-dom 18.3.1, @fluentui/react 8.125.4, @fluentui/azure-themes latest 8.x, @playwright/test 1.50+, applicationinsights-web 3.3.0, web-vitals 4.2.0 (REQ-008)
- [x] Remove `playwright-expect` from package.json devDependencies (REQ-008)
- [x] Run `npm install` and resolve any peer dependency conflicts (REQ-008)
- [x] Run `npm audit` and fix any critical/high vulnerabilities (REQ-008)
- [x] Run `npm start` and verify UI still works after dependency upgrades (REQ-008)

### Phase 5: Playwright Test Updates

- [x] Update `helper-test-managednatgw.spec.js` to expect NAT Gateway as the default egress option instead of Load Balancer (REQ-009)
- [x] Update `helper-test-main-presets.spec.js` to use new Lab/Secure Lab preset URL parameters (REQ-009)
- [x] Update `helper-export-az-commands.spec.js` to use new preset data-testid selectors (REQ-009)
- [x] Remove all `playwright-expect` imports and `expect.extend(matchers)` calls from test files; replace `toMatchText()` with native Playwright `toHaveText()` (REQ-009)
- [x] Review and update any other test files referencing old preset keys or outdated default values (REQ-009)
- [x] Run full Playwright test suite: `npx playwright test --browser chromium .playwrighttests/ --reporter list` and fix all failures (REQ-009)

### Phase 6: Post-Deploy Tooling

- [x] Update cert-manager reference version in `postdeploy/scripts/certmanager-install.sh` from v1.8.0 to v1.17.x LTS (REQ-010)
- [x] Update `postdeploy/helm/certmanagerissuer/Chart.yaml` appVersion and bump chart version to 0.4.0 (REQ-010)
- [x] Update `postdeploy/helm/externaldns/Chart.yaml` appVersion from v0.11.0 to v0.15.1 and bump chart version to 0.4.0 (REQ-010)
- [x] Update `postdeploy/helm/externaldns/values.yaml` image registry from `k8s.gcr.io` to `registry.k8s.io` and update tag (REQ-010)
- [x] Remove old Helm chart packages: `Az-CertManagerIssuer-0.3.0.tgz`, `externaldns-0.3.0.tgz`, `externaldns-0.2.0.tgz` (REQ-010)
- [x] Build new Helm chart packages with `helm package` (REQ-010)
- [x] Run `helm lint` on both updated chart directories (REQ-010)

---

**End of PRD**

*This PRD is optimized for Ralphy's checkbox task format. All tasks use `- [ ]` at column 1 for automated parsing. Section headers provide context for the AI agent executing tasks.*
