// components/filters/filterPanel.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Chip,
  Stack,
  IconButton,
  Collapse,
  useTheme,
  alpha,
  InputAdornment,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import { useFilters } from "../../context/FilterContext";
import { fetchFilterOptions } from "../../services/api";

export default function FilterPanel() {
  const theme = useTheme();
  const { filters, updateFilter, clearFilters, clearFilter, activeFilterCount } = useFilters();
  
  const [expanded, setExpanded] = useState(true);
  const [options, setOptions] = useState({
    countries: [],
    sectors: [],
    regions: [],
    topics: [],
    pestles: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch filter options from backend
  useEffect(() => {
    const loadFilterOptions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetchFilterOptions();
        console.log("Filter options loaded:", response);
        
        // Handle different response structures
        const data = response.data || response;
        
        setOptions({
          countries: Array.isArray(data.countries) ? data.countries.filter(Boolean) : [],
          sectors: Array.isArray(data.sectors) ? data.sectors.filter(Boolean) : [],
          regions: Array.isArray(data.regions) ? data.regions.filter(Boolean) : [],
          topics: Array.isArray(data.topics) ? data.topics.filter(Boolean) : [],
          pestles: Array.isArray(data.pestles) ? data.pestles.filter(Boolean) : []
        });
      } catch (err) {
        console.error("Error fetching filter options:", err);
        setError("Failed to load filter options. Please refresh the page.");
        
        // Set default options as fallback
        setOptions({
          countries: ["USA", "UK", "India", "China", "Germany"],
          sectors: ["Energy", "Finance", "Technology", "Healthcare", "Manufacturing"],
          regions: ["North America", "Europe", "Asia", "Africa", "South America"],
          topics: ["Economy", "Politics", "Technology", "Environment", "Social"],
          pestles: ["Political", "Economic", "Social", "Technological", "Legal", "Environmental"]
        });
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  const handleFilterChange = (key, value) => {
    updateFilter(key, value);
  };

  const handleClearFilters = () => {
    clearFilters();
  };

  const handleClearFilter = (key) => {
    clearFilter(key);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      // Filters are applied immediately via updateFilter
    }
  };

  // Get active filters for display
  const getActiveFilters = () => {
    return Object.entries(filters)
      .filter(([_, value]) => value && value.toString().trim() !== "")
      .map(([key, value]) => ({ key, value }));
  };

  const activeFilters = getActiveFilters();

  return (
    <Box>
      {/* Header */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon color="primary" />
          <Typography variant="h6" fontWeight="600">
            Filters
          </Typography>
          {activeFilterCount > 0 && (
            <Chip 
              label={activeFilterCount} 
              size="small" 
              color="primary"
              sx={{ borderRadius: 1.5, height: 20 }}
            />
          )}
        </Box>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <IconButton color="inherit" size="small" onClick={() => window.location.reload()}>
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        )}

        {/* Filter Controls */}
        {!loading && (
          <Stack spacing={2.5}>
            {/* Topic Search */}
            <TextField
              size="small"
              label="Search Topic"
              placeholder="Type to search topics..."
              value={filters.topic || ''}
              onChange={(e) => handleFilterChange('topic', e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: filters.topic && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleClearFilter('topic')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            {/* Year Range */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                size="small"
                label="Start Year"
                type="number"
                value={filters.startYear || ''}
                onChange={(e) => handleFilterChange('startYear', e.target.value)}
                fullWidth
                inputProps={{ min: 1900, max: 2100 }}
              />
              <TextField
                size="small"
                label="End Year"
                type="number"
                value={filters.endYear || ''}
                onChange={(e) => handleFilterChange('endYear', e.target.value)}
                fullWidth
                inputProps={{ min: 1900, max: 2100 }}
              />
            </Box>

            {/* Specific Year */}
            <TextField
              size="small"
              label="Specific Year"
              type="number"
              placeholder="Filter by exact year"
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              fullWidth
              inputProps={{ min: 1900, max: 2100 }}
            />

            {/* Country Select */}
            <FormControl fullWidth size="small">
              <InputLabel>Country</InputLabel>
              <Select
                value={filters.country || ''}
                label="Country"
                onChange={(e) => handleFilterChange('country', e.target.value)}
              >
                <MenuItem value="">All Countries</MenuItem>
                {options.countries.map((country) => (
                  <MenuItem key={country} value={country}>{country}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Region Select */}
            <FormControl fullWidth size="small">
              <InputLabel>Region</InputLabel>
              <Select
                value={filters.region || ''}
                label="Region"
                onChange={(e) => handleFilterChange('region', e.target.value)}
              >
                <MenuItem value="">All Regions</MenuItem>
                {options.regions.map((region) => (
                  <MenuItem key={region} value={region}>{region}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Sector Select */}
            <FormControl fullWidth size="small">
              <InputLabel>Sector</InputLabel>
              <Select
                value={filters.sector || ''}
                label="Sector"
                onChange={(e) => handleFilterChange('sector', e.target.value)}
              >
                <MenuItem value="">All Sectors</MenuItem>
                {options.sectors.map((sector) => (
                  <MenuItem key={sector} value={sector}>{sector}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* PESTLE Select */}
            <FormControl fullWidth size="small">
              <InputLabel>PESTLE</InputLabel>
              <Select
                value={filters.pestle || ''}
                label="PESTLE"
                onChange={(e) => handleFilterChange('pestle', e.target.value)}
              >
                <MenuItem value="">All PESTLE Categories</MenuItem>
                {options.pestles.map((pestle) => (
                  <MenuItem key={pestle} value={pestle}>{pestle}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider sx={{ my: 1 }} />

            {/* Clear Filters Button */}
            <Button
              variant="outlined"
              color="error"
              onClick={handleClearFilters}
              disabled={activeFilterCount === 0}
              startIcon={<ClearIcon />}
              fullWidth
              sx={{ borderRadius: 2, textTransform: 'none', py: 1 }}
            >
              Clear All Filters ({activeFilterCount})
            </Button>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                  Active Filters:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {activeFilters.map(({ key, value }) => (
                    <Chip
                      key={key}
                      label={`${key}: ${value}`}
                      size="small"
                      onDelete={() => handleClearFilter(key)}
                      sx={{ 
                        borderRadius: 1.5,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        )}
      </Collapse>
    </Box>
  );
}