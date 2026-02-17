import { createTheme, alpha } from '@mui/material/styles';

export const getUnifiedTheme = (mode: 'light' | 'dark') => createTheme({
    palette: {
        mode,
        primary: {
            main: '#ef4444', // Premium Red (Red 500)
            light: '#f87171',
            dark: '#dc2626',
            contrastText: '#fff',
        },
        secondary: {
            main: mode === 'dark' ? '#71717a' : '#52525b', // Zinc 400 or 600
        },
        background: {
            default: mode === 'dark' ? '#000000' : '#ffffff',
            paper: mode === 'dark' ? '#09090b' : '#fafafa', // Zinc 950 or 50
        },
        text: {
            primary: mode === 'dark' ? '#fafafa' : '#09090b',
            secondary: mode === 'dark' ? '#a1a1aa' : '#52525b',
        },
        error: {
            main: '#ef4444',
        },
        success: {
            main: '#22c55e',
        },
        warning: {
            main: '#f59e0b',
        },
        info: {
            main: '#3b82f6',
        },
        divider: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    },
    typography: {
        fontFamily: '"Inter", "SF Pro Display", -apple-system, sans-serif',
        h1: { fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontWeight: 600, letterSpacing: '-0.01em' },
        h4: { fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600, letterSpacing: '-0.01em' },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: 'none',
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#ef4444',
                    color: '#fff',
                    '&:hover': {
                        backgroundColor: '#dc2626',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: mode === 'dark' ? '#09090b' : '#ffffff',
                    border: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    boxShadow: mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: mode === 'dark' ? '#09090b' : '#ffffff',
                    border: '1px solid',
                    borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: '12px',
                    boxShadow: mode === 'dark' ? 'none' : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }
            }
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                    padding: '16px',
                },
            },
        },
    },
});

export const nexusTheme = getUnifiedTheme('dark');
