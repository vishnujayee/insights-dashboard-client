// components/GroupedBarChart.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";
import { validateChartData, safeNumber } from "../utils/chartUtils";

const GroupedBarChart = ({ data, title, height = 400 }) => {
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

      // Process data based on structure
      let processed = [];
      
      if (data[0].year || data[0]._id?.year) {
        // Handle year-based data
        const yearMap = new Map();
        data.forEach(item => {
          const year = item.year || item._id?.year;
          if (!year) return;
          
          if (!yearMap.has(year)) {
            yearMap.set(year, { year });
          }
          
          Object.keys(item).forEach(key => {
            if (key !== 'year' && key !== '_id' && typeof item[key] === 'number') {
              yearMap.get(year)[key] = safeNumber(item[key]);
            }
          });
        });
        processed = Array.from(yearMap.values());
      } else {
        // Handle regular data
        processed = data.slice(0, 10).map(item => ({
          ...item,
          _id: String(item._id || item.sector || 'Unknown')
        }));
      }
      
      setChartData(processed);
      setError(null);
    } catch (err) {
      setError("Error processing chart data");
      console.error("GroupedBarChart data error:", err);
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

      const margin = { top: 50, right: 120, bottom: 80, left: 70 };
      const width = Math.max(100, dimensions.width - margin.left - margin.right);
      const innerHeight = Math.max(100, height - margin.top - margin.bottom);

      const g = svg
        .attr("width", dimensions.width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Get categories
      const groups = chartData.map(d => d.year || d._id);
      const subgroups = Object.keys(chartData[0]).filter(k => 
        k !== 'year' && k !== '_id' && typeof chartData[0][k] === 'number'
      );

      if (subgroups.length === 0) {
        setError("No numeric data found");
        return;
      }

      // Scales
      const x0 = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding(0.2);

      const x1 = d3.scaleBand()
        .domain(subgroups)
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => 
          d3.max(subgroups, key => d[key] || 0)
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

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px");

      g.append("g")
        .call(d3.axisLeft(y).ticks(5))
        .selectAll("text")
        .style("font-size", "11px");

      // Add bars
      chartData.forEach((d, i) => {
        subgroups.forEach((subgroup, j) => {
          const value = d[subgroup] || 0;
          if (value === 0) return;

          g.append("rect")
            .attr("x", x0(d.year || d._id) + x1(subgroup))
            .attr("y", y(value))
            .attr("width", x1.bandwidth())
            .attr("height", innerHeight - y(value))
            .attr("fill", colors[j % colors.length])
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("opacity", 0.8);
        });
      });

      // Add legend
      const legend = g.append("g")
        .attr("transform", `translate(${width + 10}, 0)`);

      subgroups.forEach((subgroup, i) => {
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
          .text(subgroup);
      });

    } catch (err) {
      console.error("Error drawing GroupedBarChart:", err);
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

export default GroupedBarChart;