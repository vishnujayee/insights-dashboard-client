// services/api.js
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add filters
api.interceptors.request.use(config => {
  console.log(`Making request to: ${config.url}`, config.params);
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}:`, response.data);
    return response.data; // Return data directly
  },
  error => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dashboard endpoints
export const fetchTopIntensity = (filters) => 
  api.get("/top-intensity", { params: filters });

export const fetchYearTrend = (filters) => 
  api.get("/year-trend", { params: filters });

export const fetchDuration = (filters) => 
  api.get("/duration-analysis", { params: filters });

// PESTLE endpoints
export const fetchPestleSector = (filters) => 
  api.get("/pestle-sector-comparison", { params: filters });

export const fetchPestleYear = (filters) => 
  api.get("/pestle-year", { params: filters });

export const fetchPestleCountry = (filters) => 
  api.get("/pestle-country", { params: filters });

// Location endpoints
export const fetchTopRegion = (filters) => 
  api.get("/top-region", { params: filters });

// Comparison endpoints
export const fetchSectorYear = (filters) => 
  api.get("/comparison/sector-year", { params: filters });

export const fetchSourceYear = (filters) => 
  api.get("/comparison/source-year", { params: filters });

export const fetchLocationYear = (filters) => 
  api.get("/location-year-comparison", { params: filters });

export const fetchDurationHeatmap = (filters) => 
  api.get("/duration-year-heatmap", { params: filters });

// Filter options - CRITICAL FIX
export const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/filter-options`);
    console.log("Filter options response:", response.data);
    return { data: response.data }; // Wrap in data property for consistency
  } catch (error) {
    console.error("Error fetching filter options:", error);
    throw error;
  }
};