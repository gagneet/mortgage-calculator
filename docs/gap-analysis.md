# Gap Analysis — Australian Mortgage Calculator

_Last updated: 2026-04-13_

---

## 1. Bugs Fixed This Session

| # | File | Issue | Fix Applied |
|---|------|--------|-------------|
| B1 | `src/utils/mortgage.js:119` | `safeExtra` was referenced but never defined, causing `ReferenceError` at runtime and in all amortization tests | Defined `safeExtra = Math.max(0, extraRepayment)` before the loop; used consistently |
| B2 | `src/utils/mortgage.js:102–104` | Negative `offsetBalance` and `extraRepayment` were passed through unclamped, producing wrong interest and period counts | Replaced bare references with `safeOffset` / `safeExtra` (both clamped to ≥ 0) |
| B3 | `src/utils/mortgage.js:65–66` | `calculateRepayment` threw `Error` for an unknown frequency; test contract expected `0` return | Changed to `return 0` for invalid frequency, `principal ≤ 0`, or `years ≤ 0` |
| B4 | `src/App.js:112` | `FREQUENCY_LABELS` used but never declared; caused `ReferenceError` crashing the component | Added `const FREQUENCY_LABELS = { monthly, fortnightly, weekly }` constant |

---

## 2. Open Code Issues

### 2.1 QLD Stamp Duty Rates Are Inaccurate

**File:** `src/utils/mortgage.js`, `STATE_STAMP_DUTY_RULES.QLD`

| Bracket | Implemented base | Implemented rate | Correct base (OSR 2024) | Correct rate |
|---------|-----------------|-----------------|------------------------|-------------|
| $0–$75 000 | 0 | 1.50 % | 0 | **0.75 %** |
| $75 001–$540 000 | **0** | 3.50 % | **$562.50** | 3.50 % |
| $540 001–$1 000 000 | $17 325 | 4.50 % | $17 325 | 4.50 % |
| > $1 000 000 | **$37 825** | 5.75 % | **$38 025** | 5.75 % |

Impact: for properties under $75 k, duty is doubled; for $75 k–$540 k, the accumulated lower-bracket duty ($562.50) is omitted entirely.

### 2.2 NSW and VIC Last-Bracket Base Rounding

The accumulated bases for the final brackets in NSW and VIC are off by small amounts (≤ $200) due to integer rounding of intermediate values. These propagate linearly for high-value properties.

### 2.3 Only Three States Supported

NSW, VIC and QLD are hard-coded. SA, WA, TAS, ACT and NT are silently mapped to NSW rules (via `?? STATE_STAMP_DUTY_RULES.NSW`). The dropdown also only offers NSW / VIC / QLD, but any future API call or deep-link could supply an unsupported state code.

### 2.4 Spurious `state` and `includeLmi` in `summary` useMemo Dependency Array _(Fixed)_

**File:** `src/App.js:47`

```js
// state is NOT read inside calculateAmortization — it is redundant here
[principal, annualRate, termYears, frequency, offsetBalance, extraRepayment, state, includeLmi]
```

`state` affects `stampDuty` only (its own `useMemo`). Its presence in the summary deps causes an unnecessary full amortization re-run whenever the state dropdown changes. Low impact today; will matter with a 30-year weekly schedule (780 loop iterations) on low-end devices.

Similarly, `includeLmi` is already captured through `principal` — it is redundant but harmless.

### 2.5 No UI Input Validation

Inputs accept any numeric value. The following produce silent wrong results or 0:

- `loanAmount = 0` or negative → amortization returns an empty schedule
- `annualRate = 0` → zero-interest path (correct mathematically, but no UI affordance)
- `termYears = 0` → returns 0 periods with no warning
- `propertyValue < loanAmount` → LVR > 100 % (renders but is financially invalid)
- `offsetBalance > loanAmount` → valid mathematically (all interest eliminated), no warning shown

### 2.6 No React Error Boundary

If `calculateAmortization` throws (e.g., future frequency validation regression), the entire component tree unmounts with a blank screen. A top-level `<ErrorBoundary>` would show a friendly fallback.

### 2.6b Missing `public/` Directory and React Entry Files _(Fixed)_

`public/index.html` (the react-scripts HTML template), `src/index.js` (the React DOM entry point), `src/index.css`, `tailwind.config.js`, and `postcss.config.js` were all absent from the working tree — deleted at an earlier point in the repository's history. Without these files, `npm run build` fails with "Could not find a required file: index.html".

All five files were restored from git history. **`npm run build` now compiles cleanly with zero warnings.**

### 2.6c `package.json` `homepage` Field Causes Wrong Asset Paths _(Fixed)_

The `homepage` field was set to the GitHub README URL (`https://github.com/gagneet/mortgage-calculator#readme`). `react-scripts` interprets this as a base path, making every asset reference in the built `index.html` use the path prefix `/gagneet/mortgage-calculator/`. A server hosting the app at `/` would return 404s for all JavaScript and CSS bundles.

Fixed by setting `"homepage": "."` — this uses relative asset paths that work regardless of the server's base URL.

### 2.6d Circular Self-Reference in `dependencies` _(Fixed)_

`package.json` listed `"mortgage-calculator": "file:"` in `dependencies`, a package referencing itself. This resolves to the project root and silently adds it to `node_modules`. Removed.

### 2.7 `sheetjs` Is an Unused Dependency

`package.json` lists `"sheetjs": "^2.0.0"` — a dependency of the legacy `index.html` calculator — but no file in `src/` imports it. It adds ~600 KB (gzipped: ~220 KB) to the dependency graph and will be included in the audited node_modules.

**Fix:** `npm uninstall sheetjs`

### 2.8 Static Feature Toggles Cannot Change Without Redeployment

`src/config/features.js` is a hard-coded JS module. Toggling a feature requires a code change, commit, test run, and full redeploy.  
Recommended: load toggles from an environment variable bundle at build time (`REACT_APP_FEATURE_*`) or from a remote config endpoint at startup.

### 2.9 No ARIA Labels on Form Inputs

All `<input>` elements are wrapped in `<label>` tags but have no `id`/`htmlFor` pairing and no `aria-label` or `aria-describedby`. Screen readers will announce the label text but assistive technology compatibility is fragile.

### 2.10 `recharts` Version Pinned Too Loosely

`"recharts": "^2.7.2"` allows any 2.x minor upgrade. Recharts 2.x has had breaking prop changes between minors (e.g., `AreaChart` API). Pin to an exact minor or upgrade to Recharts 3.x (now stable).

---

## 3. Test Coverage Gaps (Prior to This Session)

| Gap | Status |
|-----|--------|
| `calculateRepayment` invalid-input contract (return 0 not throw) | Fixed — test now passes |
| Negative clamping in `calculateAmortization` | Fixed — test now passes |
| All three repayment frequencies (weekly math) | Missing — not covered |
| `estimateLmi` all four LVR tiers | Missing — only 90 % LVR tested |
| `calculateLvr` edge cases (0 propertyValue) | Missing |
| `formatAud` output format | Missing |
| Amortization schedule array structure | Missing |
| App rendering: feature toggles off | Missing |
| App rendering: repayment label text (Monthly / Fortnight / Week) | Missing |
| App rendering: LMI capitalization checkbox toggle | Missing |

---

## 4. Architecture / Infrastructure Gaps

| Gap | Risk |
|-----|------|
| No backend API | Inputs and results are never persisted; no audit trail |
| No database | No saved scenarios, no comparison history |
| No CI/CD pipeline | Tests only run manually or via `deploy.sh`; no branch protection |
| No E2E tests | Browser-level regressions are undetected until production |
| No CDN / static hosting strategy | The deploy script copies files to a local directory; no cache-busting headers |
| No HTTPS configuration | `deploy.sh` drops files into a directory; TLS and reverse-proxy config is out of scope |

---

## 5. Compliance / Financial-Advice Risks

| Risk | Severity |
|------|----------|
| Stamp duty and LMI figures are simplified estimates | Medium — must not be presented as definitive |
| No versioning of tax/fee rules | High — rule changes silently apply to historical calculations |
| No ASIC/RG 36 disclaimer | High — any digital tool providing financial estimates in Australia requires a disclaimer |
| No jurisdiction enforcement | Low — users can select states but tool does not block unsupported ones |

---

## 6. Recommended Roadmap

### Phase 1 — Accuracy & Quality (immediate)
1. Correct QLD stamp duty rates and base values; add tolerance-based tests for all state/bracket combos.
2. Remove the spurious `state` dep from the summary `useMemo`.
3. Uninstall `sheetjs`.
4. Add minimal input validation (clamp/warn for invalid ranges).
5. Add financial disclaimer text in the UI.

### Phase 2 — Test & Tooling
1. Complete missing unit tests for all LMI tiers, all frequencies, schedule structure.
2. Add React Error Boundary around `<App />`.
3. Add accessibility attributes (`id`, `htmlFor`, `aria-describedby`) to all form controls.
4. Set up a CI pipeline (GitHub Actions) gating merges on `npm test`.

### Phase 3 — Feature Toggles & Config
1. Replace static `features.js` with `REACT_APP_*` env-var flags, readable at build time.
2. Document toggle semantics in `CLAUDE.md` and here.

### Phase 4 — Backend & Persistence
1. Implement a REST/GraphQL API service (Node.js or Python FastAPI).
2. Provision PostgreSQL with the schema defined in `docs/architecture/database-schema.md`.
3. Add versioned stamp-duty and LMI rule tables to support auditable historical calculations.
4. Introduce user authentication for saved scenarios.

### Phase 5 — E2E & Observability
1. Add Playwright E2E tests for the golden path (fortnightly 30 yr loan with offset).
2. Add structured logging and error tracking (e.g., Sentry) to the frontend.
3. Add performance monitoring for calculation-intensive scenarios (weekly, 30 yr = 1 560 periods).
