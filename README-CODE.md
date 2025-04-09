# Variable Rate Mortgage Calculator - Setup Instructions

Follow these instructions to set up and run the full-featured Variable Rate Mortgage Calculator with yearly investment projections.

## Project Structure

The project consists of these key files:

- `package.json` - Dependencies and scripts
- `src/App.js` - The main application component
- `src/index.js` - Entry point for the React app
- `src/index.css` - CSS styles with Tailwind CSS setup
- `tailwind.config.js` - Configuration for Tailwind CSS

## Setup Steps

1. **Create a new project folder**

```bash
mkdir mortgage-calculator
cd mortgage-calculator
```

2. **Initialize a new React app**

```bash
npx create-react-app .
```

3. **Replace the files with the provided versions**
   - Copy `package.json` to the root directory
   - Copy `src/App.js` with our mortgage calculator code
   - Copy `src/index.js` and `src/index.css`
   - Copy `tailwind.config.js` to the root directory

4. **Install dependencies**

```bash
npm install
```

5. **Start the development server**

```bash
npm start
```

The application should now be running at [http://localhost:3000](http://localhost:3000)

## Features

- **Mortgage Calculator**
  - Variable interest rates
  - Extra payments
  - Amortization schedule
  - Loan summary and charts

- **Investment Projections**
  - 30-year investment outlook
  - Property value growth
  - Rental income and expenses
  - ROI and cash flow analysis
  - Monthly breakdowns by year

## Troubleshooting

If you encounter a blank page:

1. Check the browser console for errors
2. Ensure all dependencies are installed
3. Try using the simplified version of App.js if needed

If specific components don't render correctly, you can iteratively add them back to identify which part is causing issues.