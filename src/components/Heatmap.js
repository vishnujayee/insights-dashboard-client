// components/Heatmap.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, useTheme, Typography, Alert, CircularProgress } from "@mui/material";
import { validateChartData, safeNumber } from "../utils/chartUtils";

const Heatmap = ({ data, title, height = 400 }) => {
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

      // Process heatmap data
      let processed = [];
      
      if (data[0].country && data[0].pestle) {
        // PESTLE by country format
        const countries = [...new Set(data.map(d => d.country))].slice(0, 10);
        const pestles = [...new Set(data.map(d => d.pestle))];
        
        countries.forEach(country => {
          pestles.forEach(pestle => {
            const item = data.find(d => d.country === country && d.pestle === pestle);
            if (item) {
              processed.push({
                x: country,
                y: pestle,
                value: safeNumber(item.count || item.value, 0)
              });
            }
          });
        });
      } else if (data[0].year && data[0].sector) {
        // Year by sector format
        const years = [...new Set(data.map(d => d.year))].slice(0, 10);
        const sectors = [...new Set(data.map(d => d.sector))];
        
        years.forEach(year => {
          sectors.forEach(sector => {
            const item = data.find(d => d.year === year && d.sector === sector);
            if (item) {
              processed.push({
                x: String(year),
                y: sector,
                value: safeNumber(item.count || item.value, 0)
              });
            }
          });
        });
      } else {
        // Generic format
        processed = data.slice(0, 100).map((item, i) => ({
          x: String(item.x || item.category || item._id || `X${i}`),
          y: String(item.y || item.subcategory || `Y${i}`),
          value: safeNumber(item.value || item.count, 0)
        }));
      }
      
      setChartData(processed.filter(d => d.value > 0));
      setError(null);
    } catch (err) {
      setError("Error processing chart data");
      console.error("Heatmap data error:", err);
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

      const margin = { top: 60, right: 30, bottom: 100, left: 100 };
      const width = Math.max(100, dimensions.width - margin.left - margin.right);
      const innerHeight = Math.max(100, height - margin.top - margin.bottom);

      const g = svg
        .attr("width", dimensions.width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Get unique x and y values
      const xValues = [...new Set(chartData.map(d => d.x))];
      const yValues = [...new Set(chartData.map(d => d.y))];

      // Create scales
      const x = d3.scaleBand()
        .domain(xValues)
        .range([0, width])
        .padding(0.05);

      const y = d3.scaleBand()
        .domain(yValues)
        .range([0, innerHeight])
        .padding(0.05);

      // Color scale
      const maxValue = d3.max(chartData, d => d.value) || 1;
      const colorScale = d3.scaleSequential()
        .domain([0, maxValue])
        .interpolator(t => d3.interpolateRgb(
          theme.palette.primary.light,
          theme.palette.primary.dark
        )(t));

      // Add axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px");

      g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "11px");

      // Add cells
      chartData.forEach(d => {
        if (d.value === 0) return;

        g.append("rect")
          .attr("x", x(d.x))
          .attr("y", y(d.y))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .attr("fill", colorScale(d.value))
          .attr("rx", 2)
          .attr("ry", 2)
          .attr("opacity", 0.8);
      });

    } catch (err) {
      console.error("Error drawing Heatmap:", err);
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
        No heatmap data available
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

export default Heatmap;