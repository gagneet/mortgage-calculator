import React, { useMemo, useState } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { featureToggles } from './config/features';
import {
  calculateAmortization,
  calculateLvr,
  estimateLmi,
  estimateStampDuty,
  formatAud,
} from './utils/mortgage';

const states = ['NSW', 'VIC', 'QLD'];

const App = () => {
  const [loanAmount, setLoanAmount] = useState(700000);
  const [propertyValue, setPropertyValue] = useState(875000);
  const [annualRate, setAnnualRate] = useState(6.1);
  const [termYears, setTermYears] = useState(30);
  const [frequency, setFrequency] = useState('fortnightly');
  const [offsetBalance, setOffsetBalance] = useState(15000);
  const [extraRepayment, setExtraRepayment] = useState(0);
  const [state, setState] = useState('NSW');
  const [includeLmi, setIncludeLmi] = useState(true);

  const lvr = useMemo(() => calculateLvr(loanAmount, propertyValue), [loanAmount, propertyValue]);
  const estimatedLmi = useMemo(() => estimateLmi(loanAmount, lvr), [loanAmount, lvr]);
  const stampDuty = useMemo(() => estimateStampDuty(propertyValue, state), [propertyValue, state]);

  const principal = loanAmount + (includeLmi ? estimatedLmi : 0);

  const summary = useMemo(
    () =>
      calculateAmortization({
        loanAmount: principal,
        annualRate,
        years: termYears,
        frequency,
        offsetBalance: featureToggles.showOffsetAccount ? offsetBalance : 0,
        extraRepayment: featureToggles.showExtraRepayment ? extraRepayment : 0,
      }),
    [principal, annualRate, termYears, frequency, offsetBalance, extraRepayment]
  );

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <h1 className="mb-4 text-center text-2xl font-bold">Australian Mortgage Calculator</h1>
      <p className="mb-6 text-center text-sm text-gray-600">
        Supports AUD formatting, LVR/LMI estimates, stamp duty estimate, and repayment frequencies common in Australia.
      </p>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="text-sm">
            Loan Amount (AUD)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Property Value (AUD)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={propertyValue} onChange={(e) => setPropertyValue(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Annual Interest Rate (%)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Term (years)
            <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={termYears} onChange={(e) => setTermYears(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            Repayment Frequency
            <select className="mt-1 w-full rounded border px-3 py-2" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="weekly">Weekly</option>
            </select>
          </label>
          <label className="text-sm">
            State (Stamp Duty)
            <select className="mt-1 w-full rounded border px-3 py-2" value={state} onChange={(e) => setState(e.target.value)}>
              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          {featureToggles.showOffsetAccount && (
            <label className="text-sm">
              Offset Balance (AUD)
              <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={offsetBalance} onChange={(e) => setOffsetBalance(Number(e.target.value))} />
            </label>
          )}
          {featureToggles.showExtraRepayment && (
            <label className="text-sm">
              Extra Repayment Per Period (AUD)
              <input className="mt-1 w-full rounded border px-3 py-2" type="number" value={extraRepayment} onChange={(e) => setExtraRepayment(Number(e.target.value))} />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input checked={includeLmi} type="checkbox" onChange={(e) => setIncludeLmi(e.target.checked)} />
            Capitalise estimated LMI into loan
          </label>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Loan Summary</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <p>LVR: {lvr.toFixed(2)}%</p>
          <p>Estimated LMI: {formatAud(estimatedLmi)}</p>
          {featureToggles.showUpfrontCosts && <p>Estimated Stamp Duty ({state}): {formatAud(stampDuty)}</p>}
          <p>Repayment per {frequency.slice(0, -2)}: {formatAud(summary.repayment)}</p>
          <p>Total Interest: {formatAud(summary.totalInterest)}</p>
          <p>Total Paid: {formatAud(summary.totalPaid)}</p>
          <p>Loan paid in periods: {summary.periods}</p>
        </div>
      </div>

      <div className="mb-6 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Balance Over Time</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.schedule.map((entry) => ({ period: entry.period, balance: entry.balance }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip formatter={(v) => formatAud(v)} />
              <Line type="monotone" dataKey="balance" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default App;
