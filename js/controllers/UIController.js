// UI Controller - Handles all DOM interactions
import { FormInputHelper } from '../helpers/FormInputHelper.js';
import { UIUpdater } from '../helpers/UIUpdater.js';

export class UIController {
    constructor() {
        // Store DOM elements
        this.elements = {};
        this.formHelper = new FormInputHelper();
        this.uiUpdater = new UIUpdater();
    }

    // Initialize the UI controller
    initialize() {
        // Initialize all DOM element references
        this.initializeElements();

        // Set up tab navigation
        this.setupTabNavigation();
    }

    // Set up tab navigation
    setupTabNavigation() {
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                this.elements.tabs.forEach(t => t.classList.remove('active'));
                this.elements.tabContents.forEach(c => c.classList.remove('active'));

                // Add active class to selected tab and content
                tab.classList.add('active');
                document.getElementById(tabId).classList.add('active');

                // If dashboard tab is activated, update charts
                if (tabId === 'dashboard' && this.chartController) {
                    this.chartController.updateCharts(this.propertyData);
                }
            });
        });
    }

    // Initialize all DOM elements
    initializeElements() {
        this.elements = {
            tabs: document.querySelectorAll('.nav-tab'),
            tabContents: document.querySelectorAll('.tab-content'),
            inputFields: {
                loanStartDate: document.getElementById('loanStartDate'),
                contractPrice: document.getElementById('contractPrice'),
                initialDeposit: document.getElementById('initialDeposit'),
                loanAmount: document.getElementById('loanAmount'),
                builderRebate: document.getElementById('builderRebate'),
                loanTerm: document.getElementById('loanTerm'),
                loanType: document.getElementById('loanType'),
                fixedTerm: document.getElementById('fixedTerm'),
                initialInterestRate: document.getElementById('initialInterestRate'),
                fiscalYearStartMonth: document.getElementById('fiscalYearStartMonth'),
                rentalStartDate: document.getElementById('rentalStartDate'),
                weeklyRent: document.getElementById('weeklyRent'),

                // Settlement costs
                stampDuty: document.getElementById('stampDuty'),
                transferFee: document.getElementById('transferFee'),
                mortgageFee: document.getElementById('mortgageFee'),
                governmentFee: document.getElementById('governmentFee'),
                bankWealthPackage: document.getElementById('bankWealthPackage'),
                solicitorFees: document.getElementById('solicitorFees'),
                conveyancerFees: document.getElementById('conveyancerFees'),
                propertyInspection: document.getElementById('propertyInspection'),
                furnishings: document.getElementById('furnishings'),
                bankChequeFee: document.getElementById('bankChequeFee'),
                bankSettlementFee: document.getElementById('bankSettlementFee'),
                landTitlesOfficeFees: document.getElementById('landTitlesOfficeFees'),
                initialUtilities: document.getElementById('initialUtilities'),
                initialStrataFees: document.getElementById('initialStrataFees'),
                agentFeesPercentage: document.getElementById('agentFeesPercentage'),

                // Recurring expenses
                landTax: document.getElementById('landTax'),
                councilRates: document.getElementById('councilRates'),
                strataRates: document.getElementById('strataRates'),
                waterRates: document.getElementById('waterRates'),
                insurance: document.getElementById('insurance'),

                // Split loan
                hasSplitLoan: document.getElementById('hasSplitLoan'),
                splitLoanAmount1: document.getElementById('splitLoanAmount1'),
                splitLoanAmount2: document.getElementById('splitLoanAmount2'),
                splitLoanRate1: document.getElementById('splitLoanRate1'),
                splitLoanRate2: document.getElementById('splitLoanRate2'),
                splitLoanType1: document.getElementById('splitLoanType1'),
                splitLoanType2: document.getElementById('splitLoanType2'),
                splitLoanFixedTerm1: document.getElementById('splitLoanFixedTerm1'),
                splitLoanFixedTerm2: document.getElementById('splitLoanFixedTerm2'),

                // Equity loan
                hasEquityLoan: document.getElementById('hasEquityLoan'),
                equityLoanStartDate: document.getElementById('equityLoanStartDate'),
                equityLoanAmount: document.getElementById('equityLoanAmount'),
                equityLoanTerm: document.getElementById('equityLoanTerm'),
                equityLoanInterestRate: document.getElementById('equityLoanInterestRate'),
                equityLoanType: document.getElementById('equityLoanType'),
                equityFixedTerm: document.getElementById('equityFixedTerm')
            },
            containers: {
                interestRateChanges: document.getElementById('interestRateChanges'),
                miscRepairs: document.getElementById('miscRepairs'),
                extraPayments: document.getElementById('extraPayments'),
                depreciationItems: document.getElementById('depreciationItems'),
                equityLoanDetails: document.getElementById('equityLoanDetails'),
                splitLoanDetails: document.getElementById('splitLoanDetails')
            },
            buttons: {
                calculate: document.getElementById('calculateButton'),
                addInterestRateChange: document.getElementById('addInterestRateChange'),
                addMiscRepair: document.getElementById('addMiscRepair'),
                addExtraPayment: document.getElementById('addExtraPayment'),
                addDepreciationItem: document.getElementById('addDepreciationItem'),
                closeExpenseDetails: document.getElementById('closeExpenseDetails')
            },
            summaryElements: {
                loanPrincipal: document.getElementById('summaryLoanPrincipal'),
                loanTerm: document.getElementById('summaryLoanTerm'),
                loanRate: document.getElementById('summaryLoanRate'),
                monthlyPayment: document.getElementById('summaryMonthlyPayment'),
                equityPrincipal: document.getElementById('summaryEquityPrincipal'),
                equityTerm: document.getElementById('summaryEquityTerm'),
                equityRate: document.getElementById('summaryEquityRate'),
                equityMonthlyPayment: document.getElementById('summaryEquityMonthlyPayment'),
                totalPrincipal: document.getElementById('summaryTotalPrincipal'),
                totalInterest: document.getElementById('summaryTotalInterest'),
                totalCost: document.getElementById('summaryTotalCost'),
                totalMonthlyPayment: document.getElementById('summaryTotalMonthlyPayment')
            },
            selectors: {
                loanSelector: document.getElementById('loanSelector'),
                cashflowYearSelector: document.getElementById('cashflowYearSelector'),
                fiscalYearSelector: document.getElementById('fiscalYearSelector')
            },
            tables: {
                amortizationTable: document.getElementById('amortizationTableBody'),
                cashflowTable: document.getElementById('cashflowTableBody'),
                expenseDetailsTable: document.getElementById('expenseDetailsTableBody'),
                annualSummaryTable: document.getElementById('annualSummaryTableBody'),
                taxDetailsTable: document.getElementById('taxDetailsTableBody')
            },
            chartCanvases: {
                cashflowChart: document.getElementById('cashflowChart'),
                loanBalanceChart: document.getElementById('loanBalanceChart'),
                expenseBreakdownChart: document.getElementById('expenseBreakdownChart'),
                annualSummaryChart: document.getElementById('annualSummaryChart')
            },
            depreciationUpload: document.getElementById('depreciationUpload'),
            expenseDetails: document.getElementById('expenseDetails'),
            expenseDetailsMonth: document.getElementById('expenseDetailsMonth')
        };
    }

    // Bind event listeners to UI elements
    bindEventListeners(propertyData, calculationController, chartController) {
        // Store references to controllers
        this.propertyData = propertyData;
        this.calculationController = calculationController;
        this.chartController = chartController;

        // Calculate button
        if (this.elements.buttons.calculate) {
            this.elements.buttons.calculate.addEventListener('click', () => {
                try {
                    // Collect form data
                    this.formHelper.collectFormData(this.elements, propertyData);

                    // Perform calculations
                    calculationController.calculateAll();

                    // Update UI with results
                    this.uiUpdater.updateUI(this.elements, propertyData);

                    // Switch to amortization tab
                    const amortizationTab = document.querySelector('[data-tab="amortization"]');
                    if (amortizationTab) {
                        amortizationTab.click();
                    }
                } catch (error) {
                    console.error("Error in calculations:", error);
                    alert("There was an error in the calculations. Please check your inputs and try again.");
                }
            });
        }

        // Add dynamic form elements
        if (this.elements.buttons.addInterestRateChange) {
            this.elements.buttons.addInterestRateChange.addEventListener('click', () => {
                this.formHelper.addInterestRateChange(this.elements.containers.interestRateChanges);
            });
        }

        if (this.elements.buttons.addMiscRepair) {
            this.elements.buttons.addMiscRepair.addEventListener('click', () => {
                this.formHelper.addMiscRepair(this.elements.containers.miscRepairs);
            });
        }

        if (this.elements.buttons.addExtraPayment) {
            this.elements.buttons.addExtraPayment.addEventListener('click', () => {
                this.formHelper.addExtraPayment(this.elements.containers.extraPayments);
            });
        }

        if (this.elements.buttons.addDepreciationItem) {
            this.elements.buttons.addDepreciationItem.addEventListener('click', () => {
                this.formHelper.addDepreciationItem(this.elements.containers.depreciationItems);
            });
        }

        // Show/hide equity loan details
        if (this.elements.inputFields.hasEquityLoan) {
            this.elements.inputFields.hasEquityLoan.addEventListener('change', () => {
                if (this.elements.inputFields.hasEquityLoan.value === 'yes') {
                    this.elements.containers.equityLoanDetails.classList.remove('hidden');
                } else {
                    this.elements.containers.equityLoanDetails.classList.add('hidden');
                }
            });
        }

        // Show/hide split loan details
        if (this.elements.inputFields.hasSplitLoan) {
            this.elements.inputFields.hasSplitLoan.addEventListener('change', () => {
                if (this.elements.inputFields.hasSplitLoan.value === 'yes') {
                    this.elements.containers.splitLoanDetails.classList.remove('hidden');
                    // Disable normal loan amount - will be sum of splits
                    if (this.elements.inputFields.loanAmount) {
                        this.elements.inputFields.loanAmount.disabled = true;
                    }
                } else {
                    this.elements.containers.splitLoanDetails.classList.add('hidden');
                    if (this.elements.inputFields.loanAmount) {
                        this.elements.inputFields.loanAmount.disabled = false;
                    }
                }

                // Update loan amounts when toggling
                this.formHelper.updateSplitLoanAmounts(this.elements);
            });
        }

        // Update split loan amounts when changed
        if (this.elements.inputFields.splitLoanAmount1) {
            this.elements.inputFields.splitLoanAmount1.addEventListener('change', () => {
                this.formHelper.updateSplitLoanAmounts(this.elements);
            });
        }

        if (this.elements.inputFields.splitLoanAmount2) {
            this.elements.inputFields.splitLoanAmount2.addEventListener('change', () => {
                this.formHelper.updateSplitLoanAmounts(this.elements);
            });
        }

        // Loan selector change
        if (this.elements.selectors.loanSelector) {
            this.elements.selectors.loanSelector.addEventListener('change', () => {
                this.uiUpdater.updateAmortizationTable(this.elements, propertyData);
            });
        }

        // Year selectors change
        if (this.elements.selectors.cashflowYearSelector) {
            this.elements.selectors.cashflowYearSelector.addEventListener('change', () => {
                this.uiUpdater.updateCashflowTable(this.elements, propertyData);
            });
        }

        if (this.elements.selectors.fiscalYearSelector) {
            this.elements.selectors.fiscalYearSelector.addEventListener('change', () => {
                this.uiUpdater.updateTaxDetailsTable(this.elements, propertyData);
            });
        }

        // Close expense details
        if (this.elements.buttons.closeExpenseDetails) {
            this.elements.buttons.closeExpenseDetails.addEventListener('click', () => {
                if (this.elements.expenseDetails) {
                    this.elements.expenseDetails.classList.add('hidden');
                }
            });
        }

        // Handle depreciation file upload
        if (this.elements.depreciationUpload) {
            this.elements.depreciationUpload.addEventListener('change', (event) => {
                this.formHelper.handleDepreciationUpload(event, this.elements);
            });
        }

        // Auto calculate loan amount if not specified
        if (this.elements.inputFields.contractPrice) {
            this.elements.inputFields.contractPrice.addEventListener('change', () => {
                this.formHelper.updateLoanAmount(this.elements);
            });
        }

        if (this.elements.inputFields.initialDeposit) {
            this.elements.inputFields.initialDeposit.addEventListener('change', () => {
                this.formHelper.updateLoanAmount(this.elements);
            });
        }

        if (this.elements.inputFields.builderRebate) {
            this.elements.inputFields.builderRebate.addEventListener('change', () => {
                this.formHelper.updateLoanAmount(this.elements);
            });
        }
    }

    // Set default values for the form
    setDefaultValues() {
        // Set default dates
        const today = new Date();

        if (this.elements.inputFields.loanStartDate) {
            this.elements.inputFields.loanStartDate.value = today.toISOString().split('T')[0];
        }

        if (this.elements.inputFields.rentalStartDate) {
            this.elements.inputFields.rentalStartDate.value = today.toISOString().split('T')[0];
        }

        if (this.elements.inputFields.fiscalYearStartMonth) {
            this.elements.inputFields.fiscalYearStartMonth.value = '6'; // July by default
        }
    }
}