// components/layout/dashboardLayout.jsx
import { Grid, Box, Paper, useTheme, useMediaQuery } from "@mui/material";
import FilterPanel from "../filters/filterPanel";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children, showFilters = true }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        p: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Grid container spacing={{ xs: 2, md: 3 }}>
        
        {/* FILTER PANEL - Collapsible on mobile */}
        {showFilters && (
          <Grid item xs={12} md={3} lg={2.5}>
            <Paper
              elevation={isMobile ? 1 : 3}
              sx={{
                p: { xs: 1.5, sm: 2, md: 2.5 },
                borderRadius: { xs: 2, md: 3 },
                height: "fit-content",
                position: { md: "sticky" },
                top: { md: 24 },
                transition: "all 0.3s ease",
                '&:hover': {
                  boxShadow: theme.shadows[8]
                }
              }}
            >
              <FilterPanel />
            </Paper>
          </Grid>
        )}

        {/* MAIN CONTENT */}
        <Grid item xs={12} md={showFilters ? (isTablet ? 9 : 9.5) : 12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2, sm: 2.5, md: 3 }
              }}
            >
              <AnimatePresence mode="wait">
                {children}
              </AnimatePresence>
            </Box>
          </motion.div>
        </Grid>

      </Grid>
    </Box>
  );
}