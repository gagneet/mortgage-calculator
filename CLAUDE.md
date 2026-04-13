# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start                          # Dev server at localhost:3000
npm run build                      # Production bundle → /build
npm test                           # Jest in watch mode
CI=true npm test -- --watchAll=false  # Run all tests once (non-interactive)
npm test mortgage.test             # Run a single test file
npm test -- --testNamePattern="calculates LVR"  # Run tests matching a name
```

Linting is enforced by ESLint via `react-scripts` (extends `react-app` and `react-app/jest`); it runs implicitly during `build` and `test`.

Deployment: `scripts/deploy.sh` runs `npm ci` → tests (CI mode) → build → copies to target directory.

## Architecture

This is a **frontend-only React SPA** — all mortgage calculations happen client-side with no backend or persistence layer.

### Calculation engine: `src/utils/mortgage.js`

The core financial logic lives here:
- `calculateMortgage(inputs)` — orchestrates all calculations and returns the summary object consumed by the UI
- Repayment frequencies: **monthly** (12/yr), **fortnightly** (26/yr), **weekly** (52/yr) via a `periodsPerYear` map
- **LVR/LMI**: LVR = loan / property value; LMI is estimated when LVR > 80%
- **Stamp duty**: tiered bracket rules for NSW, VIC, and QLD; no stamp duty for other states
- **Offset account**: reduces the principal used for interest calculation each period
- **Extra repayments**: added on top of the minimum repayment each period; shortens loan term
- Amortization schedule is returned as an array for the balance chart

### UI: `src/App.js`

Single component that renders the input form, calls `calculateMortgage`, displays summary metrics, and renders the amortization balance chart (Recharts `AreaChart`).

### Feature flags: `src/config/features.js`

Static boolean flags that control which UI sections are visible (`showOffsetAccount`, `showExtraRepayment`, `showUpfrontCosts`). Toggle these to enable/disable features without changing App.js.

### Tests

- `src/utils/mortgage.test.js` — unit tests for the calculation engine (LVR/LMI, stamp duty, repayment amounts, offset + extra repayment scenarios)
- `src/App.test.js` — smoke test for component rendering
- `src/setupTests.js` — mocks `ResizeObserver` for Recharts compatibility in Jest

## Key domain concepts

- **LVR** (Loan-to-Value Ratio): loan amount ÷ property value; LMI typically applies above 80%
- **LMI** (Lenders Mortgage Insurance): protects the lender, paid by borrower when LVR > 80%
- **Offset account**: a linked account whose balance offsets the loan principal for interest purposes
- **Fortnightly repayments** (26/yr) save interest vs. monthly because extra repayments are made each year
- All monetary values are in AUD; use `formatAud()` (defined in `App.js`) for display

## Documentation

- `docs/gap-analysis.md` — current state findings and planned improvements
- `docs/architecture/system-architecture.md` — current frontend-only architecture and proposed API + PostgreSQL backend
- `docs/architecture/database-schema.md` — proposed schema for persisting user scenarios and results
