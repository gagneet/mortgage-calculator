# System Architecture

## Current Application Shape

This repository currently ships a **frontend-only** React SPA. There is no backend API or database runtime dependency.

```mermaid
flowchart LR
    U[Australian User] --> B[Browser]
    B --> A[React SPA]
    A --> C[Mortgage Engine - client utils]
    C --> D[UI Summary + Chart]
```

## Proposed Production Architecture

```mermaid
flowchart LR
    U[User] --> CDN[CDN / Static Hosting]
    CDN --> SPA[React SPA]
    SPA --> API[API Service]
    API --> DB[(PostgreSQL)]
    API --> CFG[Feature Toggle Config]
    API --> RATES[Reference Tables\nStamp Duty / LMI Bands]
```

## Runtime Components

- `src/App.js` – Main Australian mortgage UI and result rendering.
- `src/utils/mortgage.js` – Core calculation engine for repayments, amortization, LVR/LMI, and stamp duty estimates.
- `src/config/features.js` – Feature toggles used by the UI.
- `scripts/deploy.sh` – Ubuntu-friendly build/test/deploy script for static output.

## Deployment Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer/CI
    participant Host as Ubuntu Server
    Dev->>Host: ./scripts/deploy.sh /var/www/mortgage-calculator
    Host->>Host: npm ci
    Host->>Host: npm test (CI mode)
    Host->>Host: npm run build
    Host->>Host: copy build/* to target directory
```
