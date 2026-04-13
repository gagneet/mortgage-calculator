// Loan Calculator - Handles loan calculations
export class LoanCalculator {
    calculateAmortizationSchedule(principal, termYears, interestRate, startDate, rateChanges, extraPayments) {
        if (!principal || principal <= 0) return {
            schedule: [],
            totalInterest: 0,
            totalPrincipal: 0,
            monthlyPayment: 0
        };

        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = termYears * 12;
        const monthlyPayment = this.calculateMonthlyPayment(principal, monthlyRate, numberOfPayments);

        let balance = principal;
        let totalInterest = 0;
        let currentRate = interestRate;
        let currentMonthlyRate = monthlyRate;
        let currentMonthlyPayment = monthlyPayment;

        const schedule = [];
        let appliedExtraPayments = new Set(); // Track which extra payments have been applied

        for (let month = 0; month < numberOfPayments && balance > 0; month++) {
            const paymentDate = new Date(startDate);
            paymentDate.setMonth(paymentDate.getMonth() + month);

            // Check for interest rate changes
            if (rateChanges && rateChanges.length > 0) {
                for (const rateChange of rateChanges) {
                    if (rateChange.date <= paymentDate && (month === 0 || rateChange.date > new Date(startDate.getTime()))) {
                        currentRate = rateChange.rate;
                        currentMonthlyRate = currentRate / 100 / 12;
                        // Keep the same monthly payment when rates change
                        break;
                    }
                }
            }

            // Calculate interest and principal for this month
            const interestPayment = balance * currentMonthlyRate;
            let principalPayment = currentMonthlyPayment - interestPayment;

            // Handle potential final payment adjustments
            if (principalPayment > balance) {
                principalPayment = balance;
                currentMonthlyPayment = principalPayment + interestPayment;
            }

            // Apply extra payments if any
            let extraPayment = 0;
            let extraPaymentDescription = '';

            // Look for extra payments for this month only
            if (extraPayments && extraPayments.length > 0) {
                extraPayments.forEach(payment => {
                    if (!payment.date) return;

                    const paymentKey = payment.date.toISOString(); // Unique ID for payment

                    // Only apply if payment date matches this month and hasn't been applied yet
                    if (!appliedExtraPayments.has(paymentKey) &&
                        payment.date.getFullYear() === paymentDate.getFullYear() &&
                        payment.date.getMonth() === paymentDate.getMonth()) {

                        extraPayment += payment.amount;
                        extraPaymentDescription = payment.description;
                        appliedExtraPayments.add(paymentKey);
                    }
                });
            }

            // Apply extra payment to reduce principal, not change monthly payment
            if (extraPayment > 0) {
                if (extraPayment > balance - principalPayment) {
                    extraPayment = balance - principalPayment;
                }
                principalPayment += extraPayment;
            }

            // Update balance
            balance -= principalPayment;
            totalInterest += interestPayment;

            // Total payment = scheduled payment + extra payment
            const totalPaymentThisMonth = interestPayment + principalPayment;

            // Add to schedule
            schedule.push({
                month: month + 1,
                date: paymentDate,
                payment: currentMonthlyPayment, // Keep consistent monthly payment
                principal: principalPayment - (extraPayment || 0), // Normal principal
                interest: interestPayment,
                balance: balance,
                rate: currentRate,
                extraPayment: extraPayment,
                extraPaymentDescription: extraPaymentDescription,
                totalPayment: totalPaymentThisMonth // Total payment may vary
            });

            // Break if loan is fully paid
            if (balance <= 0) {
                break;
            }
        }

        return {
            schedule: schedule,
            totalInterest: totalInterest,
            totalPrincipal: principal,
            monthlyPayment: monthlyPayment
        };
    }

    calculateMonthlyPayment(principal, monthlyRate, numberOfPayments) {
        if (monthlyRate === 0) {
            return principal / numberOfPayments;
        }

        return principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    combineLoanSchedules(schedule1, schedule2) {
        if (!schedule1 || !schedule2 || schedule1.length === 0 || schedule2.length === 0) {
            return schedule1.length > 0 ? [...schedule1] : (schedule2.length > 0 ? [...schedule2] : []);
        }

        // Create a combined schedule by date
        const dateMap = new Map();

        // Add first schedule
        schedule1.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            dateMap.set(dateKey, { ...entry });
        });

        // Add second schedule
        schedule2.forEach(entry => {
            const dateKey = entry.date.toISOString().split('T')[0];
            if (dateMap.has(dateKey)) {
                const existingEntry = dateMap.get(dateKey);
                dateMap.set(dateKey, {
                    month: existingEntry.month,
                    date: existingEntry.date,
                    payment: existingEntry.payment + entry.payment,
                    principal: existingEntry.principal + entry.principal,
                    interest: existingEntry.interest + entry.interest,
                    balance: existingEntry.balance + entry.balance,
                    rate: (existingEntry.rate + entry.rate) / 2, // Average rate
                    extraPayment: (existingEntry.extraPayment || 0) + (entry.extraPayment || 0),
                    extraPaymentDescription: existingEntry.extraPaymentDescription || entry.extraPaymentDescription,
                    totalPayment: (existingEntry.totalPayment || existingEntry.payment) +
                        (entry.totalPayment || entry.payment)
                });
            } else {
                dateMap.set(dateKey, { ...entry });
            }
        });

        // Convert map to array and sort by date
        return Array.from(dateMap.values()).sort((a, b) => a.date - b.date);
    }
}