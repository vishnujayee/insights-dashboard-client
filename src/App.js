// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { FilterProvider } from "../src/context/FilterContext";
import { SnackbarProvider } from 'notistack';
import { Box } from "@mui/material";

import Navbar from "../src/components/layout/Navbar";
import Sidebar from "../src/components/layout/Sidebar";
import Dashboard from "./Pages/Dashboard";
import LocationComparison from "./Pages/LocationComparison";
import YearComparison from "./Pages/YearComparison";
import PestleAnalysis from "./Pages/PestleAnalysis";
import DurationAnalysis from "./Pages/DurationAnalysis";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <FilterProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
                <Sidebar />
                <Box 
                  component="main" 
                  sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    backgroundColor: theme.palette.background.default,
                    minHeight: 'calc(100vh - 64px)'
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/location-comparison" element={<LocationComparison />} />
                    <Route path="/year-comparison" element={<YearComparison />} />
                    <Route path="/pestle-analysis" element={<PestleAnalysis />} />
                    <Route path="/duration-analysis" element={<DurationAnalysis />} />
                  </Routes>
                </Box>
              </Box>
            </Box>
          </Router>
        </FilterProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;