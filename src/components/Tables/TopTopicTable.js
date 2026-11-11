// components/TopTopicTable.jsx
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  TableSortLabel,
  TablePagination,
  IconButton,
  Link,
  Chip,
  Box,
  Tooltip,
  useTheme,
  alpha
} from "@mui/material";
import {
  OpenInNew as OpenInNewIcon,
  Link as LinkIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "@mui/icons-material";

const TopTopicTable = ({ data }) => {
  const theme = useTheme();
  const [orderBy, setOrderBy] = useState('intensity');
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

  const getIntensityColor = (value) => {
    if (value > 75) return theme.palette.success.main;
    if (value > 50) return theme.palette.info.main;
    if (value > 25) return theme.palette.warning.main;
    return theme.palette.error.main;
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
                Topic
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                <TableSortLabel
                  active={orderBy === 'intensity'}
                  direction={orderBy === 'intensity' ? order : 'asc'}
                  onClick={() => handleSort('intensity')}
                >
                  Intensity
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
                  active={orderBy === 'likelihood'}
                  direction={orderBy === 'likelihood' ? order : 'asc'}
                  onClick={() => handleSort('likelihood')}
                >
                  Likelihood
                </TableSortLabel>
              </TableCell>
              <TableCell 
                align="center"
                sx={{ 
                  fontWeight: 600,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                }}
              >
                Source
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
                        label={row.topic || row._id} 
                        size="small"
                        sx={{ 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500,
                          maxWidth: 200,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(getIntensityColor(row.intensity), 0.2),
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: '100%',
                            width: `${Math.min(row.intensity, 100)}%`,
                            backgroundColor: getIntensityColor(row.intensity),
                            borderRadius: 2,
                            transition: 'width 0.3s'
                          }}
                        />
                      </Box>
                      <span style={{ fontWeight: 500, minWidth: 40 }}>
                        {row.intensity}
                      </span>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip 
                      icon={row.likelihood > 50 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      label={row.likelihood}
                      size="small"
                      sx={{ 
                        backgroundColor: alpha(
                          row.likelihood > 50 ? theme.palette.success.main : theme.palette.error.main,
                          0.1
                        ),
                        color: row.likelihood > 50 ? theme.palette.success.main : theme.palette.error.main,
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {row.url && (
                      <Tooltip title="View Source">
                        <IconButton
                          size="small"
                          component={Link}
                          href={row.url}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.1)
                            }
                          }}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
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

export default TopTopicTable;