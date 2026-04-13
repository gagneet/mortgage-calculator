// Chart Controller - Handles all chart visualizations
export class ChartController {
    constructor() {
        // Charts object to store chart instances
        this.charts = {
            cashflow: null,
            loanBalance: null,
            expenseBreakdown: null,
            annualSummary: null
        };
    }

    updateCharts(propertyData) {
        this.initializeCharts();
        this.updateCashflowChart(propertyData);
        this.updateLoanBalanceChart(propertyData);
        this.updateExpenseBreakdownChart(propertyData);
        this.updateAnnualSummaryChart(propertyData);
    }

    initializeCharts() {
        this.initializeCashflowChart();
        this.initializeLoanBalanceChart();
        this.initializeExpenseBreakdownChart();
        this.initializeAnnualSummaryChart();
    }

    initializeCashflowChart() {
        const chartCanvas = document.getElementById('cashflowChart');
        if (!chartCanvas) return;

        if (!this.charts.cashflow) {
            this.charts.cashflow = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Income',
                            backgroundColor: 'rgba(34, 197, 94, 0.5)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 1,
                            data: []
                        },
                        {
                            label: 'Expenses',
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 1,
                            data: []
                        },
                        {
                            label: 'Net Cash Flow',
                            type: 'line',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            fill: false,
                            tension: 0.1,
                            data: []
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        }
    }

    initializeLoanBalanceChart() {
        const chartCanvas = document.getElementById('loanBalanceChart');
        if (!chartCanvas) return;

        if (!this.charts.loanBalance) {
            this.charts.loanBalance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Primary Loan Balance',
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 2,
                            pointRadius: 1,
                            data: []
                        },
                        {
                            label: 'Split Loan 1 Balance',
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            borderColor: 'rgba(16, 185, 129, 1)',
                            borderWidth: 2,
                            pointRadius: 1,
                            data: []
                        },
                        {
                            label: 'Split Loan 2 Balance',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            borderColor: 'rgba(245, 158, 11, 1)',
                            borderWidth: 2,
                            pointRadius: 1,
                            data: []
                        },
                        {
                            label: 'Equity Loan Balance',
                            backgroundColor: 'rgba(139, 92, 246, 0.2)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 2,
                            pointRadius: 1,
                            data: []
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Balance ($)'
                            }
                        }
                    }
                }
            });
        }
    }

    initializeExpenseBreakdownChart() {
        const chartCanvas = document.getElementById('expenseBreakdownChart');
        if (!chartCanvas) return;

        if (!this.charts.expenseBreakdown) {
            this.charts.expenseBreakdown = new Chart(chartCanvas, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Expenses',
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.7)',
                            'rgba(249, 115, 22, 0.7)',
                            'rgba(234, 179, 8, 0.7)',
                            'rgba(59, 130, 246, 0.7)',
                            'rgba(139, 92, 246, 0.7)',
                            'rgba(236, 72, 153, 0.7)',
                            'rgba(16, 185, 129, 0.7)',
                            'rgba(125, 211, 252, 0.7)'
                        ],
                        borderColor: [
                            'rgba(239, 68, 68, 1)',
                            'rgba(249, 115, 22, 1)',
                            'rgba(234, 179, 8, 1)',
                            'rgba(59, 130, 246, 1)',
                            'rgba(139, 92, 246, 1)',
                            'rgba(236, 72, 153, 1)',
                            'rgba(16, 185, 129, 1)',
                            'rgba(125, 211, 252, 1)'
                        ],
                        borderWidth: 1,
                        data: []
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    }

    initializeAnnualSummaryChart() {
        const chartCanvas = document.getElementById('annualSummaryChart');
        if (!chartCanvas) return;

        if (!this.charts.annualSummary) {
            this.charts.annualSummary = new Chart(chartCanvas, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [
                        {
                            label: 'Income',
                            backgroundColor: 'rgba(34, 197, 94, 0.5)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 1,
                            data: []
                        },
                        {
                            label: 'Expenses',
                            backgroundColor: 'rgba(239, 68, 68, 0.5)',
                            borderColor: 'rgba(239, 68, 68, 1)',
                            borderWidth: 1,
                            data: []
                        },
                        {
                            label: 'Tax Benefit',
                            backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            borderColor: 'rgba(59, 130, 246, 1)',
                            borderWidth: 1,
                            data: []
                        },
                        {
                            label: 'Net Position',
                            type: 'line',
                            backgroundColor: 'rgba(139, 92, 246, 0.5)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 2,
                            pointRadius: 4,
                            fill: false,
                            tension: 0.1,
                            data: []
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Amount ($)'
                            }
                        }
                    }
                }
            });
        }
    }

    updateCashflowChart(propertyData) {
        if (!this.charts.cashflow) return;

        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // Get the latest year's data
        const yearSelector = document.getElementById('cashflowYearSelector');
        if (!yearSelector) return;

        const selectedYear = parseInt(yearSelector.value) || new Date().getFullYear();

        const entries = Object.values(propertyData.results.cashFlow)
            .filter(entry => entry.year === selectedYear)
            .sort((a, b) => a.month - b.month);

        const labels = entries.map(entry => monthNames[entry.month]);
        const incomeData = entries.map(entry => entry.totalIncome);
        const expenseData = entries.map(entry => entry.totalExpenses);
        const netData = entries.map(entry => entry.netCashFlow);

        this.charts.cashflow.data.labels = labels;
        this.charts.cashflow.data.datasets[0].data = incomeData;
        this.charts.cashflow.data.datasets[1].data = expenseData;
        this.charts.cashflow.data.datasets[2].data = netData;

        this.charts.cashflow.update();
    }

    updateLoanBalanceChart(propertyData) {
        if (!this.charts.loanBalance) return;

        const dateFormatter = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short'
        });

        // Sample the loan schedules (e.g., every 6 months) to keep the chart manageable
        const sampleInterval = 6;

        // Primary loan balance
        const primarySchedule = propertyData.results.primaryLoan.schedule;
        const primaryLabels = [];
        const primaryData = [];

        const splitLoan1Data = [];
        const splitLoan2Data = [];

        // Set up data arrays
        for (let i = 0; i < primarySchedule.length; i += sampleInterval) {
            const entry = primarySchedule[i];
            if (!entry) continue;

            primaryLabels.push(dateFormatter.format(entry.date));
            primaryData.push(entry.balance);
        }

        // Fill split loan data arrays if using split loans
        if (propertyData.hasSplitLoan) {
            // Hide primary loan dataset
            this.charts.loanBalance.data.datasets[0].hidden = true;

            // Show split loan datasets
            this.charts.loanBalance.data.datasets[1].hidden = false;
            this.charts.loanBalance.data.datasets[2].hidden = false;

            // Populate split loan 1 data
            const splitLoan1Schedule = propertyData.results.splitLoan1.schedule;
            for (let i = 0; i < splitLoan1Schedule.length; i += sampleInterval) {
                const entry = splitLoan1Schedule[i];
                if (!entry) continue;

                splitLoan1Data.push(entry.balance);
            }

            // Populate split loan 2 data
            const splitLoan2Schedule = propertyData.results.splitLoan2.schedule;
            for (let i = 0; i < splitLoan2Schedule.length; i += sampleInterval) {
                const entry = splitLoan2Schedule[i];
                if (!entry) continue;

                splitLoan2Data.push(entry.balance);
            }
        } else {
            // Show primary loan dataset
            this.charts.loanBalance.data.datasets[0].hidden = false;

            // Hide split loan datasets
            this.charts.loanBalance.data.datasets[1].hidden = true;
            this.charts.loanBalance.data.datasets[2].hidden = true;
        }

        // Equity loan balance
        const equitySchedule = propertyData.hasEquityLoan ? propertyData.results.equityLoan.schedule : [];
        const equityData = [];

        for (let i = 0; i < equitySchedule.length; i += sampleInterval) {
            const entry = equitySchedule[i];
            if (!entry) continue;

            equityData.push(entry.balance);
        }

        this.charts.loanBalance.data.labels = primaryLabels;
        this.charts.loanBalance.data.datasets[0].data = primaryData;
        this.charts.loanBalance.data.datasets[1].data = splitLoan1Data;
        this.charts.loanBalance.data.datasets[2].data = splitLoan2Data;
        this.charts.loanBalance.data.datasets[3].data = equityData;

        // Show/hide equity loan dataset
        this.charts.loanBalance.data.datasets[3].hidden = !propertyData.hasEquityLoan;

        this.charts.loanBalance.update();
    }

    updateExpenseBreakdownChart(propertyData) {
        if (!this.charts.expenseBreakdown) return;

        // Aggregate expenses by category
        const expenseCategories = {};

        // Go through all cash flow entries and collect expenses
        Object.values(propertyData.results.cashFlow).forEach(entry => {
            entry.expenses.forEach(expense => {
                const category = expense.category;
                if (!expenseCategories[category]) {
                    expenseCategories[category] = 0;
                }
                expenseCategories[category] += expense.amount;
            });
        });

        // Sort categories by amount and take top 7, combine the rest
        const sortedCategories = Object.entries(expenseCategories)
            .sort((a, b) => b[1] - a[1]);

        const topCategories = sortedCategories.slice(0, 7);
        const otherCategories = sortedCategories.slice(7);

        let otherTotal = 0;
        otherCategories.forEach(([_, amount]) => {
            otherTotal += amount;
        });

        const labels = topCategories.map(([category]) => category);
        const data = topCategories.map(([_, amount]) => amount);

        if (otherTotal > 0) {
            labels.push('Other');
            data.push(otherTotal);
        }

        this.charts.expenseBreakdown.data.labels = labels;
        this.charts.expenseBreakdown.data.datasets[0].data = data;

        this.charts.expenseBreakdown.update();
    }

    updateAnnualSummaryChart(propertyData) {
        if (!this.charts.annualSummary) return;

        const summaries = Object.values(propertyData.results.annualSummary)
            .sort((a, b) => a.startYear - b.startYear);

        const labels = summaries.map(summary => summary.fiscalYear);
        const incomeData = summaries.map(summary => summary.totalIncome);
        const expenseData = summaries.map(summary => summary.totalExpenses);
        const taxBenefitData = summaries.map(summary => summary.taxBenefit);
        const netPositionData = summaries.map(summary => summary.netPosition);

        this.charts.annualSummary.data.labels = labels;
        this.charts.annualSummary.data.datasets[0].data = incomeData;
        this.charts.annualSummary.data.datasets[1].data = expenseData;
        this.charts.annualSummary.data.datasets[2].data = taxBenefitData;
        this.charts.annualSummary.data.datasets[3].data = netPositionData;

        this.charts.annualSummary.update();
    }
}