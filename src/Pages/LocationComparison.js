// Pages/LocationComparison.jsx
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
  ToggleButton,
  ToggleButtonGroup,
  Button
} from "@mui/material";
import {
  LocationOn as LocationIcon,
  Public as PublicIcon,
  Map as MapIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  BarChart as BarChartIcon,
  GridOn as GridIcon
} from "@mui/icons-material";
import { useFilters } from "../context/FilterContext";
import DashboardLayout from "../components/layout/dashboardLayout";
import GroupedBarChart from "../components/GroupedBarChart";
import Heatmap from "../components/Heatmap";
import KpiCard from "../components/kpiCard";
import { fetchTopRegion } from "../services/api";
import axios from "axios";
import { transformRegion, transformLocationYear } from "../utils/chartDataTransformers";

const BASE_URL = "http://localhost:5000/api";

function LocationComparison() {
  const theme = useTheme();
  const { filters } = useFilters();

  const [regionData, setRegionData] = useState([]);
  const [locationYearData, setLocationYearData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [chartView, setChartView] = useState('bar');

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [regionRes, locationRes] = await Promise.all([
        fetchTopRegion(filters),
        axios.get(`${BASE_URL}/location-year-comparison`, { params: filters })
      ]);

      console.log("Region data:", regionRes);
      console.log("Location year data:", locationRes.data);

      setRegionData(transformRegion(regionRes));
      setLocationYearData(transformLocationYear(locationRes.data));
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Location Comparison Error:", err);
      setError("Failed to load location comparison data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Calculate summary statistics
  const summary = {
    totalRegions: regionData.length,
    topRegion: regionData[0]?._id || "N/A",
    topValue: regionData[0]?.avgRelevance?.toFixed(1) || 0,
    activeYears: locationYearData.length 
      ? [...new Set(locationYearData.map(d => d.year))].length
      : 0
  };

  const handleChartViewChange = (event, newView) => {
    if (newView !== null) {
      setChartView(newView);
    }
  };

  if (loading && regionData.length === 0) {
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
                Location Comparison
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyze regional patterns and trends
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
              title="Total Regions" 
              value={summary.totalRegions} 
              color={theme.palette.primary.main}
              icon={<PublicIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Top Region" 
              value={summary.topRegion} 
              color={theme.palette.success.main}
              icon={<LocationIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Top Relevance" 
              value={summary.topValue} 
              color={theme.palette.warning.main}
              icon={<BarChartIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Active Years" 
              value={summary.activeYears} 
              color={theme.palette.info.main}
              icon={<MapIcon />}
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
        {/* Top Regions */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={900}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Top Regions by Relevance
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Average relevance score by region
                  </Typography>
                </Box>
                <Chip 
                  label={`${regionData.length} regions`}
                  size="small"
                  color="primary"
                />
              </Box>
              <Box sx={{ height: 400 }}>
                <GroupedBarChart data={regionData} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Regional Distribution */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={1100}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="600" gutterBottom>
                Regional Distribution
              </Typography>
              <Box sx={{ height: 400 }}>
                <RegionalDistributionChart data={regionData} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Location Year Analysis */}
        <Grid item xs={12}>
          <Fade in timeout={1300}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography variant="h6" fontWeight="600">
                    Location Year Comparison
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Regional trends across years
                  </Typography>
                </Box>
                <ToggleButtonGroup
                  value={chartView}
                  exclusive
                  onChange={handleChartViewChange}
                  size="small"
                >
                  <ToggleButton value="bar">
                    <Tooltip title="Bar Chart View">
                      <BarChartIcon />
                    </Tooltip>
                  </ToggleButton>
                  <ToggleButton value="heatmap">
                    <Tooltip title="Heatmap View">
                      <GridIcon />
                    </Tooltip>
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
              
              <Box sx={{ height: 450 }}>
                {chartView === 'bar' ? (
                  <GroupedBarChart data={locationYearData} />
                ) : (
                  <Heatmap data={locationYearData} />
                )}
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

// Regional Distribution Chart Component
const RegionalDistributionChart = ({ data }) => {
  const theme = useTheme();
  
  if (!data || data.length === 0) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No region data available</Typography>
      </Box>
    );
  }

  const total = data.reduce((sum, item) => sum + (item.avgRelevance || 0), 0);
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main
  ];

  return (
    <Box sx={{ height: '100%', overflow: 'auto', pr: 2 }}>
      {data.map((item, index) => {
        const percentage = total ? ((item.avgRelevance / total) * 100).toFixed(1) : 0;
        return (
          <Box key={item._id} sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="body2" fontWeight="500">
                {item._id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.avgRelevance?.toFixed(1)} ({percentage}%)
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 8,
                backgroundColor: theme.palette.grey[200],
                borderRadius: 4,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: colors[index % colors.length],
                  borderRadius: 4,
                  transition: 'width 1s ease'
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default LocationComparison;