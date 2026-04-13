/**
 * Unit tests for src/utils/mortgage.js
 *
 * All functions under test are pure (no I/O, no side effects).
 * Tests are inherently idempotent — no data setup or teardown required.
 */
import {
  REPAYMENTS_PER_YEAR,
  calculateAmortization,
  calculateLvr,
  calculateRepayment,
  estimateLmi,
  estimateStampDuty,
  formatAud,
} from './mortgage';

// ---------------------------------------------------------------------------
// calculateLvr
// ---------------------------------------------------------------------------
describe('calculateLvr', () => {
  test('returns correct LVR for a standard loan', () => {
    expect(calculateLvr(700000, 875000)).toBeCloseTo(80, 5);
  });

  test('returns 0 when propertyValue is 0', () => {
    expect(calculateLvr(500000, 0)).toBe(0);
  });

  test('returns 0 when propertyValue is negative', () => {
    expect(calculateLvr(500000, -100000)).toBe(0);
  });

  test('returns LVR > 100 when loan exceeds property value', () => {
    expect(calculateLvr(1000000, 800000)).toBeCloseTo(125, 2);
  });
});

// ---------------------------------------------------------------------------
// estimateLmi
// ---------------------------------------------------------------------------
describe('estimateLmi', () => {
  test('returns 0 when LVR is exactly 80', () => {
    expect(estimateLmi(700000, 80)).toBe(0);
  });

  test('returns 0 when LVR is below 80', () => {
    expect(estimateLmi(600000, 75)).toBe(0);
  });

  test('applies 0.8 % rate for LVR 80–85', () => {
    const lmi = estimateLmi(850000, 85);
    expect(lmi).toBeCloseTo(850000 * 0.008, 2);
  });

  test('applies 1.6 % rate for LVR 85–90', () => {
    const lmi = estimateLmi(900000, 90);
    expect(lmi).toBeCloseTo(900000 * 0.016, 2);
  });

  test('applies 2.8 % rate for LVR 90–95', () => {
    const lmi = estimateLmi(950000, 95);
    expect(lmi).toBeCloseTo(950000 * 0.028, 2);
  });

  test('applies 4 % rate for LVR above 95', () => {
    const lmi = estimateLmi(980000, 97);
    expect(lmi).toBeCloseTo(980000 * 0.04, 2);
  });
});

// ---------------------------------------------------------------------------
// estimateStampDuty
// ---------------------------------------------------------------------------
describe('estimateStampDuty', () => {
  describe('NSW brackets', () => {
    test('first bracket ($0–$17 000): 1.25 %', () => {
      expect(estimateStampDuty(10000, 'NSW')).toBeCloseTo(10000 * 0.0125, 2);
    });

    test('mid-range property ($364 001–$1 212 000): base $10 909 + 4.5 %', () => {
      const duty = estimateStampDuty(875000, 'NSW');
      const expected = 10909 + (875000 - 364000) * 0.045;
      expect(duty).toBeCloseTo(expected, 0);
    });

    test('high-value property (> $1 212 000): base $48 909 + 5.5 %', () => {
      const duty = estimateStampDuty(1500000, 'NSW');
      const expected = 48909 + (1500000 - 1212000) * 0.055;
      expect(duty).toBeCloseTo(expected, 0);
    });
  });

  describe('VIC brackets', () => {
    test('lower bracket ($0–$25 000): 1.4 %', () => {
      expect(estimateStampDuty(20000, 'VIC')).toBeCloseTo(20000 * 0.014, 2);
    });

    test('mid bracket ($130 001–$960 000): base $2 870 + 6 %', () => {
      const duty = estimateStampDuty(500000, 'VIC');
      const expected = 2870 + (500000 - 130000) * 0.06;
      expect(duty).toBeCloseTo(expected, 0);
    });
  });

  describe('QLD brackets', () => {
    test('returns a positive value for a typical QLD property', () => {
      expect(estimateStampDuty(500000, 'QLD')).toBeGreaterThan(0);
    });

    test('upper bracket (> $1 000 000): base $37 825 + 5.75 %', () => {
      const duty = estimateStampDuty(1200000, 'QLD');
      const expected = 37825 + (1200000 - 1000000) * 0.0575;
      expect(duty).toBeCloseTo(expected, 0);
    });
  });

  describe('all three supported states return non-zero duty', () => {
    test.each([['NSW'], ['VIC'], ['QLD']])('%s', (state) => {
      expect(estimateStampDuty(900000, state)).toBeGreaterThan(0);
    });
  });

  describe('invalid inputs', () => {
    test.each([
      ['zero value', 0, 'NSW'],
      ['negative value', -1000, 'NSW'],
      ['NaN', NaN, 'NSW'],
      ['Infinity', Infinity, 'NSW'],
    ])('%s returns 0', (_label, value, state) => {
      expect(estimateStampDuty(value, state)).toBe(0);
    });
  });

  test('unknown state falls back to NSW rules', () => {
    const nswDuty = estimateStampDuty(900000, 'NSW');
    const unknownDuty = estimateStampDuty(900000, 'SA');
    expect(unknownDuty).toBe(nswDuty);
  });
});

// ---------------------------------------------------------------------------
// calculateRepayment
// ---------------------------------------------------------------------------
describe('calculateRepayment', () => {
  describe('valid inputs', () => {
    test('monthly repayment on a standard loan is in the expected range', () => {
      const repayment = calculateRepayment({
        principal: 500000,
        annualRate: 6,
        years: 30,
        frequency: 'monthly',
      });
      // Standard amortization: ≈ $2 997.75
      expect(repayment).toBeCloseTo(2997.75, 0);
    });

    test('fortnightly repayment is approximately half the monthly payment', () => {
      const monthly = calculateRepayment({ principal: 500000, annualRate: 6, years: 30, frequency: 'monthly' });
      const fortnightly = calculateRepayment({ principal: 500000, annualRate: 6, years: 30, frequency: 'fortnightly' });
      // Fortnightly rate is slightly less (6%/26 vs 6%/12) so fortnightly × 2 < monthly
      expect(fortnightly * 2).toBeLessThan(monthly);
      expect(fortnightly).toBeGreaterThan(monthly * 0.4);
    });

    test('weekly repayment is approximately one quarter of monthly', () => {
      const monthly = calculateRepayment({ principal: 500000, annualRate: 6, years: 30, frequency: 'monthly' });
      const weekly = calculateRepayment({ principal: 500000, annualRate: 6, years: 30, frequency: 'weekly' });
      expect(weekly * 4).toBeLessThan(monthly);
      expect(weekly).toBeGreaterThan(monthly * 0.2);
    });

    test('zero interest rate divides principal evenly', () => {
      const repayment = calculateRepayment({ principal: 360000, annualRate: 0, years: 30, frequency: 'monthly' });
      expect(repayment).toBeCloseTo(360000 / 360, 2);
    });

    test('REPAYMENTS_PER_YEAR exports the correct period counts', () => {
      expect(REPAYMENTS_PER_YEAR.monthly).toBe(12);
      expect(REPAYMENTS_PER_YEAR.fortnightly).toBe(26);
      expect(REPAYMENTS_PER_YEAR.weekly).toBe(52);
    });
  });

  describe('invalid inputs return 0', () => {
    test.each([
      ['unknown frequency', { principal: 500000, annualRate: 6, years: 30, frequency: 'unknown' }],
      ['zero years', { principal: 500000, annualRate: 6, years: 0, frequency: 'monthly' }],
      ['negative years', { principal: 500000, annualRate: 6, years: -1, frequency: 'monthly' }],
      ['zero principal', { principal: 0, annualRate: 6, years: 30, frequency: 'monthly' }],
      ['negative principal', { principal: -100, annualRate: 6, years: 30, frequency: 'monthly' }],
    ])('%s', (_label, args) => {
      expect(calculateRepayment(args)).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// calculateAmortization
// ---------------------------------------------------------------------------
describe('calculateAmortization', () => {
  const BASE_ARGS = {
    loanAmount: 700000,
    annualRate: 6,
    years: 30,
    frequency: 'monthly',
    offsetBalance: 0,
    extraRepayment: 0,
  };

  test('returns the expected shape', () => {
    const result = calculateAmortization(BASE_ARGS);
    expect(result).toHaveProperty('repayment');
    expect(result).toHaveProperty('totalInterest');
    expect(result).toHaveProperty('totalPaid');
    expect(result).toHaveProperty('periods');
    expect(result).toHaveProperty('schedule');
    expect(Array.isArray(result.schedule)).toBe(true);
  });

  test('schedule entries have the correct shape', () => {
    const { schedule } = calculateAmortization(BASE_ARGS);
    const entry = schedule[0];
    expect(entry).toHaveProperty('period', 1);
    expect(entry).toHaveProperty('repayment');
    expect(entry).toHaveProperty('interestPaid');
    expect(entry).toHaveProperty('principalPaid');
    expect(entry).toHaveProperty('balance');
  });

  test('last schedule entry has balance at or near zero', () => {
    const { schedule } = calculateAmortization(BASE_ARGS);
    const last = schedule[schedule.length - 1];
    expect(last.balance).toBeCloseTo(0, 0);
  });

  test('totalPaid ≈ loanAmount + totalInterest', () => {
    const result = calculateAmortization(BASE_ARGS);
    expect(result.totalPaid).toBeCloseTo(result.totalInterest + BASE_ARGS.loanAmount, 0);
  });

  test('period count matches years × periodsPerYear (approximately)', () => {
    const result = calculateAmortization(BASE_ARGS);
    const maxPeriods = BASE_ARGS.years * 12;
    expect(result.periods).toBeLessThanOrEqual(maxPeriods);
    expect(result.periods).toBeGreaterThan(maxPeriods - 2); // within 2 periods due to early payoff
  });

  describe('offset and extra repayment reduce term and interest', () => {
    test('offset + extra repayment reduces total interest and period count', () => {
      const baseline = calculateAmortization({
        ...BASE_ARGS,
        frequency: 'fortnightly',
      });

      const accelerated = calculateAmortization({
        ...BASE_ARGS,
        frequency: 'fortnightly',
        offsetBalance: 40000,
        extraRepayment: 200,
      });

      expect(accelerated.totalInterest).toBeLessThan(baseline.totalInterest);
      expect(accelerated.periods).toBeLessThan(baseline.periods);
    });
  });

  describe('negative values are clamped to zero', () => {
    test('negative extraRepayment behaves as zero', () => {
      const withZero = calculateAmortization({ ...BASE_ARGS, extraRepayment: 0 });
      const withNegative = calculateAmortization({ ...BASE_ARGS, extraRepayment: -500 });
      expect(withNegative.totalInterest).toBeCloseTo(withZero.totalInterest, 0);
      expect(withNegative.periods).toBe(withZero.periods);
    });

    test('negative offsetBalance behaves as zero', () => {
      const withZero = calculateAmortization({ ...BASE_ARGS, offsetBalance: 0 });
      const withNegative = calculateAmortization({ ...BASE_ARGS, offsetBalance: -10000 });
      expect(withNegative.totalInterest).toBeCloseTo(withZero.totalInterest, 0);
      expect(withNegative.periods).toBe(withZero.periods);
    });
  });

  describe('all three frequencies produce a complete schedule', () => {
    test.each([['monthly'], ['fortnightly'], ['weekly']])('%s', (frequency) => {
      const result = calculateAmortization({ ...BASE_ARGS, frequency });
      expect(result.periods).toBeGreaterThan(0);
      expect(result.totalInterest).toBeGreaterThan(0);
      expect(result.schedule.length).toBe(result.periods);
    });
  });

  test('throws for invalid frequency', () => {
    expect(() =>
      calculateAmortization({ ...BASE_ARGS, frequency: 'daily' })
    ).toThrow(/Invalid frequency/);
  });

  test('offset larger than balance eliminates all interest', () => {
    const result = calculateAmortization({
      ...BASE_ARGS,
      loanAmount: 100000,
      offsetBalance: 200000, // fully covers the loan — zero interest each period
    });
    // Interest base = max(balance - offset, 0) = 0 throughout
    expect(result.totalInterest).toBe(0);
    // Repayment amount is still the standard formula value, so the loan
    // takes multiple periods to amortise (principal only, no interest drag).
    // It finishes well before the 30-year (360-period) maximum.
    expect(result.periods).toBeGreaterThan(0);
    expect(result.periods).toBeLessThan(BASE_ARGS.years * 12);
  });
});

// ---------------------------------------------------------------------------
// formatAud
// ---------------------------------------------------------------------------
describe('formatAud', () => {
  test('formats a positive number as AUD', () => {
    const formatted = formatAud(1234.56);
    expect(formatted).toMatch(/\$1,234\.56/);
  });

  test('formats zero as AUD', () => {
    expect(formatAud(0)).toMatch(/\$0\.00/);
  });

  test('formats large numbers with thousands separator', () => {
    const formatted = formatAud(1000000);
    expect(formatted).toMatch(/\$1,000,000\.00/);
  });
});
