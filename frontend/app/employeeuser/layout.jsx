'use client';
import { useState } from 'react';
import {
    Box,
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    createTheme,
    ThemeProvider
} from '@mui/material';
import {
    Dashboard,
    CalendarToday,
    PendingActions,
    Logout,
    Person,
    Settings
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Create custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#fdc501',
            light: '#ffd733',
            dark: '#c59400',
            contrastText: '#000000'
        },
        background: {
            default: '#ffffff',
            paper: '#ffffff'
        },
        text: {
            primary: '#000000',
            secondary: 'rgba(0, 0, 0, 0.6)'
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
            }
        }
    }
});

export default function EmployeeLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [anchorEl, setAnchorEl] = useState(null);

    const menuItems = [
        { text: 'Dashboard', icon: <Dashboard />, path: '/employeeuser/emp_dashboard' },
        { text: 'Attendance', icon: <CalendarToday />, path: '/employeeuser/emp_attendance' },
        { text: 'Leave Request', icon: <PendingActions />, path: '/employeeuser/emp_leaverequest' },
    ];

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        router.push('/signin');
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                minHeight: '100vh', 
                bgcolor: 'background.default',
                overflow: 'hidden'
            }}>
                <AppBar 
                    position="fixed" 
                    sx={{ 
                        bgcolor: 'background.paper', 
                        color: 'text.primary',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        zIndex: theme.zIndex.drawer + 1,
                        height: '48px'
                    }}
                >
                    <Toolbar sx={{ 
                        justifyContent: 'space-between',
                        minHeight: '48px !important',
                        px: 1
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: 'primary.main'
                                }}
                            >
                                Employee Portal
                            </Typography>
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                                {menuItems.map((item) => (
                                    <Button
                                        key={item.text}
                                        component={Link}
                                        href={item.path}
                                        startIcon={item.icon}
                                        sx={{
                                            color: pathname === item.path ? 'primary.main' : 'text.secondary',
                                            borderBottom: pathname === item.path ? '2px solid' : 'none',
                                            borderColor: 'primary.main',
                                            borderRadius: 0,
                                            '&:hover': {
                                                color: 'primary.main',
                                                bgcolor: 'rgba(253, 197, 1, 0.04)'
                                            }
                                        }}
                                    >
                                        {item.text}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{
                                    '&:hover': {
                                        bgcolor: 'rgba(253, 197, 1, 0.04)'
                                    }
                                }}
                            >
                                <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                                    <Person />
                                </Avatar>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        minWidth: 200,
                                        borderRadius: 2,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <MenuItem onClick={handleMenuClose}>
                                    <Person sx={{ mr: 1, color: 'primary.main' }} /> Profile
                                </MenuItem>
                                <MenuItem onClick={handleMenuClose}>
                                    <Settings sx={{ mr: 1, color: 'primary.main' }} /> Settings
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <Logout sx={{ mr: 1 }} /> Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box 
                    component="main" 
                    sx={{ 
                        flexGrow: 1, 
                        p: 0,
                        mt: '48px',
                        maxWidth: '1400px',
                        mx: 'auto',
                        width: '100%',
                        mb: 0,
                        overflow: 'auto',
                        position: 'relative'
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
} 