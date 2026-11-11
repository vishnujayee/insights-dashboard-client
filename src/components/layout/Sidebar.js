// components/layout/Sidebar.jsx
import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
  Divider,
  Collapse,
  useTheme
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import {
  Dashboard as DashboardIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  ExpandLess,
  ExpandMore,
  Assessment as AssessmentIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";

const Sidebar = () => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
    },
    {
      text: "Location Analysis",
      icon: <LocationIcon />,
      path: "/location-comparison",
    },
    {
      text: "Year Comparison",
      icon: <CalendarIcon />,
      path: "/year-comparison",
    },
    {
      text: "PESTLE Analysis",
      icon: <AnalyticsIcon />,
      path: "/pestle-analysis",
    },
    {
      text: "Duration Analysis",
      icon: <TimelineIcon />,
      path: "/duration-analysis",
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 260,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 260,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          top: '64px',
          height: 'calc(100% - 64px)',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 2 }}>
        {/* App Title */}
        <Box sx={{ px: 3, mb: 2 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 600,
              letterSpacing: '1px'
            }}
          >
            MAIN NAVIGATION
          </Typography>
        </Box>

        {/* Main Menu Items */}
        <List sx={{ px: 2 }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <ListItem 
                key={item.text} 
                disablePadding 
                sx={{ mb: 1 }}
              >
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '30',
                      },
                      '& .MuiListItemIcon-root': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiListItemText-primary': {
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                      },
                    },
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2, mx: 3 }} />

        {/* Reports Section */}
        <Box sx={{ px: 3, mb: 1 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 600,
              letterSpacing: '1px'
            }}
          >
            REPORTS
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              sx={{ borderRadius: 2, py: 1.2 }}
              onClick={() => setOpen(!open)}
            >
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Saved Reports"
                primaryTypographyProps={{ fontSize: '0.9rem' }}
              />
              {open ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton 
                sx={{ 
                  pl: 6, 
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Weekly Report" />
              </ListItemButton>
              <ListItemButton 
                sx={{ 
                  pl: 6, 
                  borderRadius: 2,
                  '&:hover': { backgroundColor: theme.palette.action.hover }
                }}
              >
                <ListItemIcon sx={{ minWidth: 30 }}>
                  <BarChartIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Monthly Summary" />
              </ListItemButton>
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;