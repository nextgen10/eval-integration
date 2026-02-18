'use client';

import React from 'react';
import { Box, Button, Container, Typography, useTheme, alpha } from '@mui/material';
import { UbsLogoFull } from './UbsLogoFull';
import { BrandPipe } from './BrandPipe';

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

/**
 * UBS-style navigation bar: clean, minimal, professional.
 * No glassmorphism; flat background with subtle border.
 */
export const UnifiedNavBar: React.FC<UnifiedNavBarProps> = ({
    title,
    items,
    onLogoClick,
    actions
}) => {
    const theme = useTheme();
    const isLight = theme.palette.mode === 'light';

    const renderTitle = (titleStr: string) => {
        const parts = titleStr.split(' ');
        const evalIdx = parts.findIndex(p => p.toUpperCase() === 'EVAL');
        const lastWord = parts[parts.length - 1].toUpperCase();
        const titleSx = { fontWeight: 600, letterSpacing: '-0.01em', color: 'text.primary', whiteSpace: 'nowrap', fontSize: '1.125rem' };

        if (evalIdx >= 0 && evalIdx < parts.length - 1) {
            const mainPart = parts.slice(0, evalIdx).join(' ');
            const redPart = parts.slice(evalIdx).join(' ');
            return (
                <Typography variant="h6" sx={titleSx}>
                    {mainPart}{mainPart ? ' ' : ''}<Box component="span" sx={{ color: 'primary.main' }}>{redPart}</Box>
                </Typography>
            );
        }
        if (parts.length > 1 && (lastWord === 'EVAL' || lastWord === 'DOCS')) {
            const mainPart = parts.slice(0, -1).join(' ');
            return (
                <Typography variant="h6" sx={titleSx}>
                    {mainPart} <Box component="span" sx={{ color: 'primary.main' }}>{lastWord}</Box>
                </Typography>
            );
        }
        return <Typography variant="h6" sx={titleSx}>{titleStr}</Typography>;
    };

    return (
        <Box
            sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1200,
                width: '100%',
                bgcolor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                ...(isLight && { boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }),
            }}
        >
            <Container maxWidth="xl" sx={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 2, md: 3 }, position: 'relative' }}>
                {/* Brand: UBS Logo (official SVG) | App Name */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', zIndex: 1 }}>
                    <Box
                        onClick={onLogoClick}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                    >
                        <UbsLogoFull
                            height={36}
                            keysColor={isLight ? theme.palette.text.primary : theme.palette.primary.main}
                            wordmarkColor={isLight ? theme.palette.primary.main : '#FFFFFF'}
                        />
                        <BrandPipe />
                        {renderTitle(title)}
                    </Box>
                </Box>

                {/* Navigation Links - absolutely centered */}
                <Box sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    {items.map((item) => (
                        <Button
                            key={item.id}
                            onClick={item.onClick}
                            startIcon={item.icon}
                            variant="text"
                            sx={{
                                px: 2,
                                py: 1,
                                borderRadius: 1,
                                fontSize: '0.875rem',
                                color: item.active ? 'primary.main' : 'text.secondary',
                                bgcolor: item.active ? (isLight ? '#FFE5E5' : alpha(theme.palette.primary.main, 0.12)) : 'transparent',
                                fontWeight: item.active ? 600 : 500,
                                '&:hover': {
                                    color: 'primary.main',
                                    bgcolor: isLight ? 'rgba(208,0,0,0.06)' : alpha(theme.palette.primary.main, 0.08),
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>

                {/* Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end', zIndex: 1 }}>
                    {actions}
                </Box>
            </Container>
        </Box>
    );
};
