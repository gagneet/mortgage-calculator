# Variable Rate Mortgage Calculator

This application is a React-based web implementation of the Variable Rate Mortgage Calculator I originally developed in VBA.
It allows users to calculate mortgage payments with variable interest rates and extra payment options, as well as view yearly investment data from the attached Excel workbook.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Features

### Calculator Page

- Input basic loan details (amount, interest rate, term)
- Configure interest rate changes at specific months (as we are taking variable rate, it may change according to the Central Bank's wimps)
- Add one-time extra payments (these shall be consistent throughout the year and may be bank fees [negative])
- Set up regular monthly extra payments (sometime the Bank may give a monthly discount on taking a package over the actual calculated fees and/or amount)
- Configure staged payments (different extra payment amounts for different periods)
- View amortization schedule, rate change summary, and payment summaries
- Interactive chart showing loan balance over time

### Investment Projections Page
- View mortgage information projected over 30 years
- Customize investment parameters (property value, rental income, expenses, etc.)
- See monthly breakdowns for each year
- View investment performance metrics (ROI, cash flow, equity growth)
- Interactive charts showing projections over time
- All calculations based on the mortgage parameters from the calculator page

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
2. **YearlyDataView**: Displays yearly investment projections based on the mortgage calculations
3. **Layout**: Navigation layout with state-based page switching

### Key Utility Functions

- `calculateEMI`: Calculates the Equated Monthly Installment based on loan amount, interest rate, and term
- `calculateMortgage`: Performs the full amortization schedule calculation
- `calculateMortgageForYears`: Extends mortgage calculations for 30-year projections
- `generateYearlyReports`: Creates yearly investment reports based on mortgage data

### Data Sharing Between Components

The application uses React state to share loan data between the mortgage calculator and the yearly projections view. When the user changes loan parameters and calculates the mortgage, this data is passed to the yearly projections component to update the investment calculations.

## Using the Calculator

1. Enter the basic loan details (amount, initial interest rate, and term)
2. (Optional) Add interest rate changes for specific months
3. (Optional) Configure one-time extra payments
4. (Optional) Set up regular extra payments
5. (Optional) Configure staged regular extra payments
6. Click "Calculate" to see the results
7. View the amortization schedule, loan summary, and charts

## Viewing Investment Projections

1. Navigate to the "Yearly Data" page
2. Enter investment parameters (property value, rental income, expenses, etc.)
3. See the 30-year investment performance chart
4. Use the dropdown to select a specific year to view
5. Review monthly details and yearly summaries
6. Check the cash flow chart for the selected year

## Differences from the VBA Implementation

This React implementation maintains all the core calculation functionality of the original VBA version while adding:

- Modern web interface with responsive design
- Interactive charts
- Tabbed interface for viewing different aspects of the calculation results
- Investment projections based on mortgage calculations
- No dependency on loading the actual Excel file - all calculations are done dynamically

## Original VBA Code

The original VBA code included these key functions:

- `SetupMortgageCalculator`: Setting up the Excel worksheet layout
- `CalculateMortgage`: The main calculation function
- `CalculateEMI`: For calculating monthly payment amount

This JavaScript implementation preserves the same calculation logic while adapting it to a web interface and extending it with investment projections.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## License

This project is licensed under the MIT License.
