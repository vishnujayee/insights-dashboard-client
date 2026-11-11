// utils/chartDataTransformers.js
/**
 * Consolidated utility for transforming API data to chart formats
 */

// Safe array getter
export const safeArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [];
};

// Safe number parsing
export const safeNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// ==================== DASHBOARD TRANSFORMERS ====================

// Transform Top Intensity data for BarChart
export const transformTopIntensity = (data) => {
  const items = safeArray(data);
  return items
    .map(item => ({
      _id: item._id || item.topic || 'Unknown',
      totalIntensity: safeNumber(item.totalIntensity || item.intensity, 0)
    }))
    .filter(item => item.totalIntensity > 0)
    .slice(0, 10);
};

// Transform Year Trend data for LineChart
export const transformYearTrend = (data) => {
  const items = safeArray(data);
  return items
    .map(item => {
      const year = item._id?.year || item._id || item.year;
      return {
        _id: safeNumber(year, 0),
        totalLikelihood: safeNumber(item.totalLikelihood || item.likelihood || item.value, 0)
      };
    })
    .filter(item => item._id > 0 && item.totalLikelihood > 0)
    .sort((a, b) => a._id - b._id);
};

// Transform Duration data for DurationChart
export const transformDuration = (data) => {
  const items = safeArray(data);
  return items
    .map(item => ({
      topic: item.topic || item._id || 'Unknown',
      duration: safeNumber(item.duration, 0)
    }))
    .filter(item => item.duration > 0)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 15);
};

// ==================== PESTLE TRANSFORMERS ====================

// Transform PESTLE Sector data for GroupedBarChart
export const transformPestleSector = (data) => {
  const items = safeArray(data);
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
  
  return Array.from(sectorMap.values()).slice(0, 8);
};

// Transform PESTLE Year data for StackedAreaChart
export const transformPestleYear = (data) => {
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

// Transform PESTLE Country data for Heatmap
export const transformPestleCountry = (data) => {
  const items = safeArray(data);
  const result = [];
  
  // Get unique countries and pestles
  const countrySet = new Set();
  const pestleSet = new Set();
  const valueMap = new Map();
  
  items.forEach(item => {
    const country = item.country || item._id?.country;
    const pestle = item.pestle || item._id?.pestle;
    const value = safeNumber(item.count || item.value, 0);
    
    if (country && pestle && value > 0) {
      countrySet.add(country);
      pestleSet.add(pestle);
      valueMap.set(`${country}|${pestle}`, value);
    }
  });
  
  const countries = Array.from(countrySet).slice(0, 8);
  const pestles = Array.from(pestleSet);
  
  countries.forEach(country => {
    pestles.forEach(pestle => {
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

// ==================== LOCATION TRANSFORMERS ====================

// Transform Region data for GroupedBarChart
export const transformRegion = (data) => {
  const items = safeArray(data);
  return items
    .map(item => ({
      _id: item._id || item.region || 'Unknown',
      avgRelevance: safeNumber(item.avgRelevance || item.relevance, 0)
    }))
    .filter(item => item.avgRelevance > 0)
    .slice(0, 10);
};

// Transform Location Year data for StackedAreaChart
export const transformLocationYear = (data) => {
  const items = safeArray(data);
  const yearMap = new Map();
  
  items.forEach(item => {
    const year = item._id?.year || item.year;
    const region = item._id?.region || item.region;
    const count = safeNumber(item.count, 0);
    
    if (year && region && count > 0) {
      if (!yearMap.has(year)) {
        yearMap.set(year, { year: Number(year) });
      }
      yearMap.get(year)[region] = count;
    }
  });
  
  return Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year);
};

// ==================== YEAR COMPARISON TRANSFORMERS ====================

// Transform Sector Year data for GroupedBarChart
export const transformSectorYear = (data) => {
  const items = safeArray(data);
  const yearMap = new Map();
  
  items.forEach(item => {
    const year = item._id?.year || item.year;
    const sector = item._id?.sector || item.sector;
    const count = safeNumber(item.count, 0);
    
    if (year && sector && count > 0) {
      if (!yearMap.has(year)) {
        yearMap.set(year, { year: Number(year) });
      }
      yearMap.get(year)[sector] = count;
    }
  });
  
  return Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year);
};

// Transform Source Year data for GroupedBarChart
export const transformSourceYear = (data) => {
  const items = safeArray(data);
  const yearMap = new Map();
  
  items.forEach(item => {
    const year = item._id?.year || item.year;
    const source = item._id?.source || item.source;
    const count = safeNumber(item.count, 0);
    
    if (year && source && count > 0) {
      if (!yearMap.has(year)) {
        yearMap.set(year, { year: Number(year) });
      }
      yearMap.get(year)[source] = count;
    }
  });
  
  return Array.from(yearMap.values())
    .sort((a, b) => a.year - b.year);
};