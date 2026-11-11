// components/DurationChart.jsx
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";
import { validateChartData, safeNumber } from "../utils/chartUtils";

export default function DurationChart({ data, title, height = 400 }) {
  const theme = useTheme();
  const ref = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      const validation = validateChartData(data, ['topic', 'duration']);
      
      if (!validation.isValid) {
        setError(validation.error);
        setChartData([]);
      } else {
        const processed = data
          .map(item => ({
            topic: String(item.topic || 'Unknown'),
            duration: safeNumber(item.duration, 0)
          }))
          .filter(item => item.duration > 0)
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 15); // Limit to top 15 for performance
          
        setChartData(processed);
        setError(null);
      }
    } catch (err) {
      setError("Error processing chart data");
      console.error("DurationChart data error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    observer.observe(ref.current.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isLoading || error || chartData.length === 0 || dimensions.width === 0) return;

    try {
      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();

      const margin = { top: 40, right: 30, bottom: 100, left: 70 };
      const width = Math.max(100, dimensions.width - margin.left - margin.right);
      const innerHeight = Math.max(100, height - margin.top - margin.bottom);

      const g = svg
        .attr("width", dimensions.width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Scales
      const x = d3.scaleBand()
        .domain(chartData.map(d => d.topic))
        .range([0, width])
        .padding(0.3);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.duration) * 1.1])
        .nice()
        .range([innerHeight, 0]);

      // Color scale based on duration
      const colorScale = d3.scaleSequential()
        .domain([0, d3.max(chartData, d => d.duration)])
        .interpolator(t => d3.interpolateRgb(
          theme.palette.success.light,
          theme.palette.error.light
        )(t));

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "11px")
        .style("fill", theme.palette.text.secondary);

      // Add bars
      g.selectAll("rect")
        .data(chartData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.topic))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.duration))
        .attr("height", d => innerHeight - y(d.duration))
        .attr("fill", d => colorScale(d.duration))
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("opacity", 0.8);

    } catch (err) {
      console.error("Error drawing DurationChart:", err);
      setError("Error rendering chart");
    }
  }, [chartData, dimensions, height, theme, isLoading, error]);

  if (isLoading) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (chartData.length === 0) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No duration data available
      </Alert>
    );
  }

  return (
    <Box sx={{ width: '100%', height, position: 'relative' }}>
      {title && (
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, ml: 1 }}>
          {title}
        </Typography>
      )}
      <svg ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
    </Box>
  );
}