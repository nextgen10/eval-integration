import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Grid,
    Chip, alpha, LinearProgress, Stack, Card, CardContent,
    IconButton, Tooltip, Divider, Avatar, CircularProgress,
    Snackbar, Alert
} from '@mui/material';
import {
    Sparkles, FileText, Figma, Brain, CheckCircle,
    Copy, Download, Star, X, Plus, AlertCircle,
    Layout, ArrowRight, Zap, Target, Info, Code
} from 'lucide-react';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Button } from '../UI/Button';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

export function TestDesignView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [userStory, setUserStory] = useState('');
    const [figmaUrl, setFigmaUrl] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [metadata, setMetadata] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingStage, setLoadingStage] = useState('');
    const [status, setStatus] = useState(null); // { message, severity }
    const [feedbackVisible, setFeedbackVisible] = useState(false);
    const [currentFeedback, setCurrentFeedback] = useState({ rating: 5, comments: '' });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (testCases.length > 0) {
            console.log("SUCCESS: State updated with test cases:", testCases);
        }
    }, [testCases]);

    // Fetch latest generated test cases on mount
    useEffect(() => {
        const fetchLatestData = async () => {
            try {
                const response = await axios.get(`${API_BASE}/latest`);
                const { test_cases, metadata, user_story } = response.data;

                if (test_cases && test_cases.length > 0) {
                    setTestCases(test_cases);
                    setMetadata(metadata);
                    if (user_story) setUserStory(user_story);
                    console.log("Loaded last generated test cases:", test_cases.length);
                }
            } catch (error) {
                console.error("Failed to load latest test cases:", error);
            }
        };

        fetchLatestData();
    }, []);

    const API_BASE = '/api/playwright-pom/v1/test-design';

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 5);
        setAttachments(files);
    };

    const removeFile = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const showNotification = (msg, severity) => {
        setStatus({ message: msg, severity: severity });
        setTimeout(() => setStatus(null), 4000);
    };

    const simulateLoadingProgress = () => {
        const stages = [
            { text: 'Analyzing requirements...', progress: 15 },
            { text: 'Processing attachments...', progress: 30 },
            { text: 'Fetching design context...', progress: 45 },
            { text: 'AI generating test scenarios...', progress: 70 },
            { text: 'Optimizing test coverage...', progress: 85 },
            { text: 'Finalizing Test Cases...', progress: 95 }
        ];

        let currentStage = 0;
        const interval = setInterval(() => {
            if (currentStage < stages.length) {
                setLoadingStage(stages[currentStage].text);
                setLoadingProgress(stages[currentStage].progress);
                currentStage++;
            } else {
                clearInterval(interval);
            }
        }, 800);

        return interval;
    };

    const handleGenerate = async () => {
        if (!userStory.trim() && attachments.length === 0 && !figmaUrl.trim()) {
            showNotification("Please provide at least one input (User Story, files, or Figma URL)", "error");
            return;
        }

        setLoading(true);
        setLoadingProgress(0);
        setLoadingStage('Initializing...');
        const progressInterval = simulateLoadingProgress();

        try {
            const formData = new FormData();
            formData.append('story', userStory);
            if (figmaUrl.trim()) formData.append('figma_url', figmaUrl);
            attachments.forEach(file => formData.append('attachments', file));

            const response = await axios.post(`${API_BASE}/generate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("RAW API RESPONSE:", response.data);

            clearInterval(progressInterval);
            setLoadingProgress(100);
            setLoadingStage('Success!');

            if (response.data && response.data.test_cases) {
                setTestCases(response.data.test_cases);
                setMetadata(response.data.metadata || null);
                showNotification(`Successfully generated ${response.data.test_cases.length} test cases`, "success");
            } else {
                console.error("No test cases in response:", response.data);
                showNotification("No test cases were generated. Please check your input.", "warning");
            }
        } catch (error) {
            console.error(error);
            clearInterval(progressInterval);
            showNotification("Failed to generate Test Cases", "error");
        } finally {
            setTimeout(() => {
                setLoading(false);
                setLoadingProgress(0);
                setLoadingStage('');
            }, 800);
        }
    };

    const handleFeedback = async () => {
        try {
            await axios.post(`${API_BASE}/feedback`, {
                story_id: metadata?.story_id,
                ...currentFeedback
            });
            showNotification("Thank you for your feedback!", "success");
            setFeedbackVisible(false);
        } catch (error) {
            showNotification("Failed to submit feedback", "error");
        }
    };

    const downloadCSV = () => {
        if (!testCases || testCases.length === 0) return;

        // Helper to escape CSV fields
        const escapeCsvField = (field) => {
            if (field === null || field === undefined) return '""';
            let stringField = String(field);
            // Replace any escaped newlines
            stringField = stringField.replace(/\\n/g, '\n');
            // Wrap in quotes if needed
            if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        };

        const headers = ["ID", "Title", "Priority", "Preconditions", "Step", "Expected Result", "Mapping"];
        const rows = [];

        testCases.forEach(tc => {
            // Split steps and expected results into lines
            const stepLines = (tc.steps || "").split('\n').filter(l => l.trim());
            const expectedLines = (tc.expected || "").split('\n').filter(l => l.trim());

            // Determine how many rows we need (max of steps or expected)
            const rowCount = Math.max(stepLines.length, expectedLines.length, 1);

            for (let i = 0; i < rowCount; i++) {
                rows.push([
                    // Only show ID/Title/Priority/Preconds/Mapping on the first line of the test case
                    // OR repeat them? Usually repeated is safer for "Row per step" imports.
                    // Let's repeat them to ensure context is preserved for every step row.
                    tc.id,
                    tc.title,
                    tc.priority || "Medium",
                    tc.preconditions || "",
                    stepLines[i] || "",     // Single step line
                    expectedLines[i] || "", // Single expected line (matched by index)
                    tc.requirement_mapping || ""
                ].map(escapeCsvField).join(","));
            }
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `test_cases_${metadata?.story_id || 'export'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const copyToClipboard = () => {
        const text = testCases.map(tc =>
            `ID: ${tc.id}\nTitle: ${tc.title}\nSteps:\n${tc.steps}\nExpected: ${tc.expected}\n`
        ).join('\n---\n\n');
        navigator.clipboard.writeText(text);
        showNotification("Test Cases copied to clipboard!", "success");
    };

    const [showDebugModal, setShowDebugModal] = useState(false);
    const [debugModalData, setDebugModalData] = useState({ title: '', content: '' });

    const openDebugModal = (title, content) => {
        setDebugModalData({ title, content });
        setShowDebugModal(true);
    };

    return (
        <Box sx={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Debug Modal */}
            {showDebugModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDebugModal(false)}>
                    <div
                        className={`w-[800px] h-[80vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-300'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between px-4 border-b ${isDark ? 'border-white/10 bg-[#252526]' : 'border-gray-300 bg-gray-50'}`} style={{ paddingTop: 16, paddingBottom: 16, minHeight: 72 }}>
                            <div className="flex items-center gap-3" style={{ marginLeft: 24 }}>
                                <Sparkles className={isDark ? 'text-purple-400' : 'text-purple-600'} size={20} />
                                <h3 className={`text-lg font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{debugModalData.title}</h3>
                            </div>
                            <button onClick={() => setShowDebugModal(false)} className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`} style={{ marginRight: 24 }}>
                                <X size={18} color={theme.palette.text.secondary} />
                            </button>
                        </div>

                        <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-6 ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`} style={{ padding: 20 }}>
                            <div>
                                <pre className={`p-4 rounded-lg border text-xs whitespace-pre-wrap break-words font-mono ${isDark ? 'bg-black/40 border-white/5 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                    {debugModalData.content}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <Box sx={{
                p: 2,
                height: '70px',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper',
                flexShrink: 0,
                zIndex: 10
            }}>
                <Box sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Test Design
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Generate comprehensive test cases from requirements and designs
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
                            {status.severity === 'success' ? <CheckCircle size={16} color={theme.palette.success.main} /> : <AlertCircle size={16} color={theme.palette.error.main} />}
                            <Typography variant="body2">{status.message}</Typography>
                        </Box>
                    )}
                    <ThemeToggle />
                </div>
            </Box>

            {/* Content Area */}
            <Box sx={{
                flex: 1,
                p: 2,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'background-color 0.3s',
                boxSizing: 'border-box'
            }}>
                <Grid container spacing={2} sx={{ height: '100%', width: '100%' }}>
                    {/* Left Column - Inputs */}
                    <Grid size={{ xs: 12, lg: 5 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{
                            p: 3,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d5db',
                            bgcolor: isDark ? alpha('#1e1e1e', 0.8) : alpha('#ffffff', 0.9),
                            backdropFilter: 'blur(10px)',
                            overflowY: 'auto'
                        }}>
                            <Box>
                                <Typography component="div" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.6, letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FileText size={18} color={theme.palette.primary.main} /> Requirements / User Story
                                </Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={8}
                                    placeholder="Describe the feature or paste your user story here..."
                                    value={userStory}
                                    onChange={(e) => setUserStory(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.01),
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography component="div" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.6, letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Figma size={18} color={theme.palette.secondary.main} /> Figma Design (Optional)
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="https://www.figma.com/file/..."
                                    value={figmaUrl}
                                    onChange={(e) => setFigmaUrl(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            '&:hover fieldset': {
                                                borderColor: theme.palette.primary.main
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: theme.palette.primary.main
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Box>
                                <Typography component="div" sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.6, letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Plus size={18} color={theme.palette.success.main} /> Attachments (PDF/Images)
                                </Typography>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,application/pdf"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <Box sx={{
                                        p: 2, border: '2px dashed', borderColor: 'divider', borderRadius: 2,
                                        textAlign: 'center', cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }
                                    }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Click to upload or drag and drop
                                        </Typography>
                                    </Box>
                                </label>
                                {attachments.length > 0 && (
                                    <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                                        {attachments.map((file, idx) => (
                                            <Chip
                                                key={idx}
                                                label={file.name}
                                                onDelete={() => removeFile(idx)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Box>

                            <Box sx={{ mt: 'auto' }}>
                                <Button
                                    variant="primary-glass"
                                    size="medium"
                                    className="px-6 shadow-lg shadow-blue-500/20"
                                    fullWidth
                                    onClick={handleGenerate}
                                    loading={loading}
                                    icon={Sparkles}
                                >
                                    {loading ? "Generating..." : "Generate Test Cases Using AI"}
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column - Results */}
                    <Grid size={{ xs: 12, lg: 7 }} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Paper sx={{
                            p: 0,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d5db',
                            bgcolor: isDark ? alpha('#1e1e1e', 0.8) : alpha('#ffffff', 0.9),
                            backdropFilter: 'blur(10px)',
                        }}>
                            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02) }}>
                                <Typography component="div" sx={{ m: 0, fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.6, letterSpacing: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Zap size={18} color={theme.palette.warning.main} /> Generated Test Scenarios {testCases.length > 0 && `(${testCases.length})`}
                                </Typography>
                                {testCases.length > 0 && (
                                    <Stack direction="row" spacing={1}>
                                        {/* Debug: Extracted Content */}
                                        {metadata?.extracted_content && metadata.extracted_content.length > 0 && (
                                            <IconButton
                                                size="small"
                                                color="info"
                                                title="View Extracted Context"
                                                onClick={() => openDebugModal(
                                                    'Extracted Source Content',
                                                    metadata.extracted_content.map(t => typeof t === 'string' ? t : JSON.stringify(t, null, 2)).join('\n\n---\n\n')
                                                )}
                                            >
                                                <Info size={18} color={theme.palette.info.main} />
                                            </IconButton>
                                        )}

                                        {/* Debug: Full Prompt */}
                                        {metadata?.full_prompt && (
                                            <IconButton
                                                size="small"
                                                color="secondary"
                                                title="View AI Prompt"
                                                onClick={() => openDebugModal(
                                                    'AI Prompt Preview',
                                                    metadata.full_prompt
                                                )}
                                            >
                                                <Code size={18} color={theme.palette.secondary.main} />
                                            </IconButton>
                                        )}

                                        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

                                        <IconButton size="small" onClick={copyToClipboard} title="Copy to Clipboard">
                                            <Copy size={18} color={theme.palette.info.main} />
                                        </IconButton>
                                        <IconButton size="small" onClick={downloadCSV} title="Download CSV" color="success">
                                            <Download size={18} />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => setFeedbackVisible(!feedbackVisible)}
                                            color={feedbackVisible ? "primary" : "default"}
                                            title="Provide Feedback"
                                        >
                                            <Star size={18} style={{ color: '#ffc107' }} />
                                        </IconButton>
                                    </Stack>
                                )}
                            </Box>

                            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
                                {feedbackVisible && testCases.length > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02), borderColor: 'primary.main', borderRadius: 2 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>Rate AI Generated Test Cases Quality</Typography>
                                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <IconButton
                                                    key={star}
                                                    size="small"
                                                    onClick={() => setCurrentFeedback({ ...currentFeedback, rating: star })}
                                                    color={currentFeedback.rating >= star ? "warning" : "default"}
                                                >
                                                    <Star size={20} fill={currentFeedback.rating >= star ? theme.palette.warning.main : 'transparent'} color={currentFeedback.rating >= star ? theme.palette.warning.main : theme.palette.action.disabled} />
                                                </IconButton>
                                            ))}
                                        </Stack>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="What could be improved?"
                                            value={currentFeedback.comments}
                                            onChange={(e) => setCurrentFeedback({ ...currentFeedback, comments: e.target.value })}
                                            sx={{ mb: 2 }}
                                        />
                                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                            <Button
                                                variant="primary-glass"
                                                onClick={handleFeedback}
                                                className="px-8 shadow-lg shadow-blue-500/20 font-bold"
                                                icon={CheckCircle}
                                            >
                                                Submit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => setFeedbackVisible(false)}
                                                className="px-8 shadow-lg shadow-red-500/20 font-bold"
                                                icon={X}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    </Paper>
                                )}

                                {loading ? (
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                                        <Box sx={{ position: 'relative', width: 120, height: 120 }}>
                                            <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full"></div>
                                            <Brain size={120} color={theme.palette.primary.main} className="animate-bounce" style={{ position: 'relative', zIndex: 1 }} />
                                        </Box>
                                        <Box sx={{ width: '100%', maxWidth: 400 }}>
                                            <Typography variant="h6" align="center" gutterBottom>{loadingStage}</Typography>
                                            <LinearProgress
                                                variant="determinate"
                                                value={loadingProgress}
                                                sx={{
                                                    height: 10,
                                                    borderRadius: 5,
                                                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                    '& .MuiLinearProgress-bar': {
                                                        background: 'linear-gradient(45deg, #673ab7, #2196f3)'
                                                    }
                                                }}
                                            />
                                            <Typography align="right" variant="caption" display="block" sx={{ mt: 1 }}>{loadingProgress}%</Typography>
                                        </Box>
                                    </Box>
                                ) : testCases.length > 0 ? (
                                    <Stack spacing={2}>
                                        {testCases.map((tc, idx) => (
                                            <Card key={idx} variant="outlined" sx={{
                                                borderRadius: 2,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                    borderColor: 'primary.main',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}>
                                                <CardContent sx={{ p: 2.5 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Chip
                                                                label={tc.id}
                                                                size="small"
                                                                sx={{ fontWeight: 'bold', bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main' }}
                                                            />
                                                            <Chip
                                                                label={tc.priority || 'Medium'}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    borderColor: tc.priority === 'High' ? 'error.main' : 'warning.main',
                                                                    color: tc.priority === 'High' ? 'error.main' : 'warning.main'
                                                                }}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>{tc.title}</Typography>

                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>TEST STEPS</Typography>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: 'text.primary' }}>{tc.steps}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}>EXPECTED RESULT</Typography>
                                                            <Typography variant="body2" sx={{ color: 'text.primary' }}>{tc.expected}</Typography>
                                                        </Grid>
                                                    </Grid>

                                                    {tc.requirement_mapping && (
                                                        <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: alpha(theme.palette.divider, 0.3) }}>
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                <Target size={12} color={theme.palette.primary.main} /> Mapping: {tc.requirement_mapping}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </Stack>
                                ) : testCases.length === 0 && metadata ? (
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8, color: 'warning.main' }}>
                                        <AlertCircle size={64} color={theme.palette.warning.main} style={{ marginBottom: 16 }} />
                                        <Typography variant="h6">No Scenarios Detected</Typography>
                                        <Typography variant="body2">The AI didn't find specific testable requirements. Try adding more detail to your user story.</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                        <Sparkles size={64} color={theme.palette.secondary.main} style={{ marginBottom: 16 }} />
                                        <Typography variant="h6">Ready to generate intelligence</Typography>
                                        <Typography variant="body2">Fill in the requirements and click Generate</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

        </Box>
    );
}
