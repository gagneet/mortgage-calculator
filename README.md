# Australian Mortgage Calculator (React)

A React single-page application for estimating Australian home loan repayments.

## What it does

- Calculates amortized repayments in **AUD**.
- Supports **monthly, fortnightly, and weekly** repayment frequencies.
- Estimates **LVR** and **LMI** impact.
- Estimates **stamp duty** for NSW/VIC/QLD (simplified model).
- Supports **offset account balance** and **extra recurring repayments**.
- Shows summary metrics and an amortization balance chart.

> Important: This tool provides estimates only and is not financial advice.

## Tech Stack

- React 19
- Recharts (visualization)
- React Testing Library + Jest

## Project Structure

- `src/App.js` – Main calculator UI
- `src/utils/mortgage.js` – Core financial calculations
- `src/config/features.js` – Feature toggles
- `src/utils/mortgage.test.js` – Calculator utility tests
- `docs/gap-analysis.md` – Findings and modernization gaps
- `docs/architecture/*` – Architecture + schema documentation
- `scripts/deploy.sh` – Build/test/deploy helper for Ubuntu

## Local Development

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## Testing

```bash
CI=true npm test -- --watchAll=false
```

## Production Build

```bash
npm run build
```

## Deploy on Ubuntu

```bash
./scripts/deploy.sh /var/www/mortgage-calculator
```

The script will:
1. run `npm ci`
2. run tests in CI mode
3. build static assets
4. copy build output to the target directory

## Database and Backend Status

This repository currently has **no backend service and no live database integration**. Proposed schema and architecture for that next phase are documented under `docs/architecture/`.
