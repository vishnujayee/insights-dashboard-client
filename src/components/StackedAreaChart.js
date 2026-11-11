// components/StackedAreaChart.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";
import { validateChartData, safeNumber } from "../utils/chartUtils";

const StackedAreaChart = ({ data, title, height = 400 }) => {
  const theme = useTheme();
  const ref = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    try {
      setIsLoading(true);
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        setChartData([]);
        setError(null);
        return;
      }

      // Process data for stacking
      let processed = [];
      
      if (data[0].year && data[0].pestle) {
        // Group by year
        const yearMap = new Map();
        data.forEach(item => {
          const year = safeNumber(item.year, 0);
          if (year === 0) return;
          
          if (!yearMap.has(year)) {
            yearMap.set(year, { year });
          }
          
          const pestle = item.pestle || 'Other';
          yearMap.get(year)[pestle] = safeNumber(item.count || item.value, 0);
        });
        
        processed = Array.from(yearMap.values())
          .sort((a, b) => a.year - b.year);
      } else {
        processed = data.slice(0, 20); // Limit data
      }
      
      setChartData(processed);
      setError(null);
    } catch (err) {
      setError("Error processing chart data");
      console.error("StackedAreaChart data error:", err);
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

      const margin = { top: 50, right: 120, bottom: 60, left: 70 };
      const width = Math.max(100, dimensions.width - margin.left - margin.right);
      const innerHeight = Math.max(100, height - margin.top - margin.bottom);

      const g = svg
        .attr("width", dimensions.width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Get keys for stacking
      const keys = Object.keys(chartData[0]).filter(k => k !== 'year' && k !== '_id');

      if (keys.length === 0) {
        setError("No data to stack");
        return;
      }

      // Stack the data
      const stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      const stackedData = stack(chartData);

      // Scales
      const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.year || d._id))
        .range([0, width]);

      const y = d3.scaleLinear()
        .domain([0, d3.max(stackedData, layer => 
          d3.max(layer, d => d[1])
        ) * 1.1])
        .nice()
        .range([innerHeight, 0]);

      // Colors
      const colors = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.success.main,
        theme.palette.warning.main,
        theme.palette.info.main,
        theme.palette.error.main
      ];

      // Area generator
      const area = d3.area()
        .x(d => x(d.data.year || d.data._id))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX);

      // Add areas
      stackedData.forEach((layer, i) => {
        g.append("path")
          .datum(layer)
          .attr("fill", colors[i % colors.length])
          .attr("opacity", 0.7)
          .attr("d", area);
      });

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("font-size", "11px");

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "11px");

      // Add legend
      const legend = g.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

      keys.slice(0, 6).forEach((key, i) => {
        const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 20})`);

        legendRow.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", colors[i % colors.length]);

        legendRow.append("text")
          .attr("x", 20)
          .attr("y", 10)
          .style("font-size", "11px")
          .text(key);
      });

    } catch (err) {
      console.error("Error drawing StackedAreaChart:", err);
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
        No data available
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
};

export default StackedAreaChart;