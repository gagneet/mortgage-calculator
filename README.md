# Variable Rate Mortgage Calculator

This application is a React-based web implementation of the Variable Rate Mortgage Calculator I originally developed in VBA.
It allows users to calculate mortgage payments with variable interest rates and extra payment options, as well as view yearly investment data from the attached Excel workbook.

## Features

### Calculator Page

- Input basic loan details (amount, interest rate, term)
- Configure interest rate changes at specific months (as we are taking variable rate, it may change according to the Central Bank's wimps)
- Add one-time extra payments (these shall be consistent throughout the year and may be bank fees [negative])
- Set up regular monthly extra payments (sometime the Bank may give a monthly discount on taking a package over the actual calculated fees and/or amount)
- Configure staged payments (different extra payment amounts for different periods)
- View amortization schedule, rate change summary, and payment summaries
- Interactive chart showing loan balance over time

### Yearly Data Page

- View data from the 30 yearly sheets in the Excel workbook
- Switch between years using a dropdown selector

## Setup and Installation

To run this application locally:

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

## Required Packages

- React
- React Router DOM
- Recharts (for charts)
- SheetJS (for Excel file processing)

## Technical Implementation

### Main Components

1. **MortgageCalculator**: The main calculator implementation with all the input forms and calculation logic
2. **YearlyDataView**: Displays yearly data from the Excel workbook
3. **Layout**: Navigation layout with router configuration

### Key Utility Functions

- `calculateEMI`: Calculates the Equated Monthly Installment based on loan amount, interest rate, and term
- `calculateMortgage`: Performs the full amortization schedule calculation

### Excel Data Processing

The application uses SheetJS to read and process the Excel workbook. The YearlyDataView component:

1. Loads the Excel file
2. Extracts the year sheets
3. Processes each sheet into a structured format
4. Presents the data in a filterable table

## Using the Calculator

1. Enter the basic loan details (amount, initial interest rate, and term)
2. (Optional) Add interest rate changes for specific months
3. (Optional) Configure one-time extra payments
4. (Optional) Set up regular extra payments
5. (Optional) Configure staged regular extra payments
6. Click "Calculate" to see the results
7. View the amortization schedule, loan summary, and charts

## Viewing Yearly Data

1. Navigate to the "Yearly Data" page
2. Use the dropdown to select the year you want to view
3. Browse the table data for the selected year

## Differences from the VBA Implementation

This React implementation maintains all the core calculation functionality of the original VBA version while adding:

- Modern web interface with responsive design
- Interactive charts
- Tabbed interface for viewing different aspects of the calculation results
- Improved navigation between calculator and yearly data

## Original VBA Code

The original VBA code included these key functions:

- `SetupMortgageCalculator`: Setting up the Excel worksheet layout
- `CalculateMortgage`: The main calculation function
- `CalculateEMI`: For calculating monthly payment amount

This JavaScript implementation preserves the same calculation logic while adapting it to a web interface.

## License

This project is licensed under the MIT License.
