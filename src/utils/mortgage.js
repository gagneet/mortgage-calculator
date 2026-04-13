export const REPAYMENTS_PER_YEAR = {
  monthly: 12,
  fortnightly: 26,
  weekly: 52,
};

const roundToCents = (value) => Math.round(value * 100) / 100;

export const formatAud = (value) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(value);

export const calculateLvr = (loanAmount, propertyValue) => {
  if (!propertyValue || propertyValue <= 0) return 0;
  return (loanAmount / propertyValue) * 100;
};

export const estimateLmi = (loanAmount, lvr) => {
  if (lvr <= 80) return 0;
  const rate = lvr <= 85 ? 0.008 : lvr <= 90 ? 0.016 : lvr <= 95 ? 0.028 : 0.04;
  return roundToCents(loanAmount * rate);
};

const STATE_STAMP_DUTY_RULES = {
  NSW: [
    { upto: 17000, base: 0, rate: 0.0125 },
    { upto: 36000, base: 212, rate: 0.015 },
    { upto: 97000, base: 497, rate: 0.0175 },
    { upto: 364000, base: 1564, rate: 0.035 },
    { upto: 1212000, base: 10909, rate: 0.045 },
    { upto: Infinity, base: 48909, rate: 0.055 },
  ],
  VIC: [
    { upto: 25000, base: 0, rate: 0.014 },
    { upto: 130000, base: 350, rate: 0.024 },
    { upto: 960000, base: 2870, rate: 0.06 },
    { upto: 2000000, base: 52670, rate: 0.055 },
    { upto: Infinity, base: 109670, rate: 0.065 },
  ],
  QLD: [
    { upto: 75000, base: 0, rate: 0.015 },
    { upto: 540000, base: 0, rate: 0.035 },
    { upto: 1000000, base: 17325, rate: 0.045 },
    { upto: Infinity, base: 37825, rate: 0.0575 },
  ],
};

export const estimateStampDuty = (propertyValue, state) => {
  if (!Number.isFinite(propertyValue) || propertyValue <= 0) return 0;

  const tiers = STATE_STAMP_DUTY_RULES[state] ?? STATE_STAMP_DUTY_RULES.NSW;
  let lower = 0;

  for (const tier of tiers) {
    if (propertyValue <= tier.upto) {
      return roundToCents(Math.max(0, tier.base + (propertyValue - lower) * tier.rate));
    }
    lower = tier.upto;
  }

  return 0;
};

export const calculateRepayment = ({ principal, annualRate, years, frequency }) => {
  const periodsPerYear = REPAYMENTS_PER_YEAR[frequency];
  if (!periodsPerYear || !Number.isFinite(years) || years <= 0 || !Number.isFinite(principal) || principal <= 0) {
    return 0;
  }
  const totalPeriods = years * periodsPerYear;
  const periodicRate = annualRate / 100 / periodsPerYear;

  if (periodicRate === 0) {
    return principal / totalPeriods;
  }

  return (
    (principal * periodicRate * Math.pow(1 + periodicRate, totalPeriods)) /
    (Math.pow(1 + periodicRate, totalPeriods) - 1)
  );
};

export const calculateAmortization = ({
  loanAmount,
  annualRate,
  years,
  frequency,
  offsetBalance = 0,
  extraRepayment = 0,
}) => {
  const periodsPerYear = REPAYMENTS_PER_YEAR[frequency];
  const totalPeriods = years * periodsPerYear;
  const periodicRate = annualRate / 100 / periodsPerYear;
  const repayment = calculateRepayment({ principal: loanAmount, annualRate, years, frequency });

  const safeOffset = Math.max(0, offsetBalance);
  const safeExtra = Math.max(0, extraRepayment);
  
  let balance = loanAmount;
  let totalInterest = 0;
  const schedule = [];

  for (let period = 1; period <= totalPeriods && balance > 0.01; period += 1) {
    const interestBase = Math.max(balance - safeOffset, 0);
    const interest = interestBase * periodicRate;
    const effectiveRepayment = Math.max(repayment + safeExtra, interest);
    const principalPaid = Math.min(effectiveRepayment - interest, balance);
    balance -= principalPaid;
    totalInterest += interest;

    schedule.push({
      period,
      repayment: roundToCents(effectiveRepayment),
      interestPaid: roundToCents(interest),
      principalPaid: roundToCents(principalPaid),
      balance: roundToCents(Math.max(balance, 0)),
    });
  }

  return {
    repayment: roundToCents(repayment + safeExtra),
    totalInterest: roundToCents(totalInterest),
    totalPaid: roundToCents(loanAmount + totalInterest),
    periods: schedule.length,
    schedule,
  };
};
