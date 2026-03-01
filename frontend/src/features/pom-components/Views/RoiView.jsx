import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, Tooltip, IconButton, TextField, Divider, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { TrendingUp, Clock, Zap, DollarSign, Settings, Save, RefreshCw, Layers, FileCode, Play, Wrench, Server, PieChart } from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ThemeToggle } from '../UI/ThemeToggle';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';

export function RoiView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [stats, setStats] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Form state
    const [formSettings, setFormSettings] = useState({});

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/roi/stats');
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();
            setStats(data);
            setSettings(data.settings);
            setFormSettings(data.settings); // Init form
        } catch (e) {
            console.error("Failed to fetch ROI stats:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        try {
            await fetch('/api/roi/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formSettings)
            });
            setEditing(false);
            fetchStats(); // Refresh stats with new calc
        } catch (e) {
            console.error(e);
        }
    };

    const StatCard = ({ title, value, subvalue, icon: Icon, color }) => (
        <Card className="h-full relative overflow-hidden group p-4">
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
                <Icon size={80} />
            </div>
            <div className="flex items-center justify-between h-full relative z-10">
                <div className="flex flex-col justify-center">
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, fontSize: '0.7rem' }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: '800', mt: 0.5, mb: 0, lineHeight: 1.2 }}>
                        {value}
                    </Typography>
                    {subvalue && (
                        <Typography variant="caption" sx={{ color: color.replace('bg-', 'text-').replace('500', '600'), fontWeight: 600, mt: 0.5 }}>
                            {subvalue}
                        </Typography>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color} bg-opacity-15 text-${color.split('-')[1]}-600 shadow-sm flex-shrink-0`}>
                    <Icon size={24} />
                </div>
            </div>
        </Card>
    );

    const SavingsBar = ({ label, savedHours, manualHours, color }) => {
        const percentage = Math.min(100, (savedHours / (manualHours || 1)) * 100);
        return (
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1 font-medium">
                    <span>{label}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {savedHours} hrs saved
                    </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${color}`}
                        style={{ width: `${percentage > 0 ? percentage : 0}%` }}
                    />
                </div>
            </div>
        );
    };

    if (loading || !stats) return <div className="p-10 text-center">Loading ROI Stats...</div>;

    return (
        <div className="absolute inset-0 flex flex-col overflow-hidden w-full bg-transparent">
            {/* Header */}
            <Box sx={{ p: 2, display: 'none', zIndex: 20 }}>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        ROI & Savings
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Calculate hard dollar savings from automation.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ThemeToggle />
                </Box>
            </Box>

            <div className="flex-1 overflow-hidden p-4">
                <div className="max-w-full h-full flex flex-col gap-4">

                    {/* Top Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        <StatCard
                            title="Total Runs"
                            value={stats.total_runs}
                            icon={Play}
                            color="bg-blue-500"
                        />
                        <StatCard
                            title="Tests Executed"
                            value={stats.total_tests_executed}
                            icon={Layers}
                            color="bg-purple-500"
                        />
                        <StatCard
                            title="Time Saved"
                            value={`${stats.total_savings_hours} hrs`}
                            icon={Clock}
                            color="bg-orange-500"
                        />
                        <StatCard
                            title="Hard ($) Savings"
                            value={`$${stats.total_hard_savings.toLocaleString()}`}

                            icon={DollarSign}
                            color="bg-green-500"
                        />
                    </div>

                    {/* Charts & Advanced Metrics Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">

                        {/* Left Column: Charts (2/3 width) */}
                        <div className="lg:col-span-2 flex flex-col gap-4 h-full min-h-0">
                            {/* Chart 1: Cumulative Savings Trend */}
                            <Card className="flex-1 p-5 min-h-0 flex flex-col">
                                <div className="flex items-center justify-between mb-2 shrink-0">
                                    <h3 className={`font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <TrendingUp size={18} className="text-green-500" />
                                        Cumulative Savings Impact
                                    </h3>
                                    <span className="text-xs text-gray-500">Execution savings over time</span>
                                </div>
                                <div className="flex-1 w-full min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.history}>
                                            <defs>
                                                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                stroke={isDark ? "#666" : "#999"}
                                                fontSize={10}
                                            />
                                            <YAxis
                                                stroke={isDark ? "#666" : "#999"}
                                                fontSize={10}
                                                tickFormatter={(val) => `$${val}`}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', borderColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '8px' }}
                                                itemStyle={{ color: isDark ? '#e5e7eb' : '#111827' }}
                                                formatter={(value) => [`$${value}`, "Savings"]}
                                                labelFormatter={(label) => new Date(label).toLocaleString()}
                                            />
                                            <Area type="monotone" dataKey="cumulative_savings" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Chart 2: Cost Comparison */}
                            <Card className="h-48 p-5 shrink-0 flex flex-row gap-6 items-center">
                                <div className="flex-1 h-full">
                                    <h3 className={`font-bold mb-2 text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        <PieChart size={18} className="text-blue-500" />
                                        Cost Efficiency Analysis
                                    </h3>
                                    <div className="h-[80%] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart layout="vertical" data={[
                                                { name: 'Manual', cost: stats.projected_manual_cost },
                                                { name: 'Automation', cost: (stats.total_hard_savings && stats.projected_manual_cost) ? (stats.projected_manual_cost - stats.total_hard_savings) : 0 } // Rough calc for display
                                            ]} barSize={20}>
                                                <XAxis type="number" hide />
                                                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} stroke={isDark ? "#fff" : "#000"} />
                                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                                                    {
                                                        [{ name: 'Manual', color: '#ef4444' }, { name: 'Automation', color: '#22c55e' }].map((entry, index) => (
                                                            <cell key={`cell-${index}`} fill={entry.color} />
                                                        ))
                                                    }
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="w-px h-full bg-gray-200 dark:bg-gray-700"></div>
                                <div className="w-1/3 flex flex-col justify-center gap-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Velocity Multiplier</div>
                                        <div className="text-2xl font-black text-blue-500">{stats.velocity_multiplier}x</div>
                                        <div className="text-[10px] text-gray-400">Faster than manual</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Cost Ratio</div>
                                        <div className="text-2xl font-black text-purple-500">1:{stats.cost_savings_ratio}</div>
                                        <div className="text-[10px] text-gray-400">Spend vs Value</div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Right Column: Settings & Efficiency (1/3 width) */}
                        <div className="lg:col-span-1 flex flex-col gap-3 h-full min-h-0">
                            {/* Efficiency Bars (Compressed) */}
                            {/* Efficiency Bars (Compressed) */}
                            <Card className="flex-col overflow-hidden shrink-0">
                                <div className="p-4 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Zap size={18} className="text-yellow-500" />
                                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Efficiency Gains</h3>
                                    </div>
                                </div>

                                <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

                                <div className="p-4 pt-3 space-y-3">
                                    <SavingsBar label="Design" savedHours={stats.design_savings_hours} manualHours={(stats.total_tests_executed * settings.manual_design_mins) / 60} color="bg-blue-500" />
                                    <SavingsBar label="Scripting" savedHours={stats.script_savings_hours} manualHours={(stats.total_tests_executed * settings.manual_script_mins) / 60} color="bg-purple-500" />
                                    <SavingsBar label="Execution" savedHours={stats.exec_savings_hours} manualHours={(stats.total_tests_executed * settings.manual_exec_mins) / 60} color="bg-orange-500" />
                                </div>
                            </Card>

                            {/* Settings (Scrollable) */}
                            <Card className="flex-1 min-h-0 flex flex-col overflow-hidden">
                                <div className="p-5 pb-3 shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Settings size={18} className="text-gray-500" />
                                        <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Assumptions</h3>
                                    </div>
                                </div>

                                <Divider sx={{ borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }} />

                                <div className="flex-1 overflow-hidden p-4 pt-3 flex flex-col justify-between">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                        {[
                                            { key: 'hourly_rate', label: 'Rate ($/hr)', icon: DollarSign },
                                            { key: 'maintenance_percent', label: 'Maint. (%)', icon: Wrench },
                                            { key: 'manual_exec_mins', label: 'Man. Exec', icon: Play },
                                            { key: 'infra_cost_per_hour', label: 'Infra ($)', icon: Server },
                                            { key: 'manual_design_mins', label: 'Man. Dsgn', icon: Layers },
                                            { key: 'auto_design_mins', label: 'Auto Dsgn', icon: Zap },
                                            { key: 'manual_script_mins', label: 'Man. Scpt', icon: FileCode },
                                            { key: 'auto_script_mins', label: 'Auto Scpt', icon: Zap },
                                        ].map((field) => (
                                            <div key={field.key} className="flex flex-col">
                                                <label className="text-[10px] font-bold opacity-60 ml-1 uppercase truncate tracking-wider" title={field.label}>{field.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        disabled={!editing}
                                                        value={formSettings[field.key] || 0}
                                                        onChange={(e) => setFormSettings({ ...formSettings, [field.key]: parseFloat(e.target.value) })}
                                                        className={`w-full py-1 px-2 pl-7 rounded border border-solid text-xs font-mono transition-all outline-none h-8
                                                            ${isDark ? 'bg-black/20 border-white/10' : 'bg-white border-gray-500 text-gray-900 shadow-sm'}
                                                            ${!editing && 'opacity-70 border-transparent bg-transparent pl-0 shadow-none'}
                                                        `}
                                                    />
                                                    <div className={`absolute left-2 top-1/2 -translate-y-1/2 ${editing ? 'opacity-50' : 'opacity-0'}`}>
                                                        <field.icon size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Edit Button Area */}
                                    <div className="pt-4">
                                        {editing ? (
                                            <div className="flex gap-2">
                                                <Button size="small" variant="danger" fullWidth onClick={() => { setEditing(false); setFormSettings(settings); }} className="text-xs h-8 shadow-red-500/20">Cancel</Button>
                                                <Button size="small" variant="primary-glass" fullWidth onClick={handleSaveSettings} className="text-xs h-8 shadow-blue-500/20">Save</Button>
                                            </div>
                                        ) : (
                                            <Button size="small" variant="primary-glass" fullWidth onClick={() => setEditing(true)} className="text-xs h-8 shadow-blue-500/20">
                                                Adjust Drivers
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
