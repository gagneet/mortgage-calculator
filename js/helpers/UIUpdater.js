// UI Updater - Handles updating the UI with calculation results
export class UIUpdater {
    updateUI(elements, propertyData) {
        // Update loan summary
        this.updateLoanSummary(elements, propertyData);

        // Update amortization table
        this.updateAmortizationTable(elements, propertyData);

        // Update cashflow selectors and tables
        this.updateCashflowSelectors(elements, propertyData);
        this.updateCashflowTable(elements, propertyData);

        // Update annual summary table
        this.updateAnnualSummaryTable(elements, propertyData);
        this.updateTaxDetailsTable(elements, propertyData);
    }

    updateLoanSummary(elements, propertyData) {
        if (propertyData.hasSplitLoan) {
            elements.summaryElements.loanPrincipal.textContent =
                (propertyData.results.splitLoan1.totalPrincipal + propertyData.results.splitLoan2.totalPrincipal).toFixed(2);
            elements.summaryElements.loanTerm.textContent = propertyData.loanTerm;
            elements.summaryElements.loanRate.textContent =
                "Split: " + propertyData.splitLoan.rate1.toFixed(2) + "% / " + propertyData.splitLoan.rate2.toFixed(2) + "%";
            elements.summaryElements.monthlyPayment.textContent =
                (propertyData.results.splitLoan1.monthlyPayment + propertyData.results.splitLoan2.monthlyPayment).toFixed(2);
        } else {
            elements.summaryElements.loanPrincipal.textContent = propertyData.results.primaryLoan.totalPrincipal.toFixed(2);
            elements.summaryElements.loanTerm.textContent = propertyData.loanTerm;
            elements.summaryElements.loanRate.textContent = propertyData.initialInterestRate.toFixed(2);
            elements.summaryElements.monthlyPayment.textContent = propertyData.results.primaryLoan.monthlyPayment.toFixed(2);
        }

        // Update equity loan summary if applicable
        if (propertyData.hasEquityLoan) {
            elements.summaryElements.equityPrincipal.textContent = propertyData.results.equityLoan.totalPrincipal.toFixed(2);
            elements.summaryElements.equityTerm.textContent = propertyData.equityLoan.term;
            elements.summaryElements.equityRate.textContent = propertyData.equityLoan.interestRate.toFixed(2);
            elements.summaryElements.equityMonthlyPayment.textContent = propertyData.results.equityLoan.monthlyPayment.toFixed(2);
            document.getElementById('equityLoanSummary').classList.remove('hidden');
        } else {
            document.getElementById('equityLoanSummary').classList.add('hidden');
        }

        // Update total financing summary
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalMonthlyPayment = 0;

        if (propertyData.hasSplitLoan) {
            totalPrincipal = propertyData.results.splitLoan1.totalPrincipal + propertyData.results.splitLoan2.totalPrincipal;
            totalInterest = propertyData.results.splitLoan1.totalInterest + propertyData.results.splitLoan2.totalInterest;
            totalMonthlyPayment = propertyData.results.splitLoan1.monthlyPayment + propertyData.results.splitLoan2.monthlyPayment;
        } else {
            totalPrincipal = propertyData.results.primaryLoan.totalPrincipal;
            totalInterest = propertyData.results.primaryLoan.totalInterest;
            totalMonthlyPayment = propertyData.results.primaryLoan.monthlyPayment;
        }

        if (propertyData.hasEquityLoan) {
            totalPrincipal += propertyData.results.equityLoan.totalPrincipal;
            totalInterest += propertyData.results.equityLoan.totalInterest;
            totalMonthlyPayment += propertyData.results.equityLoan.monthlyPayment;
        }

        elements.summaryElements.totalPrincipal.textContent = totalPrincipal.toFixed(2);
        elements.summaryElements.totalInterest.textContent = totalInterest.toFixed(2);
        elements.summaryElements.totalCost.textContent = (totalPrincipal + totalInterest).toFixed(2);
        elements.summaryElements.totalMonthlyPayment.textContent = totalMonthlyPayment.toFixed(2);
    }

    updateAmortizationTable(elements, propertyData) {
        const selectedLoan = elements.selectors.loanSelector.value;
        const tbody = elements.tables.amortizationTable;

        if (!tbody) return;

        // Clear existing rows
        tbody.innerHTML = '';

        let schedule;

        if (selectedLoan === 'primary') {
            if (propertyData.hasSplitLoan) {
                // Display combined schedule for split loans
                schedule = propertyData.results.primaryLoan.schedule;
            } else {
                schedule = propertyData.results.primaryLoan.schedule;
            }
        } else if (selectedLoan === 'splitLoan1') {
            schedule = propertyData.results.splitLoan1.schedule;
        } else if (selectedLoan === 'splitLoan2') {
            schedule = propertyData.results.splitLoan2.schedule;
        } else if (selectedLoan === 'equity') {
            schedule = propertyData.results.equityLoan.schedule;
        } else { // combined
            // Create a combined schedule by date
            const combined = [];
            const dateMap = new Map();

            // Add primary loan schedule
            if (propertyData.hasSplitLoan) {
                // Already combined primary loan schedules
                propertyData.results.primaryLoan.schedule.forEach(entry => {
                    const dateKey = entry.date.toISOString().split('T')[0];
                    dateMap.set(dateKey, { ...entry });
                });
            } else {
                propertyData.results.primaryLoan.schedule.forEach(entry => {
                    const dateKey = entry.date.toISOString().split('T')[0];
                    dateMap.set(dateKey, { ...entry });
                });
            }

            // Add equity loan schedule
            if (propertyData.hasEquityLoan) {
                propertyData.results.equityLoan.schedule.forEach(entry => {
                    const dateKey = entry.date.toISOString().split('T')[0];
                    if (dateMap.has(dateKey)) {
                        const primaryEntry = dateMap.get(dateKey);
                        dateMap.set(dateKey, {
                            month: primaryEntry.month,
                            date: entry.date,
                            payment: primaryEntry.payment + entry.payment,
                            principal: primaryEntry.principal + entry.principal,
                            interest: primaryEntry.interest + entry.interest,
                            balance: primaryEntry.balance + entry.balance,
                            rate: (primaryEntry.rate + entry.rate) / 2, // Average rate
                            extraPayment: (primaryEntry.extraPayment || 0) + (entry.extraPayment || 0),
                            extraPaymentDescription: primaryEntry.extraPaymentDescription || entry.extraPaymentDescription,
                            totalPayment: (primaryEntry.totalPayment || primaryEntry.payment) +
                                (entry.totalPayment || entry.payment)
                        });
                    } else {
                        dateMap.set(dateKey, { ...entry });
                    }
                });
            }

            // Convert map to array and sort by date
            schedule = Array.from(dateMap.values()).sort((a, b) => a.date - b.date);
        }

        if (!schedule || schedule.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="7" class="text-center">No data available</td>';
            tbody.appendChild(row);
            return;
        }

        // Add rows to table
        schedule.forEach((entry, index) => {
            if (!entry || !entry.date) return;

            const row = document.createElement('tr');

            const dateFormatter = new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'short'
            });

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${dateFormatter.format(entry.date)}</td>
                <td>$${entry.payment.toFixed(2)}</td>
                <td>$${entry.principal.toFixed(2)}</td>
                <td>$${entry.interest.toFixed(2)}</td>
                <td>$${entry.balance.toFixed(2)}</td>
                <td>${entry.rate.toFixed(2)}%</td>
            `;

            tbody.appendChild(row);

            // Add extra payment row if applicable
            if (entry.extraPayment > 0) {
                const extraRow = document.createElement('tr');
                extraRow.className = 'bg-gray-100';
                extraRow.innerHTML = `
                    <td></td>
                    <td colspan="2">Extra payment: $${entry.extraPayment.toFixed(2)}</td>
                    <td colspan="4">${entry.extraPaymentDescription || 'Extra payment'}</td>
                `;
                tbody.appendChild(extraRow);
            }
        });
    }

    updateCashflowSelectors(elements, propertyData) {
        // Get unique years from cash flow data
        const years = Array.from(new Set(
            Object.values(propertyData.results.cashFlow).map(entry => entry.year)
        )).sort();

        if (!elements.selectors.cashflowYearSelector || years.length === 0) return;

        // Clear and update cashflow year selector
        elements.selectors.cashflowYearSelector.innerHTML = '';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            elements.selectors.cashflowYearSelector.appendChild(option);
        });

        // Get unique fiscal years from annual summary
        const fiscalYears = Object.keys(propertyData.results.annualSummary).sort();

        if (!elements.selectors.fiscalYearSelector || fiscalYears.length === 0) return;

        // Clear and update fiscal year selector
        elements.selectors.fiscalYearSelector.innerHTML = '';
        fiscalYears.forEach(fiscalYear => {
            const option = document.createElement('option');
            option.value = fiscalYear;
            option.textContent = fiscalYear;
            elements.selectors.fiscalYearSelector.appendChild(option);
        });

        // Select first options
        if (years.length > 0) {
            elements.selectors.cashflowYearSelector.value = years[0].toString();
        }

        if (fiscalYears.length > 0) {
            elements.selectors.fiscalYearSelector.value = fiscalYears[0];
        }
    }

    updateCashflowTable(elements, propertyData) {
        if (!elements.selectors.cashflowYearSelector || !elements.tables.cashflowTable) {
            console.warn("Missing cashflow selector or table elements");
            return;
        }

        const selectedYear = parseInt(elements.selectors.cashflowYearSelector.value);
        const tbody = elements.tables.cashflowTable;

        // Clear existing rows
        tbody.innerHTML = '';

        // Filter cash flow entries for selected year
        const entries = Object.values(propertyData.results.cashFlow)
            .filter(entry => entry.year === selectedYear)
            .sort((a, b) => a.month - b.month);

        if (entries.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="6" class="text-center">No data available for this year</td>';
            tbody.appendChild(row);
            return;
        }

        // Month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Add rows to table
        entries.forEach(entry => {
            const row = document.createElement('tr');

            let rentalNote = '';
            if (entry.rentalPaymentCount) {
                rentalNote = ` (${entry.rentalPaymentCount} payments)`;
            }

            row.innerHTML = `
                <td>${monthNames[entry.month]}</td>
                <td>$${entry.loanPayment.toFixed(2)}</td>
                <td>$${(entry.totalExpenses - entry.loanPayment).toFixed(2)}</td>
                <td>$${entry.rental.toFixed(2)}${rentalNote}</td>
                <td class="${entry.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}">
                    $${entry.netCashFlow.toFixed(2)}
                </td>
                <td>
                    <button class="view-details bg-blue-500 text-white py-1 px-2 rounded hover:bg-blue-600"
                            data-year="${entry.year}" data-month="${entry.month}">
                        View
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Add event listeners to view details buttons
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', () => {
                const year = parseInt(button.getAttribute('data-year'));
                const month = parseInt(button.getAttribute('data-month'));
                this.showExpenseDetails(elements, propertyData, year, month);
            });
        });
    }

    showExpenseDetails(elements, propertyData, year, month) {
        const key = `${year}-${month}`;
        const entry = propertyData.results.cashFlow[key];

        if (!entry || !elements.expenseDetailsMonth || !elements.tables.expenseDetailsTable || !elements.expenseDetails) {
            console.error("Missing expense details elements or entry");
            return;
        }

        // Month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Set month name in header
        elements.expenseDetailsMonth.textContent = `${monthNames[month]} ${year}`;

        // Clear existing rows
        elements.tables.expenseDetailsTable.innerHTML = '';

        // Add income row
        if (entry.rental > 0) {
            const incomeRow = document.createElement('tr');
            incomeRow.className = 'bg-green-50';

            let rentalNote = 'Rental payment';
            if (entry.rentalPaymentCount) {
                rentalNote += ` (${entry.rentalPaymentCount} fortnightly payments)`;
            }

            incomeRow.innerHTML = `
                <td>Rental Income</td>
                <td class="text-green-600">$${entry.rental.toFixed(2)}</td>
                <td>${rentalNote}</td>
            `;
            elements.tables.expenseDetailsTable.appendChild(incomeRow);

            // Add rental payment dates if available
            if (entry.rentalPaymentDates && entry.rentalPaymentDates.length > 0) {
                const datesRow = document.createElement('tr');
                datesRow.className = 'bg-green-50';

                const formatter = new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });

                const datesFormatted = entry.rentalPaymentDates.map(date =>
                    formatter.format(date)
                ).join(', ');

                datesRow.innerHTML = `
                    <td>Payment Dates</td>
                    <td>-</td>
                    <td>${datesFormatted}</td>
                `;
                elements.tables.expenseDetailsTable.appendChild(datesRow);
            }
        }

        // Add expense rows
        entry.expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.category}</td>
                <td class="text-red-600">$${expense.amount.toFixed(2)}</td>
                <td>${expense.notes || ''}</td>
            `;
            elements.tables.expenseDetailsTable.appendChild(row);
        });

        // Show expense details panel
        elements.expenseDetails.classList.remove('hidden');
    }

    updateAnnualSummaryTable(elements, propertyData) {
        if (!elements.tables.annualSummaryTable) return;

        const tbody = elements.tables.annualSummaryTable;

        // Clear existing rows
        tbody.innerHTML = '';

        // Sort fiscal years
        const summaries = Object.values(propertyData.results.annualSummary).sort((a, b) =>
            a.startYear - b.startYear
        );

        if (summaries.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="8" class="text-center">No annual summary data available</td>';
            tbody.appendChild(row);
            return;
        }

        // Add rows to table
        summaries.forEach(summary => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${summary.fiscalYear}</td>
                <td>${summary.totalExpenses.toFixed(2)}</td>
                <td>${summary.totalIncome.toFixed(2)}</td>
                <td>${summary.interestPaid.toFixed(2)}</td>
                <td>${summary.principalPaid.toFixed(2)}</td>
                <td>${summary.depreciation.toFixed(2)}</td>
                <td>${summary.taxBenefit.toFixed(2)}</td>
                <td class="${summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${summary.netPosition.toFixed(2)}
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    updateTaxDetailsTable(elements, propertyData) {
        if (!elements.selectors.fiscalYearSelector || !elements.tables.taxDetailsTable) return;

        const selectedFiscalYear = elements.selectors.fiscalYearSelector.value;
        const summary = propertyData.results.annualSummary[selectedFiscalYear];

        if (!summary) {
            if (elements.tables.taxDetailsTable) {
                elements.tables.taxDetailsTable.innerHTML = '<tr><td colspan="3" class="text-center">No tax details available</td></tr>';
            }
            return;
        }

        const tbody = elements.tables.taxDetailsTable;

        // Clear existing rows
        tbody.innerHTML = '';

        // Add income row
        const incomeRow = document.createElement('tr');
        incomeRow.className = 'bg-green-50';
        incomeRow.innerHTML = `
            <td>Rental Income</td>
            <td class="text-green-600">${summary.totalIncome.toFixed(2)}</td>
            <td>Total rental income for fiscal year</td>
        `;
        tbody.appendChild(incomeRow);

        // Add expense categories
        const expenseCategories = [
            { name: 'Loan Interest', amount: summary.interestPaid, notes: 'Tax deductible interest payments' },
            { name: 'Depreciation', amount: summary.depreciation, notes: 'Building and fixtures depreciation' },
            { name: 'Property Expenses', amount: summary.totalExpenses - summary.interestPaid - summary.principalPaid, notes: 'Insurance, rates, repairs, etc.' }
        ];

        expenseCategories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name}</td>
                <td class="text-red-600">${category.amount.toFixed(2)}</td>
                <td>${category.notes}</td>
            `;
            tbody.appendChild(row);
        });

        // Add summary rows
        const totalDeductionsRow = document.createElement('tr');
        totalDeductionsRow.className = 'font-semibold bg-gray-100';
        const totalDeductions = summary.totalExpenses - summary.principalPaid + summary.depreciation;

        totalDeductionsRow.innerHTML = `
            <td>Total Deductions</td>
            <td>${totalDeductions.toFixed(2)}</td>
            <td>All tax-deductible expenses</td>
        `;
        tbody.appendChild(totalDeductionsRow);

        const netPositionRow = document.createElement('tr');
        netPositionRow.className = 'font-semibold';
        const netIncome = summary.totalIncome - totalDeductions;
        const isNegative = netIncome < 0;

        netPositionRow.innerHTML = `
            <td>Net Income/Loss</td>
            <td class="${isNegative ? 'text-red-600' : 'text-green-600'}">
                ${netIncome.toFixed(2)}
            </td>
            <td>${isNegative ? 'Property is negatively geared' : 'Property is positively geared'}</td>
        `;
        tbody.appendChild(netPositionRow);

        if (isNegative) {
            const taxBenefitRow = document.createElement('tr');
            taxBenefitRow.className = 'font-semibold bg-blue-50';

            taxBenefitRow.innerHTML = `
                <td>Tax Benefit (45%)</td>
                <td class="text-blue-600">${summary.taxBenefit.toFixed(2)}</td>
                <td>Estimated tax reduction at 45% marginal rate</td>
            `;
            tbody.appendChild(taxBenefitRow);

            const afterTaxRow = document.createElement('tr');
            afterTaxRow.className = 'font-semibold bg-yellow-50';

            afterTaxRow.innerHTML = `
                <td>After-Tax Position</td>
                <td class="${summary.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}">
                    ${summary.netPosition.toFixed(2)}
                </td>
                <td>Net position after tax benefits</td>
            `;
            tbody.appendChild(afterTaxRow);
        }
    }
}