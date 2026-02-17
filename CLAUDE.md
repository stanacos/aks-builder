# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AKS Construction is an Azure open-source project that provides modular Bicep IaC templates and a React-based configuration Helper UI to deploy fully configured AKS (Azure Kubernetes Service) environments. It implements guidance from the AKS Secure Baseline, Well Architected Framework, Cloud Adoption Framework, and Azure Landing Zones.

## Architecture

The project has two main components that work together:

### Bicep IaC (`bicep/`)
- `main.bicep` is the single entry point (~65K lines) that references all other bicep modules in the same directory
- Modules are organized by Azure resource area: `network.bicep`, `firewall.bicep`, `appgw.bicep`, `keyvault.bicep`, `aksagentpool.bicep`, `aksmetricalerts.bicep`, `nsg.bicep`, `dnsZone.bicep`, etc.
- `main.bicep` sections follow this order: Networking, DNS, Key Vault, Container Registry, Firewall, Application Gateway, AKS, Monitoring/Log Analytics, Telemetry
- `bicepconfig.json` enforces linting rules (e.g., `no-hardcoded-location` is error-level, `simplify-interpolation` is error-level)
- Releases compile bicep to ARM JSON (`main.json`) for consumption

### Helper Web App (`helper/`)
- React SPA built with Create React App and FluentUI (`@fluentui/react`)
- Hosted on GitHub Pages at `https://azure.github.io/AKS-Construction/`
- `src/config.json` provides all default values (structured as `tabLabels` + `defaults` keyed by tab: `deploy`, `cluster`, `addons`, `net`)
- URL parameter overrides: any default can be overridden via `?tab.field=value` (e.g., `?cluster.vmSize=Standard_D8ds_v6`). URL params are also updated live as users change values (bookmarkable configs)
- UI component structure in `src/components/`:
  - `portalnav.js` — main SPA shell, initializes tab values from `config.json` defaults + URL params, manages all cross-tab validation
  - Tab components: `clusterTab.js`, `addonsTab.js`, `networkTab.js`, `deployTab.js`
  - `deployTab.js` generates Azure CLI/PowerShell/GitHub Actions/Terraform deployment commands
  - `common.js` — shared utilities (`adv_stackstyle`, `getError`, `hasError`, `CodeBlock`)
- Parameter names in the UI must match `main.bicep` parameter names exactly
- `deployTab.js` only outputs parameters that differ from defaults (keeping deployment scripts tight)
- `deployTab.js` has a dual parameter system: `params` for GA features, `preview_params` for preview/beta features (toggled by `deploy.disablePreviews`)

#### State Management Flow
State flows through the app as follows:
1. `src/index.js` loads `config.json` as `baseConfig` and passes it to `App` via `ConfigContext`
2. `portalnav.js` initializes `tabValues` state from config defaults, then overlays URL params
3. Each tab receives `tabValues`, `defaults`, and an `updateFn` prop bound to its tab key
4. `updateFn(field, value)` calls `mergeState` which updates both React state and the URL query string
5. All validation runs in `portalnav.js` via `invalidFn(page, field, invalid, message)` — errors propagate to tabs via `invalidArray`
6. `deployTab.js` reads the full `tabValues` and `defaults` to compute the diff and generate deployment commands

### Post-Deploy (`postdeploy/`)
- Helm charts (`certmanagerissuer`, `externaldns`) and k8s manifests for post-cluster-creation configuration
- Shell/PowerShell scripts for cert-manager, external DNS, and testing

## Development Commands

### Helper Web App
```bash
cd helper
npm install
npm start          # Runs on port 3000 at /AKS-Construction
npm run build      # Production build (CI=false to avoid warnings blocking build)
```

### Playwright Tests
```bash
cd helper
npx playwright install
npx playwright install-deps chromium

# Run all tests (dev server must be running on port 3000)
npx playwright test --browser chromium .playwrighttests/ --reporter list

# Run a single test file
npx playwright test --browser chromium .playwrighttests/helper-test-ingress.spec.js --reporter list

# Run tests matching a name pattern
npx playwright test --browser chromium .playwrighttests/ -g "networkpolicy" --reporter list
```

The default `npm test` runs only the fragile test: `helper-fragile-test-fullsecure.spec.js`. Tests in `.playwrighttests/` use `data-testid` attributes to navigate the DOM. Playwright config (`playwright.config.js`) uses 4 workers with 1 retry. Tests navigate tabs via `[data-testid="portalnav-Pivot"] > button:nth-child(N)` where N is the 1-indexed tab position (1=Deploy, 2=Cluster, 3=Addons, 4=Networking).

### Bicep Validation
```bash
az bicep build --file bicep/main.bicep --outdir bicep/compiled
```

### PSRule (Well Architected Analysis)
```powershell
Install-Module -Name 'PSRule.Rules.Azure' -Repository PSGallery -Scope CurrentUser
$paramPath="./.github/workflows_dep/regressionparams/optimised-for-well-architected.json"
Assert-PSRule -Module 'PSRule.Rules.Azure' -InputPath $paramPath -Format File -outcome Processed
```

## CI/CD Workflows

Key workflows in `.github/workflows/`:
- `bicepBuild.yml` — Compiles bicep on PR, detects parameter changes, comments diff on PR
- `StandardCI.yml` / `ByoVnetCI.yml` / `ByoVnetPrivateCI.yml` — Infrastructure deployment CI (validate + deploy)
- `regressionparams.yml` — Validates multiple parameter files in `.github/workflows_dep/regressionparams/` against bicep
- `ghpages.yml` / `ghpagesTest.yml` — Build and test the Helper web app for GitHub Pages
- `release.yml` / `release-soft.yml` — Publish releases (bicep + helper)
- `markdownchecks.yml` — Spell checking with cspell
- `Lighthouse.yml` — Accessibility/SEO/performance checks on the Helper

## Key Conventions

- **Parameter defaults**: New bicep parameters must use the least obtrusive default value. The same default must be replicated in `helper/src/config.json`
- **Bicep-UI coupling**: Every new `main.bicep` parameter should have a corresponding FluentUI control in the appropriate tab component. Preview features use the `preview_params` variable in `deployTab.js` instead of `params`
- **Default-diffing in deployTab.js**: Parameters are only emitted when they differ from `config.json` defaults, using the pattern: `...(value !== defaults.tab.field && { paramName: value })`. When config.json defaults intentionally differ from bicep defaults (e.g., automation schedule defaults), the emission logic must always emit those params regardless of whether they match config.json, to ensure bicep receives the correct values
- **Regression params**: Breaking changes (parameter renames, default changes) must be covered by a regression parameter file in `.github/workflows_dep/regressionparams/`
- **Playwright tests**: Use `data-testid` attributes. The `fragile` keyword in test filenames indicates learning/WIP tests; removing it promotes to core tests
- **Branching**: Feature branches PR to main. The `develop` branch is used for full CI testing (primarily for fork contributions)

## Adding a New Bicep Parameter to the Helper

1. Add the parameter to `bicep/main.bicep`
2. Add the matching default value to `helper/src/config.json` under the appropriate tab key
3. Add a FluentUI control in the appropriate `*Tab.js` component, wiring it to `updateFn(fieldName, value)`
4. Add the parameter to `deployTab.js` in `params` (or `preview_params` for preview features) with default-diffing logic
5. Add `data-testid` attribute to the control and write a Playwright test
