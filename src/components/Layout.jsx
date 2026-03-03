import React from 'react';
import { Box, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemIcon, ListItemText, CssBaseline, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Layout({ children }) {
    const navigate = useNavigate();
    const location = useLocation();

    const admin = JSON.parse(localStorage.getItem('admin') || '{}');
    const isSuperAdmin = admin.app_id === '1' || admin.user_type === 1;

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
        { text: 'Events / Modules', icon: <EventIcon />, path: '/modules' },
        ...(isSuperAdmin ? [{ text: 'Module Allotment', icon: <AssignmentIndIcon />, path: '/allotment' }] : []),
        ...(isSuperAdmin ? [{ text: 'Users', icon: <PeopleIcon />, path: '/users' }] : []),
        ...(!isSuperAdmin ? [{ text: 'App Settings', icon: <SettingsIcon />, path: '/settings' }] : []),
        { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications' }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'rgba(18, 18, 18, 0.8)', backdropFilter: 'blur(10px)' }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1 }}>
                        EVENT APP ADMIN
                    </Typography>
                    <IconButton color="inherit" onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            localStorage.clear();
                            navigate('/login');
                        }
                    }}>
                        <LogoutIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                                sx={{
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(187, 134, 252, 0.12)',
                                        borderRight: '3px solid #bb86fc'
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ color: location.pathname === item.path ? '#bb86fc' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
}
