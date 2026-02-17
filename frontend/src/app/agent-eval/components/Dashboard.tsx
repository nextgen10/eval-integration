import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, useTheme, Icon, Tooltip as MuiTooltip, alpha, lighten } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import FunctionsIcon from '@mui/icons-material/Functions';
import CloseIcon from '@mui/icons-material/Close';
import ShieldIcon from '@mui/icons-material/Shield';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { API_BASE_URL } from '../utils/config';

interface DashboardProps {
    latestResult: any;
}

export default function Dashboard({ latestResult }: DashboardProps) {
    const theme = useTheme();
    const [history, setHistory] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [startIndex, setStartIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Config for animation
    const WINDOW_SIZE = 50;
    const ANIMATION_SPEED = 150;

    useEffect(() => {
        setMounted(true);

        fetch(`${API_BASE_URL}/history`)
            .then(res => res.json())
            .then(data => {
                const chartData = data.map((item: any) => {
                    return {
                        id: item.id,
                        run_id: item.run_id,
                        timestamp: new Date(item.timestamp).toLocaleTimeString(),
                        accuracy: (item.aggregate?.accuracy || 0) * 100,
                        rqs: (item.aggregate?.rqs || 0) * 100,
                        completeness: (item.aggregate?.completeness || 0) * 100,
                        consistency: (item.aggregate?.consistency || 0) * 100,
                        safety: (item.aggregate?.safety || 1.0) * 100,
                        hallucinations: (item.aggregate?.hallucination || 0) * 100
                    };
                }).reverse();
                setHistory(chartData);
            })
            .catch(err => console.error("Failed to fetch history:", err));
    }, []);

    const sourceData = history.slice(-100);

    useEffect(() => {
        if (!mounted || sourceData.length <= WINDOW_SIZE || isPaused) return;

        const interval = setInterval(() => {
            setStartIndex(prev => (prev + 1) % sourceData.length);
        }, ANIMATION_SPEED);

        return () => clearInterval(interval);
    }, [mounted, sourceData.length, isPaused]);

    const getVisibleData = () => {
        if (sourceData.length <= WINDOW_SIZE) return sourceData;
        const end = startIndex + WINDOW_SIZE;
        if (end <= sourceData.length) {
            return sourceData.slice(startIndex, end);
        } else {
            return [
                ...sourceData.slice(startIndex, sourceData.length),
                ...sourceData.slice(0, end - sourceData.length)
            ];
        }
    };

    const visibleData = getVisibleData();

    const stats = {
        rqs: latestResult?.aggregate?.rqs || 0,
        accuracy: latestResult?.aggregate?.accuracy || 0,
        completeness: latestResult?.aggregate?.completeness || 0,
        consistency: latestResult?.aggregate?.consistency || 0,
        safety: latestResult?.aggregate?.safety || 1.0,
        hallucination: latestResult?.aggregate?.hallucination || 0,
        error_summary: latestResult?.error_summary || {},
        status: latestResult?.evaluation_status || (latestResult?.aggregate?.accuracy > 0.5 ? "PASS" : "FAIL")
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Paper sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" display="block" color="text.secondary">
                        Evaluation ID: {data.id}
                    </Typography>
                    {data.run_id && (
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1, fontFamily: 'monospace' }}>
                            UUID: {data.run_id.slice(0, 8)}...
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {data.timestamp}
                    </Typography>
                    {payload.map((p: any) => (
                        <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                            <Typography variant="caption" sx={{ color: p.color }}>
                                {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
                            </Typography>
                        </Box>
                    ))}
                </Paper>
            );
        }
        return null;
    };

    return (
        <Box sx={{ height: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            {/* Header */}
            <Box sx={{ p: 2, height: '70px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: (theme) => alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(10px)', flexShrink: 0 }}>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Evaluation Dashboard
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Real-time Overview & Analytics
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {latestResult?.id && (
                        <Paper
                            elevation={0}
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                border: '1px solid',
                                borderColor: (theme) => alpha(theme.palette.primary.main, 0.5),
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}
                        >
                            <Typography variant="caption" color="text.primary" sx={{ fontWeight: 'bold', letterSpacing: 1.5, fontSize: '0.75rem' }}>
                                LATEST EVALUATION ID: {latestResult.id}
                            </Typography>
                        </Paper>
                    )}
                </Box>
            </Box>

            {/* Content Area - Scrollable */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Box sx={{ flexGrow: 1 }}>
                            <Grid container spacing={1.5} columns={{ xs: 12, sm: 12, md: 14 }}>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="RQS"
                                        value={`${(stats.rqs * 100).toFixed(1)}%`}
                                        color="#2196f3"
                                        icon={<AssessmentIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Accuracy"
                                        value={`${(stats.accuracy * 100).toFixed(1)}%`}
                                        color="#673ab7"
                                        icon={<CheckCircleIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Completeness"
                                        value={`${(stats.completeness * 100).toFixed(1)}%`}
                                        color="#00bcd4"
                                        icon={<FunctionsIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Hallucination"
                                        value={`${(stats.hallucination * 100).toFixed(1)}%`}
                                        color="#ff5722"
                                        icon={<CloseIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Consistency"
                                        value={`${(stats.consistency * 100).toFixed(1)}%`}
                                        color="#009688"
                                        icon={<TimelineIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Safety"
                                        value={`${(stats.safety * 100).toFixed(1)}%`}
                                        color="#e91e63"
                                        icon={<ShieldIcon fontSize="large" />}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                    <SummaryCard
                                        title="Status"
                                        value={stats.status}
                                        color={stats.status === "PASS" ? "#4caf50" : "#f44336"}
                                        icon={stats.status === "PASS" ? <CheckCircleIcon fontSize="large" /> : <CloseIcon fontSize="large" />}
                                        subtitle={
                                            Object.entries(stats.error_summary).length > 0 ? (
                                                <Box component="span">
                                                    {Object.entries(stats.error_summary).map(([k, v], i, arr) => (
                                                        <React.Fragment key={k}>
                                                            <Box component="span" sx={{ color: k === 'correct' ? "#4caf50" : "#f44336" }}>
                                                                {k}: {v as React.ReactNode}
                                                            </Box>
                                                            {i < arr.length - 1 && ", "}
                                                        </React.Fragment>
                                                    ))}
                                                </Box>
                                            ) : "No Errors"
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Paper>

                {/* Charts Section */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 12 }}>
                            <Paper
                                sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: 250 }}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Performance Trend (Last 100 Runs)</Typography>
                                    <MuiTooltip title={
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>What does this graph show?</Typography>
                                            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                                • <strong>RQS (Response Quality Score)</strong>: Weighted combination of Accuracy and Consistency
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                • <strong>Accuracy</strong>: Percentage of correct answers vs hallucinations
                                            </Typography>
                                        </Box>
                                    } placement="top">
                                        <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: 'text.secondary' }}>
                                            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                                        </Box>
                                    </MuiTooltip>
                                </Box>
                                <Box sx={{ height: 190 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={visibleData}>
                                                <defs>
                                                    <linearGradient id="colorRqs" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#673ab7" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#673ab7" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#e91e63" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#e91e63" stopOpacity={0} />
                                                    </linearGradient>
                                                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#00bcd4" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="id" tick={{ fontSize: 10 }} minTickGap={30} />
                                                <YAxis tick={{ fontSize: 10 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                                <Area type="monotone" dataKey="rqs" stroke="#2196f3" fillOpacity={1} fill="url(#colorRqs)" name="RQS %" isAnimationActive={false} />
                                                <Area type="monotone" dataKey="accuracy" stroke="#673ab7" fillOpacity={1} fill="url(#colorAcc)" name="Accuracy %" isAnimationActive={false} />
                                                <Area type="monotone" dataKey="completeness" stroke="#00bcd4" fillOpacity={1} fill="url(#colorComp)" name="Completeness %" isAnimationActive={false} />
                                                <Area type="monotone" dataKey="safety" stroke="#e91e63" fillOpacity={1} fill="url(#colorSafe)" name="Safety %" isAnimationActive={false} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={{ xs: 12, md: 12 }}>
                            <Paper
                                sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: 250 }}
                                onMouseEnter={() => setIsPaused(true)}
                                onMouseLeave={() => setIsPaused(false)}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Consistency vs Hallucinations (Last 100 Runs)</Typography>
                                    <MuiTooltip title={
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>What does this graph show?</Typography>
                                            <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                                                • <strong>Consistency %</strong>: How similar multiple runs are to each other
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                • <strong>Hallucination Rate %</strong>: Percentage of incorrect answers
                                            </Typography>
                                        </Box>
                                    } placement="top">
                                        <Box component="span" sx={{ display: 'inline-flex', cursor: 'help', color: 'text.secondary' }}>
                                            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                                        </Box>
                                    </MuiTooltip>
                                </Box>
                                <Box sx={{ height: 190 }}>
                                    {mounted && (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={visibleData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="id" tick={{ fontSize: 10 }} minTickGap={30} />
                                                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                                <Line yAxisId="left" type="monotone" dataKey="consistency" stroke="#009688" name="Consistency %" isAnimationActive={false} dot={false} />
                                                <Line yAxisId="left" type="monotone" dataKey="hallucinations" stroke="#f44336" name="Hallucination Rate %" isAnimationActive={false} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box >
    );
}

export function SummaryCard({ title, value, color, icon, subtitle }: { title: string, value: string | number, color: string, icon?: React.ReactNode, subtitle?: React.ReactNode }) {
    const theme = useTheme();
    return (
        <Card
            sx={{
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                transition: 'border-color 0.2s ease-in-out',
                '&:hover': {
                    borderColor: 'primary.main',
                }
            }}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ color: color, display: 'flex' }}>
                        {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
                    </Box>
                    <Typography
                        variant="overline"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            fontSize: '0.7rem'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: '1.25rem',
                        mb: 0.5
                    }}
                >
                    {value}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.75rem'
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}
