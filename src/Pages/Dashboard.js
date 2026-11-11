// Pages/Dashboard.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { useFilters } from "../context/FilterContext";
import DashboardLayout from "../components/layout/dashboardLayout";
import KpiCard from "../components/kpiCard";
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Fade,
  useTheme,
  IconButton,
  Tooltip,
  Stack,
  Button
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import DurationChart from "../components/DurationChart";
import GroupedBarChart from "../components/GroupedBarChart";
import StackedAreaChart from "../components/StackedAreaChart";
import Heatmap from "../components/Heatmap";
import {
  fetchTopIntensity,
  fetchYearTrend,
  fetchDuration,
  fetchPestleSector,
  fetchPestleYear,
  fetchPestleCountry,
} from "../services/api";
import {
  transformTopIntensity,
  transformYearTrend,
  transformDuration,
  transformPestleSector,
  transformPestleYear,
  transformPestleCountry
} from "../utils/chartDataTransformers";

function Dashboard() {
  const theme = useTheme();
  const { filters, activeFilterCount } = useFilters();

  const [topTopics, setTopTopics] = useState([]);
  const [yearData, setYearData] = useState([]);
  const [durationData, setDurationData] = useState([]);
  const [pestleSector, setPestleSector] = useState([]);
  const [pestleYear, setPestleYear] = useState([]);
  const [pestleCountry, setPestleCountry] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        topRes,
        yearRes,
        durationRes,
        pestleSectorRes,
        pestleYearRes,
        pestleCountryRes
      ] = await Promise.all([
        fetchTopIntensity(filters),
        fetchYearTrend(filters),
        fetchDuration(filters),
        fetchPestleSector(filters),
        fetchPestleYear(filters),
        fetchPestleCountry(filters)
      ]);

      console.log("Dashboard data loaded");

      setTopTopics(transformTopIntensity(topRes));
      setYearData(transformYearTrend(yearRes));
      setDurationData(transformDuration(durationRes));
      setPestleSector(transformPestleSector(pestleSectorRes));
      setPestleYear(transformPestleYear(pestleYearRes));
      setPestleCountry(transformPestleCountry(pestleCountryRes));
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const totalIntensity = yearData.reduce((acc, curr) => acc + (curr.totalLikelihood || 0), 0);
    const topSector = pestleSector.length > 0 ? pestleSector[0]._id || "N/A" : "N/A";
    const avgDuration = durationData.length > 0
      ? (durationData.reduce((acc, curr) => acc + (curr.duration || 0), 0) / durationData.length).toFixed(1)
      : 0;

    return {
      totalTopics: topTopics.length,
      totalIntensity,
      topSector,
      avgDuration
    };
  }, [topTopics, yearData, pestleSector, durationData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  if (loading && !topTopics.length) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
              {activeFilterCount > 0 && ` • ${activeFilterCount} active filters`}
            </Typography>
          </Box>
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Total Topics" 
            value={summary.totalTopics} 
            color={theme.palette.primary.main}
            icon={<TrendingUpIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Total Intensity" 
            value={summary.totalIntensity} 
            color={theme.palette.success.main}
            icon={<AnalyticsIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Top Sector" 
            value={summary.topSector} 
            color={theme.palette.warning.main}
            icon={<BusinessIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Avg Duration" 
            value={`${summary.avgDuration}y`} 
            color={theme.palette.info.main}
            icon={<CalendarIcon />}
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Top Intensity Topics</Typography>
            <Box sx={{ height: 350 }}>
              <BarChart data={topTopics} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Year Wise Trend</Typography>
            <Box sx={{ height: 350 }}>
              <LineChart data={yearData} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Duration Analysis</Typography>
            <Box sx={{ height: 350 }}>
              <DurationChart data={durationData} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>PESTLE by Sector</Typography>
            <Box sx={{ height: 350 }}>
              <GroupedBarChart data={pestleSector} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>PESTLE Year Trend</Typography>
            <Box sx={{ height: 350 }}>
              <StackedAreaChart data={pestleYear} />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>PESTLE by Country</Typography>
            <Box sx={{ height: 400 }}>
              <Heatmap data={pestleCountry} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default Dashboard;