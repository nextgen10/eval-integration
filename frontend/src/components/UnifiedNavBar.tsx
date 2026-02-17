'use client';

import React from 'react';
import { Box, Button, Typography, useTheme, Container, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { UbsLogo } from './UbsLogo';

interface UnifiedNavBarProps {
    title: string;
    items: {
        id: string;
        label: string;
        icon?: React.ReactNode;
        onClick?: () => void;
        active?: boolean;
    }[];
    onLogoClick?: () => void;
    actions?: React.ReactNode;
}

export const UnifiedNavBar: React.FC<UnifiedNavBarProps> = ({
    title,
    items,
    onLogoClick,
    actions
}) => {
    const theme = useTheme();

    const renderTitle = (titleStr: string) => {
        const parts = titleStr.split(' ');
        if (parts.length > 1 && parts[parts.length - 1].toUpperCase() === 'EVAL') {
            const mainPart = parts.slice(0, -1).join(' ');
            return (
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', whiteSpace: 'nowrap' }}>
                    {mainPart} <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box>
                </Typography>
            );
        }
        return (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', whiteSpace: 'nowrap' }}>
                {titleStr}
            </Typography>
        );
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                position: 'sticky',
                top: 16,
                zIndex: 1200,
                px: { xs: 2, md: 4 },
                mb: 4,
                width: '100%',
                maxWidth: 1400,
                mx: 'auto',
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 2, lg: 0 },
                backdropFilter: 'blur(30px)',
                background: alpha(theme.palette.background.paper, 0.8),
                borderRadius: { xs: 2, md: 99 },
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.6)',
                p: 1,
                minHeight: { xs: 'auto', md: 72 },
            }}>
                {/* Brand Logo */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', pl: 3 }}>
                    <Box
                        onClick={onLogoClick}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            cursor: 'pointer',
                        }}
                    >
                        <UbsLogo size={32} color={theme.palette.primary.main} />
                        {renderTitle(title)}
                    </Box>
                </Box>

                {/* Navigation Links */}
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    p: 0.5,
                    bgcolor: alpha(theme.palette.common.white, 0.03),
                    borderRadius: 99,
                }}>
                    {items.map((item) => (
                        <Button
                            key={item.id}
                            onClick={item.onClick}
                            startIcon={item.icon}
                            sx={{
                                px: 2.5,
                                py: 0.8,
                                borderRadius: 99,
                                fontSize: '0.875rem',
                                color: item.active ? 'primary.main' : 'text.secondary',
                                bgcolor: item.active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                fontWeight: item.active ? 700 : 500,
                                '&:hover': {
                                    color: 'primary.main',
                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                {/* Right Actions */}
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    justifyContent: 'flex-end',
                    pr: 2
                }}>
                    {actions}
                </Box>
            </Box>
        </Box>
    );
};
