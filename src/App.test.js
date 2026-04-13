/**
 * Integration tests for src/App.js
 *
 * Tests render the full App component and assert on visible output.
 * React Testing Library's automatic afterEach cleanup ensures each test
 * starts with a fresh DOM — no manual teardown required.
 *
 * Default state of the app (used unless overridden):
 *   loanAmount = 700 000, propertyValue = 875 000, annualRate = 6.1 %
 *   termYears = 30, frequency = 'fortnightly', state = NSW
 *   All feature toggles: true
 */
import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

// ---------------------------------------------------------------------------
// Smoke test
// ---------------------------------------------------------------------------
describe('App — smoke test', () => {
  test('renders page heading and major sections', () => {
    render(<App />);
    expect(screen.getByText(/Australian Mortgage Calculator/i)).toBeInTheDocument();
    expect(screen.getByText(/Loan Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/Balance Over Time/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Feature toggle visibility (all toggles are true by default)
// ---------------------------------------------------------------------------
describe('App — feature toggle visibility (all toggles ON)', () => {
  beforeEach(() => render(<App />));

  test('showOffsetAccount: offset balance input is rendered', () => {
    expect(screen.getByLabelText(/Offset Balance/i)).toBeInTheDocument();
  });

  test('showExtraRepayment: extra repayment input is rendered', () => {
    expect(screen.getByLabelText(/Extra Repayment Per Period/i)).toBeInTheDocument();
  });

  test('showUpfrontCosts: stamp duty line is rendered in summary', () => {
    expect(screen.getByText(/Estimated Stamp Duty/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Loan summary fields
// ---------------------------------------------------------------------------
describe('App — loan summary fields', () => {
  beforeEach(() => render(<App />));

  test('LVR is displayed', () => {
    // Default: 700 000 / 875 000 = 80.00 %
    expect(screen.getByText(/LVR:/i)).toBeInTheDocument();
    expect(screen.getByText(/80\.00%/)).toBeInTheDocument();
  });

  test('Estimated LMI is displayed', () => {
    // Scope to <p> to avoid matching ancestor container elements
    expect(screen.getByText(/Estimated LMI/i, { selector: 'p' })).toBeInTheDocument();
  });

  test('Total Interest is displayed', () => {
    expect(screen.getByText(/Total Interest/i)).toBeInTheDocument();
  });

  test('Total Paid is displayed', () => {
    expect(screen.getByText(/Total Paid/i)).toBeInTheDocument();
  });

  test('Loan paid in periods is displayed', () => {
    expect(screen.getByText(/Loan paid in periods/i)).toBeInTheDocument();
  });

  test('Stamp duty state code (NSW) appears in summary label', () => {
    expect(screen.getByText(/Estimated Stamp Duty \(NSW\)/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Repayment frequency labels
// ---------------------------------------------------------------------------
describe('App — repayment frequency labels', () => {
  test('default frequency (fortnightly) shows "Fortnight" label', () => {
    render(<App />);
    expect(screen.getByText(/Repayment per Fortnight/i)).toBeInTheDocument();
  });

  test('switching to monthly shows "Month" label', () => {
    render(<App />);
    const select = screen.getByLabelText(/Repayment Frequency/i);
    fireEvent.change(select, { target: { value: 'monthly' } });
    expect(screen.getByText(/Repayment per Month/i)).toBeInTheDocument();
  });

  test('switching to weekly shows "Week" label', () => {
    render(<App />);
    const select = screen.getByLabelText(/Repayment Frequency/i);
    fireEvent.change(select, { target: { value: 'weekly' } });
    expect(screen.getByText(/Repayment per Week/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// State dropdown
// ---------------------------------------------------------------------------
describe('App — state dropdown', () => {
  test('all three states are available as options', () => {
    render(<App />);
    const stateSelect = screen.getByLabelText(/State \(Stamp Duty\)/i);
    const options = Array.from(stateSelect.options).map((o) => o.value);
    expect(options).toContain('NSW');
    expect(options).toContain('VIC');
    expect(options).toContain('QLD');
  });

  test('changing state updates the stamp duty label', () => {
    render(<App />);
    const stateSelect = screen.getByLabelText(/State \(Stamp Duty\)/i);
    fireEvent.change(stateSelect, { target: { value: 'VIC' } });
    expect(screen.getByText(/Estimated Stamp Duty \(VIC\)/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// LMI capitalisation checkbox
// ---------------------------------------------------------------------------
describe('App — LMI capitalisation checkbox', () => {
  test('checkbox is rendered and checked by default', () => {
    render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /Capitalise estimated LMI/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  test('unchecking the LMI checkbox updates the UI without crashing', () => {
    render(<App />);
    const checkbox = screen.getByRole('checkbox', { name: /Capitalise estimated LMI/i });
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    // App still renders all summary fields after the state change
    expect(screen.getByText(/Total Paid/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Input interaction — loan amount
// ---------------------------------------------------------------------------
describe('App — loan amount input', () => {
  test('changing loan amount re-renders the LVR without crashing', () => {
    render(<App />);
    const loanInput = screen.getByLabelText(/Loan Amount \(AUD\)/i);
    fireEvent.change(loanInput, { target: { value: '500000' } });
    // LVR = 500 000 / 875 000 = 57.14 % — just verify it doesn't crash
    expect(screen.getByText(/LVR:/i)).toBeInTheDocument();
  });
});
