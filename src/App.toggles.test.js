/**
 * Integration tests for src/App.js with ALL feature toggles disabled.
 *
 * jest.mock is hoisted by babel-jest so the mock is in place before App
 * is imported, regardless of declaration order in this file.
 *
 * These tests are idempotent: no database, no external state.
 * RTL's automatic afterEach cleanup handles DOM teardown.
 */
jest.mock('./config/features', () => ({
  featureToggles: {
    showOffsetAccount: false,
    showExtraRepayment: false,
    showUpfrontCosts: false,
  },
}));

import { render, screen } from '@testing-library/react';
import App from './App';

describe('App — all feature toggles OFF', () => {
  beforeEach(() => render(<App />));

  // ----- Hidden inputs -----

  test('offset balance input is NOT rendered when showOffsetAccount=false', () => {
    expect(screen.queryByLabelText(/Offset Balance/i)).not.toBeInTheDocument();
  });

  test('extra repayment input is NOT rendered when showExtraRepayment=false', () => {
    expect(screen.queryByLabelText(/Extra Repayment Per Period/i)).not.toBeInTheDocument();
  });

  test('stamp duty line is NOT shown in summary when showUpfrontCosts=false', () => {
    // Scope to <p> to avoid matching ancestor container text
    expect(screen.queryByText(/Estimated Stamp Duty/i, { selector: 'p' })).not.toBeInTheDocument();
  });

  // ----- Core fields still present -----

  test('page heading is still rendered', () => {
    expect(screen.getByText(/Australian Mortgage Calculator/i)).toBeInTheDocument();
  });

  test('LVR and LMI summary fields are still shown', () => {
    expect(screen.getByText(/LVR:/i)).toBeInTheDocument();
    expect(screen.getByText(/Estimated LMI/i, { selector: 'p' })).toBeInTheDocument();
  });

  test('repayment, total interest and total paid are still shown', () => {
    expect(screen.getByText(/Total Interest/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Paid/i)).toBeInTheDocument();
    expect(screen.getByText(/Repayment per Fortnight/i)).toBeInTheDocument();
  });

  // ----- Calculation correctness when toggles are off -----

  test('calculation still completes (Loan paid in periods is rendered)', () => {
    expect(screen.getByText(/Loan paid in periods/i)).toBeInTheDocument();
  });
});
