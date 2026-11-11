// utils/dataAdapters.js
/**
 * Utility functions to adapt backend data to chart formats
 */

// Generic safe array getter
export const safeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};

// Safe number parsing
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined) return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Adapter for Top Intensity Topics (BarChart)
export const adaptTopIntensityData = (data) => {
  const items = safeArray(data);
  return items.map(item => ({
    _id: item._id || item.topic || 'Unknown',
    totalIntensity: safeNumber(item.totalIntensity || item.intensity, 0)
  })).filter(item => item.totalIntensity > 0);
};

// Adapter for Year Trend (LineChart)
export const adaptYearTrendData = (data) => {
  const items = safeArray(data);
  return items.map(item => {
    const year = item._id?.year || item._id || item.year;
    return {
      _id: safeNumber(year, 0),
      totalLikelihood: safeNumber(item.totalLikelihood || item.likelihood || item.value, 0)
    };
  }).filter(item => item._id > 0 && item.totalLikelihood > 0)
    .sort((a, b) => a._id - b._id);
};

// Adapter for Duration Analysis
export const adaptDurationData = (data) => {
  const items = safeArray(data);
  return items.map(item => ({
    topic: item.topic || item._id || 'Unknown',
    duration: safeNumber(item.duration, 0)
  })).filter(item => item.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 15);
};

// Adapter for PESTLE Sector data (GroupedBarChart)
export const adaptPestleSectorData = (data) => {
  const items = safeArray(data);
  const result = [];
  
  // Group by sector
  const sectorMap = new Map();
  
  items.forEach(item => {
    const sector = item.sector || item._id?.sector || 'Unknown';
    const pestle = item.pestle || item._id?.pestle || 'Other';
    const value = safeNumber(item.avgIntensity || item.count || item.value, 0);
    
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, { _id: sector });
    }
    
    if (value > 0) {
      sectorMap.get(sector)[pestle] = value;
    }
  });
  
  sectorMap.forEach((value) => {
    result.push(value);
  });
  
  return result.slice(0, 10);
};

// Adapter for PESTLE Year data (StackedAreaChart)
export const adaptPestleYearData = (data) => {
  const items = safeArray(data);
  const yearMap = new Map();
  
  items.forEach(item => {
    const year = safeNumber(item.year || item._id?.year, 0);
    if (year === 0) return;
    
    const pestle = item.pestle || item._id?.pestle || 'Other';
    const value = safeNumber(item.count || item.value, 0);
    
    if (!yearMap.has(year)) {
      yearMap.set(year, { year });
    }
    
    if (value > 0) {
      yearMap.get(year)[pestle] = value;
    }
  });
  
  return Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year);
};

// Adapter for PESTLE Country data (Heatmap)
export const adaptPestleCountryData = (data) => {
  const items = safeArray(data);
  
  // Get unique countries and pestles
  const countries = new Set();
  const pestles = new Set();
  const valueMap = new Map();
  
  items.forEach(item => {
    const country = item.country || item._id?.country || 'Unknown';
    const pestle = item.pestle || item._id?.pestle || 'Other';
    const value = safeNumber(item.count || item.value, 0);
    
    if (value > 0) {
      countries.add(country);
      pestles.add(pestle);
      valueMap.set(`${country}|${pestle}`, value);
    }
  });
  
  // Create grid data
  const result = [];
  const countryList = Array.from(countries).slice(0, 10);
  const pestleList = Array.from(pestles);
  
  countryList.forEach(country => {
    pestleList.forEach(pestle => {
      const value = valueMap.get(`${country}|${pestle}`) || 0;
      if (value > 0) {
        result.push({
          x: country,
          y: pestle,
          value
        });
      }
    });
  });
  
  return result;
};

// Adapter for Region data
export const adaptRegionData = (data) => {
  const items = safeArray(data);
  return items.map(item => ({
    _id: item._id || item.region || 'Unknown',
    avgRelevance: safeNumber(item.avgRelevance || item.relevance, 0)
  })).filter(item => item.avgRelevance > 0);
};