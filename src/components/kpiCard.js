// components/kpiCard.jsx
import React from "react";
import { Paper, Box, Typography, useTheme, alpha, IconButton } from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon
} from "@mui/icons-material";

const KpiCard = ({ title, value, color = "#2563eb", icon, trend = 0 }) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (trend > 0) return <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 16 }} />;
    if (trend < 0) return <TrendingDownIcon sx={{ color: theme.palette.error.main, fontSize: 16 }} />;
    return null;
  };

  const getTrendColor = () => {
    if (trend > 0) return theme.palette.success.main;
    if (trend < 0) return theme.palette.error.main;
    return theme.palette.text.secondary;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.08)} 0%, ${alpha(color, 0.02)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(color, 0.1),
            color: color,
          }}
        >
          {icon}
        </Box>
        <IconButton size="small" sx={{ color: theme.palette.text.secondary }}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ color: color }}>
          {value}
        </Typography>
        {trend !== 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getTrendIcon()}
            <Typography 
              variant="caption" 
              sx={{ 
                color: getTrendColor(),
                fontWeight: 600
              }}
            >
              {Math.abs(trend)}%
            </Typography>
          </Box>
        )}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
        vs previous period
      </Typography>
    </Paper>
  );
};

export default KpiCard;