'use client';
import React from 'react';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Collapse, useTheme, IconButton, Avatar, alpha, Tooltip, Button } from '@mui/material';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import StarIcon from '@mui/icons-material/Star';
import CalculateIcon from '@mui/icons-material/Calculate';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Link from 'next/link';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import { ColorModeContext } from '../contexts/ColorModeContext';
import { useSidebar } from '../contexts/SidebarContext';
import DataObjectIcon from '@mui/icons-material/DataObject';

export default function Sidebar() {
    const theme = useTheme();
    const pathname = usePathname();
    const colorMode = useContext(ColorModeContext);
    const { isCollapsed, toggleSidebar, sidebarWidth } = useSidebar();

    const menuItems = [
        { text: 'Dashboard', icon: <SpaceDashboardIcon fontSize="medium" />, path: '/agent-eval/dashboard' },
        { text: 'Test Evaluations', icon: <AssessmentIcon fontSize="medium" />, path: '/agent-eval/test-evaluations' },
        { text: 'Agent Interaction', icon: <ModelTrainingIcon fontSize="medium" />, path: '/agent-eval/agent-interaction' },
        { text: 'Configuration', icon: <SettingsSuggestIcon fontSize="medium" />, path: '/agent-eval/configuration' },
        { text: 'History', icon: <HistoryIcon fontSize="medium" />, path: '/agent-eval/history' },
        { text: 'Examples', icon: <CalculateIcon fontSize="medium" />, path: '/agent-eval/examples' },
        { text: 'About', icon: <InfoOutlinedIcon fontSize="medium" />, path: '/agent-eval/about' },
        { text: 'Models Info', icon: <PsychologyIcon fontSize="medium" />, path: '/agent-eval/models-info' },
    ];

    return (
        <Box
            sx={{
                width: sidebarWidth,
                bgcolor: 'background.paper',
                borderRight: '1px solid',
                borderColor: 'divider',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                overflow: 'visible', // Changed to visible so button can overlap
                transition: 'width 0.3s ease-in-out',
                zIndex: 1200,
            }}
        >
            {/* Scrollable Content Container */}
            <Box
                sx={{
                    height: '100%',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    sx={{
                        p: 0,
                        height: '70px',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        background: (theme) => alpha(theme.palette.background.paper, 0.7),
                        backdropFilter: 'blur(10px)',
                        flexShrink: 0, // Prevent shrinking
                    }}
                >
                    {/* Expanded State Content */}
                    {!isCollapsed && (
                        <>
                            <Box sx={{ position: 'absolute', left: 16, display: 'flex', alignItems: 'center' }}>
                                <svg width={0} height={0} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', visibility: 'hidden' }}>
                                    <defs>
                                        <linearGradient id="sidebar_logo_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="30%" stopColor="#673ab7" />
                                            <stop offset="90%" stopColor="#2196f3" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <AutoAwesomeIcon sx={{ fontSize: 40, fill: "url(#sidebar_logo_gradient)", animation: 'logo-pulse 2s infinite ease-in-out', willChange: 'transform', filter: 'drop-shadow(0 0 15px rgba(33, 150, 243, 0.8))', bgcolor: 'transparent !important', boxShadow: 'none !important' }} />
                            </Box>

                            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 4 }}>
                                <Typography variant="h1" sx={{
                                    fontWeight: 'bold',
                                    letterSpacing: 0,
                                    fontSize: '1.25rem',
                                    whiteSpace: 'nowrap',
                                    background: 'linear-gradient(45deg, #673ab7, #2196f3, #673ab7)',
                                    backgroundSize: '200% auto',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    lineHeight: 1.2,
                                    display: 'inline-block', // Required for transform
                                }}>
                                    E • V • A • L
                                </Typography>
                                <Typography variant="caption" sx={{ mt: 0.5, color: 'text.secondary', lineHeight: 1 }}>
                                    Powered by Agentic AI
                                </Typography>
                            </Box>
                        </>
                    )}

                    {/* Collapsed State Content - Centered Icon */}
                    {isCollapsed && (
                        <>
                            <svg width={0} height={0} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', visibility: 'hidden' }}>
                                <defs>
                                    <linearGradient id="sidebar_logo_gradient_collapsed" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="30%" stopColor="#673ab7" />
                                        <stop offset="90%" stopColor="#2196f3" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <AutoAwesomeIcon sx={{ fontSize: 40, fill: "url(#sidebar_logo_gradient_collapsed)", animation: 'logo-pulse 2s infinite ease-in-out', willChange: 'transform', filter: 'drop-shadow(0 0 15px rgba(33, 150, 243, 0.8))', bgcolor: 'transparent !important', boxShadow: 'none !important' }} />
                        </>
                    )}
                </Box>

                <List sx={{ pt: 2, flexGrow: 1 }}>
                    {menuItems.map((item) => {
                        const menuButton = (
                            <ListItemButton
                                selected={pathname === item.path}
                                sx={{
                                    mx: 1,
                                    borderRadius: 1,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    px: isCollapsed ? 1 : 2,
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                                        color: '#fff',
                                        boxShadow: '0 4px 14px 0 rgba(103, 58, 183, 0.39)',
                                        '&:hover': {
                                            filter: 'brightness(1.1)',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: '#fff',
                                        }
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(103, 58, 183, 0.08)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: isCollapsed ? 'auto' : 40, color: 'inherit', justifyContent: 'center' }}>
                                    {item.icon}
                                </ListItemIcon>
                                {!isCollapsed && <ListItemText primary={item.text} />}
                            </ListItemButton>
                        );

                        return (
                            <Link key={item.path} href={item.path} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItem disablePadding>
                                    {isCollapsed ? (
                                        <Tooltip title={item.text} placement="right">
                                            {menuButton}
                                        </Tooltip>
                                    ) : (
                                        menuButton
                                    )}
                                </ListItem>
                            </Link>
                        );
                    })}
                </List>

                <List>
                    <Link href="/feedback" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
                        <ListItem disablePadding>
                            {isCollapsed ? (
                                <Tooltip title="Feedback" placement="right">
                                    <ListItemButton
                                        selected={pathname === '/feedback'}
                                        sx={{
                                            mx: 1,
                                            borderRadius: 1,
                                            justifyContent: 'center',
                                            px: 1,
                                            '&.Mui-selected': {
                                                background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                                                color: '#fff',
                                                boxShadow: '0 4px 14px 0 rgba(103, 58, 183, 0.39)',
                                                '&:hover': {
                                                    filter: 'brightness(1.1)',
                                                },
                                                '& .MuiListItemIcon-root': {
                                                    color: '#fff',
                                                }
                                            },
                                            '&:hover': {
                                                bgcolor: 'rgba(103, 58, 183, 0.08)',
                                            }
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 'auto', color: 'inherit', justifyContent: 'center' }}>
                                            <StarIcon fontSize="medium" />
                                        </ListItemIcon>
                                    </ListItemButton>
                                </Tooltip>
                            ) : (
                                <ListItemButton
                                    selected={pathname === '/feedback'}
                                    sx={{
                                        mx: 1,
                                        borderRadius: 1,
                                        '&.Mui-selected': {
                                            background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                                            color: '#fff',
                                            boxShadow: '0 4px 14px 0 rgba(103, 58, 183, 0.39)',
                                            '&:hover': {
                                                filter: 'brightness(1.1)',
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: '#fff',
                                            }
                                        },
                                        '&:hover': {
                                            bgcolor: 'rgba(103, 58, 183, 0.08)',
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                        <StarIcon fontSize="medium" />
                                    </ListItemIcon>
                                    <ListItemText primary="Feedback" />
                                </ListItemButton>
                            )}
                        </ListItem>
                    </Link>
                </List>

                {!isCollapsed && (
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)', color: '#fff', width: 40, height: 40, fontSize: '1rem' }}>AM</Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                Aniket Marwadi
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Admin
                            </Typography>
                        </Box>
                    </Box>
                )}
                {isCollapsed && (
                    <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'center' }}>
                        <Tooltip title="Aniket Marwadi - Admin" placement="right">
                            <Avatar sx={{ background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)', color: '#fff', width: 40, height: 40, fontSize: '1rem' }}>AM</Avatar>
                        </Tooltip>
                    </Box>
                )}
            </Box>

            {/* Gradient Defs for Arrow */}
            <svg width={0} height={0} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', visibility: 'hidden' }}>
                <defs>
                    <linearGradient id="sidebar_arrow_gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="30%" stopColor="#673ab7" />
                        <stop offset="90%" stopColor="#2196f3" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Toggle Button - On the Divider */}
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
                <IconButton
                    onClick={toggleSidebar}
                    sx={{
                        position: 'absolute',
                        right: -10, // Half of 20px width to center on border
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1300,
                        width: 20,
                        height: 20,
                        padding: 0,
                        bgcolor: 'background.paper', // Needs background to cover the line
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-50%) scale(1.1)',
                            background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                            borderColor: 'transparent',
                            '& svg': {
                                fill: '#fff !important'
                            }
                        }
                    }}
                >
                    {isCollapsed ?
                        <ChevronLeftIcon sx={{ transform: 'rotate(180deg)', fontSize: 16, fill: "url(#sidebar_arrow_gradient)", transition: 'fill 0.3s' }} /> :
                        <ChevronLeftIcon sx={{ fontSize: 16, fill: "url(#sidebar_arrow_gradient)", transition: 'fill 0.3s' }} />
                    }
                </IconButton>
            </Tooltip>
        </Box>
    );
}
