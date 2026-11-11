// context/FilterContext.jsx
import { createContext, useContext, useState, useMemo, useCallback } from "react";

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    year: "",
    country: "",
    region: "",
    state: "",
    sector: "",
    pestle: "",
    topic: "",
    startYear: "",
    endYear: "",
  });

  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Update single filter
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      // Calculate active filters count (exclude empty strings)
      const count = Object.values(newFilters).filter(v => v && v.toString().trim() !== "").length;
      setActiveFilterCount(count);
      return newFilters;
    });
  }, []);

  // Set multiple filters at once
  const setMultipleFilters = useCallback((newFilters) => {
    setFilters(prev => {
      const updatedFilters = { ...prev, ...newFilters };
      const count = Object.values(updatedFilters).filter(v => v && v.toString().trim() !== "").length;
      setActiveFilterCount(count);
      return updatedFilters;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      year: "",
      country: "",
      region: "",
      state: "",
      sector: "",
      pestle: "",
      topic: "",
      startYear: "",
      endYear: "",
    });
    setActiveFilterCount(0);
  }, []);

  // Clear specific filter
  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: "" };
      const count = Object.values(newFilters).filter(v => v && v.toString().trim() !== "").length;
      setActiveFilterCount(count);
      return newFilters;
    });
  }, []);

  // Build query string for API calls
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] && filters[key].toString().trim() !== "") {
        params.append(key, filters[key]);
      }
    });
    return params.toString();
  }, [filters]);

  // Get active filters for display
  const activeFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([_, value]) => value && value.toString().trim() !== "")
      .map(([key, value]) => ({ key, value }));
  }, [filters]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters: setMultipleFilters,
        updateFilter,
        clearFilters,
        clearFilter,
        activeFilters,
        activeFilterCount,
        queryString,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

// Custom Hook with error handling
export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};