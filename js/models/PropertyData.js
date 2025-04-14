// Property data model
export class PropertyData {
    constructor() {
        // Loan details
        this.loanStartDate = null;
        this.contractPrice = 0;
        this.initialDeposit = 0;
        this.loanAmount = 0;
        this.builderRebate = 0;
        this.loanTerm = 30;
        this.loanType = 'variable';
        this.fixedTerm = 5;
        this.initialInterestRate = 4.5;
        this.fiscalYearStartMonth = 6; // July

        // Rental details
        this.rentalStartDate = null;
        this.weeklyRent = 0;

        // Settlement costs
        this.settlementCosts = {};

        // Recurring expenses
        this.recurringExpenses = {};

        // Interest rate changes
        this.interestRateChanges = [];

        // Repairs
        this.miscRepairs = [];

        // Extra payments
        this.extraPayments = [];

        // Depreciation items
        this.depreciationItems = [];

        // Equity loan
        this.hasEquityLoan = false;
        this.equityLoan = {
            startDate: null,
            amount: 0,
            term: 30,
            interestRate: 4.5,
            type: 'variable',
            fixedTerm: 5
        };

        // Split loan
        this.hasSplitLoan = false;
        this.splitLoan = {
            amount1: 0,
            amount2: 0,
            rate1: 4.5,
            rate2: 5.0,
            type1: 'variable',
            type2: 'variable',
            fixedTerm1: 5,
            fixedTerm2: 5
        };

        // Calculation results
        this.results = {
            primaryLoan: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            splitLoan1: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            splitLoan2: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            equityLoan: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            cashFlow: {},
            annualSummary: {}
        };
    }

    // Reset results
    resetResults() {
        this.results = {
            primaryLoan: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            splitLoan1: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            splitLoan2: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            equityLoan: {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            },
            cashFlow: {},
            annualSummary: {}
        };
    }
}