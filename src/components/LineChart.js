// components/LineChart.jsx
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";

export default function LineChart({ data, title, height = 400 }) {
  const theme = useTheme();
  const ref = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setChartData([]);
        setIsLoading(false);
        return;
      }

      const processed = data
        .map(item => {
          let year = item._id;
          if (item._id && typeof item._id === 'object') {
            year = item._id.year;
          }
          year = Number(year || item.year);
          
          return {
            year: isNaN(year) ? 0 : year,
            value: Number(item.totalLikelihood || item.likelihood || item.value || 0)
          };
        })
        .filter(item => item.year > 0 && item.value > 0)
        .sort((a, b) => a.year - b.year);

      setChartData(processed);
      setError(null);
    } catch (err) {
      console.error("LineChart data error:", err);
      setError("Error processing data");
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (isLoading || error || chartData.length === 0 || !ref.current) return;

    try {
      d3.select(ref.current).selectAll("*").remove();

      const margin = { top: 40, right: 30, bottom: 50, left: 70 };
      const width = ref.current.clientWidth - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (width <= 0 || innerHeight <= 0) return;

      const svg = d3.select(ref.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.value) * 1.1 || 1])
        .nice()
        .range([innerHeight, 0]);

      // Add axes
      svg.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      svg.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      // Draw line
      const line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value))
        .curve(d3.curveMonotoneX);

      svg.append("path")
        .datum(chartData)
        .attr("fill", "none")
        .attr("stroke", theme.palette.primary.main)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add dots
      svg.selectAll("circle")
        .data(chartData)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .attr("fill", theme.palette.primary.main)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    } catch (err) {
      console.error("Error drawing LineChart:", err);
      setError("Error rendering chart");
    }
  }, [chartData, height, theme, isLoading, error]);

  if (isLoading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>{error}</Alert>
    );
  }

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