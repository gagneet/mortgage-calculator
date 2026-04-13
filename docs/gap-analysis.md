# Gap Analysis - Mortgage Calculator Modernisation (Australia)

## Current-State Findings

1. **Region mismatch in financial logic**
   - The calculator used US currency/locale and did not model Australian concepts such as LVR, LMI, stamp duty, or common repayment frequencies (fortnightly/weekly).
2. **No backend or persistence layer**
   - There is currently no backend service and no database integration in the repository. The app is a client-only React application.
3. **README drift**
   - The README described features (yearly projections, variable rate events, spreadsheet integration) that were not present in the executable code.
4. **Test coverage gap**
   - Existing test only checked for a default CRA “learn react” placeholder and did not validate calculator behavior.
5. **Architecture/documentation gap**
   - No formal architecture diagrams or schema docs existed under `docs/architecture`.
6. **Deployment automation gap**
   - No project-level deployment script existed at `./scripts/deploy.sh`.

## Risks/Issues To Address Next

1. **Stamp duty and LMI are estimates**
   - Implemented model is intentionally simplified and should be validated against a licensed broker/lender for production-grade compliance.
2. **No regulated financial advice controls**
   - The app lacks legal disclaimers, compliance text, and jurisdiction/versioning controls for fee/tax assumptions.
3. **No API/database for auditability**
   - Inputs and scenarios are not persisted; adding backend storage would allow saved quotes and comparison history.
4. **No end-to-end browser tests yet**
   - Unit/component tests now exist, but E2E coverage (Playwright/Cypress) would improve deployment confidence.

## Recommended Roadmap

1. Add a backend API and persistence (PostgreSQL) for saved scenarios and assumptions history.
2. Introduce jurisdiction/versioned tax tables and lender-rule profiles.
3. Add feature flags via env-config service (instead of static file).
4. Add E2E tests and CI pipeline gates for build/test/deploy.
