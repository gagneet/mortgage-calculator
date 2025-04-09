// Yearly Data Component for displaying yearly projected data based on mortgage calculations
const YearlyDataView = () => {
  // State to track loan parameters (will be filled by context or props in a real app)
  const [loanParams, setLoanParams] = useState({
    loanAmount: 300000,
    initialRate: 4.5,
    loanTermYears: 30,
    rateChanges: [
      { month: 13, newRate: 4.25 },
      { month: 25, newRate: 4.0 },
      { month: 61, newRate: 4.75 }
    ],
    extraPayments: [
      { month: 1, amount: 50 },
      { month: 6, amount: 5000 },
      { month: 12, amount: 1000 }
    ],
    regularExtraAmount: 100,
    regularStartMonth: 1,
    regularEndMonth: 360,
    propertyValue: 500000,
    annualPropertyValueIncrease: 3, // percentage
    rentalIncome: 2000,
    annualRentalIncomeIncrease: 2, // percentage
    propertyTax: 3000,
    insurance: 1200,
    maintenanceCost: 1500,
    otherExpenses: 600
  });

  const [selectedYear, setSelectedYear] = useState(1);
  const [yearOptions] = useState(Array.from({length: 30}, (_, i) => i + 1));
  const [loading, setLoading] = useState(false);
  
  // Generate mortgage calculation for all 30 years
  const mortgageCalculations = useMemo(() => {
    const calculations = calculateMortgageForYears(loanParams);
    return calculations;
  }, [loanParams]);
  
  // Generate yearly summaries from mortgage calculations
  const yearlyData = useMemo(() => {
    return generateYearlyReports(mortgageCalculations, loanParams);
  }, [mortgageCalculations, loanParams]);
  
  // Handle year selection change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };
  
  // Format percentage values
  const formatPercentage = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(value / 100);
  };
  
  // Calculate mortgage for all 30 years
  function calculateMortgageForYears(params) {
    const {
      loanAmount,
      initialRate,
      loanTermYears,
      rateChanges,
      extraPayments,
      regularExtraAmount,
      regularStartMonth,
      regularEndMonth
    } = params;
    
    // Basic loan parameters
    const totalMonths = loanTermYears * 12;
    const initialEMI = calculateEMI(loanAmount, initialRate, totalMonths);
    
    // Process all extra payments
    let allExtraPayments = [...extraPayments];
    
    // Add regular extra payment if defined
    if (regularExtraAmount > 0) {
      for (let i = regularStartMonth; i <= regularEndMonth; i++) {
        // Check if there's already a payment for this month
        const existingIndex = allExtraPayments.findIndex(ep => ep.month === i);
        
        if (existingIndex !== -1) {
          // Add to existing payment
          allExtraPayments[existingIndex].amount += parseFloat(regularExtraAmount);
        } else {
          // Add new payment
          allExtraPayments.push({ month: i, amount: parseFloat(regularExtraAmount) });
        }
      }
    }
    
    // Sort the combined extra payments by month
    allExtraPayments.sort((a, b) => a.month - b.month);
    
    // Calculate the amortization schedule
    let remainingPrincipal = loanAmount;
    let currentMonth = 1;
    let totalInterestPaid = 0;
    let totalExtraPayments = 0;
    let currentRate = initialRate;
    let remainingMonths = totalMonths;
    let currentEMI = initialEMI;
    let schedule = [];
    
    // Process month by month until loan is fully paid or for 30 years (360 months)
    while (remainingPrincipal > 0.01 && remainingMonths > 0 && currentMonth <= 360) {
      // Check if interest rate changes this month
      const rateChange = rateChanges.find(rc => rc.month === currentMonth);
      if (rateChange) {
        // Update the current interest rate
        currentRate = rateChange.newRate;
        
        // Recalculate the EMI based on the new rate but keeping the same remaining months
        currentEMI = calculateEMI(remainingPrincipal, currentRate, remainingMonths);
      }
      
      // Calculate interest portion with current rate
      const interestAmount = remainingPrincipal * (currentRate / 100 / 12);
      
      // Calculate principal portion (EMI minus interest)
      const principalAmount = Math.min(currentEMI - interestAmount, remainingPrincipal);
      
      // Check if there are any extra payments this month
      const extraPayment = allExtraPayments.find(ep => ep.month === currentMonth);
      let extraPaymentAmount = 0;
      
      if (extraPayment) {
        extraPaymentAmount = Math.min(extraPayment.amount, remainingPrincipal - principalAmount);
        totalExtraPayments += extraPaymentAmount;
      }
      
      // Update remaining principal after both regular and extra payments
      remainingPrincipal = remainingPrincipal - (principalAmount + extraPaymentAmount);
      
      // Update total interest paid
      totalInterestPaid += interestAmount;
      
      // Add to schedule
      schedule.push({
        month: currentMonth,
        EMI: currentEMI,
        principalPaid: principalAmount,
        interestPaid: interestAmount,
        extraPayment: extraPaymentAmount,
        remainingPrincipal: remainingPrincipal,
        interestRate: currentRate,
        remainingMonths: remainingMonths
      });
      
      currentMonth += 1;
      remainingMonths -= 1;
      
      // If the loan is paid off earlier than expected
      if (remainingPrincipal <= 0.01) {
        break;
      }
    }
    
    return schedule;
  }
  
  // Generate yearly reports for all 30 years
  function generateYearlyReports(mortgageCalculations, params) {
    const {
      loanAmount,
      propertyValue,
      annualPropertyValueIncrease,
      rentalIncome,
      annualRentalIncomeIncrease,
      propertyTax,
      insurance,
      maintenanceCost,
      otherExpenses
    } = params;
    
    // Group calculations by year
    const yearlyReports = [];
    
    for (let year = 1; year <= 30; year++) {
      // Get months for this year (1-12 for year 1, 13-24 for year 2, etc.)
      const startMonth = (year - 1) * 12 + 1;
      const endMonth = year * 12;
      
      // Get mortgage data for this year
      const yearData = mortgageCalculations.filter(
        entry => entry.month >= startMonth && entry.month <= endMonth
      );
      
      if (yearData.length === 0) {
        // If loan is paid off before this year, create empty record
        yearlyReports.push({
          year,
          monthlyData: [],
          loanPaidOff: true,
          summary: {
            principalPaid: 0,
            interestPaid: 0,
            totalPaid: 0,
            remainingPrincipal: 0,
            currentPropertyValue: calculatePropertyValue(propertyValue, year),
            equity: calculatePropertyValue(propertyValue, year),
            rentalIncome: calculateYearlyRentalIncome(rentalIncome, year),
            expenses: calculateYearlyExpenses(propertyTax, insurance, maintenanceCost, otherExpenses)
          }
        });
        continue;
      }
      
      // Calculate yearly summaries
      const principalPaid = yearData.reduce((sum, month) => sum + month.principalPaid + month.extraPayment, 0);
      const interestPaid = yearData.reduce((sum, month) => sum + month.interestPaid, 0);
      const totalPaid = principalPaid + interestPaid;
      const remainingPrincipal = yearData[yearData.length - 1].remainingPrincipal;
      
      // Calculate property value for this year
      const currentPropertyValue = calculatePropertyValue(propertyValue, year);
      
      // Calculate equity (property value minus remaining principal)
      const equity = currentPropertyValue - remainingPrincipal;
      
      // Calculate rental income for this year (with annual increase)
      const yearlyRentalIncome = calculateYearlyRentalIncome(rentalIncome, year);
      
      // Calculate expenses for this year
      const yearlyExpenses = calculateYearlyExpenses(propertyTax, insurance, maintenanceCost, otherExpenses);
      
      // Create monthly breakdown
      const monthlyData = [];
      
      // Add a row for each month (July to June)
      const monthNames = ['July', 'August', 'September', 'October', 'November', 'December', 
                          'January', 'February', 'March', 'April', 'May', 'June'];
      
      for (let i = 0; i < 12; i++) {
        const monthData = yearData[i];
        
        if (!monthData) continue; // Skip if no data for this month
        
        // Monthly rental income (yearly divided by 12)
        const monthlyRental = yearlyRentalIncome / 12;
        
        // Monthly expenses (yearly divided by 12)
        const monthlyExpenses = yearlyExpenses / 12;
        
        // Cash flow (rental income minus mortgage payment minus expenses)
        const cashFlow = monthlyRental - monthData.EMI - monthlyExpenses;
        
        monthlyData.push({
          month: monthNames[i],
          payment: monthData.EMI,
          principal: monthData.principalPaid,
          interest: monthData.interestPaid,
          extraPayment: monthData.extraPayment,
          remainingPrincipal: monthData.remainingPrincipal,
          rentalIncome: monthlyRental,
          expenses: monthlyExpenses,
          cashFlow: cashFlow
        });
      }
      
      // Create year report
      yearlyReports.push({
        year,
        monthlyData,
        loanPaidOff: false,
        summary: {
          principalPaid,
          interestPaid,
          totalPaid,
          remainingPrincipal,
          currentPropertyValue,
          equity,
          rentalIncome: yearlyRentalIncome,
          expenses: yearlyExpenses,
          netIncome: yearlyRentalIncome - yearlyExpenses - totalPaid,
          roi: ((yearlyRentalIncome - yearlyExpenses - totalPaid) / loanAmount) * 100
        }
      });
    }
    
    return yearlyReports;
  }
  
  // Calculate property value with annual increase
  function calculatePropertyValue(initialValue, year) {
    return initialValue * Math.pow(1 + (loanParams.annualPropertyValueIncrease / 100), year - 1);
  }
  
  // Calculate yearly rental income with annual increase
  function calculateYearlyRentalIncome(monthlyRental, year) {
    const annualRental = monthlyRental * 12;
    return annualRental * Math.pow(1 + (loanParams.annualRentalIncomeIncrease / 100), year - 1);
  }
  
  // Calculate yearly expenses
  function calculateYearlyExpenses(propertyTax, insurance, maintenance, other) {
    return propertyTax + insurance + maintenance + other;
  }
  
  // Render the yearly data table
  const renderYearlyDataTable = () => {
    if (!yearlyData || !yearlyData[selectedYear - 1]) {
      return <p>No data available for selected year</p>;
    }
    
    const yearReport = yearlyData[selectedYear - 1];
    
    if (yearReport.loanPaidOff) {
      return (
        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-green-700 mb-2">Loan Fully Paid Off!</h3>
          <p className="mb-4">Your loan was completely paid off before this year.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded shadow">
              <p className="font-semibold">Property Value</p>
              <p className="text-xl">{formatCurrency(yearReport.summary.currentPropertyValue)}</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <p className="font-semibold">Equity</p>
              <p className="text-xl">{formatCurrency(yearReport.summary.equity)}</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <p className="font-semibold">Annual Rental Income</p>
              <p className="text-xl">{formatCurrency(yearReport.summary.rentalIncome)}</p>
            </div>
            <div className="p-3 bg-white rounded shadow">
              <p className="font-semibold">Annual Expenses</p>
              <p className="text-xl">{formatCurrency(yearReport.summary.expenses)}</p>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div>
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded shadow">
            <p className="font-semibold">Property Value</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.currentPropertyValue)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded shadow">
            <p className="font-semibold">Equity</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.equity)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded shadow">
            <p className="font-semibold">Yearly Income</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.rentalIncome)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded shadow">
            <p className="font-semibold">Yearly Expenses</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.expenses)}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded shadow">
            <p className="font-semibold">Principal Paid</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.principalPaid)}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded shadow">
            <p className="font-semibold">Interest Paid</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.interestPaid)}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded shadow">
            <p className="font-semibold">Net Income</p>
            <p className="text-xl">{formatCurrency(yearReport.summary.netIncome)}</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded shadow">
            <p className="font-semibold">ROI</p>
            <p className="text-xl">{yearReport.summary.roi.toFixed(2)}%</p>
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-3">Monthly Breakdown - Year {selectedYear}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Payment</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining Principal</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rental Income</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Flow</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {yearReport.monthlyData.map((month, index) => (
                <tr key={`month-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-2 text-sm text-gray-500">{month.month}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.payment)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.principal)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.interest)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.extraPayment)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.remainingPrincipal)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.rentalIncome)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.expenses)}</td>
                  <td className="px-3 py-2 text-sm text-gray-500">{formatCurrency(month.cashFlow)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  // Render charts for the selected year
  const renderYearlyCharts = () => {
    if (!yearlyData || !yearlyData[selectedYear - 1] || yearlyData[selectedYear - 1].loanPaidOff) {
      return null;
    }
    
    const yearReport = yearlyData[selectedYear - 1];
    
    // Prepare data for cash flow chart
    const cashFlowData = yearReport.monthlyData.map(month => ({
      month: month.month,
      rental: month.rentalIncome,
      expenses: month.expenses,
      mortgage: month.payment,
      cashFlow: month.cashFlow
    }));
    
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Monthly Cash Flow - Year {selectedYear}</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={cashFlowData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" tickFormatter={(value) => `${Math.round(value/1000)}k`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value.toFixed(1)}%`} />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'roi') return [`${value.toFixed(2)}%`, name];
                  return [`${value.toLocaleString()}`, name];
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="propertyValue" name="Property Value" stroke="#10B981" />
              <Line yAxisId="left" type="monotone" dataKey="equity" name="Equity" stroke="#3B82F6" />
              <Line yAxisId="left" type="monotone" dataKey="debt" name="Remaining Debt" stroke="#EF4444" />
              <Line yAxisId="left" type="monotone" dataKey="netIncome" name="Net Income" stroke="#8B5CF6" />
              <Line yAxisId="right" type="monotone" dataKey="roi" name="ROI (%)" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center my-4 text-blue-700">Investment Projections by Year</h1>
      
      {/* Investment Parameters Form */}
      {renderInvestmentParamsForm()}
      
      {/* Investment Performance Chart */}
      {renderInvestmentPerformanceChart()}
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {loading ? (
          <p className="text-center">Loading data...</p>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Year:</label>
              <select 
                className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={selectedYear}
                onChange={handleYearChange}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>
            
            <h2 className="text-lg font-semibold mb-3">Year {selectedYear} Data</h2>
            
            {/* Yearly Data Table */}
            {renderYearlyDataTable()}
            
            {/* Yearly Charts */}
            {renderYearlyCharts()}
          </>
        )}
      </div>
    </div>
  );
};

// Share loan data between calculator and yearly view
const App = () => {
  const [currentPage, setCurrentPage] = useState('calculator');
  const [loanData, setLoanData] = useState({
    loanAmount: 300000,
    initialRate: 4.5,
    loanTermYears: 30,
    // More loan parameters can be added here
  });

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  // Update loan data from calculator
  const updateLoanData = (data) => {
    setLoanData({...loanData, ...data});
  };

  return (
    <Layout onNavigate={handleNavigate} currentPage={currentPage}>
      {currentPage === 'calculator' && <MortgageCalculator loanData={loanData} updateLoanData={updateLoanData} />}
      {currentPage === 'yearlyData' && <YearlyDataView loanData={loanData} />}
    </Layout>
  );
};

export default App;="month" />
              <YAxis tickFormatter={(value) => `${Math.round(value)}`} />
              <Tooltip formatter={(value) => [`${value.toFixed(2)}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="rental" name="Rental Income" stroke="#10B981" />
              <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" />
              <Line type="monotone" dataKey="mortgage" name="Mortgage" stroke="#3B82F6" />
              <Line type="monotone" dataKey="cashFlow" name="Cash Flow" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Investment parameter form
  const renderInvestmentParamsForm = () => {
    return (
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold mb-3">Investment Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount ($)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.loanAmount} 
              onChange={(e) => setLoanParams({...loanParams, loanAmount: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input 
              type="number" 
              step="0.01" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.initialRate} 
              onChange={(e) => setLoanParams({...loanParams, initialRate: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Term (Years)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.loanTermYears} 
              onChange={(e) => setLoanParams({...loanParams, loanTermYears: parseInt(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Value ($)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.propertyValue} 
              onChange={(e) => setLoanParams({...loanParams, propertyValue: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Value Growth (%/year)</label>
            <input 
              type="number" 
              step="0.1" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.annualPropertyValueIncrease} 
              onChange={(e) => setLoanParams({...loanParams, annualPropertyValueIncrease: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Rental Income ($)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.rentalIncome} 
              onChange={(e) => setLoanParams({...loanParams, rentalIncome: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rental Income Growth (%/year)</label>
            <input 
              type="number" 
              step="0.1" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.annualRentalIncomeIncrease} 
              onChange={(e) => setLoanParams({...loanParams, annualRentalIncomeIncrease: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Tax ($/year)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.propertyTax} 
              onChange={(e) => setLoanParams({...loanParams, propertyTax: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Insurance ($/year)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.insurance} 
              onChange={(e) => setLoanParams({...loanParams, insurance: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance ($/year)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.maintenanceCost} 
              onChange={(e) => setLoanParams({...loanParams, maintenanceCost: parseFloat(e.target.value)})} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Expenses ($/year)</label>
            <input 
              type="number" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
              value={loanParams.otherExpenses} 
              onChange={(e) => setLoanParams({...loanParams, otherExpenses: parseFloat(e.target.value)})} 
            />
          </div>
        </div>
      </div>
    );
  };

  // Render investment performance chart for all 30 years
  const renderInvestmentPerformanceChart = () => {
    if (!yearlyData || yearlyData.length === 0) {
      return null;
    }
    
    // Prepare data for performance chart
    const performanceData = yearlyData.map(year => ({
      year: year.year,
      propertyValue: year.summary.currentPropertyValue,
      equity: year.summary.equity,
      debt: year.summary.remainingPrincipal,
      netIncome: year.summary.netIncome,
      roi: year.summary.roi
    }));
    
    return (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-3">Investment Performance Over 30 Years</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={performanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKeyimport React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

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

// Main Calculator Component
const MortgageCalculator = ({ loanData, updateLoanData }) => {
  // State for loan inputs
  const [loanAmount, setLoanAmount] = useState(loanData?.loanAmount || 300000);
  const [initialRate, setInitialRate] = useState(loanData?.initialRate || 4.5);
  const [loanTermYears, setLoanTermYears] = useState(loanData?.loanTermYears || 30);
  
  // State for rate changes
  const [rateChanges, setRateChanges] = useState([
    { month: 13, newRate: 4.25 },
    { month: 25, newRate: 4.0 },
    { month: 61, newRate: 4.75 }
  ]);
  
  // State for extra payments
  const [extraPayments, setExtraPayments] = useState([
    { month: 1, amount: 50 },
    { month: 6, amount: 5000 },
    { month: 12, amount: 1000 }
  ]);
  
  // State for regular extra payments
  const [regularExtraAmount, setRegularExtraAmount] = useState(100);
  const [regularStartMonth, setRegularStartMonth] = useState(1);
  const [regularEndMonth, setRegularEndMonth] = useState(360);
  
  // State for staged regular extra payments
  const [stagedPayments, setStagedPayments] = useState([
    { startMonth: 1, endMonth: 36, amount: 100 },
    { startMonth: 37, endMonth: 60, amount: 200 },
    { startMonth: 61, endMonth: 120, amount: 300 }
  ]);
  
  // State for mortgage calculation results
  const [loanSummary, setLoanSummary] = useState(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [rateChangeSummary, setRateChangeSummary] = useState([]);
  const [extraPaymentSummary, setExtraPaymentSummary] = useState([]);
  const [stagedPaymentSummary, setStagedPaymentSummary] = useState([]);
  
  // State for UI tabs
  const [activeTab, setActiveTab] = useState('schedule');
  
  // Function to add new rate change
  const addRateChange = () => {
    setRateChanges([...rateChanges, { month: '', newRate: '' }]);
  };
  
  // Function to add new extra payment
  const addExtraPayment = () => {
    setExtraPayments([...extraPayments, { month: '', amount: '' }]);
  };
  
  // Function to add new staged payment
  const addStagedPayment = () => {
    setStagedPayments([...stagedPayments, { startMonth: '', endMonth: '', amount: '' }]);
  };
  
  // Function to update rate change
  const updateRateChange = (index, field, value) => {
    const updatedRateChanges = [...rateChanges];
    updatedRateChanges[index][field] = value;
    setRateChanges(updatedRateChanges);
  };
  
  // Function to update extra payment
  const updateExtraPayment = (index, field, value) => {
    const updatedExtraPayments = [...extraPayments];
    updatedExtraPayments[index][field] = value;
    setExtraPayments(updatedExtraPayments);
  };
  
  // Function to update staged payment
  const updateStagedPayment = (index, field, value) => {
    const updatedStagedPayments = [...stagedPayments];
    updatedStagedPayments[index][field] = value;
    setStagedPayments(updatedStagedPayments);
  };
  
  // Function to remove rate change
  const removeRateChange = (index) => {
    const updatedRateChanges = [...rateChanges];
    updatedRateChanges.splice(index, 1);
    setRateChanges(updatedRateChanges);
  };
  
  // Function to remove extra payment
  const removeExtraPayment = (index) => {
    const updatedExtraPayments = [...extraPayments];
    updatedExtraPayments.splice(index, 1);
    setExtraPayments(updatedExtraPayments);
  };
  
  // Function to remove staged payment
  const removeStagedPayment = (index) => {
    const updatedStagedPayments = [...stagedPayments];
    updatedStagedPayments.splice(index, 1);
    setStagedPayments(updatedStagedPayments);
  };
  
  // Main function to calculate the mortgage
  const calculateMortgage = () => {
    // Validate and clean input data
    const validRateChanges = rateChanges
      .filter(rc => rc.month && rc.newRate)
      .map(rc => ({ month: parseInt(rc.month), newRate: parseFloat(rc.newRate) }))
      .sort((a, b) => a.month - b.month);
    
    const validExtraPayments = extraPayments
      .filter(ep => ep.month && ep.amount)
      .map(ep => ({ month: parseInt(ep.month), amount: parseFloat(ep.amount) }))
      .sort((a, b) => a.month - b.month);
    
    const validStagedPayments = stagedPayments
      .filter(sp => sp.startMonth && sp.endMonth && sp.amount)
      .map(sp => ({
        startMonth: parseInt(sp.startMonth),
        endMonth: parseInt(sp.endMonth),
        amount: parseFloat(sp.amount)
      }))
      .sort((a, b) => a.startMonth - b.startMonth);
    
    // Basic loan parameters
    const totalMonths = loanTermYears * 12;
    const initialEMI = calculateEMI(loanAmount, initialRate, totalMonths);
    
    // Process all staged payments and add them to extraPayments collection
    let allExtraPayments = [...validExtraPayments];
    
    validStagedPayments.forEach(sp => {
      const { startMonth, endMonth, amount } = sp;
      
      // Add each month's payment to the allExtraPayments array
      for (let i = startMonth; i <= endMonth; i++) {
        // Check if there's already a payment for this month
        const existingIndex = allExtraPayments.findIndex(ep => ep.month === i);
        
        if (existingIndex !== -1) {
          // Add to existing payment
          allExtraPayments[existingIndex].amount += amount;
        } else {
          // Add new payment
          allExtraPayments.push({ month: i, amount: amount });
        }
      }
    });
    
    // Add regular extra payment if defined
    if (regularExtraAmount > 0) {
      for (let i = regularStartMonth; i <= regularEndMonth; i++) {
        // Check if there's already a payment for this month
        const existingIndex = allExtraPayments.findIndex(ep => ep.month === i);
        
        if (existingIndex !== -1) {
          // Add to existing payment
          allExtraPayments[existingIndex].amount += parseFloat(regularExtraAmount);
        } else {
          // Add new payment
          allExtraPayments.push({ month: i, amount: parseFloat(regularExtraAmount) });
        }
      }
    }
    
    // Sort the combined extra payments by month
    allExtraPayments.sort((a, b) => a.month - b.month);
    
    // Calculate the amortization schedule
    let remainingPrincipal = loanAmount;
    let currentMonth = 1;
    let totalInterestPaid = 0;
    let totalExtraPayments = 0;
    let currentRate = initialRate;
    let remainingMonths = totalMonths;
    let currentEMI = initialEMI;
    let schedule = [];
    
    // Process month by month until loan is fully paid
    while (remainingPrincipal > 0.01 && remainingMonths > 0) {
      // Check if interest rate changes this month
      const rateChange = validRateChanges.find(rc => rc.month === currentMonth);
      if (rateChange) {
        // Update the current interest rate
        currentRate = rateChange.newRate;
        
        // Recalculate the EMI based on the new rate but keeping the same remaining months
        currentEMI = calculateEMI(remainingPrincipal, currentRate, remainingMonths);
      }
      
      // Calculate interest portion with current rate
      const interestAmount = remainingPrincipal * (currentRate / 100 / 12);
      
      // Calculate principal portion (EMI minus interest)
      const principalAmount = Math.min(currentEMI - interestAmount, remainingPrincipal);
      
      // Check if there are any extra payments this month
      const extraPayment = allExtraPayments.find(ep => ep.month === currentMonth);
      let extraPaymentAmount = 0;
      
      if (extraPayment) {
        extraPaymentAmount = Math.min(extraPayment.amount, remainingPrincipal - principalAmount);
        totalExtraPayments += extraPaymentAmount;
      }
      
      // Update remaining principal after both regular and extra payments
      remainingPrincipal = remainingPrincipal - (principalAmount + extraPaymentAmount);
      
      // Update total interest paid
      totalInterestPaid += interestAmount;
      
      // Add to schedule
      schedule.push({
        month: currentMonth,
        EMI: currentEMI,
        principalPaid: principalAmount,
        interestPaid: interestAmount,
        extraPayment: extraPaymentAmount,
        remainingPrincipal: remainingPrincipal,
        interestRate: currentRate,
        remainingMonths: remainingMonths
      });
      
      currentMonth += 1;
      remainingMonths -= 1;
      
      // If the loan is paid off earlier than expected
      if (remainingPrincipal <= 0.01) {
        break;
      }
    }
    
    // Calculate interest saved
    const originalTotalInterest = (initialEMI * totalMonths) - loanAmount;
    const interestSaved = originalTotalInterest - totalInterestPaid;
    
    // Prepare loan summary
    const summary = {
      initialLoanAmount: loanAmount,
      initialInterestRate: initialRate,
      initialPayment: initialEMI,
      initialLoanTerm: { years: loanTermYears, months: totalMonths },
      actualLoanTerm: { years: schedule.length / 12, months: schedule.length },
      monthsSaved: totalMonths - schedule.length,
      totalInterestPaid: totalInterestPaid,
      interestSaved: interestSaved,
      totalExtraPayments: totalExtraPayments,
      totalAmountPaid: loanAmount + totalInterestPaid
    };
    
    // Prepare rate change summary
    const rateChangeSummary = [
      { month: 1, newRate: initialRate, newPayment: initialEMI },
      ...validRateChanges.map(rc => {
        const scheduleEntry = schedule.find(entry => entry.month === rc.month);
        return {
          month: rc.month,
          newRate: rc.newRate,
          newPayment: scheduleEntry ? scheduleEntry.EMI : calculateEMI(
            schedule[rc.month - 2].remainingPrincipal,
            rc.newRate,
            totalMonths - rc.month + 1
          )
        };
      })
    ];
    
    // Prepare extra payment summary
    const extraPaymentSummary = schedule
      .filter(entry => entry.extraPayment > 0)
      .map(entry => ({
        month: entry.month,
        amount: entry.extraPayment,
        remainingAfter: entry.remainingPrincipal
      }));
    
    // Prepare staged payment summary
    const stagedPaymentSummary = validStagedPayments.map(sp => {
      const monthsCovered = Math.min(sp.endMonth, schedule.length) - sp.startMonth + 1;
      return {
        startMonth: sp.startMonth,
        endMonth: sp.endMonth,
        amount: sp.amount,
        totalContribution: monthsCovered > 0 ? monthsCovered * sp.amount : 0
      };
    });
    
    // Update state with calculation results
    setLoanSummary(summary);
    setAmortizationSchedule(schedule);
    setRateChangeSummary(rateChangeSummary);
    setExtraPaymentSummary(extraPaymentSummary);
    setStagedPaymentSummary(stagedPaymentSummary);
    
    // Update loan data in parent component for sharing with yearly view
    if (updateLoanData) {
      updateLoanData({
        loanAmount,
        initialRate,
        loanTermYears,
        rateChanges: validRateChanges,
        extraPayments: allExtraPayments,
        schedule
      });
    }
  };
  
  // Function to get CSS class for table row based on rate changes and extra payments
  const getRowClass = (entry, index) => {
    const isRateChange = index > 0 && entry.interestRate !== amortizationSchedule[index - 1].interestRate;
    const hasExtraPayment = entry.extraPayment > 0;
    
    if (isRateChange && hasExtraPayment) {
      return 'bg-orange-50 border-b border-gray-200'; // Both rate change and extra payment
    } else if (isRateChange) {
      return 'bg-yellow-50 border-b border-gray-200'; // Rate change
    } else if (hasExtraPayment) {
      return 'bg-green-50 border-b border-gray-200'; // Extra payment
    } else {
      return index % 2 === 0 ? styles.tableRow : styles.tableRowAlt; // Alternate row coloring
    }
  };
  
  return (
    <div className={styles.appContainer}>
      <h1 className={styles.header}>Variable Rate Mortgage Calculator with Extra Payments</h1>
      
      {/* Loan Inputs */}
      <div className={styles.card}>
        <div className={styles.formGroup}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Loan Amount:</label>
            <input 
              type="number" 
              className={styles.input} 
              value={loanAmount} 
              onChange={(e) => setLoanAmount(parseFloat(e.target.value))} 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Initial Interest Rate (%):</label>
            <input 
              type="number" 
              step="0.01" 
              className={styles.input} 
              value={initialRate} 
              onChange={(e) => setInitialRate(parseFloat(e.target.value))} 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Loan Term (Years):</label>
            <input 
              type="number" 
              className={styles.input} 
              value={loanTermYears} 
              onChange={(e) => setLoanTermYears(parseInt(e.target.value))} 
            />
          </div>
        </div>
        
        <button className={styles.button} onClick={calculateMortgage}>Calculate</button>
      </div>
      
      {/* Rate Changes */}
      <div className={styles.card}>
        <h2 className="text-lg font-semibold mb-3">Interest Rate Changes</h2>
        <div className="mb-4">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.tableHeaderCell} w-1/3`}>Month</th>
                <th className={`${styles.tableHeaderCell} w-1/3`}>New Rate (%)</th>
                <th className={`${styles.tableHeaderCell} w-1/3`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rateChanges.map((rc, index) => (
                <tr key={`rc-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={rc.month} 
                      onChange={(e) => updateRateChange(index, 'month', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      step="0.01" 
                      className={styles.input} 
                      value={rc.newRate} 
                      onChange={(e) => updateRateChange(index, 'newRate', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <button className="text-red-500" onClick={() => removeRateChange(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-2 text-blue-600" onClick={addRateChange}>+ Add Rate Change</button>
        </div>
      </div>
      
      {/* Extra Payments */}
      <div className={styles.card}>
        <h2 className="text-lg font-semibold mb-3">One-time Extra Payments</h2>
        <div className="mb-4">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.tableHeaderCell} w-1/3`}>Month</th>
                <th className={`${styles.tableHeaderCell} w-1/3`}>Amount ($)</th>
                <th className={`${styles.tableHeaderCell} w-1/3`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {extraPayments.map((ep, index) => (
                <tr key={`ep-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={ep.month} 
                      onChange={(e) => updateExtraPayment(index, 'month', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={ep.amount} 
                      onChange={(e) => updateExtraPayment(index, 'amount', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <button className="text-red-500" onClick={() => removeExtraPayment(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-2 text-blue-600" onClick={addExtraPayment}>+ Add Extra Payment</button>
        </div>
      </div>
      
      {/* Regular Extra Payment */}
      <div className={styles.card}>
        <h2 className="text-lg font-semibold mb-3">Regular Extra Payment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={styles.inputGroup}>
            <label className={styles.label}>Monthly Amount:</label>
            <input 
              type="number" 
              className={styles.input} 
              value={regularExtraAmount} 
              onChange={(e) => setRegularExtraAmount(e.target.value)} 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Start Month:</label>
            <input 
              type="number" 
              className={styles.input} 
              value={regularStartMonth} 
              onChange={(e) => setRegularStartMonth(parseInt(e.target.value))} 
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>End Month:</label>
            <input 
              type="number" 
              className={styles.input} 
              value={regularEndMonth} 
              onChange={(e) => setRegularEndMonth(parseInt(e.target.value))} 
            />
          </div>
        </div>
      </div>
      
      {/* Staged Regular Extra Payments */}
      <div className={styles.card}>
        <h2 className="text-lg font-semibold mb-3">Staged Regular Extra Payments</h2>
        <div className="mb-4">
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={`${styles.tableHeaderCell} w-1/4`}>Start Month</th>
                <th className={`${styles.tableHeaderCell} w-1/4`}>End Month</th>
                <th className={`${styles.tableHeaderCell} w-1/4`}>Amount ($)</th>
                <th className={`${styles.tableHeaderCell} w-1/4`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stagedPayments.map((sp, index) => (
                <tr key={`sp-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={sp.startMonth} 
                      onChange={(e) => updateStagedPayment(index, 'startMonth', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={sp.endMonth} 
                      onChange={(e) => updateStagedPayment(index, 'endMonth', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <input 
                      type="number" 
                      className={styles.input} 
                      value={sp.amount} 
                      onChange={(e) => updateStagedPayment(index, 'amount', e.target.value)} 
                    />
                  </td>
                  <td className={styles.tableCell}>
                    <button className="text-red-500" onClick={() => removeStagedPayment(index)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="mt-2 text-blue-600" onClick={addStagedPayment}>+ Add Staged Payment</button>
        </div>
      </div>
      
      {/* Loan Summary */}
      {loanSummary && (
        <div className={styles.card}>
          <h2 className="text-lg font-semibold mb-3">Loan Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Initial Loan Amount:</strong> {formatCurrency(loanSummary.initialLoanAmount)}</p>
              <p><strong>Initial Payment (EMI):</strong> {formatCurrency(loanSummary.initialPayment)}</p>
              <p><strong>Actual Loan Term:</strong> {loanSummary.actualLoanTerm.years.toFixed(2)} years ({loanSummary.actualLoanTerm.months} months)</p>
              <p><strong>Total Interest Paid:</strong> {formatCurrency(loanSummary.totalInterestPaid)}</p>
              <p><strong>Total Extra Payments:</strong> {formatCurrency(loanSummary.totalExtraPayments)}</p>
            </div>
            <div>
              <p><strong>Initial Interest Rate:</strong> {loanSummary.initialInterestRate}%</p>
              <p><strong>Initial Loan Term:</strong> {loanSummary.initialLoanTerm.years} years ({loanSummary.initialLoanTerm.months} months)</p>
              <p><strong>Months Saved:</strong> {loanSummary.monthsSaved}</p>
              <p><strong>Interest Saved:</strong> {formatCurrency(loanSummary.interestSaved)}</p>
              <p><strong>Total Amount Paid:</strong> {formatCurrency(loanSummary.totalAmountPaid)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loan Balance Over Time Chart */}
      {amortizationSchedule.length > 0 && (
        <div className={styles.card}>
          <h2 className="text-lg font-semibold mb-3">Loan Balance Over Time</h2>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={amortizationSchedule.map(entry => ({
                  month: entry.month,
                  balance: entry.remainingPrincipal
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  label={{ value: 'Month', position: 'insideBottomRight', offset: -5 }} 
                />
                <YAxis 
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  label={{ value: 'Remaining Principal', angle: -90, position: 'insideLeft' }} 
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
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* Tabs for different views */}
      {amortizationSchedule.length > 0 && (
        <div className={styles.card}>
          <div className={styles.tabContainer}>
            <div 
              className={activeTab === 'schedule' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('schedule')}
            >
              Amortization Schedule
            </div>
            <div 
              className={activeTab === 'rateChanges' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('rateChanges')}
            >
              Rate Changes
            </div>
            <div 
              className={activeTab === 'extraPayments' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('extraPayments')}
            >
              Extra Payments
            </div>
            <div 
              className={activeTab === 'stagedPayments' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('stagedPayments')}
            >
              Staged Payments
            </div>
          </div>
          
          {/* Amortization Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="overflow-x-auto">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Month</th>
                    <th className={styles.tableHeaderCell}>Payment</th>
                    <th className={styles.tableHeaderCell}>Principal</th>
                    <th className={styles.tableHeaderCell}>Interest</th>
                    <th className={styles.tableHeaderCell}>Extra Payment</th>
                    <th className={styles.tableHeaderCell}>Remaining Principal</th>
                    <th className={styles.tableHeaderCell}>Rate (%)</th>
                    <th className={styles.tableHeaderCell}>Months Left</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.map((entry, index) => (
                    <tr key={`schedule-${index}`} className={getRowClass(entry, index)}>
                      <td className={styles.tableCell}>{entry.month}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.EMI)}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.principalPaid)}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.interestPaid)}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.extraPayment)}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.remainingPrincipal)}</td>
                      <td className={styles.tableCell}>{entry.interestRate.toFixed(2)}</td>
                      <td className={styles.tableCell}>{entry.remainingMonths}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Rate Changes Tab */}
          {activeTab === 'rateChanges' && (
            <div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableHeaderCell}>Month</th>
                    <th className={styles.tableHeaderCell}>New Rate (%)</th>
                    <th className={styles.tableHeaderCell}>New Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {rateChangeSummary.map((entry, index) => (
                    <tr key={`rateChange-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <td className={styles.tableCell}>{entry.month}</td>
                      <td className={styles.tableCell}>{entry.newRate.toFixed(2)}</td>
                      <td className={styles.tableCell}>{formatCurrency(entry.newPayment)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Extra Payments Tab */}
          {activeTab === 'extraPayments' && (
            <div>
              {extraPaymentSummary.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Month</th>
                      <th className={styles.tableHeaderCell}>Amount</th>
                      <th className={styles.tableHeaderCell}>Remaining After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraPaymentSummary.map((entry, index) => (
                      <tr key={`extraPayment-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                        <td className={styles.tableCell}>{entry.month}</td>
                        <td className={styles.tableCell}>{formatCurrency(entry.amount)}</td>
                        <td className={styles.tableCell}>{formatCurrency(entry.remainingAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No extra payments were made.</p>
              )}
            </div>
          )}
          
          {/* Staged Payments Tab */}
          {activeTab === 'stagedPayments' && (
            <div>
              {stagedPaymentSummary.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.tableHeaderCell}>Start Month</th>
                      <th className={styles.tableHeaderCell}>End Month</th>
                      <th className={styles.tableHeaderCell}>Amount</th>
                      <th className={styles.tableHeaderCell}>Total Contributed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stagedPaymentSummary.map((entry, index) => (
                      <tr key={`stagedPayment-${index}`} className={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                        <td className={styles.tableCell}>{entry.startMonth}</td>
                        <td className={styles.tableCell}>{entry.endMonth}</td>
                        <td className={styles.tableCell}>{formatCurrency(entry.amount)}</td>
                        <td className={styles.tableCell}>{formatCurrency(entry.totalContribution)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No staged payments were defined.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Yearly Data Component for displaying yearly data from Excel
const YearlyDataView = () => {
  const [yearlyData, setYearlyData] = useState({});
  const [selectedYear, setSelectedYear] = useState('Year 1');
  const [yearOptions, setYearOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Excel file when component mounts
    const loadExcelData = async () => {
      try {
        setLoading(true);
        const workbook = await window.fs.readFile('20250312SierraGunghalinInvestment.xlsx');
        const wb = XLSX.read(workbook, {
          cellStyles: true,
          cellFormulas: true,
          cellDates: true,
          cellNF: true,
          sheetStubs: true
        });

        // Get all year sheets
        const yearSheets = wb.SheetNames.filter(name => name.startsWith('Year'));
        setYearOptions(yearSheets);

        // Process each year sheet
        const yearsData = {};
        yearSheets.forEach(yearSheet => {
          const sheet = wb.Sheets[yearSheet];
          // Convert sheet to JSON (headers from first row)
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });
          
          // Find the actual header row (which may not be the first row)
          // Look for rows with month names (July, August, etc.)
          let headerRowIndex = -1;
          
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row) continue;
            
            // Check if this row contains month names
            const monthNames = ['July', 'August', 'September', 'October', 'November', 'December', 
                               'January', 'February', 'March', 'April', 'May', 'June'];
            
            // Count how many month names are in this row
            const monthCount = row.filter(cell => 
              typeof cell === 'string' && monthNames.includes(cell)
            ).length;
            
            // If we found at least 6 month names, consider this the header row
            if (monthCount >= 6) {
              headerRowIndex = i;
              break;
            }
          }
          
          // If we found a header row
          if (headerRowIndex >= 0) {
            // Extract headers from the identified header row
            const headers = jsonData[headerRowIndex].map(header => {
              if (header instanceof Date) return header.toLocaleDateString();
              if (header === null || header === undefined) return '';
              return String(header);
            });
            
            // Extract data rows from after the header row
            const data = jsonData.slice(headerRowIndex + 1)
              .filter(row => row && row.length > 0 && row.some(cell => cell !== null))
              .map(row => 
                row.map(cell => {
                  // Handle each cell to ensure it's suitable for rendering
                  if (cell instanceof Date) return cell;
                  if (cell === null || cell === undefined) return '';
                  return cell;
                })
              );
            
            yearsData[yearSheet] = { headers, data };
          } else {
            // Fallback to default behavior if no header row with months was found
            const headers = (jsonData[0] || []).map(header => {
              if (header instanceof Date) return header.toLocaleDateString();
              if (header === null || header === undefined) return '';
              return String(header);
            });
            
            const data = jsonData.slice(1)
              .filter(row => row && row.length > 0 && row.some(cell => cell !== null))
              .map(row => 
                row.map(cell => {
                  if (cell instanceof Date) return cell;
                  if (cell === null || cell === undefined) return '';
                  return cell;
                })
              );
            
            yearsData[yearSheet] = { headers, data };
          }
        });

        setYearlyData(yearsData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading Excel data:', error);
        setError('Failed to load data from Excel file');
        setLoading(false);
      }
    };

    loadExcelData();
  }, []);

  // Handle year selection change
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  // Render the yearly data table
  const renderYearlyDataTable = () => {
    if (!yearlyData[selectedYear]) {
      return <p>No data available for selected year</p>;
    }

    const { headers, data } = yearlyData[selectedYear];

    // Filter out empty headers and corresponding columns
    const validColumns = headers.map((header, index) => ({ header, index }))
      .filter(col => col.header !== null && col.header !== '');

    return (
      <div className="overflow-x-auto">
        <table className={styles.table}>
          <thead>
            <tr>
              {validColumns.map((col, idx) => (
                <th key={`header-${idx}`} className={styles.tableHeaderCell}>
                  {typeof col.header === 'string' ? col.header : String(col.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr key={`row-${rowIdx}`} className={rowIdx % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                {validColumns.map((col, colIdx) => (
                  <td key={`cell-${rowIdx}-${colIdx}`} className={styles.tableCell}>
                    {formatCellValue(row[col.index])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Format cell values based on type
  const formatCellValue = (value) => {
    if (value === null || value === undefined) return '';
    
    // Format numbers with 2 decimal places
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return value.toString();
      } else {
        return value.toFixed(2);
      }
    }
    
    // Format dates
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    // Ensure we return a string, not an object
    return String(value);
  };

  return (
    <div className={styles.yearlyViewContainer}>
      <h1 className={styles.header}>Yearly Data from Investment Workbook</h1>
      <div className={styles.card}>
        {loading ? (
          <p>Loading yearly data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <div className="mb-4">
              <label className={styles.label}>Select Year:</label>
              <select 
                className={styles.yearSelector}
                value={selectedYear}
                onChange={handleYearChange}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <h2 className="text-lg font-semibold mb-3">{selectedYear} Data</h2>
            {renderYearlyDataTable()}
          </>
        )}
      </div>
    </div>
  );
};

// Navigation Layout Component
const Layout = ({ children, onNavigate, currentPage }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold">Mortgage Calculator</div>
          <div className="space-x-4">
            <button 
              onClick={() => onNavigate('calculator')} 
              className={`hover:underline ${currentPage === 'calculator' ? 'font-bold' : ''}`}
            >
              Calculator
            </button>
            <button 
              onClick={() => onNavigate('yearlyData')} 
              className={`hover:underline ${currentPage === 'yearlyData' ? 'font-bold' : ''}`}
            >
              Yearly Data
            </button>
          </div>
        </div>
      </nav>
      <main>
        {children}
      </main>
      <footer className="bg-gray-200 p-4 text-center text-gray-700 mt-8">
        <p>&copy; {new Date().getFullYear()} Mortgage Calculator - Based on VBA Script</p>
      </footer>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState('calculator');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout onNavigate={handleNavigate} currentPage={currentPage}>
      {currentPage === 'calculator' && <MortgageCalculator />}
      {currentPage === 'yearlyData' && <YearlyDataView />}
    </Layout>
  );
};

export default App;