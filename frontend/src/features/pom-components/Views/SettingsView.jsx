import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Grid, Switch, FormControlLabel, Tooltip, InputAdornment, Divider, MenuItem, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Button } from '../UI/Button';
import { Save, Info, RefreshCw, CheckCircle, AlertCircle, X, Plus, Trash2 } from 'lucide-react'; // Using Lucide icons as substitutions or MUI icons if preferred
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { ThemeToggle } from '../UI/ThemeToggle';

export function SettingsView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // { message, severity }
    const [newMarker, setNewMarker] = useState("");
    const [sharedData, setSharedData] = useState({});
    const [newDataKey, setNewDataKey] = useState("");
    const [newDataValue, setNewDataValue] = useState("");
    const [dataLoading, setDataLoading] = useState(false);

    const [settings, setSettings] = useState({
        base_url: "",
        browser_type: "chromium",
        headless: false,
        timeout: 30000,
        slow_mo: 0,
        viewport_width: 1280,
        viewport_height: 720,
        markers: ["smoke", "regression", "sanity", "e2e"]
    });

    useEffect(() => {
        fetchSettings();
        fetchSharedData();
    }, []);

    const fetchSharedData = async () => {
        setDataLoading(true);
        try {
            const res = await fetch('/api/playwright-pom/data/shared');
            const data = await res.json();
            setSharedData(data);
        } catch (error) {
            console.error('Failed to fetch shared data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    const saveSharedData = async (updatedData) => {
        try {
            const res = await fetch('/api/playwright-pom/data/shared', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData || sharedData)
            });
            if (res.ok) showStatus("Shared Data saved", "success");
        } catch (error) {
            showStatus("Failed to save data", "error");
        }
    };

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/playwright-pom/settings');
            if (!response.ok) throw new Error('Failed to fetch settings');
            const data = await response.json();
            setSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            showStatus("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch('/api/playwright-pom/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save settings');
            }

            showStatus("Configuration saved successfully", "success");
        } catch (error) {
            console.error('Failed to save settings:', error);
            showStatus("Failed to save configuration: " + error.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const addMarker = (marker) => {
        const sanitized = marker.trim().toLowerCase().replace(/\s+/g, '_');
        if (!sanitized || settings.markers.includes(sanitized)) return;
        setSettings(prev => ({ ...prev, markers: [...prev.markers, sanitized] }));
    };

    const removeMarker = (marker) => {
        setSettings(prev => ({ ...prev, markers: prev.markers.filter(m => m !== marker) }));
    };

    const showStatus = (msg, severity) => {
        setStatus({ message: msg, severity: severity });
        setTimeout(() => setStatus(null), 4000);
    };

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const InfoIconWithHover = (props) => (
        <InfoOutlinedIcon
            {...props}
            sx={{
                color: 'text.disabled',
                cursor: 'pointer',
                fontSize: 'medium',
                ...props.sx
            }}
        />
    );



    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ p: 2, height: 0, overflow: 'hidden', minHeight: 0, py: 0, p: 0, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Configuration
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        System Configuration & Parameters
                    </Typography>
                </Box>
                <div className="flex gap-2 items-center">
                    {status && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: (theme) => status.severity === 'success' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: (theme) => status.severity === 'success' ? 'success.main' : 'error.main',
                            mr: 2
                        }}>
                            {status.severity === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <Typography variant="body2">{status.message}</Typography>
                        </Box>
                    )}
                    <ThemeToggle />
                </div>
            </Box>

            {/* Content NON-SCROLLABLE */}
            <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
                <Paper className="custom-scrollbar" sx={{ width: '100%', maxWidth: 1200, height: '100%', mx: 'auto', display: 'flex', flexDirection: 'column', overflow: 'hidden', p: 4, borderRadius: 1, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={4} sx={{ flex: 1, minHeight: 0 }}>
                        <Grid className="custom-scrollbar" size={{ xs: 12, lg: 8 }} sx={{ height: '100%', overflowY: 'auto', pr: 2 }}>
                            <Grid container spacing={4}>
                                {/* General Configuration Section */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ height: '100%' }}>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                            General Controls
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Environment Details</Typography>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    label="Base URL"
                                                    value={settings.base_url}
                                                    onChange={(e) => updateSetting('base_url', e.target.value)}
                                                    placeholder="https://example.com"
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <Tooltip title="Base URL for application under test" arrow>
                                                                    <InfoIconWithHover />
                                                                </Tooltip>
                                                            </InputAdornment>
                                                        )
                                                    }}
                                                />
                                            </Grid>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Timing Parameters</Typography>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 4 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Timeout (ms)"
                                                            type="number"
                                                            value={settings.timeout}
                                                            onChange={(e) => updateSetting('timeout', parseInt(e.target.value) || 0)}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Tooltip title="Maximum time to wait for elements (ms)" arrow>
                                                                            <InfoIconWithHover />
                                                                        </Tooltip>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 4 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Slow Motion (ms)"
                                                            type="number"
                                                            value={settings.slow_mo}
                                                            onChange={(e) => updateSetting('slow_mo', parseInt(e.target.value) || 0)}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Tooltip title="Delay between actions (in milliseconds)" arrow>
                                                                            <InfoIconWithHover />
                                                                        </Tooltip>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 4 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Default Workers"
                                                            type="number"
                                                            value={settings.default_parallel_workers || 4}
                                                            onChange={(e) => updateSetting('default_parallel_workers', parseInt(e.target.value) || 1)}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Tooltip title="Default number of workers for parallel execution" arrow>
                                                                            <InfoIconWithHover />
                                                                        </Tooltip>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>

                                {/* Browser Configuration Section */}
                                <Grid size={{ xs: 12 }}>
                                    <Box sx={{ height: '100%' }}>
                                        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <div className="w-1 h-5 bg-purple-500 rounded-full"></div>
                                            Browser Controls
                                        </Typography>
                                        <Grid container spacing={3}>
                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Execution Engine</Typography>
                                                <TextField
                                                    select
                                                    fullWidth
                                                    size="small"
                                                    label="Browser Type"
                                                    value={settings.browser_type}
                                                    onChange={(e) => updateSetting('browser_type', e.target.value)}
                                                    SelectProps={{
                                                        MenuProps: {
                                                            PaperProps: {
                                                                sx: {
                                                                    border: '1px solid',
                                                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#252526' : 'background.paper',
                                                                    backgroundImage: 'none',
                                                                    mt: 0.5,
                                                                    '& .MuiMenuItem-root': {
                                                                        '&:hover': {
                                                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                                                                        },
                                                                        '&.Mui-selected': {
                                                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.16)' : 'rgba(37, 99, 235, 0.08)',
                                                                            '&:hover': {
                                                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(59, 130, 246, 0.24)' : 'rgba(37, 99, 235, 0.12)'
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <MenuItem value="chromium">Chromium</MenuItem>
                                                    <MenuItem value="firefox">Firefox</MenuItem>
                                                </TextField>
                                            </Grid>

                                            <Grid size={{ xs: 12 }}>
                                                <Typography variant="subtitle2" sx={{ mb: 1, fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Viewport & Visibility</Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={settings.headless}
                                                                onChange={(e) => updateSetting('headless', e.target.checked)}
                                                            />
                                                        }
                                                        label={<Typography variant="body2">Headless Mode</Typography>}
                                                    />
                                                </Box>
                                                <Grid container spacing={2}>
                                                    <Grid size={{ xs: 6 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Width"
                                                            type="number"
                                                            value={settings.viewport_width}
                                                            onChange={(e) => updateSetting('viewport_width', parseInt(e.target.value) || 0)}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Tooltip title="Browser window width in pixels" arrow>
                                                                            <InfoIconWithHover />
                                                                        </Tooltip>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid size={{ xs: 6 }}>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            label="Height"
                                                            type="number"
                                                            value={settings.viewport_height}
                                                            onChange={(e) => updateSetting('viewport_height', parseInt(e.target.value) || 0)}
                                                            InputProps={{
                                                                endAdornment: (
                                                                    <InputAdornment position="end">
                                                                        <Tooltip title="Browser window height in pixels" arrow>
                                                                            <InfoIconWithHover />
                                                                        </Tooltip>
                                                                    </InputAdornment>
                                                                )
                                                            }}
                                                        />
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Playwright Markers Section */}
                        <Grid size={{ xs: 12, lg: 4 }} sx={{ height: '100%' }}>
                            <Box sx={{ height: '100%', mt: 0 }}>
                                <Box sx={{ p: 3, height: '100%', bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <div className="w-1 h-5 bg-orange-500 rounded-full"></div>
                                        Playwright Markers
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                        Define custom pytest markers.
                                    </Typography>
                                    <Box className="custom-scrollbar" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, flex: 1, minHeight: 0, overflowY: 'auto', alignContent: 'flex-start' }}>
                                        {settings.markers.map(marker => (
                                            <Box
                                                key={marker}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: '16px',
                                                    bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(249, 115, 22, 0.1)',
                                                    color: 'orange.main',
                                                    border: '1px solid',
                                                    borderColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(249, 115, 22, 0.3)',
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ fontWeight: 'bold', color: (theme) => theme.palette.mode === 'dark' ? '#fb923c' : '#ea580c' }}>
                                                    {marker}
                                                </Typography>
                                                <button
                                                    onClick={() => removeMarker(marker)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        padding: 0,
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        color: '#94a3b8'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </Box>
                                        ))}
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2, maxWidth: 400 }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="New marker (Max 30 chars)"
                                            value={newMarker}
                                            onChange={(e) => setNewMarker(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                            inputProps={{ maxLength: 30 }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    addMarker(newMarker);
                                                    setNewMarker('');
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="primary-glass"
                                            size="small"
                                            className="px-6 shadow-lg shadow-blue-500/20"
                                            startIcon={<Plus size={16} />}
                                            onClick={() => {
                                                addMarker(newMarker);
                                                setNewMarker('');
                                            }}
                                        >
                                            Add
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* Global Data Repository Section */}
                    <Grid container spacing={4} sx={{ mt: 2 }}>
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03), borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                    Global Data Repository
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                    Manage persistent data used across Shared Flows and Tests. Data is stored in <b>data/shared_data.json</b>.
                                </Typography>

                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {Object.keys(sharedData).length === 0 ? (
                                        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.disabled', p: 2 }}>No global data defined.</Typography>
                                    ) : (
                                        Object.entries(sharedData).map(([key, values]) => (
                                            <div key={key} className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main', fontFamily: 'monospace' }}>{key}</Typography>
                                                    <Button variant="danger" size="small" className="p-1 h-auto" onClick={() => {
                                                        const newData = { ...sharedData };
                                                        delete newData[key];
                                                        setSharedData(newData);
                                                        saveSharedData(newData);
                                                    }} icon={Trash2} />
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {values.map((v, i) => (
                                                        <div key={i} className={`px-2 py-1 rounded text-[11px] border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                                            {v}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <Box sx={{ mt: 3, p: 2, borderTop: '1px dashed', borderColor: 'divider', display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField
                                        size="small"
                                        placeholder="Key (e.g. usernames)"
                                        value={newDataKey}
                                        onChange={(e) => setNewDataKey(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        size="small"
                                        placeholder="Value (e.g. admin)"
                                        value={newDataValue}
                                        onChange={(e) => setNewDataValue(e.target.value)}
                                        sx={{ flex: 1 }}
                                    />
                                    <Button
                                        variant="primary-glass"
                                        size="small"
                                        icon={Plus}
                                        onClick={() => {
                                            if (!newDataKey.trim() || !newDataValue.trim()) return;
                                            const key = newDataKey.trim();
                                            const val = newDataValue.trim();
                                            const newData = { ...sharedData };
                                            if (!newData[key]) newData[key] = [];
                                            if (!newData[key].includes(val)) newData[key].push(val);
                                            setSharedData(newData);
                                            setNewDataKey("");
                                            setNewDataValue("");
                                            saveSharedData(newData);
                                        }}
                                    >
                                        Add
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="primary-glass"
                            size="medium"
                            className="px-6 shadow-lg shadow-blue-500/20"
                            onClick={handleSave}
                            startIcon={<SaveIcon />}
                        >
                            Save
                        </Button>
                    </Box>
                </Paper>

            </Box >


        </Box >
    );
}
