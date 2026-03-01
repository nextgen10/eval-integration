import React from 'react';
import MuiButton from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTheme } from '@mui/material/styles';

export function Button({
    children,
    onClick,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    icon: Icon,
    disabled = false,
    loading = false,
    className = "",
    fullWidth = false,
    ...props
}) {
    const theme = useTheme();

    // Map custom variants to MUI variants/colors
    let muiVariant = 'contained';
    let muiColor = 'primary';
    let sx = {};

    switch (variant) {
        case 'primary':
            muiVariant = 'contained';
            muiColor = 'primary';
            break;
        case 'secondary':
            muiVariant = 'outlined';
            muiColor = 'secondary';
            break;
        case 'danger':
            muiVariant = 'contained';
            muiColor = 'error';
            break;
        case 'success':
            muiVariant = 'contained';
            muiColor = 'success';
            sx = { bgcolor: theme.palette.success.main, '&:hover': { bgcolor: theme.palette.success.dark } };
            break;
        case 'warning':
            muiVariant = 'contained';
            muiColor = 'warning';
            break;
        case 'ghost':
            muiVariant = 'text';
            muiColor = 'inherit';
            break;
        case 'danger-outline':
            muiVariant = 'outlined';
            muiColor = 'error';
            break;
        default:
            muiVariant = 'contained';
            muiColor = 'primary';
    }

    // Map sizes
    const muiSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';

    return (
        <MuiButton
            variant={muiVariant}
            color={muiColor}
            size={muiSize}
            onClick={onClick}
            disabled={disabled || loading}
            startIcon={!loading && Icon ? <Icon size={size === 'sm' ? 16 : 20} /> : null}
            fullWidth={fullWidth}
            sx={{
                ...sx,
                textTransform: 'none',
                boxShadow: variant === 'primary' ? '0 6px 20px 0 rgba(103, 58, 183, 0.23)' : undefined,
                ...(variant === 'success' && {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(0, 200, 83, 0.15)',
                    border: '1px solid rgba(0, 200, 83, 0.3)',
                    color: '#00c853',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 200, 83, 0.25)',
                        borderColor: 'rgba(0, 200, 83, 0.5)',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'rgba(0, 200, 83, 0.05)',
                        border: '1px solid rgba(0, 200, 83, 0.1)',
                        color: 'rgba(0, 200, 83, 0.4)',
                        cursor: 'not-allowed',
                        pointerEvents: 'auto',
                        boxShadow: 'none',
                    },
                }),
                ...(variant === 'danger' && {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(244, 67, 54, 0.15)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    color: '#f44336',
                    '&:hover': {
                        backgroundColor: 'rgba(244, 67, 54, 0.25)',
                        borderColor: 'rgba(244, 67, 54, 0.5)',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'rgba(244, 67, 54, 0.05)',
                        border: '1px solid rgba(244, 67, 54, 0.1)',
                        color: 'rgba(244, 67, 54, 0.4)',
                        cursor: 'not-allowed',
                        pointerEvents: 'auto',
                        boxShadow: 'none',
                    },
                }),
                ...(variant === 'warning' && {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(255, 152, 0, 0.15)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    color: '#ff9800',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 152, 0, 0.25)',
                        borderColor: 'rgba(255, 152, 0, 0.5)',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'rgba(255, 152, 0, 0.05)',
                        border: '1px solid rgba(255, 152, 0, 0.1)',
                        color: 'rgba(255, 152, 0, 0.4)',
                        cursor: 'not-allowed',
                        pointerEvents: 'auto',
                        boxShadow: 'none',
                    },
                }),
                ...(variant === 'primary-glass' && {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(33, 150, 243, 0.15)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    color: '#2196f3',
                    '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.25)',
                        borderColor: 'rgba(33, 150, 243, 0.5)',
                    },
                    '&.Mui-disabled': {
                        backgroundColor: 'rgba(33, 150, 243, 0.05)',
                        border: '1px solid rgba(33, 150, 243, 0.1)',
                        color: 'rgba(33, 150, 243, 0.4)',
                        cursor: 'not-allowed',
                        pointerEvents: 'auto',
                        boxShadow: 'none',
                    },
                }),
            }}
            className={className}
            {...props}
        >
            {loading && <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />}
            {children}
        </MuiButton>
    );
}
