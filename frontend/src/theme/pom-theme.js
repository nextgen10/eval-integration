import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        primary: {
            main: mode === 'light' ? '#673ab7' : '#7c4dff', // Deep Purple
            gradient: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
        },
        secondary: {
            main: mode === 'light' ? '#2196f3' : '#448aff', // Blue
        },
        background: {
            default: mode === 'light' ? '#f5f5f5' : '#121212',
            paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        },
        success: {
            main: '#00c853',
        },
        error: {
            main: '#f44336',
        },
        warning: {
            main: '#ff9800',
        },
        info: {
            main: '#2196f3',
        },
        status: {
            safe: '#00bcd4',
            faithfulness: '#3f51b5',
            correctness: '#9c27b0',
        }
    },
    typography: {
        fontFamily: [
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
        h1: {
            fontSize: '2.125rem',
            fontWeight: 700,
            lineHeight: 1.2,
        },
        h4: {
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.5,
        },
        subtitle1: {
            fontSize: '0.875rem',
            fontWeight: 500,
            lineHeight: 1.75,
        },
        body1: {
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1.5,
        },
        caption: {
            fontSize: '0.75rem',
            fontWeight: 400,
            lineHeight: 1.66,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                },
                containedPrimary: {
                    background: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                    color: '#fff',
                    '&:hover': {
                        boxShadow: '0 6px 20px 0 rgba(103, 58, 183, 0.23)',
                        filter: 'brightness(1.1)',
                    },
                },
            },
            variants: [
                {
                    props: { variant: 'outlined' },
                    style: {
                        border: '1px solid',
                        borderImageSource: 'linear-gradient(45deg, #673ab7 30%, #2196f3 90%)',
                        borderImageSlice: 1,
                        // Note: border-image can be tricky with border-radius. 
                        // Alternative approach for gradient border with radius might be needed if this fails.
                    }
                }
            ]
        },
        MuiCard: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: '12px',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    backdropFilter: 'blur(10px)',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(180deg, rgba(30,30,30, 0.6) 0%, #1e1e1e 60%)'
                        : 'linear-gradient(180deg, rgba(255,255,255, 0.8) 0%, #ffffff 60%)',
                    boxShadow: theme.palette.mode === 'dark'
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }),
            },
        },
    },
});

// Create a default dark theme for now, or export a function to create it
// The request mentions "Agentic Eval Dark/Light", so we can probably default to dark or let user toggle.
// For now I'll export a standard theme creation function.

export const theme = createTheme(getDesignTokens('dark')); // Defaulting to dark as "Agentic" often implies dark/modern. Will verify.
export const lightTheme = createTheme(getDesignTokens('light'));

export default theme;
