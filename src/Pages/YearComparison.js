// Pages/YearComparison.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Fade,
  useTheme,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Button
} from "@mui/material";
import {
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Source as SourceIcon
} from "@mui/icons-material";
import { useFilters } from "../context/FilterContext";
import DashboardLayout from "../components/layout/dashboardLayout";
import GroupedBarChart from "../components/GroupedBarChart";
import StackedAreaChart from "../components/StackedAreaChart";
import KpiCard from "../components/kpiCard";
import axios from "axios";
import { transformSectorYear, transformSourceYear, transformLocationYear } from "../utils/chartDataTransformers";

const BASE_URL = "http://localhost:5000/api";

function YearComparison() {
  const theme = useTheme();
  const { filters } = useFilters();

  const [sectorYear, setSectorYear] = useState([]);
  const [countryYear, setCountryYear] = useState([]);
  const [sourceYear, setSourceYear] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [sectorRes, countryRes, sourceRes] = await Promise.all([
        axios.get(`${BASE_URL}/comparison/sector-year`, { params: filters }),
        axios.get(`${BASE_URL}/location-year-comparison`, { params: filters }),
        axios.get(`${BASE_URL}/comparison/source-year`, { params: filters })
      ]);

      console.log("Sector Year:", sectorRes.data);
      console.log("Country Year:", countryRes.data);
      console.log("Source Year:", sourceRes.data);

      setSectorYear(transformSectorYear(sectorRes.data));
      setCountryYear(transformLocationYear(countryRes.data));
      setSourceYear(transformSourceYear(sourceRes.data));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Year Comparison Error:", err);
      setError("Failed to load year comparison data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Calculate summary statistics
  const summary = {
    totalYears: [...new Set([
      ...sectorYear.map(d => d.year),
      ...countryYear.map(d => d.year),
      ...sourceYear.map(d => d.year)
    ])].length,
    totalSectors: sectorYear.length,
    totalCountries: countryYear.length,
    totalSources: sourceYear.length
  };

  if (loading && sectorYear.length === 0) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header Section */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Year Comparison
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Compare trends across different dimensions
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated?.toLocaleTimeString() || 'Never'}
              </Typography>
            </Box>
            
            <Stack direction="row" spacing={1}>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchData} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Fade>

      {/* KPI Cards */}
      <Fade in timeout={700}>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Years Analyzed" 
              value={summary.totalYears} 
              color={theme.palette.primary.main}
              icon={<CalendarIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Sectors" 
              value={summary.totalSectors} 
              color={theme.palette.success.main}
              icon={<BusinessIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Countries" 
              value={summary.totalCountries} 
              color={theme.palette.warning.main}
              icon={<PublicIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Sources" 
              value={summary.totalSources} 
              color={theme.palette.info.main}
              icon={<SourceIcon />}
            />
          </Grid>
        </Grid>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={fetchData}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </Fade>
      )}

      {/* Main Charts */}
      <Grid container spacing={3}>
        {/* Sector vs Year */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={900}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Sector vs Year
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Year-wise sector distribution
                  </Typography>
                </Box>
                <Chip 
                  icon={<BusinessIcon />}
                  label={`${sectorYear.length} records`}
                  size="small"
                  color="primary"
                />
              </Box>
              <Box sx={{ height: 400 }}>
                <GroupedBarChart data={sectorYear} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Source vs Year */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={1100}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Source vs Year
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Year-wise source distribution
                  </Typography>
                </Box>
                <Chip 
                  icon={<SourceIcon />}
                  label={`${sourceYear.length} records`}
                  size="small"
                  color="info"
                />
              </Box>
              <Box sx={{ height: 400 }}>
                <GroupedBarChart data={sourceYear} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Country vs Year */}
        <Grid item xs={12}>
          <Fade in timeout={1300}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Country vs Year
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Year-wise country distribution (stacked view)
                  </Typography>
                </Box>
                <Chip 
                  icon={<PublicIcon />}
                  label={`${countryYear.length} records`}
                  size="small"
                  color="success"
                />
              </Box>
              <Box sx={{ height: 450 }}>
                <StackedAreaChart data={countryYear} />
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default YearComparison;