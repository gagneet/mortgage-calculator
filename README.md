# Australian Mortgage Calculator

A React single-page application for estimating Australian home loan repayments in AUD. All calculations happen client-side; there is no backend service or database in the current release.

> **Disclaimer:** This tool provides estimates only and is not financial advice. Stamp duty and LMI figures are simplified models and may differ from official lender or government calculations.

---

## Features

- **Repayment frequencies:** monthly (12/yr), fortnightly (26/yr), weekly (52/yr)
- **LVR calculation** (Loan-to-Value Ratio) with automatic LMI estimate when LVR > 80 %
- **LMI capitalisation:** option to roll the LMI premium into the loan principal
- **Stamp duty estimate** for NSW, VIC and QLD using tiered bracket rules
- **Offset account** balance reduces the interest base each period
- **Extra repayments** per period shorten the loan term
- **Amortization balance chart** showing remaining balance over the full loan term
- **Feature flags** controlling optional UI sections (see `src/config/features.js`)

---

## Tech Stack

| Layer | Library | Version |
|-------|---------|---------|
| UI framework | React | 19.x |
| Charts | Recharts | 2.x |
| Styling | Tailwind CSS | 3.x |
| Tests | Jest + React Testing Library | via react-scripts |

---

## Project Structure

```
src/
  App.js                  Main calculator UI component
  config/
    features.js           Feature toggle flags (static, build-time)
  utils/
    mortgage.js           Core financial calculation engine
    mortgage.test.js      Unit tests for calculation functions
  App.test.js             Component integration tests
  setupTests.js           Jest/RTL global setup (ResizeObserver mock)

docs/
  gap-analysis.md         Known gaps, bugs, and improvement roadmap
  architecture/
    system-architecture.md  Architecture diagrams and component map
    database-schema.md      Proposed PostgreSQL schema for future backend

scripts/
  deploy.sh               Build-test-deploy script for Ubuntu servers
```

---

## Local Development

```bash
npm install
npm start          # dev server at http://localhost:3000
```

---

## Testing

```bash
# Run all tests once (non-interactive, CI-compatible)
CI=true npm test -- --watchAll=false

# Watch mode (development)
npm test

# Run a single test file
npm test mortgage.test

# Run tests matching a name pattern
npm test -- --testNamePattern="LVR and LMI"
```

### What is tested

| File | Coverage |
|------|----------|
| `mortgage.test.js` | LVR/LMI tiers, stamp duty all states/brackets, repayment formula, invalid inputs, offset + extra repayment, negative clamping, schedule structure, formatAud, all frequencies |
| `App.test.js` | Component rendering, feature toggle visibility, repayment frequency labels, summary fields |

---

## Feature Toggles

Controlled by `src/config/features.js`:

| Toggle | Default | Effect when `true` |
|--------|---------|-------------------|
| `showOffsetAccount` | `true` | Renders offset balance input; applies offset in calculation |
| `showExtraRepayment` | `true` | Renders extra repayment input; applies in amortization |
| `showUpfrontCosts` | `true` | Shows stamp duty estimate in Loan Summary panel |

> Changing a toggle requires a code change and redeployment. See `docs/gap-analysis.md` Phase 3 for the env-var migration plan.

---

## Production Build

```bash
npm run build          # outputs static assets to /build
```

---

## Deploy to Ubuntu Server

```bash
./scripts/deploy.sh /var/www/mortgage-calculator
```

The script executes four steps in order:

1. `npm ci` — clean dependency install
2. `CI=true npm test -- --watchAll=false` — full test suite (aborts on failure)
3. `npm run build` — production bundle
4. Copies `build/*` to the target directory (target must not be `/` or empty)

Requires `npm` on `$PATH`. Use `sudo` if the target directory requires elevated permissions.

---

## Architecture & Database

The current release is **frontend-only**. Proposed backend architecture (API + PostgreSQL) is documented in:

- [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md)
- [`docs/architecture/database-schema.md`](docs/architecture/database-schema.md)

Known gaps and the improvement roadmap are in [`docs/gap-analysis.md`](docs/gap-analysis.md).
