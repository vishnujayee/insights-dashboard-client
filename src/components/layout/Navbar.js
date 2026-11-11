// components/layout/Navbar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  useTheme
} from "@mui/material";
import {
  NotificationsNone as NotificationsIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon
} from "@mui/icons-material";

const Navbar = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  
  const handleNotificationOpen = (event) => setNotificationAnchor(event.currentTarget);
  const handleNotificationClose = () => setNotificationAnchor(null);

  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${theme.palette.primary.light}`,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo and Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DashboardIcon sx={{ fontSize: 28, color: "white" }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              letterSpacing: "0.5px",
              background: "linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.9) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            InsightAnalytics
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationOpen}
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings */}
          <Tooltip title="Settings">
            <IconButton 
              color="inherit"
              sx={{ 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="Profile">
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{ 
                ml: 1,
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  bgcolor: theme.palette.secondary.main,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                AD
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 180,
            }
          }}
        >
          <MenuItem onClick={handleProfileMenuClose}>My Profile</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Account Settings</MenuItem>
          <MenuItem onClick={handleProfileMenuClose}>Logout</MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              borderRadius: 2,
              minWidth: 280,
            }
          }}
        >
          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2">New data available</Typography>
              <Typography variant="caption" color="text.secondary">2 minutes ago</Typography>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleNotificationClose}>
            <Box sx={{ py: 1 }}>
              <Typography variant="subtitle2">Dashboard updated</Typography>
              <Typography variant="caption" color="text.secondary">1 hour ago</Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;