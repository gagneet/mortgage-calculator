// Calculation Controller - Handles all financial calculations
import { LoanCalculator } from '../calculators/LoanCalculator.js';
import { CashFlowCalculator } from '../calculators/CashFlowCalculator.js';
import { AnnualSummaryCalculator } from '../calculators/AnnualSummaryCalculator.js';

export class CalculationController {
    constructor(propertyData) {
        this.propertyData = propertyData;
        this.loanCalculator = new LoanCalculator();
        this.cashFlowCalculator = new CashFlowCalculator();
        this.annualSummaryCalculator = new AnnualSummaryCalculator();
    }

    calculateAll() {
        try {
            // Reset results before new calculations
            this.propertyData.resetResults();

            // Calculate loan schedules
            this.calculateLoanSchedules();

            // Calculate monthly cash flow
            this.calculateMonthlyCashFlow();

            // Calculate annual summary
            this.calculateAnnualSummary();
        } catch (error) {
            console.error("Error in calculations:", error);
            throw error;
        }
    }

    calculateLoanSchedules() {
        // Calculate primary loan
        if (this.propertyData.hasSplitLoan) {
            // Calculate split loan 1
            this.propertyData.results.splitLoan1 = this.loanCalculator.calculateAmortizationSchedule(
                this.propertyData.splitLoan.amount1,
                this.propertyData.loanTerm,
                this.propertyData.splitLoan.rate1,
                this.propertyData.loanStartDate,
                this.propertyData.interestRateChanges,
                this.propertyData.extraPayments.filter(p => p.target === 'splitLoan1')
            );

            // Calculate split loan 2
            this.propertyData.results.splitLoan2 = this.loanCalculator.calculateAmortizationSchedule(
                this.propertyData.splitLoan.amount2,
                this.propertyData.loanTerm,
                this.propertyData.splitLoan.rate2,
                this.propertyData.loanStartDate,
                this.propertyData.interestRateChanges,
                this.propertyData.extraPayments.filter(p => p.target === 'splitLoan2')
            );

            // Create a combined schedule for reporting purposes
            this.propertyData.results.primaryLoan = {
                schedule: this.loanCalculator.combineLoanSchedules(
                    this.propertyData.results.splitLoan1.schedule,
                    this.propertyData.results.splitLoan2.schedule
                ),
                totalInterest: this.propertyData.results.splitLoan1.totalInterest + this.propertyData.results.splitLoan2.totalInterest,
                totalPrincipal: this.propertyData.results.splitLoan1.totalPrincipal + this.propertyData.results.splitLoan2.totalPrincipal,
                monthlyPayment: this.propertyData.results.splitLoan1.monthlyPayment + this.propertyData.results.splitLoan2.monthlyPayment
            };
        } else {
            this.propertyData.results.primaryLoan = this.loanCalculator.calculateAmortizationSchedule(
                this.propertyData.loanAmount,
                this.propertyData.loanTerm,
                this.propertyData.initialInterestRate,
                this.propertyData.loanStartDate,
                this.propertyData.interestRateChanges,
                this.propertyData.extraPayments.filter(p => p.target === 'primary')
            );

            // Reset split loan results when not using split loans
            this.propertyData.results.splitLoan1 = {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            };

            this.propertyData.results.splitLoan2 = {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            };
        }

        // Calculate equity loan if applicable
        if (this.propertyData.hasEquityLoan && this.propertyData.equityLoan.amount > 0) {
            this.propertyData.results.equityLoan = this.loanCalculator.calculateAmortizationSchedule(
                this.propertyData.equityLoan.amount,
                this.propertyData.equityLoan.term,
                this.propertyData.equityLoan.interestRate,
                this.propertyData.equityLoan.startDate,
                this.propertyData.interestRateChanges,
                this.propertyData.extraPayments.filter(p => p.target === 'equity')
            );
        } else {
            this.propertyData.results.equityLoan = {
                schedule: [],
                totalInterest: 0,
                totalPrincipal: 0,
                monthlyPayment: 0
            };
        }
    }

    calculateMonthlyCashFlow() {
        this.propertyData.results.cashFlow = this.cashFlowCalculator.calculateMonthlyCashFlow(
            this.propertyData
        );
    }

    calculateAnnualSummary() {
        this.propertyData.results.annualSummary = this.annualSummaryCalculator.calculateAnnualSummary(
            this.propertyData
        );
    }
}