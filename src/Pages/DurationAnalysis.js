// Pages/DurationAnalysis.jsx
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
  Button,
  CircularProgress
} from "@mui/material";
import {
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import { useFilters } from "../context/FilterContext";
import DashboardLayout from "../components/layout/dashboardLayout";
import DurationChart from "../components/DurationChart";
import Heatmap from "../components/Heatmap";
import KpiCard from "../components/kpiCard";
import { fetchDuration, fetchDurationHeatmap } from "../services/api";

function DurationAnalysis() {
  const theme = useTheme();
  const { filters } = useFilters();

  const [durationData, setDurationData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [durationRes, heatmapRes] = await Promise.all([
        fetchDuration(filters),
        fetchDurationHeatmap(filters)
      ]);

      console.log("Duration data:", durationRes);
      console.log("Heatmap data:", heatmapRes);

      // Process duration data
      let processedDuration = [];
      if (Array.isArray(durationRes)) {
        processedDuration = durationRes
          .map(item => ({
            topic: item.topic || 'Unknown',
            duration: Number(item.duration) || 0
          }))
          .filter(item => item.duration > 0)
          .sort((a, b) => b.duration - a.duration);
      }
      setDurationData(processedDuration);

      // Process heatmap data
      let processedHeatmap = [];
      if (Array.isArray(heatmapRes)) {
        processedHeatmap = heatmapRes
          .map(item => {
            const year = item._id?.year || item.year;
            const durationBucket = item._id?.durationBucket || item.durationBucket;
            return {
              x: String(year || 'Unknown'),
              y: durationBucket || 'Unknown',
              value: Number(item.count) || 0
            };
          })
          .filter(item => item.value > 0);
      }
      setHeatmapData(processedHeatmap);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Duration Analysis Error:", err);
      setError("Failed to load duration analysis data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Calculate summary statistics
  const summary = {
    totalItems: durationData.length,
    avgDuration: durationData.length 
      ? (durationData.reduce((acc, curr) => acc + curr.duration, 0) / durationData.length).toFixed(1)
      : 0,
    maxDuration: durationData.length 
      ? Math.max(...durationData.map(d => d.duration))
      : 0,
    uniqueYears: heatmapData.length 
      ? [...new Set(heatmapData.map(d => d.x))].length
      : 0
  };

  // Duration Categories Chart Component
  const DurationCategoriesChart = ({ data }) => {
    if (!data || data.length === 0) {
      return (
        <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No duration data available</Typography>
        </Box>
      );
    }

    const categories = {
      'Short (0-2 years)': data.filter(d => d.duration <= 2).length,
      'Medium (3-5 years)': data.filter(d => d.duration > 2 && d.duration <= 5).length,
      'Long (6-10 years)': data.filter(d => d.duration > 5 && d.duration <= 10).length,
      'Very Long (10+ years)': data.filter(d => d.duration > 10).length
    };

    const total = data.length;
    const colors = [
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main
    ];

    return (
      <Box sx={{ height: '100%', overflow: 'auto', pr: 2 }}>
        {Object.entries(categories).map(([label, count], index) => {
          const percentage = total ? ((count / total) * 100).toFixed(1) : 0;
          return (
            <Box key={label} sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">{label}</Typography>
                <Typography variant="body2" fontWeight="600">
                  {count} ({percentage}%)
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
                    backgroundColor: colors[index],
                    borderRadius: 4,
                    transition: 'width 0.5s ease'
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };

  if (loading && durationData.length === 0) {
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
      {/* Header */}
      <Fade in timeout={500}>
        <Box mb={4}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Duration Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
              </Typography>
            </Box>
            <IconButton onClick={fetchData} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>
      </Fade>

      {/* Error Alert */}
      {error && (
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
      )}

      {/* KPI Cards */}
      <Fade in timeout={700}>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Total Topics" 
              value={summary.totalItems} 
              color={theme.palette.primary.main}
              icon={<TimelineIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Avg Duration" 
              value={`${summary.avgDuration}y`} 
              color={theme.palette.success.main}
              icon={<CalendarIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Max Duration" 
              value={`${summary.maxDuration}y`} 
              color={theme.palette.warning.main}
              icon={<TimelineIcon />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard 
              title="Active Years" 
              value={summary.uniqueYears} 
              color={theme.palette.info.main}
              icon={<CalendarIcon />}
            />
          </Grid>
        </Grid>
      </Fade>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Duration Timeline */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={900}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Duration Timeline</Typography>
                <Chip 
                  label={`${durationData.length} topics`}
                  size="small"
                  color="primary"
                />
              </Box>
              <Box sx={{ height: 350 }}>
                <DurationChart data={durationData} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Duration Categories */}
        <Grid item xs={12} lg={6}>
          <Fade in timeout={1100}>
            <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Duration Categories
              </Typography>
              <Box sx={{ height: 350 }}>
                <DurationCategoriesChart data={durationData} />
              </Box>
            </Paper>
          </Fade>
        </Grid>

        {/* Heatmap */}
        <Grid item xs={12}>
          <Fade in timeout={1300}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Duration Heatmap</Typography>
                <Chip 
                  label={`${heatmapData.length} records`}
                  size="small"
                  color="info"
                />
              </Box>
              <Box sx={{ height: 400 }}>
                <Heatmap data={heatmapData} />
              </Box>
            </Paper>
          </Fade>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
}

export default DurationAnalysis;