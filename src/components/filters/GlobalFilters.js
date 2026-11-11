import React from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Paper
} from "@mui/material";
import { useFilters } from "../../context/FilterContext";

const GlobalFilters = () => {
  const { filters, updateFilter, clearFilters } = useFilters();

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Grid container spacing={2}>

        <Grid item xs={2}>
          <TextField
            label="Start Year"
            value={filters.startYear}
            onChange={(e) => updateFilter("startYear", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <TextField
            label="End Year"
            value={filters.endYear}
            onChange={(e) => updateFilter("endYear", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <TextField
            label="Country"
            value={filters.country}
            onChange={(e) => updateFilter("country", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <TextField
            label="Region"
            value={filters.region}
            onChange={(e) => updateFilter("region", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <TextField
            label="Sector"
            value={filters.sector}
            onChange={(e) => updateFilter("sector", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={2}>
          <TextField
            label="Pestle"
            value={filters.pestle}
            onChange={(e) => updateFilter("pestle", e.target.value)}
            fullWidth
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        </Grid>

      </Grid>
    </Paper>
  );
};

export default GlobalFilters;