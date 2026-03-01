"use client";
import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { ThemeToggle } from './ThemeToggle';

export function PageHeader({ title, description, children }) {
    return (
        <Box sx={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,

            bgcolor: 'background.paper',
        }}>
            <Box>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #673ab7, #2196f3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.02em',
                    }}
                >
                    {title}
                </Typography>
                {description && (
                    <Typography
                        variant="subtitle1"
                        sx={{
                            mt: 0.5,
                            color: 'text.secondary',
                            fontWeight: 500
                        }}
                    >
                        {description}
                    </Typography>
                )}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {children}
                <ThemeToggle />
            </Box>
        </Box>
    );
}
