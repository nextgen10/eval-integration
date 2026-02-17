import React from 'react';
import { Box, Paper, Typography, Avatar, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

interface GlassCardProps {
    title: string;
    value: React.ReactNode;
    color: string;
    icon: React.ReactNode;
    subtitle?: string;
    trend?: string | null;
}

export const GlassCard: React.FC<GlassCardProps> = ({ title, value, color: initialColor, icon, subtitle, trend }) => {
    const theme = useTheme();
    const color = (initialColor === '#ffffff' || initialColor === '#fff')
        ? (initialColor === '#ffffff' ? (initialColor === '#ffffff' ? '#ffffff' : '#ffffff') : '#ffffff')
        : initialColor;

    // Actually, let's just use the current theme context to decide
    return (
        <MotionPaper
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ borderColor: theme.palette.primary.main }}
            sx={{
                p: 3,
                height: '100%',
                backgroundColor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'border-color 0.2s ease-in-out',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}
        >
            <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 20 }) : icon}
                    </Box>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem',
                            lineHeight: 1
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.75rem',
                        mb: 1
                    }}
                >
                    {value}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto' }}>
                {trend && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: trend.startsWith('+') ? 'success.main' : trend.startsWith('-') ? 'error.main' : 'text.secondary',
                            fontWeight: 700,
                            bgcolor: (theme) => alpha(trend.startsWith('+') ? theme.palette.success.main : trend.startsWith('-') ? theme.palette.error.main : theme.palette.text.secondary, 0.1),
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem'
                        }}
                    >
                        {trend}
                    </Typography>
                )}
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontWeight: 500
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </MotionPaper>
    );
};
