import React, { useState, useEffect } from 'react';
import {
    Activity, Play, AlertCircle, CheckCircle,
    RefreshCw, FileCode, ArrowRight, Save, Copy, Pause, Info, Sparkles, X, Eye, ChevronDown, Folder
} from 'lucide-react';
import {
    Box, Typography, Paper,
    Divider, IconButton, Chip,
    alpha, CircularProgress, Tooltip,
    Select, MenuItem, FormControl, InputLabel, Menu
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Button } from '../UI/Button';
import { ThemeToggle } from '../UI/ThemeToggle';

export function HealRecordingView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [recordings, setRecordings] = useState([]);
    const [selectedRecording, setSelectedRecording] = useState('');
    const [recordingMenuAnchor, setRecordingMenuAnchor] = useState(null);
    const [healingSession, setHealingSession] = useState(null); // 'running', 'paused', 'healing', 'complete'
    const [logs, setLogs] = useState([]);
    const [logsCopied, setLogsCopied] = useState(false);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [showFixModal, setShowFixModal] = useState(false);
    const [lastFix, setLastFix] = useState(null);
    const [editedFix, setEditedFix] = useState('');
    const [aiPrompts, setAiPrompts] = useState(null);

    useEffect(() => {
        if (lastFix) setEditedFix(lastFix.new_line || '');
    }, [lastFix]);

    useEffect(() => {
        fetchRecordings();
    }, []);

    const fetchRecordings = async () => {
        try {
            const res = await fetch('/api/playwright-pom/record/files');
            const data = await res.json();
            setRecordings(data.files || []); // Expecting list of {name, path} or just strings?
            // Existing endpoint returns { files: [ {name: '...', path: '...'}, ...], folders: [...] }
        } catch (err) {
            console.error("Failed to fetch recordings", err);
        }
    };

    const startHealing = async () => {
        if (!selectedRecording) return;
        setHealingSession('running');
        setLogs([{ type: 'info', message: `Initializing session for ${selectedRecording}...` }]);
        setLastFix(null);

        try {
            const res = await fetch('/api/playwright-pom/heal/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: selectedRecording })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            setLogs(prev => [...prev, { type: 'success', message: `Session ready. Total steps: ${data.total_steps}` }]);

            // Start the loop
            runHealingLoop();

        } catch (e) {
            setHealingSession('error');
            setLogs(prev => [...prev, { type: 'error', message: `Failed to start: ${e.message}` }]);
        }
    };

    const isPausedRef = React.useRef(false);

    const togglePause = () => {
        if (healingSession === 'running') {
            isPausedRef.current = true;
            setHealingSession('paused_user');
            setLogs(prev => [...prev, { type: 'info', message: 'Execution paused by user.' }]);
        } else if (healingSession === 'paused_user') {
            isPausedRef.current = false;
            setHealingSession('running');
            setLogs(prev => [...prev, { type: 'info', message: 'Resuming execution...' }]);
            runHealingLoop();
        }
    };

    const runHealingLoop = async () => {
        let running = true;
        isPausedRef.current = false; // Reset on start

        while (running) {
            // Check pause ref
            if (isPausedRef.current) {
                running = false;
                break;
            }

            try {
                const res = await fetch('/api/playwright-pom/heal/step', { method: 'POST' });
                const data = await res.json();

                if (!res.ok) throw new Error(data.detail);

                if (data.status === 'complete') {
                    setLogs(prev => [...prev, { type: 'success', message: 'Execution completed successfully.' }]);
                    setHealingSession('complete');
                    running = false;
                } else if (data.status === 'failed') {
                    setLogs(prev => [...prev, { type: 'error', message: `Step Failed: ${data.line_content}` }]);
                    setLogs(prev => [...prev, { type: 'error', message: `Error: ${data.error}` }]);
                    setHealingSession('paused'); // Pause for manual intervention or AI heal trigger
                    running = false;
                    // TODO: Trigger auto-heal here?
                } else if (data.status === 'skipped') {
                    setLogs(prev => [...prev, { type: 'info', message: `Skipped: ${data.line_content}` }]);
                } else {
                    // Success
                    setLogs(prev => [...prev, { type: 'success', message: `Executed: ${data.line_content}` }]);
                    // Add small delay for visualization
                    await new Promise(r => setTimeout(r, 500));
                }

            } catch (e) {
                setLogs(prev => [...prev, { type: 'error', message: `System Error: ${e.message}` }]);
                running = false;
                setHealingSession('error');
            }
        }
    };

    const fixStep = async () => {
        setLogs(prev => [...prev, { type: 'info', message: 'Attempting to heal...' }]);

        try {
            const res = await fetch('/api/playwright-pom/heal/fix', { method: 'POST' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail);

            setLogs(prev => [...prev, { type: 'success', message: `Healed: ${data.message}` }]);
            setLastFix(data);
            // Pause to allow user to review and manually resume
            setHealingSession('paused_user');
            isPausedRef.current = true;
        } catch (e) {
            setLogs(prev => [...prev, { type: 'error', message: `Healing failed: ${e.message}` }]);
        }
    };

    const fetchHealPrompts = async () => {
        try {
            const res = await fetch('/api/playwright-pom/heal/prompts', { method: 'GET' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            setAiPrompts(data);
            setShowPromptModal(true);
        } catch (e) {
            setLogs(prev => [...prev, { type: 'error', message: `Failed to fetch prompts: ${e.message}` }]);
        }
    };

    const saveFixOverride = async () => {
        try {
            const res = await fetch('/api/playwright-pom/heal/fix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ override_code: editedFix })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            setLogs(prev => [...prev, { type: 'success', message: `Fix updated manually.` }]);
            setLastFix(data);
            setShowFixModal(false);
        } catch (e) {
            setLogs(prev => [...prev, { type: 'error', message: `Override failed: ${e.message}` }]);
        }
    };

    return (
        <>
            {showFixModal && lastFix && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowFixModal(false)}>
                    <div
                        className={`w-[600px] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-300'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-4 border-b ${isDark ? 'border-white/10 bg-[#252526]' : 'border-gray-300 bg-gray-50'}`} style={{ paddingTop: 16, paddingBottom: 16, minHeight: 72 }}>
                            <div className="flex items-center gap-3" style={{ marginLeft: 24 }}>
                                <RefreshCw className={isDark ? 'text-orange-400' : 'text-orange-600'} size={20} />
                                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Review Fix</h3>
                            </div>
                            <button onClick={() => setShowFixModal(false)} className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`} style={{ marginRight: 24 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className={`space-y-4 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`} style={{ padding: 20 }}>
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Original Failed Line</h4>
                                <pre className={`p-3 rounded-lg border text-sm font-mono overflow-x-auto ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                    {lastFix.original_line || 'Unknown'}
                                </pre>
                            </div>
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Healed Line (Editable)</h4>
                                <textarea
                                    className={`w-full p-3 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${isDark ? 'bg-black/20 border-white/10 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}
                                    value={editedFix}
                                    onChange={(e) => setEditedFix(e.target.value)}
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="secondary" onClick={() => setShowFixModal(false)}>Cancel</Button>
                                <Button variant="primary" onClick={saveFixOverride}>Save Override</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showPromptModal && aiPrompts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPromptModal(false)}>
                    <div
                        className={`w-[800px] h-[80vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-300'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-4 border-b ${isDark ? 'border-white/10 bg-[#252526]' : 'border-gray-300 bg-gray-50'}`} style={{ paddingTop: 16, paddingBottom: 16, minHeight: 72 }}>
                            <div className="flex items-center gap-3" style={{ marginLeft: 24 }}>
                                <Sparkles className={isDark ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>AI Prompts Preview</h3>
                            </div>
                            <button onClick={() => setShowPromptModal(false)} className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`} style={{ marginRight: 24 }}>
                                <X size={18} />
                            </button>
                        </div>
                        <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-6 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`} style={{ padding: 20 }}>
                            {/* System Prompt */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>System Prompt</h4>
                                <pre className={`p-4 rounded-lg border text-xs whitespace-pre-wrap break-words font-mono ${isDark ? 'bg-black/40 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    {aiPrompts.system_prompt}
                                </pre>
                            </div>
                            {/* User Prompt */}
                            <div>
                                <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>User Prompt</h4>
                                <pre className={`p-4 rounded-lg border text-xs whitespace-pre-wrap break-words font-mono ${isDark ? 'bg-blue-500/5 border-blue-500/10 text-gray-300' : 'bg-blue-50 border-blue-100 text-gray-700'}`}>
                                    {aiPrompts.user_prompt}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <Box sx={{
                height: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <Box sx={{
                    p: 2,
                    height: 0, overflow: 'hidden', minHeight: 0, py: 0, p: 0,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    flexShrink: 0
                }}>
                    <Box sx={{ pt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                                Heal Recording
                            </Typography>
                        </Box>
                        <Typography variant="subtitle1" color="text.secondary">
                            Auto-detect and fix broken locators in your recordings
                        </Typography>
                    </Box>
                    <div className="flex gap-2 items-center">
                        <ThemeToggle />
                    </div>
                </Box>

                {/* Content */}
                <Box sx={{
                    flex: 1,
                    minHeight: 0,
                    overflow: 'hidden',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    {/* Control Panel */}
                    <Paper sx={{
                        p: 2,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ mb: 1, fontWeight: 'bold', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Target Recording
                            </Typography>
                            <Box
                                onClick={(e) => setRecordingMenuAnchor(e.currentTarget)}
                                sx={{
                                    mt: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: '10px 16px',
                                    border: '1px solid',
                                    borderColor: isDark ? alpha('#fff', 0.1) : 'divider',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    bgcolor: isDark ? alpha('#fff', 0.05) : '#fff',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        borderColor: theme.palette.primary.main,
                                        bgcolor: isDark ? alpha('#fff', 0.08) : '#fff',
                                        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                    <div className={`p-1.5 rounded-md ${selectedRecording ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                        <FileCode size={18} />
                                    </div>
                                    <Typography
                                        noWrap
                                        variant="body2"
                                        sx={{
                                            color: selectedRecording ? 'text.primary' : 'text.disabled',
                                            fontWeight: selectedRecording ? 500 : 400,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {selectedRecording
                                            ? (() => {
                                                const r = recordings.find(rec => (rec.path || rec) === selectedRecording);
                                                if (!r) return selectedRecording.replace('.py', '');
                                                return r.folder ? `${r.folder}/${r.name.replace('.py', '')}` : r.name.replace('.py', '');
                                            })()
                                            : "Select a recording to heal..."}
                                    </Typography>
                                </Box>
                                <ChevronDown
                                    size={18}
                                    className={`transition-transform duration-300 ${Boolean(recordingMenuAnchor) ? 'rotate-180 text-primary' : 'text-gray-400'}`}
                                />
                            </Box>

                            <Menu
                                anchorEl={recordingMenuAnchor}
                                open={Boolean(recordingMenuAnchor)}
                                onClose={() => setRecordingMenuAnchor(null)}
                                PaperProps={{
                                    sx: {
                                        mt: 1,
                                        borderRadius: '12px',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                                        maxHeight: '400px',
                                        width: recordingMenuAnchor ? recordingMenuAnchor.clientWidth : 'auto'
                                    }
                                }}
                            >
                                {recordings.length === 0
                                    ? [<MenuItem key="no-recordings" disabled>No recordings found</MenuItem>]
                                    : (() => {
                                        const groupedRecordings = Object.entries(
                                            recordings.reduce((acc, r) => {
                                                const folder = r.folder || 'Root';
                                                if (!acc[folder]) acc[folder] = [];
                                                acc[folder].push(r);
                                                return acc;
                                            }, {})
                                        ).sort(([a], [b]) => a === 'Root' ? -1 : b === 'Root' ? 1 : a.localeCompare(b));

                                        const menuItems = [
                                            <MenuItem
                                                key="clear-selection"
                                                onClick={() => {
                                                    setSelectedRecording('');
                                                    setRecordingMenuAnchor(null);
                                                }}
                                                sx={{
                                                    gap: 1.5,
                                                    py: 1.5,
                                                    px: 2,
                                                    mx: 1,
                                                    borderRadius: '8px',
                                                    mb: 0.5,
                                                    color: 'text.secondary'
                                                }}
                                            >
                                                <X size={16} className="opacity-70" />
                                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>None (Clear Selection)</Typography>
                                            </MenuItem>,
                                            <Divider key="clear-divider" sx={{ my: 1, mx: 2 }} />,
                                        ];

                                        groupedRecordings.forEach(([folder, folderFiles]) => {
                                            if (folder !== 'Root') {
                                                menuItems.push(
                                                    <Box
                                                        key={`folder-${folder}`}
                                                        sx={{
                                                            px: 3,
                                                            py: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            opacity: 0.6,
                                                            userSelect: 'none'
                                                        }}
                                                    >
                                                        <Folder size={12} className={isDark ? "text-yellow-500" : "text-yellow-600"} />
                                                        <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px' }}>
                                                            {folder}
                                                        </Typography>
                                                    </Box>
                                                );
                                            }

                                            folderFiles.forEach((r, idx) => {
                                                const recordingPath = r.path || r;
                                                const recordingName = (r.name || r).replace('.py', '');
                                                menuItems.push(
                                                    <MenuItem
                                                        key={`recording-${folder}-${recordingPath}-${idx}`}
                                                        onClick={() => {
                                                            setSelectedRecording(recordingPath);
                                                            setRecordingMenuAnchor(null);
                                                        }}
                                                        selected={selectedRecording === recordingPath}
                                                        sx={{
                                                            gap: 1.5,
                                                            py: 1.5,
                                                            px: folder === 'Root' ? 2 : 4,
                                                            mx: 1,
                                                            borderRadius: '8px',
                                                            mb: 0.5,
                                                            '&.Mui-selected': {
                                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                                color: theme.palette.primary.main,
                                                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.15) }
                                                            }
                                                        }}
                                                    >
                                                        <FileCode size={16} className="opacity-70" />
                                                        <Typography variant="body2">{recordingName}</Typography>
                                                    </MenuItem>
                                                );
                                            });

                                            menuItems.push(
                                                <Divider key={`divider-${folder}`} sx={{ my: 0.5, mx: 2, opacity: 0.5 }} />
                                            );
                                        });

                                        return menuItems;
                                    })()}
                            </Menu>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                            {healingSession === 'running' && (
                                <Button
                                    variant="primary-glass"
                                    onClick={togglePause}
                                    className="shadow-lg shadow-blue-500/25 px-6"
                                >
                                    <Pause size={18} className="mr-2" />
                                    Pause
                                </Button>
                            )}

                            {healingSession === 'paused_user' && (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {lastFix && (
                                        <Tooltip title="Review Fix">
                                            <IconButton
                                                onClick={() => setShowFixModal(true)}
                                                className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                                sx={{
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: '8px',
                                                    width: '42px'
                                                }}
                                            >
                                                <Eye size={18} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Button
                                        variant="primary-glass"
                                        onClick={togglePause}
                                        className="shadow-lg shadow-blue-500/25 px-6"
                                    >
                                        <Play size={18} className="mr-2" />
                                        Resume
                                    </Button>
                                </Box>
                            )}

                            {healingSession === 'paused' ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="View AI Prompts">
                                        <IconButton
                                            onClick={fetchHealPrompts}
                                            className={`transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                            sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: '8px',
                                                width: '42px'
                                                // Removed fixed height to let flex determine or match button
                                            }}
                                        >
                                            <Info size={18} />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="warning"
                                        onClick={fixStep}
                                        className="shadow-lg shadow-orange-500/25 px-6"
                                    >
                                        <RefreshCw size={18} className="mr-2" />
                                        Attempt Auto-Heal
                                    </Button>
                                </Box>
                            ) : (
                                (!healingSession || healingSession === 'complete' || healingSession === 'error') && (
                                    <Button
                                        variant="primary-glass"
                                        disabled={!selectedRecording}
                                        onClick={startHealing}
                                        className="shadow-lg shadow-blue-500/25 px-6"

                                    >
                                        <Play size={18} className="mr-2" />
                                        Start Healing
                                    </Button>
                                )
                            )}
                        </Box>
                    </Paper>

                    {/* Execution / Healing Logs */}
                    <Paper sx={{
                        flex: 1,
                        p: 0,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.background.paper, 0.5)
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="subtitle2" fontWeight="bold">Live Execution Log</Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        const logText = logs.map(l => `[${l.type.toUpperCase()}] ${l.message}`).join('\n');
                                        navigator.clipboard.writeText(logText);
                                        setLogsCopied(true);
                                        setTimeout(() => setLogsCopied(false), 2000);
                                    }}
                                    title={logsCopied ? "Copied!" : "Copy Logs"}
                                    disabled={logs.length === 0}
                                    color={logsCopied ? "success" : "default"}
                                >
                                    {logsCopied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                </IconButton>
                            </Box>
                        </Box>

                        <Box className="custom-scrollbar" sx={{
                            flex: 1,
                            minHeight: 0, // Crucial for flex scrolling
                            p: 3,
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.875rem',
                            bgcolor: isDark ? '#0d0d0d' : '#fafafa'
                        }}>
                            {logs.length === 0 ? (
                                <Box sx={{
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.secondary',
                                    flexDirection: 'column',
                                    gap: 2
                                }}>
                                    <Activity size={48} className="opacity-20" />
                                    <Typography>Select a recording and run to start healing</Typography>
                                </Box>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {log.type === 'error' ? <AlertCircle size={16} className="text-red-500" /> :
                                                    log.type === 'success' ? <CheckCircle size={16} className="text-green-500" /> :
                                                        <ArrowRight size={16} className="text-blue-500" />}
                                            </div>
                                            <div>{log.message}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </>
    );
}
