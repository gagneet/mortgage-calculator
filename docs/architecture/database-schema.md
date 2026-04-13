# Database Schema

## Current State

There is **no database schema implemented** in the current repository. The app computes results in-browser only.

## Proposed Schema (for next phase)

```mermaid
erDiagram
    USERS ||--o{ SCENARIOS : owns
    SCENARIOS ||--o{ SCENARIO_ASSUMPTIONS : has
    SCENARIOS ||--o{ SCENARIO_RESULTS : produces

    USERS {
      uuid id PK
      text email
      timestamptz created_at
    }

    SCENARIOS {
      uuid id PK
      uuid user_id FK
      text name
      text state_code
      numeric property_value
      numeric loan_amount
      numeric annual_rate
      int term_years
      text repayment_frequency
      timestamptz created_at
      timestamptz updated_at
    }

    SCENARIO_ASSUMPTIONS {
      uuid id PK
      uuid scenario_id FK
      numeric offset_balance
      numeric extra_repayment
      boolean include_lmi
      numeric lmi_estimate
      numeric stamp_duty_estimate
      text ruleset_version
      timestamptz created_at
    }

    SCENARIO_RESULTS {
      uuid id PK
      uuid scenario_id FK
      numeric repayment_amount
      numeric total_interest
      numeric total_paid
      int periods
      jsonb amortization_preview
      timestamptz created_at
    }
```

## Notes

- `ruleset_version` allows traceability when stamp duty or LMI estimate rules change.
- `amortization_preview` can store a trimmed schedule for quick rendering; full rows could live in a dedicated table if needed.
