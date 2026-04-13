// Cash Flow Calculator - Handles cash flow calculations
export class CashFlowCalculator {
    calculateMonthlyCashFlow(propertyData) {
        const cashFlow = {};

        // Determine the date range for calculations
        const startDate = new Date(propertyData.loanStartDate);
        let endDate = new Date(startDate);

        // Find the end date based on the loan schedules
        if (propertyData.results.primaryLoan.schedule.length > 0) {
            const primaryEndDate = propertyData.results.primaryLoan.schedule[propertyData.results.primaryLoan.schedule.length - 1].date;
            endDate = primaryEndDate > endDate ? primaryEndDate : endDate;
        }

        if (propertyData.results.equityLoan.schedule.length > 0) {
            const equityEndDate = propertyData.results.equityLoan.schedule[propertyData.results.equityLoan.schedule.length - 1].date;
            endDate = equityEndDate > endDate ? equityEndDate : endDate;
        }

        // Calculate cash flow for each month
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();

            const key = `${year}-${month}`;

            if (!cashFlow[key]) {
                cashFlow[key] = {
                    date: new Date(currentDate),
                    year: year,
                    month: month,
                    loanPayment: 0,
                    expenses: [],
                    rental: 0,
                    totalExpenses: 0,
                    totalIncome: 0,
                    netCashFlow: 0
                };
            }

            // Add loan payments
            let primaryPayment = 0;
            let equityPayment = 0;

            // Find primary loan payment for this month
            const primaryLoanPayment = this.findPaymentForMonth(propertyData.results.primaryLoan.schedule, year, month);

            if (primaryLoanPayment) {
                primaryPayment = primaryLoanPayment.payment;
                cashFlow[key].expenses.push({
                    category: 'Primary Loan Payment',
                    amount: primaryPayment,
                    notes: `Interest: $${primaryLoanPayment.interest.toFixed(2)}, Principal: $${primaryLoanPayment.principal.toFixed(2)}`
                });
            }

            // Find equity loan payment for this month
            if (propertyData.hasEquityLoan) {
                const equityLoanPayment = this.findPaymentForMonth(propertyData.results.equityLoan.schedule, year, month);

                if (equityLoanPayment) {
                    equityPayment = equityLoanPayment.payment;
                    cashFlow[key].expenses.push({
                        category: 'Equity Loan Payment',
                        amount: equityPayment,
                        notes: `Interest: $${equityLoanPayment.interest.toFixed(2)}, Principal: $${equityLoanPayment.principal.toFixed(2)}`
                    });
                }
            }

            cashFlow[key].loanPayment = primaryPayment + equityPayment;

            // Add recurring expenses (quarterly)
            this.addRecurringExpenses(cashFlow[key], month, propertyData.recurringExpenses);

            // Calculate rental income
            this.calculateRentalIncome(cashFlow[key], currentDate, propertyData);

            // Add any misc repairs for this month
            this.addMiscRepairs(cashFlow[key], year, month, propertyData.miscRepairs);

            // Add settlement costs for the first month only
            if (currentDate.getFullYear() === startDate.getFullYear() && currentDate.getMonth() === startDate.getMonth()) {
                this.addSettlementCosts(cashFlow[key], propertyData.settlementCosts);
            }

            // Calculate totals
            cashFlow[key].totalExpenses = cashFlow[key].loanPayment +
                cashFlow[key].expenses.reduce((sum, expense) => sum + expense.amount, 0);

            cashFlow[key].totalIncome = cashFlow[key].rental;
            cashFlow[key].netCashFlow = cashFlow[key].totalIncome - cashFlow[key].totalExpenses;

            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return cashFlow;
    }

    findPaymentForMonth(schedule, year, month) {
        return schedule.find(p =>
            p.date.getFullYear() === year && p.date.getMonth() === month
        );
    }

    addRecurringExpenses(cashFlowEntry, month, recurringExpenses) {
        // Check if it's a quarter month (Jan, Apr, Jul, Oct)
        const isQuarterMonth = month % 3 === 0;

        if (isQuarterMonth) {
            // Land tax (quarterly)
            const quarterlyLandTax = recurringExpenses.landTax / 4;
            if (quarterlyLandTax > 0) {
                cashFlowEntry.expenses.push({
                    category: 'Land Tax (Quarterly)',
                    amount: quarterlyLandTax,
                    notes: `Quarterly payment (${quarterlyLandTax.toFixed(2)} × 4 = ${recurringExpenses.landTax.toFixed(2)} yearly)`
                });
            }

            // Council rates (quarterly)
            const quarterlyCouncilRates = recurringExpenses.councilRates / 4;
            if (quarterlyCouncilRates > 0) {
                cashFlowEntry.expenses.push({
                    category: 'Council Rates (Quarterly)',
                    amount: quarterlyCouncilRates,
                    notes: `Quarterly payment (${quarterlyCouncilRates.toFixed(2)} × 4 = ${recurringExpenses.councilRates.toFixed(2)} yearly)`
                });
            }

            // Strata rates (quarterly)
            const quarterlyStrataRates = recurringExpenses.strataRates / 4;
            if (quarterlyStrataRates > 0) {
                cashFlowEntry.expenses.push({
                    category: 'Strata Rates (Quarterly)',
                    amount: quarterlyStrataRates,
                    notes: `Quarterly payment (${quarterlyStrataRates.toFixed(2)} × 4 = ${recurringExpenses.strataRates.toFixed(2)} yearly)`
                });
            }

            // Water rates (quarterly)
            const quarterlyWaterRates = recurringExpenses.waterRates / 4;
            if (quarterlyWaterRates > 0) {
                cashFlowEntry.expenses.push({
                    category: 'Water Rates (Quarterly)',
                    amount: quarterlyWaterRates,
                    notes: `Quarterly payment (${quarterlyWaterRates.toFixed(2)} × 4 = ${recurringExpenses.waterRates.toFixed(2)} yearly)`
                });
            }
        }

        // Home & Contents Insurance (monthly)
        const monthlyInsurance = recurringExpenses.insurance / 12;
        if (monthlyInsurance > 0) {
            cashFlowEntry.expenses.push({
                category: 'Home & Contents Insurance',
                amount: monthlyInsurance,
                notes: `Monthly payment (${monthlyInsurance.toFixed(2)} × 12 = ${recurringExpenses.insurance.toFixed(2)} yearly)`
            });
        }
    }

    calculateRentalIncome(cashFlowEntry, currentDate, propertyData) {
        if (propertyData.weeklyRent > 0 && currentDate >= propertyData.rentalStartDate) {
            // Calculate fortnightly rental payments based on exact dates
            const rentalStartDate = new Date(propertyData.rentalStartDate);

            // Determine the fortnightly rental payment dates in this month
            const monthStart = new Date(cashFlowEntry.year, cashFlowEntry.month, 1);
            const monthEnd = new Date(cashFlowEntry.year, cashFlowEntry.month + 1, 0); // Last day of month

            // Find all fortnightly payments in this month
            let paymentDate = new Date(rentalStartDate);
            let fortnightRentalIncome = 0;

            // Go to the first payment before or on the start of the month
            while (paymentDate > monthStart) {
                paymentDate.setDate(paymentDate.getDate() - 14);
            }

            // If we went too far back, move forward one payment
            if (paymentDate < monthStart) {
                paymentDate.setDate(paymentDate.getDate() + 14);
            }

            // Count all payments in this month
            let paymentsInMonth = [];
            while (paymentDate <= monthEnd) {
                // Only count payments after the rental start date
                if (paymentDate >= rentalStartDate) {
                    paymentsInMonth.push(new Date(paymentDate));
                    fortnightRentalIncome += propertyData.weeklyRent * 2;
                }

                // Go to next payment date
                paymentDate.setDate(paymentDate.getDate() + 14);
            }

            cashFlowEntry.rental = fortnightRentalIncome;

            // Add a note about the number of payments
            if (paymentsInMonth.length > 0) {
                cashFlowEntry.rentalPaymentDates = paymentsInMonth;
                cashFlowEntry.rentalPaymentCount = paymentsInMonth.length;
            }

            // Calculate agent fees based on percentage
            if (propertyData.settlementCosts.agentFeesPercentage > 0 && fortnightRentalIncome > 0) {
                const agentFees = fortnightRentalIncome * (propertyData.settlementCosts.agentFeesPercentage / 100);

                cashFlowEntry.expenses.push({
                    category: 'Agent Fees',
                    amount: agentFees,
                    notes: `${propertyData.settlementCosts.agentFeesPercentage}% of rental income ($${fortnightRentalIncome.toFixed(2)})`
                });
            }
        }
    }

    addMiscRepairs(cashFlowEntry, year, month, miscRepairs) {
        if (!miscRepairs || miscRepairs.length === 0) return;

        miscRepairs.forEach(repair => {
            if (repair.date.getFullYear() === year && repair.date.getMonth() === month) {
                cashFlowEntry.expenses.push({
                    category: 'Miscellaneous Repair',
                    amount: repair.amount,
                    notes: repair.description
                });
            }
        });
    }

    addSettlementCosts(cashFlowEntry, settlementCosts) {
        Object.entries(settlementCosts).forEach(([key, value]) => {
            // Skip agent fees percentage as it's handled separately
            if (key === 'agentFeesPercentage') return;

            if (value > 0) {
                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
                    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter

                cashFlowEntry.expenses.push({
                    category: formattedKey,
                    amount: value,
                    notes: 'One-time settlement cost'
                });
            }
        });
    }
}