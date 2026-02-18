'use client';

import React from 'react';
import { Box, Paper, Typography, alpha, useTheme } from '@mui/material';

export interface MetricCardProps {
  /** Label (secondary text, e.g. "Total Evaluations") */
  label: string;
  /** Primary value to display */
  value: React.ReactNode;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Optional subtitle below value */
  subtitle?: string;
  /** Optional trend indicator (e.g. "+12%", "-5%") */
  trend?: string | null;
  /** Optional custom color for trend */
  trendColor?: 'success' | 'error' | 'warning' | 'info';
}

/**
 * Unified metric / KPI card for dashboards.
 * Clean surface, clear typography hierarchy, consistent spacing.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  subtitle,
  trend,
  trendColor,
}) => {
  const theme = useTheme();

  const resolveTrendColor = () => {
    if (trendColor) return `${trendColor}.main`;
    if (!trend) return 'text.secondary';
    if (trend.startsWith('+')) return 'success.main';
    if (trend.startsWith('-')) return 'error.main';
    return 'text.secondary';
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        minHeight: 120,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'box-shadow 0.2s ease',
        '&:hover': {
          boxShadow: (t) => t.palette.mode === 'light' ? '0 2px 8px rgba(0,0,0,0.06)' : '0 2px 8px rgba(0,0,0,0.2)',
        },
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          {icon && (
            <Box sx={{ color: 'primary.main', display: 'flex' }}>
              {React.isValidElement(icon)
                ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 })
                : icon}
            </Box>
          )}
          <Typography
            variant="overline"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              letterSpacing: '0.04em',
              fontSize: '0.6875rem',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '1.75rem',
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 'auto', flexWrap: 'wrap' }}>
        {trend && (
          <Typography
            variant="caption"
            sx={{
              color: resolveTrendColor(),
              fontWeight: 700,
              bgcolor: (t) =>
                alpha(
                  trend.startsWith('+')
                    ? t.palette.success.main
                    : trend.startsWith('-')
                      ? t.palette.error.main
                      : t.palette.text.secondary,
                  0.12
                ),
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
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
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
