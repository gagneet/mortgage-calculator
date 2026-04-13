// Annual Summary Calculator - Handles annual financial summaries
export class AnnualSummaryCalculator {
    calculateAnnualSummary(propertyData) {
        const annualSummary = {};

        // Group cash flow by fiscal year
        const cashFlowEntries = Object.values(propertyData.results.cashFlow);

        cashFlowEntries.forEach(entry => {
            const fiscalYearStart = propertyData.fiscalYearStartMonth;
            let fiscalYear;

            // Determine fiscal year based on the month
            if (entry.month >= fiscalYearStart) {
                fiscalYear = entry.year;
            } else {
                fiscalYear = entry.year - 1;
            }

            const key = `FY${fiscalYear}-${fiscalYear + 1}`;

            if (!annualSummary[key]) {
                annualSummary[key] = {
                    fiscalYear: key,
                    startYear: fiscalYear,
                    endYear: fiscalYear + 1,
                    totalExpenses: 0,
                    totalIncome: 0,
                    interestPaid: 0,
                    principalPaid: 0,
                    depreciation: 0,
                    taxBenefit: 0,
                    netPosition: 0
                };
            }

            // Add expenses and income
            annualSummary[key].totalExpenses += entry.totalExpenses;
            annualSummary[key].totalIncome += entry.totalIncome;

            // Calculate interest and principal paid
            this.calculateLoanPayments(annualSummary[key], entry, propertyData);
        });

        // Calculate depreciation for each fiscal year
        this.calculateDepreciation(annualSummary, propertyData);

        // Calculate tax benefits and net position
        this.calculateTaxBenefits(annualSummary);

        return annualSummary;
    }

    calculateLoanPayments(summary, entry, propertyData) {
        // Calculate primary loan payments
        const primaryLoanPayment = this.findPaymentForMonth(
            propertyData.results.primaryLoan.schedule,
            entry.date.getFullYear(),
            entry.date.getMonth()
        );

        if (primaryLoanPayment) {
            summary.interestPaid += primaryLoanPayment.interest;
            summary.principalPaid += primaryLoanPayment.principal;
        }

        // Calculate equity loan payments if applicable
        if (propertyData.hasEquityLoan) {
            const equityLoanPayment = this.findPaymentForMonth(
                propertyData.results.equityLoan.schedule,
                entry.date.getFullYear(),
                entry.date.getMonth()
            );

            if (equityLoanPayment) {
                summary.interestPaid += equityLoanPayment.interest;
                summary.principalPaid += equityLoanPayment.principal;
            }
        }
    }

    findPaymentForMonth(schedule, year, month) {
        return schedule.find(p =>
            p.date.getFullYear() === year && p.date.getMonth() === month
        );
    }

    calculateDepreciation(annualSummary, propertyData) {
        if (!propertyData.depreciationItems || propertyData.depreciationItems.length === 0) {
            return;
        }

        propertyData.depreciationItems.forEach(item => {
            // Calculate depreciation amount per year
            const annualDepreciation = item.cost * (item.rate / 100);

            // Apply depreciation to appropriate fiscal years
            Object.keys(annualSummary).forEach(key => {
                const summary = annualSummary[key];
                const fiscalYearEndDate = new Date(summary.endYear, propertyData.fiscalYearStartMonth, 0);

                // Only apply if item was purchased before end of fiscal year
                if (item.startDate <= fiscalYearEndDate) {
                    // For first year, prorate based on purchase date if needed
                    if (item.startDate.getFullYear() === summary.endYear ||
                        (item.startDate.getFullYear() === summary.startYear &&
                            item.startDate.getMonth() >= propertyData.fiscalYearStartMonth)) {

                        // Calculate months in first fiscal year
                        let startMonth = item.startDate.getMonth();
                        let endMonth = propertyData.fiscalYearStartMonth - 1;
                        if (endMonth < 0) endMonth = 11;

                        let monthsInFirstYear;
                        if (startMonth <= endMonth) {
                            monthsInFirstYear = endMonth - startMonth + 1;
                        } else {
                            monthsInFirstYear = 12 - startMonth + endMonth + 1;
                        }

                        const proratedDepreciation = annualDepreciation * (monthsInFirstYear / 12);
                        summary.depreciation += proratedDepreciation;
                    } else {
                        // Full year depreciation
                        summary.depreciation += annualDepreciation;
                    }
                }
            });
        });
    }

    calculateTaxBenefits(annualSummary) {
        Object.values(annualSummary).forEach(summary => {
            const totalDeductions = summary.totalExpenses + summary.depreciation;
            const negativeGearing = Math.max(0, totalDeductions - summary.totalIncome);

            // Tax benefit at 45% rate
            summary.taxBenefit = negativeGearing * 0.45;

            // Net position including tax benefits
            summary.netPosition = summary.totalIncome - summary.totalExpenses + summary.taxBenefit;
        });
    }
}