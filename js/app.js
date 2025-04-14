// Main application file
import { PropertyData } from './models/PropertyData.js';
import { UIController } from './controllers/UIController.js';
import { CalculationController } from './controllers/CalculationController.js';
import { ChartController } from './controllers/ChartController.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Create application instances
    const propertyData = new PropertyData();
    const uiController = new UIController();
    const calculationController = new CalculationController(propertyData);
    const chartController = new ChartController();

    // Initialize the UI
    uiController.initialize();

    // Connect the UI elements to the property data model
    uiController.bindEventListeners(propertyData, calculationController, chartController);

    // Set default values
    uiController.setDefaultValues();
});