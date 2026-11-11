// utils/chartUtils.js
// Safe data validation
export const validateChartData = (data, requiredFields = []) => {
  if (!data) return { isValid: false, error: "No data provided" };
  if (!Array.isArray(data)) return { isValid: false, error: "Data must be an array" };
  if (data.length === 0) return { isValid: false, error: "No data available" };
  
  // Check if data has required fields
  if (requiredFields.length > 0) {
    const sample = data[0];
    const missingFields = requiredFields.filter(field => !(field in sample));
    if (missingFields.length > 0) {
      return { 
        isValid: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      };
    }
  }
  
  return { isValid: true, data };
};

// Safe number parsing
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Safe array access
export const safeArray = (data) => Array.isArray(data) ? data : [];

// Debounce function for performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Memoized data processing
export const processChartData = (data, processor) => {
  if (!Array.isArray(data)) return [];
  try {
    return processor(data);
  } catch (error) {
    console.error("Error processing chart data:", error);
    return [];
  }
};