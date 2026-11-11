// components/TopSectorTable.jsx
import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  TableSortLabel,
  TablePagination,
  Box,
  Chip,
  useTheme,
  alpha
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from "@mui/icons-material";

const TopSectorTable = ({ data }) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState('avgIntensity');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[orderBy] || 0;
    const bVal = b[orderBy] || 0;
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getTrendIcon = (value) => {
    if (value > 75) return <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
    if (value < 25) return <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />;
    return <TrendingFlatIcon sx={{ color: theme.palette.warning.main, fontSize: 16 }} />;
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                Sector
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <TableSortLabel
                  active={orderBy === 'avgIntensity'}
                  direction={orderBy === 'avgIntensity' ? order : 'asc'}
                  onClick={() => handleSort('avgIntensity')}
                >
                  Avg Intensity
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <TableSortLabel
                  active={orderBy === 'avgLikelihood'}
                  direction={orderBy === 'avgLikelihood' ? order : 'asc'}
                  onClick={() => handleSort('avgLikelihood')}
                >
                  Avg Likelihood
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <TableSortLabel
                  active={orderBy === 'count'}
                  direction={orderBy === 'count' ? order : 'asc'}
                  onClick={() => handleSort('count')}
                >
                  Count
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i) => (
                <TableRow 
                  key={i}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.02)
                    },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={row._id || row.sector} 
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {getTrendIcon(row.avgIntensity)}
                      <span style={{ fontWeight: 500 }}>
                        {row.avgIntensity?.toFixed(2)}
                      </span>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      {getTrendIcon(row.avgLikelihood)}
                      <span style={{ fontWeight: 500 }}>
                        {row.avgLikelihood?.toFixed(2)}
                      </span>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      label={row.count || 0} 
                      size="small"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          '.MuiTablePagination-select': {
            borderRadius: 2,
          }
        }}
      />
    </Paper>
  );
};

export default TopSectorTable;