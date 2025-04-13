import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import logo from './logo.svg';
import './App.css';

// CSS Styles
const styles = {
  appContainer: 'container mx-auto p-4 max-w-6xl',
  header: 'text-2xl font-bold text-center my-4 text-blue-700',
  card: 'bg-white rounded-lg shadow-md p-6 mb-6',
  formGroup: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4',
  inputGroup: 'mb-2',
  label: 'block text-sm font-medium text-gray-700 mb-1',
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500',
  button: 'bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  table: 'min-w-full divide-y divide-gray-200',
  tableHeader: 'bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider',
  tableHeaderCell: 'px-3 py-2 text-left',
  tableRow: 'bg-white border-b border-gray-200',
  tableRowHighlight: 'bg-yellow-50 border-b border-gray-200',
  tableRowAlt: 'bg-gray-50 border-b border-gray-200',
  tableCell: 'px-3 py-2 text-sm text-gray-500',
  tabContainer: 'flex border-b mb-4',
  tab: 'py-2 px-4 text-gray-600 cursor-pointer',
  activeTab: 'py-2 px-4 text-blue-600 border-b-2 border-blue-600 cursor-pointer',
  chartContainer: 'h-64 md:h-80 my-6',
  yearlyViewContainer: 'p-4',
  yearSelector: 'w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4'
};

// Utility function to format currency values
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
};

// Utility function to calculate EMI (Equated Monthly Installment)
const calculateEMI = (principal, annualInterestRate, remainingMonths) => {
  const monthlyRate = annualInterestRate / 100 / 12;
  
  // If interest rate is 0, just divide principal by total payments
  if (monthlyRate === 0) {
    return principal / remainingMonths;
  }
  
  // Standard EMI formula
  return principal * 
    monthlyRate * 
    Math.pow(1 + monthlyRate, remainingMonths) / 
    (Math.pow(1 + monthlyRate, remainingMonths) - 1);
};

// Simple Mortgage Calculator Component
const App = () => {
  // Basic state for loan inputs
  const [loanAmount, setLoanAmount] = useState(300000);
  const [initialRate, setInitialRate] = useState(4.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  
  // State for mortgage calculation results
  const [loanSummary, setLoanSummary] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  
  // Main function to calculate the mortgage
  const calculateMortgage = () => {
    // Basic loan parameters
    const totalMonths = loanTermYears * 12;
    const initialEMI = calculateEMI(loanAmount, initialRate, totalMonths);
    
    // Calculate the amortization schedule
    let remainingPrincipal = loanAmount;
    let currentMonth = 1;
    let totalInterestPaid = 0;
    let currentRate = initialRate;
    let remainingMonths = totalMonths;
    let currentEMI = initialEMI;
    let schedule = [];
    
    // Process month by month until loan is fully paid
    while (remainingPrincipal > 0.01 && remainingMonths > 0) {
      // Calculate interest portion with current rate
      const interestAmount = remainingPrincipal * (currentRate / 100 / 12);
      
      // Calculate principal portion (EMI minus interest)
      const principalAmount = Math.min(currentEMI - interestAmount, remainingPrincipal);
      
      // Update remaining principal
      remainingPrincipal = remainingPrincipal - principalAmount;
      
      // Update total interest paid
      totalInterestPaid += interestAmount;
      
      // Add to schedule
      schedule.push({
        month: currentMonth,
        payment: currentEMI,
        principalPaid: principalAmount,
        interestPaid: interestAmount,
        remainingPrincipal: remainingPrincipal,
        interestRate: currentRate
      });
      
      currentMonth += 1;
      remainingMonths -= 1;
      
      // If the loan is paid off earlier than expected
      if (remainingPrincipal <= 0.01) {
        break;
      }
    }
    
    // Calculate total interest
    const totalInterest = totalInterestPaid;
    
    // Prepare loan summary
    const summary = {
      loanAmount: loanAmount,
      interestRate: initialRate,
      payment: initialEMI,
      loanTerm: loanTermYears,
      totalInterest: totalInterest,
      totalPaid: loanAmount + totalInterest
    };
    
    // Update state with calculation results
    setLoanSummary(summary);
    setAmortizationSchedule(schedule);
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Variable Rate Mortgage Calculator</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($):</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
              value={loanAmount} 
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%):</label>
            <input 
              type="number" 
              step="0.01" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
              value={initialRate} 
              onChange={(e) => setInitialRate(parseFloat(e.target.value))} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years):</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
              value={loanTermYears} 
              onChange={(e) => setLoanTermYears(parseInt(e.target.value))} 
            />
          </div>
        </div>
        
        <button 
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700" 
          onClick={calculateMortgage}
        >
          Calculate
        </button>
      </div>
      
      {/* Loan Summary */}
      {loanSummary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Loan Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Loan Amount:</strong> {formatCurrency(loanSummary.loanAmount)}</p>
              <p><strong>Monthly Payment:</strong> {formatCurrency(loanSummary.payment)}</p>
              <p><strong>Total Interest Paid:</strong> {formatCurrency(loanSummary.totalInterest)}</p>
            </div>
            <div>
              <p><strong>Interest Rate:</strong> {loanSummary.interestRate}%</p>
              <p><strong>Loan Term:</strong> {loanSummary.loanTerm} years</p>
              <p><strong>Total Amount Paid:</strong> {formatCurrency(loanSummary.totalPaid)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loan Balance Chart */}
      {amortizationSchedule.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-3">Loan Balance Over Time</h2>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={amortizationSchedule.map(entry => ({
                  month: entry.month,
                  balance: entry.remainingPrincipal
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                />
                <Tooltip 
                  formatter={(value) => [`${formatCurrency(value)}`, 'Remaining Principal']}
                  labelFormatter={(label) => `Month ${label}`} 
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="#3b82f6" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Amortization Schedule */}
      {amortizationSchedule.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Amortization Schedule</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Principal</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remaining Principal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {amortizationSchedule.slice(0, 12).map((entry, index) => (
                  <tr key={`schedule-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-3 py-2 text-sm text-gray-500">{entry.month}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(entry.payment)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(entry.principalPaid)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(entry.interestPaid)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(entry.remainingPrincipal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {amortizationSchedule.length > 12 && (
              <p className="mt-2 text-sm text-gray-500">Showing first 12 months of {amortizationSchedule.length} total months.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;