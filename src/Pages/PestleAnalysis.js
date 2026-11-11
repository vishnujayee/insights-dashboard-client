// Pages/PestleAnalysis.jsx
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
  Tab,
  Tabs,
  Badge,
  Button
} from "@mui/material";
import {
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  Public as PublicIcon,
  Timeline as TimelineIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Category as CategoryIcon
} from "@mui/icons-material";
import { useFilters } from "../context/FilterContext";
import DashboardLayout from "../components/layout/dashboardLayout";
import GroupedBarChart from "../components/GroupedBarChart";
import StackedAreaChart from "../components/StackedAreaChart";
import Heatmap from "../components/Heatmap";
import KpiCard from "../components/kpiCard";
import {
  fetchPestleSector,
  fetchPestleCountry,
  fetchPestleYear
} from "../services/api";
import {
  transformPestleSector,
  transformPestleCountry,
  transformPestleYear
} from "../utils/chartDataTransformers";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`pestle-tabpanel-${index}`}
      aria-labelledby={`pestle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function PestleAnalysis() {
  const theme = useTheme();
  const { filters } = useFilters();

  const [sectorData, setSectorData] = useState([]);
  const [countryData, setCountryData] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [sectorRes, countryRes, yearRes] = await Promise.all([
        fetchPestleSector(filters),
        fetchPestleCountry(filters),
        fetchPestleYear(filters)
      ]);

      console.log("PESTLE Sector:", sectorRes);
      console.log("PESTLE Country:", countryRes);
      console.log("PESTLE Year:", yearRes);

      setSectorData(transformPestleSector(sectorRes));
      setCountryData(transformPestleCountry(countryRes));
      setYearData(transformPestleYear(yearRes));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("PESTLE Analysis Error:", err);
      setError("Failed to load PESTLE analysis data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Calculate summary statistics
  const summary = {
    totalSectors: sectorData.length,
    totalCountries: countryData.length,
    totalYears: yearData.length,
    uniquePestles: yearData.length > 0 
      ? Object.keys(yearData[0]).filter(k => k !== 'year').length 
      : 0
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading && sectorData.length === 0) {
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
                PESTLE Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Political, Economic, Social, Technological, Legal, Environmental analysis
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
              title="Sectors Analyzed" 
              value={summary.totalSectors} 
              color={theme.palette.primary.main}
              icon={<BusinessIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Countries" 
              value={summary.totalCountries} 
              color={theme.palette.success.main}
              icon={<PublicIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Years of Data" 
              value={summary.totalYears} 
              color={theme.palette.warning.main}
              icon={<TimelineIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="PESTLE Categories" 
              value={summary.uniquePestles} 
              color={theme.palette.info.main}
              icon={<CategoryIcon />}
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

      {/* Tabs Navigation */}
      <Paper sx={{ mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab 
            label={
              <Badge badgeContent={sectorData.length} color="primary">
                <Box>Sector Analysis</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={countryData.length} color="success">
                <Box>Country Analysis</Box>
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={yearData.length} color="warning">
                <Box>Year Trend</Box>
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fade in timeout={900}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      PESTLE by Sector
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Distribution across business sectors
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${sectorData.length} records`}
                    size="small"
                    color="primary"
                  />
                </Box>
                <Box sx={{ height: 450 }}>
                  <GroupedBarChart data={sectorData} />
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fade in timeout={1100}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      PESTLE by Country
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Geographic distribution heatmap
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${countryData.length} records`}
                    size="small"
                    color="success"
                  />
                </Box>
                <Box sx={{ height: 500 }}>
                  <Heatmap data={countryData} />
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fade in timeout={1300}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="600">
                      PESTLE Year Trend
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Temporal evolution of PESTLE factors
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${yearData.length} years`}
                    size="small"
                    color="warning"
                  />
                </Box>
                <Box sx={{ height: 450 }}>
                  <StackedAreaChart data={yearData} />
                </Box>
              </Paper>
            </Fade>
          </Grid>
        </Grid>
      </TabPanel>
    </DashboardLayout>
  );
}

export default PestleAnalysis;