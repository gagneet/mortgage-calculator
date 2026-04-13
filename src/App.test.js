import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Australian mortgage calculator and summary fields', () => {
  render(<App />);

  expect(screen.getByText(/Australian Mortgage Calculator/i)).toBeInTheDocument();
  expect(screen.getByText(/Loan Summary/i)).toBeInTheDocument();
  expect(screen.getByText(/Estimated Stamp Duty/i)).toBeInTheDocument();
  expect(screen.getByText(/LVR:/i)).toBeInTheDocument();
});
