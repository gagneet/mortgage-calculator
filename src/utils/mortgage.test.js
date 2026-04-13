import { calculateAmortization, calculateLvr, estimateLmi, estimateStampDuty } from './mortgage';

describe('mortgage utils', () => {
  test('calculates LVR and LMI for high-LVR loans', () => {
    const lvr = calculateLvr(900000, 1000000);
    expect(lvr).toBeCloseTo(90, 5);
    expect(estimateLmi(900000, lvr)).toBeGreaterThan(0);
  });

  test('estimates state stamp duty', () => {
    expect(estimateStampDuty(900000, 'NSW')).toBeGreaterThan(0);
    expect(estimateStampDuty(900000, 'VIC')).toBeGreaterThan(0);
    expect(estimateStampDuty(900000, 'QLD')).toBeGreaterThan(0);
  });

  test('offset and extra repayment reduce term and interest', () => {
    const baseline = calculateAmortization({
      loanAmount: 700000,
      annualRate: 6,
      years: 30,
      frequency: 'fortnightly',
      offsetBalance: 0,
      extraRepayment: 0,
    });

    const accelerated = calculateAmortization({
      loanAmount: 700000,
      annualRate: 6,
      years: 30,
      frequency: 'fortnightly',
      offsetBalance: 40000,
      extraRepayment: 200,
    });

    expect(accelerated.totalInterest).toBeLessThan(baseline.totalInterest);
    expect(accelerated.periods).toBeLessThan(baseline.periods);
  });
});
