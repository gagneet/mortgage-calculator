# System Architecture

_Last updated: 2026-04-13_

---

## 1. Current Architecture — Frontend-Only SPA

The current release is a **client-side-only React single-page application**. All financial calculations execute in the user's browser; there is no API server and no database.

```mermaid
flowchart TD
    subgraph Browser["Browser (Client)"]
        direction TB
        UI["App.js\nReact UI Component"]
        CFG["features.js\nFeature Toggles"]
        ENG["mortgage.js\nCalculation Engine"]
        CHART["Recharts\nAmortization Chart"]

        UI -->|reads| CFG
        UI -->|calls| ENG
        ENG -->|returns schedule| UI
        UI -->|passes data| CHART
    end

    User(["Australian User"]) -->|HTTPS GET| Browser
```

### Component Responsibilities

| File | Role |
|------|------|
| `src/App.js` | Stateful React component. Owns all form inputs, calls calculation functions via `useMemo`, renders summary panel and chart |
| `src/utils/mortgage.js` | Pure calculation functions: LVR, LMI, stamp duty, repayment formula, amortization schedule |
| `src/config/features.js` | Build-time feature flags consumed by `App.js` to show/hide UI sections and conditionally apply offset/extra repayment in calculations |
| `scripts/deploy.sh` | CI-compatible build-test-copy script for Ubuntu servers |

---

## 2. Calculation Data Flow

```mermaid
flowchart LR
    IN["User Inputs\n(loan, rate, term,\nfrequency, state…)"] --> LVR["calculateLvr()"]
    IN --> LMI["estimateLmi()"]
    IN --> DUTY["estimateStampDuty()"]
    IN --> AMORT["calculateAmortization()"]

    LVR --> SUM["Loan Summary Panel"]
    LMI --> SUM
    DUTY --> SUM
    AMORT --> SUM
    AMORT -->|schedule array| CHART["Recharts LineChart\n(balance over time)"]
```

### Amortization Loop (per period)

```mermaid
flowchart TD
    START([period = 1]) --> OFFSET["interestBase = max(balance − safeOffset, 0)"]
    OFFSET --> INTEREST["interest = interestBase × periodicRate"]
    INTEREST --> REPAY["effectiveRepayment = max(baseRepayment + safeExtra, interest)"]
    REPAY --> PRINCIPAL["principalPaid = min(effectiveRepayment − interest, balance)"]
    PRINCIPAL --> UPDATE["balance −= principalPaid\ntotalInterest += interest"]
    UPDATE --> PUSH["push schedule entry"]
    PUSH --> CHECK{balance > 0.01\nAND period ≤ maxPeriods}
    CHECK -->|Yes| START
    CHECK -->|No| RETURN([return summary + schedule])
```

---

## 3. Feature Toggle Flow

```mermaid
flowchart LR
    CFG["src/config/features.js\n{ showOffsetAccount: true\n  showExtraRepayment: true\n  showUpfrontCosts: true }"]

    CFG -->|showOffsetAccount| OFF_IN["Offset Balance Input\n(rendered in form)"]
    CFG -->|showOffsetAccount| OFF_CALC["offsetBalance passed to\ncalculateAmortization()"]

    CFG -->|showExtraRepayment| EXT_IN["Extra Repayment Input\n(rendered in form)"]
    CFG -->|showExtraRepayment| EXT_CALC["extraRepayment passed to\ncalculateAmortization()"]

    CFG -->|showUpfrontCosts| DUTY_OUT["Stamp Duty line\n(rendered in summary)"]
```

> **Current limitation:** toggles are hard-coded at build time. Changing a toggle requires a code commit and full redeploy. Phase 3 of the roadmap migrates this to `REACT_APP_*` environment variables or a remote config service.

---

## 4. Deployment Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / CI
    participant Script as scripts/deploy.sh
    participant Host as Ubuntu Server

    Dev->>Script: ./scripts/deploy.sh /var/www/mortgage-calculator
    Script->>Host: npm ci
    Note over Host: Clean install from package-lock.json
    Script->>Host: CI=true npm test -- --watchAll=false
    Note over Host: Aborts on any test failure
    Script->>Host: npm run build
    Note over Host: Creates /build directory
    Script->>Host: rm -rf /TARGET/* && cp -R build/* /TARGET
    Note over Host: Atomic replace; refuses to deploy to / or empty path
    Host-->>Dev: "Deployment complete: /TARGET"
```

---

## 5. Proposed Production Architecture (Next Phase)

When backend persistence is added, the target architecture is:

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        SPA["React SPA"]
    end

    subgraph Edge["Edge / Hosting"]
        CDN["CDN\nStatic Assets + Cache-Control Headers"]
    end

    subgraph API["API Layer (Node.js / FastAPI)"]
        REST["REST Endpoints\n/api/scenarios\n/api/rates\n/api/toggles"]
    end

    subgraph Data["Data Layer"]
        DB[("PostgreSQL\nScenarios + Users\n+ Rule Tables")]
        CACHE["Redis\n(rate-rule cache)"]
    end

    subgraph Config["Config"]
        FLAGS["Feature Toggle Service\n(LaunchDarkly / env vars)"]
    end

    User(["User"]) --> CDN --> SPA
    SPA -->|JSON API calls| REST
    REST --> DB
    REST --> CACHE
    REST --> FLAGS
```

### API Surface (proposed)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/scenarios` | Save a new mortgage scenario |
| `GET` | `/api/scenarios/:id` | Retrieve a saved scenario with results |
| `GET` | `/api/rates/stamp-duty` | Return versioned stamp duty brackets by state |
| `GET` | `/api/rates/lmi` | Return versioned LMI rate tiers |
| `GET` | `/api/toggles` | Return current feature toggle state |

---

## 6. Component Dependency Graph

```mermaid
graph LR
    App["App.js"] --> mortgage["utils/mortgage.js"]
    App --> features["config/features.js"]
    App --> recharts["recharts (external)"]
    mortgage --> intl["Intl.NumberFormat (built-in)"]

    AppTest["App.test.js"] --> App
    AppTest --> rtl["@testing-library/react"]

    MortgageTest["mortgage.test.js"] --> mortgage
```

---

## 7. Runtime Characteristics

| Property | Value |
|----------|-------|
| Bundle size (gzip) | 159 KB (measured: `npm run build`, React 19 + Recharts 2.x) |
| Calculation complexity | O(n) where n = years × periods/year (max 1 560 for 30-yr weekly) |
| Browser support | Modern evergreen browsers (no IE) |
| Network calls at runtime | None (current release) |
| Server requirement | Any static file host (nginx, Apache, Netlify, S3+CloudFront) |
