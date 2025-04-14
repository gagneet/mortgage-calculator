// Form Input Helper - Handles form input interactions
export class FormInputHelper {
    updateLoanAmount(elements) {
        if (!elements.inputFields.contractPrice ||
            !elements.inputFields.initialDeposit ||
            !elements.inputFields.builderRebate ||
            !elements.inputFields.loanAmount) {
            console.warn('Missing input elements for loan amount calculation');
            return;
        }

        const contractPrice = parseFloat(elements.inputFields.contractPrice.value) || 0;
        const initialDeposit = parseFloat(elements.inputFields.initialDeposit.value) || 0;
        const builderRebate = parseFloat(elements.inputFields.builderRebate.value) || 0;

        if (contractPrice > 0) {
            const calculatedLoanAmount = contractPrice - initialDeposit - builderRebate;
            if (calculatedLoanAmount > 0) {
                elements.inputFields.loanAmount.value = calculatedLoanAmount;

                // Also update split loan amounts if split loan is enabled
                if (elements.inputFields.hasSplitLoan &&
                    elements.inputFields.hasSplitLoan.value === 'yes' &&
                    elements.inputFields.splitLoanAmount1 &&
                    elements.inputFields.splitLoanAmount2) {

                    // Default to 50/50 split if not set yet
                    if (!elements.inputFields.splitLoanAmount1.value && !elements.inputFields.splitLoanAmount2.value) {
                        elements.inputFields.splitLoanAmount1.value = (calculatedLoanAmount / 2).toFixed(2);
                        elements.inputFields.splitLoanAmount2.value = (calculatedLoanAmount / 2).toFixed(2);
                    }
                }
            }
        }
    }

    updateSplitLoanAmounts(elements) {
        if (!elements.inputFields.hasSplitLoan ||
            !elements.inputFields.splitLoanAmount1 ||
            !elements.inputFields.splitLoanAmount2 ||
            !elements.inputFields.loanAmount) {
            console.warn('Missing input elements for split loan calculation');
            return;
        }

        if (elements.inputFields.hasSplitLoan.value === 'yes') {
            const splitAmount1 = parseFloat(elements.inputFields.splitLoanAmount1.value) || 0;
            const splitAmount2 = parseFloat(elements.inputFields.splitLoanAmount2.value) || 0;

            // Update the main loan amount field
            elements.inputFields.loanAmount.value = (splitAmount1 + splitAmount2).toFixed(2);
        }
    }

    addInterestRateChange(container) {
        if (!container) {
            console.warn('Missing container for interest rate change');
            return;
        }

        const div = document.createElement('div');
        div.className = 'interest-rate-change flex items-center space-x-4';
        div.innerHTML = `
            <div class="w-1/3">
                <label>Date</label>
                <input type="date" class="interest-rate-date w-full">
            </div>
            <div class="w-1/3">
                <label>New Rate (%)</label>
                <input type="number" min="0" max="20" step="0.01" class="interest-rate-value w-full">
            </div>
            <div class="mt-6">
                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

        div.querySelector('.remove-item').addEventListener('click', () => {
            div.remove();
        });

        container.appendChild(div);
    }

    addMiscRepair(container) {
        if (!container) {
            console.warn('Missing container for misc repair');
            return;
        }

        const div = document.createElement('div');
        div.className = 'misc-repair flex items-center space-x-4';
        div.innerHTML = `
            <div class="w-1/3">
                <label>Date</label>
                <input type="date" class="repair-date w-full">
            </div>
            <div class="w-1/3">
                <label>Amount ($)</label>
                <input type="number" min="0" step="10" class="repair-amount w-full">
            </div>
            <div class="w-1/3">
                <label>Description</label>
                <input type="text" class="repair-description w-full">
            </div>
            <div class="mt-6">
                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

        div.querySelector('.remove-item').addEventListener('click', () => {
            div.remove();
        });

        container.appendChild(div);
    }

    addExtraPayment(container) {
        if (!container) {
            console.warn('Missing container for extra payment');
            return;
        }

        const div = document.createElement('div');
        div.className = 'extra-payment flex items-center space-x-4';
        div.innerHTML = `
            <div class="w-1/4">
                <label>Date</label>
                <input type="date" class="payment-date w-full">
            </div>
            <div class="w-1/4">
                <label>Amount ($)</label>
                <input type="number" min="0" step="100" class="payment-amount w-full">
            </div>
            <div class="w-1/4">
                <label>Apply to</label>
                <select class="payment-target w-full">
                    <option value="primary">Primary Loan</option>
                    <option value="splitLoan1">Split Loan 1</option>
                    <option value="splitLoan2">Split Loan 2</option>
                    <option value="equity">Equity Loan</option>
                </select>
            </div>
            <div class="w-1/4">
                <label>Description</label>
                <input type="text" class="payment-description w-full">
            </div>
            <div class="mt-6">
                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

        div.querySelector('.remove-item').addEventListener('click', () => {
            div.remove();
        });

        container.appendChild(div);
    }

    addDepreciationItem(container) {
        if (!container) {
            console.warn('Missing container for depreciation item');
            return;
        }

        const div = document.createElement('div');
        div.className = 'depreciation-item flex items-center space-x-4';
        div.innerHTML = `
            <div class="w-1/4">
                <label>Description</label>
                <input type="text" class="item-description w-full">
            </div>
            <div class="w-1/4">
                <label>Cost Basis ($)</label>
                <input type="number" min="0" step="100" class="item-cost w-full">
            </div>
            <div class="w-1/4">
                <label>Rate (% per year)</label>
                <input type="number" min="0" max="100" step="0.1" class="item-rate w-full">
            </div>
            <div class="w-1/4">
                <label>Start Date</label>
                <input type="date" class="item-start-date w-full">
            </div>
            <div class="mt-6">
                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Remove</button>
            </div>
        `;

        div.querySelector('.remove-item').addEventListener('click', () => {
            div.remove();
        });

        container.appendChild(div);
    }

    async handleDepreciationUpload(event, elements) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await this.readExcelFile(file);
            if (data && data.length > 0 && elements.containers.depreciationItems) {
                // Clear existing items
                elements.containers.depreciationItems.innerHTML = '';

                // Add each item from the file
                data.forEach(item => {
                    if (item.Description && item.Cost) {
                        const container = document.createElement('div');
                        container.className = 'depreciation-item flex items-center space-x-4';
                        container.innerHTML = `
                            <div class="w-1/4">
                                <label>Description</label>
                                <input type="text" class="item-description w-full" value="${item.Description}">
                            </div>
                            <div class="w-1/4">
                                <label>Cost Basis ($)</label>
                                <input type="number" min="0" step="100" class="item-cost w-full" value="${item.Cost}">
                            </div>
                            <div class="w-1/4">
                                <label>Rate (% per year)</label>
                                <input type="number" min="0" max="100" step="0.1" class="item-rate w-full" value="${item.Rate || 2.5}">
                            </div>
                            <div class="w-1/4">
                                <label>Start Date</label>
                                <input type="date" class="item-start-date w-full" value="${item.StartDate || new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="mt-6">
                                <button class="remove-item bg-red-500 text-white py-1 px-2 rounded hover:bg-red-600">Remove</button>
                            </div>
                        `;

                        container.querySelector('.remove-item').addEventListener('click', () => {
                            container.remove();
                        });

                        elements.containers.depreciationItems.appendChild(container);
                    }
                });

                alert(`Imported ${data.length} depreciation items`);
            }
        } catch (error) {
            console.error("Error reading depreciation file:", error);
            alert("Error reading depreciation file. Please check the format.");
        }
    }

    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = function(e) {
                try {
                    const data = e.target.result;
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Assume first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = function(error) {
                reject(error);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    collectFormData(elements, propertyData) {
        // Reset results before collecting new data
        propertyData.resetResults();

        // Collect loan details
        if (elements.inputFields.loanStartDate && elements.inputFields.loanStartDate.value) {
            propertyData.loanStartDate = new Date(elements.inputFields.loanStartDate.value);
        } else {
            propertyData.loanStartDate = new Date();
        }

        propertyData.contractPrice = parseFloat(elements.inputFields.contractPrice?.value) || 0;
        propertyData.initialDeposit = parseFloat(elements.inputFields.initialDeposit?.value) || 0;
        propertyData.loanAmount = parseFloat(elements.inputFields.loanAmount?.value) || 0;
        propertyData.builderRebate = parseFloat(elements.inputFields.builderRebate?.value) || 0;
        propertyData.loanTerm = parseInt(elements.inputFields.loanTerm?.value) || 30;
        propertyData.loanType = elements.inputFields.loanType?.value || 'variable';
        propertyData.fixedTerm = parseInt(elements.inputFields.fixedTerm?.value) || 5;
        propertyData.initialInterestRate = parseFloat(elements.inputFields.initialInterestRate?.value) || 4.5;
        propertyData.fiscalYearStartMonth = parseInt(elements.inputFields.fiscalYearStartMonth?.value) || 6;

        // Rental details
        if (elements.inputFields.rentalStartDate && elements.inputFields.rentalStartDate.value) {
            propertyData.rentalStartDate = new Date(elements.inputFields.rentalStartDate.value);
        } else {
            propertyData.rentalStartDate = new Date();
        }

        propertyData.weeklyRent = parseFloat(elements.inputFields.weeklyRent?.value) || 0;

        // Settlement costs
        propertyData.settlementCosts = this.collectSettlementCosts(elements);

        // Recurring expenses
        propertyData.recurringExpenses = this.collectRecurringExpenses(elements);

        // Interest rate changes
        propertyData.interestRateChanges = this.collectInterestRateChanges(elements);

        // Miscellaneous repairs
        propertyData.miscRepairs = this.collectMiscRepairs(elements);

        // Extra payments
        propertyData.extraPayments = this.collectExtraPayments(elements);

        // Depreciation items
        propertyData.depreciationItems = this.collectDepreciationItems(elements);

        // Split loan
        propertyData.hasSplitLoan = elements.inputFields.hasSplitLoan && elements.inputFields.hasSplitLoan.value === 'yes';
        if (propertyData.hasSplitLoan) {
            propertyData.splitLoan = {
                amount1: parseFloat(elements.inputFields.splitLoanAmount1?.value) || 0,
                amount2: parseFloat(elements.inputFields.splitLoanAmount2?.value) || 0,
                rate1: parseFloat(elements.inputFields.splitLoanRate1?.value) || 4.5,
                rate2: parseFloat(elements.inputFields.splitLoanRate2?.value) || 5.0,
                type1: elements.inputFields.splitLoanType1?.value || 'variable',
                type2: elements.inputFields.splitLoanType2?.value || 'variable',
                fixedTerm1: parseInt(elements.inputFields.splitLoanFixedTerm1?.value) || 5,
                fixedTerm2: parseInt(elements.inputFields.splitLoanFixedTerm2?.value) || 5
            };
        }

        // Equity loan
        propertyData.hasEquityLoan = elements.inputFields.hasEquityLoan && elements.inputFields.hasEquityLoan.value === 'yes';
        if (propertyData.hasEquityLoan) {
            propertyData.equityLoan = {
                startDate: elements.inputFields.equityLoanStartDate && elements.inputFields.equityLoanStartDate.value
                    ? new Date(elements.inputFields.equityLoanStartDate.value)
                    : new Date(),
                amount: parseFloat(elements.inputFields.equityLoanAmount?.value) || 0,
                term: parseInt(elements.inputFields.equityLoanTerm?.value) || 30,
                interestRate: parseFloat(elements.inputFields.equityLoanInterestRate?.value) || 4.5,
                type: elements.inputFields.equityLoanType?.value || 'variable',
                fixedTerm: parseInt(elements.inputFields.equityFixedTerm?.value) || 5
            };
        }
    }

    collectSettlementCosts(elements) {
        return {
            stampDuty: parseFloat(elements.inputFields.stampDuty?.value) || 0,
            transferFee: parseFloat(elements.inputFields.transferFee?.value) || 0,
            mortgageFee: parseFloat(elements.inputFields.mortgageFee?.value) || 0,
            governmentFee: parseFloat(elements.inputFields.governmentFee?.value) || 0,
            bankWealthPackage: parseFloat(elements.inputFields.bankWealthPackage?.value) || 0,
            solicitorFees: parseFloat(elements.inputFields.solicitorFees?.value) || 0,
            conveyancerFees: parseFloat(elements.inputFields.conveyancerFees?.value) || 0,
            propertyInspection: parseFloat(elements.inputFields.propertyInspection?.value) || 0,
            furnishings: parseFloat(elements.inputFields.furnishings?.value) || 0,
            bankChequeFee: parseFloat(elements.inputFields.bankChequeFee?.value) || 0,
            bankSettlementFee: parseFloat(elements.inputFields.bankSettlementFee?.value) || 0,
            landTitlesOfficeFees: parseFloat(elements.inputFields.landTitlesOfficeFees?.value) || 0,
            initialUtilities: parseFloat(elements.inputFields.initialUtilities?.value) || 0,
            initialStrataFees: parseFloat(elements.inputFields.initialStrataFees?.value) || 0,
            agentFeesPercentage: parseFloat(elements.inputFields.agentFeesPercentage?.value) || 0
        };
    }

    collectRecurringExpenses(elements) {
        return {
            landTax: parseFloat(elements.inputFields.landTax?.value) || 0,
            councilRates: parseFloat(elements.inputFields.councilRates?.value) || 0,
            strataRates: parseFloat(elements.inputFields.strataRates?.value) || 0,
            waterRates: parseFloat(elements.inputFields.waterRates?.value) || 0,
            insurance: parseFloat(elements.inputFields.insurance?.value) || 0
        };
    }

    collectInterestRateChanges(elements) {
        const changes = [];

        if (!elements.containers.interestRateChanges) return changes;

        const interestRateChanges = elements.containers.interestRateChanges.querySelectorAll('.interest-rate-change');
        interestRateChanges.forEach(item => {
            const dateInput = item.querySelector('.interest-rate-date');
            const rateInput = item.querySelector('.interest-rate-value');

            if (dateInput && rateInput && dateInput.value && rateInput.value) {
                const date = new Date(dateInput.value);
                const rate = parseFloat(rateInput.value);

                if (!isNaN(rate)) {
                    changes.push({ date, rate });
                }
            }
        });

        // Sort by date
        return changes.sort((a, b) => a.date - b.date);
    }

    collectMiscRepairs(elements) {
        const repairs = [];

        if (!elements.containers.miscRepairs) return repairs;

        const miscRepairs = elements.containers.miscRepairs.querySelectorAll('.misc-repair');
        miscRepairs.forEach(item => {
            const dateInput = item.querySelector('.repair-date');
            const amountInput = item.querySelector('.repair-amount');
            const descriptionInput = item.querySelector('.repair-description');

            if (dateInput && amountInput && dateInput.value && amountInput.value) {
                const date = new Date(dateInput.value);
                const amount = parseFloat(amountInput.value);
                const description = descriptionInput && descriptionInput.value ? descriptionInput.value : 'Repair';

                if (!isNaN(amount)) {
                    repairs.push({ date, amount, description });
                }
            }
        });

        return repairs;
    }

    collectExtraPayments(elements) {
        const payments = [];

        if (!elements.containers.extraPayments) return payments;

        const extraPayments = elements.containers.extraPayments.querySelectorAll('.extra-payment');
        extraPayments.forEach(item => {
            const dateInput = item.querySelector('.payment-date');
            const amountInput = item.querySelector('.payment-amount');
            const targetInput = item.querySelector('.payment-target');
            const descriptionInput = item.querySelector('.payment-description');

            if (dateInput && amountInput && targetInput && dateInput.value && amountInput.value) {
                const date = new Date(dateInput.value);
                const amount = parseFloat(amountInput.value);
                const target = targetInput.value;
                const description = descriptionInput && descriptionInput.value ? descriptionInput.value : 'Extra Payment';

                if (!isNaN(amount)) {
                    payments.push({ date, amount, target, description });
                }
            }
        });

        return payments;
    }

    collectDepreciationItems(elements) {
        const items = [];

        if (!elements.containers.depreciationItems) return items;

        const depreciationItems = elements.containers.depreciationItems.querySelectorAll('.depreciation-item');
        depreciationItems.forEach(item => {
            const descriptionInput = item.querySelector('.item-description');
            const costInput = item.querySelector('.item-cost');
            const rateInput = item.querySelector('.item-rate');
            const startDateInput = item.querySelector('.item-start-date');

            if (descriptionInput && costInput && rateInput && startDateInput &&
                descriptionInput.value && costInput.value && rateInput.value && startDateInput.value) {

                const description = descriptionInput.value;
                const cost = parseFloat(costInput.value);
                const rate = parseFloat(rateInput.value);
                const startDate = new Date(startDateInput.value);

                if (!isNaN(cost) && !isNaN(rate)) {
                    items.push({ description, cost, rate, startDate });
                }
            }
        });

        return items;
    }
}