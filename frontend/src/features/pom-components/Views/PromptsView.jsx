import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, TextField, Divider, alpha,
    CircularProgress, Tooltip, IconButton
} from '@mui/material';
import {
    Wand2, FileText, Save, RefreshCw, AlertCircle,
    CheckCircle, ChevronRight, MessageSquare, Code
} from 'lucide-react';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Button } from '../UI/Button';
import { useTheme } from '@mui/material/styles';

export function PromptsView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [prompts, setPrompts] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null); // { message, severity }

    const fetchPrompts = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/playwright-pom/prompts/list');
            if (response.ok) {
                const data = await response.json();
                setPrompts(data);
                if (data.length > 0 && !selectedPrompt) {
                    handleSelectPrompt(data[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching prompts:', error);
            showStatus("Failed to load prompts", "error");
        } finally {
            setLoading(false);
        }
    };


    const handleSelectPrompt = async (filename) => {
        setSelectedPrompt(filename);
        try {
            const response = await fetch(`/api/playwright-pom/prompts/${filename}`);
            if (response.ok) {
                const data = await response.json();
                setContent(data.content);
            }
        } catch (error) {
            console.error('Error fetching prompt content:', error);
            showStatus("Failed to load prompt content", "error");
        }
    };

    const handleSave = async () => {
        if (!selectedPrompt) return;
        setSaving(true);
        try {
            const response = await fetch(`/api/playwright-pom/prompts/${selectedPrompt}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            });

            if (response.ok) {
                showStatus("PromptTemplate updated successfully", "success");
            } else {
                showStatus("Failed to save changes", "error");
            }
        } catch (error) {
            console.error('Error saving prompt:', error);
            showStatus("Error saving changes", "error");
        } finally {
            setSaving(false);
        }
    };

    const showStatus = (message, severity) => {
        setStatus({ message, severity });
        setTimeout(() => setStatus(null), 3000);
    };

    useEffect(() => {
        fetchPrompts();
    }, []);

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'none' }}>
                <Box sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            AI Prompts
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Modify the core AI logic and instruction sets
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
                            bgcolor: status.severity === 'success' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: status.severity === 'success' ? 'success.main' : 'error.main',
                            mr: 2
                        }}>
                            {status.severity === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <Typography variant="body2">{status.message}</Typography>
                        </Box>
                    )}
                    <ThemeToggle />
                </div>
            </Box>

            {/* Content Area */}
            <Box sx={{ flex: 1, p: 2, minHeight: 0, overflow: 'hidden', transition: 'background-color 0.3s' }}>
                <div className="flex h-full gap-4">

                    {/* Sidebar: Prompt List */}
                    <div className="w-80 flex flex-col h-full min-h-0 shrink-0">
                        <Paper sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: theme.shadows[4]
                        }}>
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.grey[50], 0.5) }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>
                                    Define Prompts
                                </Typography>
                                <IconButton size="small" onClick={fetchPrompts} disabled={loading}>
                                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                                </IconButton>
                            </Box>

                            <List sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
                                {loading && prompts.length === 0 ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                ) : (
                                    prompts.map((filename) => (
                                        <ListItem key={filename} disablePadding sx={{ mb: 0.5 }}>
                                            <ListItemButton
                                                selected={selectedPrompt === filename}
                                                onClick={() => handleSelectPrompt(filename)}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    '&.Mui-selected': {
                                                        bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.08),
                                                        '&:hover': {
                                                            bgcolor: isDark ? alpha(theme.palette.primary.main, 0.25) : alpha(theme.palette.primary.main, 0.12),
                                                        }
                                                    }
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <MessageSquare size={16} color={selectedPrompt === filename ? theme.palette.primary.main : theme.palette.text.secondary} />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={filename.replace('.txt', '').replace(/_/g, ' ')}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: {
                                                            fontWeight: selectedPrompt === filename ? 600 : 400,
                                                            textTransform: 'capitalize'
                                                        }
                                                    }}
                                                />
                                                <ChevronRight size={14} style={{ opacity: selectedPrompt === filename ? 1 : 0.3 }} />
                                            </ListItemButton>
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </Paper>
                    </div>

                    {/* Main Editor */}
                    <div className="flex-1 flex flex-col h-full min-h-0">
                        <Paper sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                            boxShadow: theme.shadows[4]
                        }}>
                            {selectedPrompt ? (
                                <>
                                    <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: isDark ? alpha(theme.palette.background.paper, 0.5) : alpha(theme.palette.grey[50], 0.5) }}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <Code size={20} />
                                            </div>
                                            <div>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'capitalize' }}>
                                                    {selectedPrompt.replace('.txt', '').replace(/_/g, ' ')}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Prompt Template
                                                </Typography>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="primary-glass"
                                                size="small"
                                                icon={Save}
                                                loading={saving}
                                                onClick={handleSave}
                                                className="shadow-lg shadow-blue-500/20 px-6"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </Box>
                                    <Box sx={{ flex: 1, p: 4, overflow: 'hidden', position: 'relative' }}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="System instructions..."
                                            variant="standard"
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: {
                                                    height: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    '& .MuiInputBase-input': {
                                                        height: '100% !important',
                                                        overflow: 'auto !important',
                                                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                        fontSize: '0.9rem',
                                                        lineHeight: 1.6,
                                                        color: theme.palette.text.secondary
                                                    }
                                                }
                                            }}
                                            sx={{ height: '100%' }}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <Wand2 size={64} strokeWidth={1} style={{ marginBottom: 16 }} />
                                    <Typography variant="h6">Select a prompt to edit</Typography>
                                </Box>
                            )}
                        </Paper>
                    </div>

                </div>
            </Box>
        </Box>
    );
}
