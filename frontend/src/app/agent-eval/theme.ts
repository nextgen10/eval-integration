'use client';
import { createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const getTheme = (mode: 'light' | 'dark') => createTheme({
    palette: {
        mode,
        primary: {
            main: mode === 'dark' ? '#7c4dff' : '#673ab7', // Lighter purple for dark mode
            light: mode === 'dark' ? '#b388ff' : '#ede7f6',
            dark: mode === 'dark' ? '#651fff' : '#5e35b1',
            contrastText: '#fff',
        },
        secondary: {
            main: mode === 'dark' ? '#448aff' : '#2196f3', // Lighter blue for dark mode
            light: mode === 'dark' ? '#82b1ff' : '#e3f2fd',
            dark: mode === 'dark' ? '#2979ff' : '#1e88e5',
            contrastText: '#fff',
        },
        background: {
            default: mode === 'dark' ? '#121212' : '#f5f5f5',
            paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        success: {
            main: '#00c853',
            light: '#b9f6ca',
            dark: '#009624',
        },
        error: {
            main: '#f44336',
            light: '#ffcdd2',
            dark: '#d32f2f',
        },
        warning: {
            main: '#ff9800',
            light: '#ffe0b2',
            dark: '#f57c00',
        },
        text: {
            primary: mode === 'dark' ? '#e0e0e0' : '#364152',
            secondary: mode === 'dark' ? '#a0a0a0' : '#697586',
        },
        divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
        h1: { fontSize: '2.125rem', fontWeight: 700 },
        h2: { fontSize: '1.5rem', fontWeight: 700 },
        h3: { fontSize: '1.25rem', fontWeight: 600 },
        h4: { fontSize: '1rem', fontWeight: 600 },
        h5: { fontSize: '0.875rem', fontWeight: 500 },
        h6: { fontSize: '0.75rem', fontWeight: 500 },
        subtitle1: { fontSize: '0.875rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.75rem', fontWeight: 400 },
        caption: { fontSize: '0.75rem', fontWeight: 400 },
        body1: { fontSize: '0.875rem' },
        body2: { fontSize: '0.75rem' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                    color: '#fff',
                    '&:hover': {
                        boxShadow: '0 6px 20px 0 rgba(103, 58, 183, 0.23)',
                        filter: 'brightness(1.1)',
                    }
                },
                outlined: {
                    border: '2px solid transparent',
                    background: mode === 'dark'
                        ? 'linear-gradient(#1e1e1e, #1e1e1e) padding-box, linear-gradient(45deg, #673ab7 30%, #2196f3 90%) border-box'
                        : 'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(45deg, #673ab7 30%, #2196f3 90%) border-box',
                    color: mode === 'dark' ? '#fff' : '#673ab7',
                    '&:hover': {
                        background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%) border-box',
                        color: '#fff',
                        border: '2px solid transparent',
                        boxShadow: '0 4px 14px 0 rgba(103, 58, 183, 0.39)',
                    }
                }
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e3e8ef',
                    boxShadow: 'none',
                    backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 500,
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
                    color: mode === 'dark' ? '#fff' : '#364152',
                    borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e0e0e0',
                }
            }
        }
    },
});

export default getTheme;
