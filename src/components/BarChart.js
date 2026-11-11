// components/BarChart.jsx
import * as d3 from "d3";
import { useEffect, useRef, useState, useCallback } from "react";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";

export default function BarChart({ data, title, height = 400 }) {
  const theme = useTheme();
  const ref = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Process data
  useEffect(() => {
    try {
      setIsLoading(true);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setChartData([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      // Filter and process data
      const processed = data
        .filter(item => item && (item.totalIntensity > 0 || item.intensity > 0))
        .map(item => ({
          label: String(item._id || item.topic || 'Unknown').substring(0, 20),
          value: Number(item.totalIntensity || item.intensity || 0)
        }))
        .filter(item => item.value > 0)
        .slice(0, 10);

      setChartData(processed);
      setError(null);
    } catch (err) {
      console.error("BarChart data error:", err);
      setError("Error processing chart data");
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  // Draw chart
  useEffect(() => {
    if (isLoading || error || chartData.length === 0 || !ref.current) return;

    try {
      // Clear previous chart
      d3.select(ref.current).selectAll("*").remove();

      // Setup dimensions
      const margin = { top: 40, right: 30, bottom: 80, left: 70 };
      const width = ref.current.clientWidth - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (width <= 0 || innerHeight <= 0) return;

      const svg = d3.select(ref.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleBand()
        .domain(chartData.map(d => d.label))
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value) * 1.1 || 1])
        .nice()
        .range([innerHeight, 0]);

      // Add X axis
      svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      // Add bars with animation
      svg.selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.label))
        .attr("width", x.bandwidth())
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", theme.palette.primary.main)
        .attr("rx", 4)
        .attr("ry", 4)
        .transition()
        .duration(800)
        .attr("y", d => y(d.value))
        .attr("height", d => innerHeight - y(d.value));

    } catch (err) {
      console.error("Error drawing BarChart:", err);
      setError("Error rendering chart");
    }
  }, [chartData, height, theme, isLoading, error]);

  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height, position: 'relative' }}>
      {title && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>
      )}
      <svg ref={ref} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
}