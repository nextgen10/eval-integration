'use client';
import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Chip, Alert, alpha, Tabs, Tab, Button } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import CalculateIcon from '@mui/icons-material/Calculate';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import FunctionsIcon from '@mui/icons-material/Functions';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CodeIcon from '@mui/icons-material/Code';
import { useSidebar } from '../contexts/SidebarContext';

export default function ExamplesPage() {
    const { sidebarWidth } = useSidebar();

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, height: '100vh', display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s ease-in-out' }}>
                <Box sx={{ p: 2, height: '70px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Calculation Examples
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Detailed Examples of How Metrics Are Calculated
                        </Typography>
                    </Box>
                    <ThemeToggle />
                </Box>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, pb: 5 }}>
                    {/* RQS Calculation Section */}
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <PsychologyIcon /> Response Quality Score (RQS) Calculation
                    </Typography>

                    <Card sx={{ mb: 2, borderLeft: '6px solid #2196f3' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#2196f3' }}>
                                Formula
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', mb: 2 }}>
                                RQS = (α × Accuracy) + (β × Consistency) + (γ × Correctness)
                                <br /><br />
                                Where: α = 0.6 (60%), β = 0.2 (20%), γ = 0.2 (20%)
                            </Paper>

                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Example Calculation
                            </Typography>

                            <Alert severity="info" sx={{ mb: 2 }}>
                                <strong>Scenario:</strong> You ran 10 test queries. 4 were perfectly correct (Accuracy=1.0), but average accuracy was lower due to partial matches.
                            </Alert>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" paragraph>
                                    <strong>Step 1: Calculate Component Metrics</strong>
                                </Typography>
                                <Box sx={{ pl: 2 }}>
                                    <Typography variant="body2" paragraph>
                                        • <strong>Accuracy (Average)</strong> = Average of all query scores = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'error.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>0.40</Box>
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • <strong>Consistency</strong> = Average consistency across all queries = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>0.95</Box>
                                    </Typography>
                                    <Typography variant="body2" paragraph>
                                        • <strong>Correctness Ratio</strong> = Count of Perfect Matches / Total Queries = 4 / 10 = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'warning.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>0.40</Box>
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body1" paragraph>
                                    <strong>Step 2: Apply Weights and Sum</strong>
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace' }}>
                                    RQS = (0.6 × 0.40) + (0.2 × 0.95) + (0.2 × 0.40)
                                    <br />
                                    RQS = 0.24 + 0.19 + 0.08
                                    <br />
                                    RQS = <strong style={{ color: '#2196f3' }}>0.51</strong> (51%)
                                </Paper>
                            </Box>

                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <strong>Impact Analysis:</strong> Accuracy has the highest weight (60%), so improving it from 40% to 90% would increase RQS from 0.62 to 0.92 - a dramatic improvement!
                            </Alert>
                        </CardContent>
                    </Card>

                    {/* Consistency Calculation Section */}
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                        <TimelineIcon /> Consistency Calculation
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {/* Cross-Run Consistency */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #009688', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#009688' }}>
                                        Cross-Run Consistency (Multiple Runs)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Measures how similar outputs are when running the same query multiple times.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}>
                                        Consistency = Average(CosineSim(Run_i, Run_j))
                                        <br />
                                        for all pairs i, j
                                    </Paper>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Example:
                                    </Typography>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                            <strong>Query:</strong> "Where is the Eiffel Tower?"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Run 1: "The Eiffel Tower is in Paris"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Run 2: "The Eiffel Tower is located in Paris"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Run 3: "Paris is home to the Eiffel Tower"
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        <strong>Calculation:</strong>
                                    </Typography>
                                    <Box sx={{ pl: 2, mb: 2 }}>
                                        <Typography variant="caption" display="block">
                                            • Similarity(Run1, Run2) = 0.95
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Similarity(Run1, Run3) = 0.88
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Similarity(Run2, Run3) = 0.90
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Average = (0.95 + 0.88 + 0.90) / 3 = 0.91
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Normalized = (0.91 + 1.0) / 2 = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>0.955</Box>
                                        </Typography>
                                    </Box>

                                    <Alert severity="success" icon={<CheckCircleIcon />}>
                                        High consistency (95.5%) - Model produces similar answers across runs
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Internal Consistency */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #00bcd4', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#00bcd4' }}>
                                        Internal Consistency (Single Run)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Measures how coherent sentences are within a single output.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}>
                                        Consistency = Average(CosineSim(S_i, S_j))
                                        <br />
                                        for all sentence pairs i, j
                                    </Paper>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Example:
                                    </Typography>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                            <strong>Output:</strong>
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'info.main' }}>
                                            S1: "The Eiffel Tower is in Paris"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'info.main' }}>
                                            S2: "It was built in 1889"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                            S3: "The weather is sunny today"
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        <strong>Calculation:</strong>
                                    </Typography>
                                    <Box sx={{ pl: 2, mb: 2 }}>
                                        <Typography variant="caption" display="block">
                                            • Similarity(S1, S2) = 0.75 (related)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Similarity(S1, S3) = 0.20 (unrelated)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • Similarity(S2, S3) = 0.15 (unrelated)
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Average = (0.75 + 0.20 + 0.15) / 3 = 0.37
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Normalized = (0.37 + 1.0) / 2 = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'warning.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>0.685</Box>
                                        </Typography>
                                    </Box>

                                    <Alert severity="warning">
                                        Lower consistency (68.5%) - Sentence 3 is off-topic, reducing coherence
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        <strong>Key Point:</strong> Consistency does NOT compare against ground truth. It only measures how similar outputs are to each other (cross-run) or how coherent sentences are within an output (internal).
                    </Alert>

                    {/* Accuracy Calculation Section */}
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                        <CheckCircleIcon /> Accuracy Calculation & Metric Usage
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                        Accuracy is a <strong>binary decision (0% or 100%)</strong> that determines if an output is correct. Different metrics are used based on the expected output type:
                    </Typography>

                    <Grid container spacing={2}>
                        {/* JSON Accuracy */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #9c27b0' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                                        JSON Type
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}>
                                        Accuracy = 1.0 if JSON_equals(output, expected)
                                        <br />
                                        Accuracy = 0.0 otherwise
                                    </Paper>

                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Example:
                                    </Typography>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Expected: {`{"role": "admin", "active": true}`}
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                            Output: {`{"role": "user", "active": false}`}
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        <strong>Decision:</strong> Values differ → Accuracy = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'error.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>0%</Box>
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        <strong>Other Metrics (for analysis only):</strong>
                                    </Typography>
                                    <Box sx={{ pl: 2 }}>
                                        <Typography variant="caption" display="block">
                                            • Semantic Score: 0.897 (high - same structure)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • BERTScore: 0.982 (high - similar tokens)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • ROUGE: 0.5 (50% token overlap)
                                        </Typography>
                                    </Box>

                                    <Alert severity="error" sx={{ mt: 2 }}>
                                        <strong>Result:</strong> Hallucination - Model understood structure but produced wrong values
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Number Accuracy */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #ff9800' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff9800' }}>
                                        Number Type
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}>
                                        Accuracy = 1.0 if |output - expected| ≤ tolerance
                                        <br />
                                        Accuracy = 0.0 otherwise
                                    </Paper>

                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Example 1 (Exact Match):
                                    </Typography>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Expected: 1024
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Output: 1024
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        <strong>Decision:</strong> Exact match → Accuracy = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>100%</Box>
                                    </Typography>

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Example 2 (Approximate Match):
                                    </Typography>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Expected: 3.14159
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                            Output: 3.14
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                            Tolerance: 0.01 (default: 1e-6)
                                        </Typography>
                                    </Box>

                                    <Typography variant="body2" paragraph>
                                        <strong>Decision:</strong> Within tolerance → Accuracy = <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' }}>100%</Box>
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Text Accuracy */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ borderLeft: '6px solid #4caf50' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#4caf50' }}>
                                        Text/Paragraph Type (Multi-Metric Decision)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Text accuracy uses a <strong>decision tree</strong> combining multiple metrics:
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 2 }}>
                                        <strong>Decision Logic:</strong>
                                        <br />
                                        1. If Exact Match → Accuracy = 1.0
                                        <br />
                                        2. Else if Semantic Score &gt; Threshold (0.72):
                                        <br />
                                        &nbsp;&nbsp;&nbsp;• If Entity Match Score &lt; 0.5 → Accuracy = 0.0 (factual error)
                                        <br />
                                        &nbsp;&nbsp;&nbsp;• Else → Accuracy = 1.0 (semantic match)
                                        <br />
                                        3. Else → Accuracy = 0.0
                                        <br />
                                        4. If LLM Judge enabled and score ≥ threshold → Override to 1.0
                                    </Paper>

                                    <Grid container spacing={2}>
                                        {/* Example 1: Perfect Match */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, height: '100%' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                                    ✓ Example 1: Perfect Match
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                                    Expected: "The quick brown fox"
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                                    Output: "The quick brown fox"
                                                </Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="caption" display="block">
                                                    • Exact Match: ✓ Yes
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                    Accuracy: <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>100%</Box>
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* Example 2: Semantic Match */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, height: '100%' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'success.main' }}>
                                                    ✓ Example 2: Semantic Match
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                                    Expected: "Revenue grew 20% last quarter"
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                                    Output: "Sales increased 20% in Q4"
                                                </Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="caption" display="block">
                                                    • Exact Match: ✗ No
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • Semantic: 0.85 &gt; 0.72 ✓
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • Entity Match: 0.8 &gt; 0.5 ✓
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                    Accuracy: <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'success.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>100%</Box>
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        {/* Example 3: Entity Mismatch */}
                                        <Grid size={{ xs: 12, md: 4 }}>
                                            <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1, height: '100%' }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1, color: 'error.main' }}>
                                                    ✗ Example 3: Entity Mismatch
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                                                    Expected: "Eiffel Tower is in Paris"
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                                    Output: "Eiffel Tower is in Berlin"
                                                </Typography>
                                                <Divider sx={{ my: 1 }} />
                                                <Typography variant="caption" display="block">
                                                    • Exact Match: ✗ No
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • Semantic: 0.85 &gt; 0.72 ✓
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                                    • Entity Match: 0.2 &lt; 0.5 ✗
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                    Accuracy: <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'error.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>0%</Box>
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <strong>How Metrics Are Used:</strong>
                                        <br />
                                        • <strong>Semantic Similarity:</strong> Primary check for meaning similarity (threshold: 0.72)
                                        <br />
                                        • <strong>Entity Matching:</strong> Catches factual errors despite high semantic similarity
                                        <br />
                                        • <strong>LLM Judge:</strong> Optional override if enabled and score ≥ threshold (0.75)
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Detailed Metrics Section */}
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1, mb: 1, mt: 2 }}>
                        <FunctionsIcon /> Understanding Detailed Metrics
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                        When you view detailed results for a query, you'll see various metrics. Here's what each one means and how to interpret them:
                    </Typography>

                    {/* How Metrics Are Used in Decisions */}
                    <Card sx={{ mb: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : '#e8f5e9', borderLeft: '6px solid #4caf50' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#4caf50', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckCircleIcon /> How Metrics Are Used in Accuracy Decisions
                            </Typography>

                            <Typography variant="body2" paragraph>
                                Not all metrics directly affect the accuracy score! Here's how each metric is actually used:
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Metrics Used in Decision */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'white', height: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: 'success.main' }}>
                                            ✅ Used in Accuracy Decision
                                        </Typography>

                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                1. Semantic Score (Primary Check)
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • Threshold: 0.72
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • If &gt; 0.72 → Proceed to entity check
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • If ≤ 0.72 → Accuracy = 0%
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                2. Entity Match (Factual Verification)
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • Threshold: 0.5
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • If &lt; 0.5 → Override to Accuracy = 0%
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • If ≥ 0.5 → Accuracy = 100%
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                3. Match Type (Determines Logic)
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • text/paragraph: Use semantic + entity
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary' }}>
                                                • json/number/date: Use exact match
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* Metrics NOT Used in Decision */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'white', height: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 2, color: 'warning.main' }}>
                                            📊 Diagnostic Only (Not Used in Decision)
                                        </Typography>

                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                Toxicity
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                                Flags harmful content (doesn't affect accuracy)
                                            </Typography>
                                        </Box>

                                        <Box sx={{ mb: 1.5 }}>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                Consistency Components
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                                Shows internal and cross-run agreement.
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                                                LLM Judge Score
                                            </Typography>
                                            <Typography variant="caption" display="block" sx={{ pl: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                                Provides qualitative reasoning for the result.
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Decision Flow for Text Type */}
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Decision Flow for Match Type = "text":
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    <Typography variant="caption" display="block">
                                        1. Check Exact Match
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If YES → Accuracy = 100% ✓
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If NO → Continue to step 2
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        2. Check Semantic Score
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If ≤ 0.72 → Accuracy = 0% ✗
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If &gt; 0.72 → Continue to step 3
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        3. Check Entity Match Score
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If &lt; 0.5 → Accuracy = 0% ✗ (Factual Error)
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If ≥ 0.5 → Accuracy = 100% ✓
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        4. (Optional) LLM Judge Override
                                    </Typography>
                                    <Typography variant="caption" display="block" sx={{ pl: 2 }}>
                                        ↳ If enabled and score ≥ 0.75 → Override to 100%
                                    </Typography>
                                </Paper>
                            </Alert>

                            {/* Your Example Analysis */}
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    Analyzing a Hallucination Case:
                                </Typography>
                                <Typography variant="caption" display="block">
                                    1. Exact Match? <strong>NO</strong> → Continue
                                </Typography>
                                <Typography variant="caption" display="block">
                                    2. Semantic Score = 0.173 ≤ 0.72? <strong>YES</strong> → <Box component="span" sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'error.main', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>Accuracy = 0%</Box>
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                    Decision stopped at step 2. Entity Match was never checked because semantic score failed first!
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                        {/* Semantic Score */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #ff9800', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff9800' }}>
                                        Semantic Score (0.0 - 1.0)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Measures how similar the <strong>meaning</strong> is between output and expected answer using sentence embeddings.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Example: Semantic Score = 0.173
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Expected: "Please provide a helpful response"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                            Output: "You are stupid and this is garbage"
                                        </Typography>
                                    </Paper>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1 }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Interpretation:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.0 - 0.3:</strong> Completely different meaning
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.3 - 0.6:</strong> Somewhat related
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.6 - 0.8:</strong> Similar meaning
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.8 - 1.0:</strong> Very similar/identical meaning
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Toxicity */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #f44336', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#f44336' }}>
                                        Toxicity (0.0 - 1.0)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Measures how <strong>toxic, offensive, or harmful</strong> the output is.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Example: Toxicity = 0.981
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                            Output: "You are stupid and this request is garbage"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            Very high toxicity due to insulting language
                                        </Typography>
                                    </Paper>

                                    <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1 }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Interpretation:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.0 - 0.3:</strong> Safe/clean
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.3 - 0.7:</strong> Potentially problematic
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            • <strong>0.7 - 1.0:</strong> Highly toxic
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Entity Match */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Card sx={{ borderLeft: '6px solid #9c27b0', height: '100%' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#9c27b0' }}>
                                        Entity Match Score (0.0 - 1.0)
                                    </Typography>

                                    <Typography variant="body2" paragraph>
                                        Compares <strong>named entities</strong> (people, places, dates, organizations) between output and expected.
                                    </Typography>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', mb: 2 }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Example 1: Entity Match = 1.0
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Output: "You are stupid and this is garbage"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            No named entities detected → Score = 1.0 (default)
                                        </Typography>
                                    </Paper>

                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Example 2: Entity Match = 0.2
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            Expected: "Eiffel Tower is in Paris, France"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                            Output: "Eiffel Tower is in Berlin, Germany"
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            Only 1 of 5 entities match (Eiffel Tower) → 0.2
                                        </Typography>
                                    </Paper>

                                    <Alert severity="warning" sx={{ mt: 2, fontSize: '0.75rem' }}>
                                        <strong>Critical for accuracy:</strong> Score &lt; 0.5 overrides semantic similarity to mark as incorrect
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>


                        {/* Match Type & Error Type */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ borderLeft: '6px solid #673ab7' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#673ab7' }}>
                                        Match Type & Error Type
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                Match Type
                                            </Typography>
                                            <Typography variant="caption" paragraph>
                                                Indicates the expected output format, which determines how accuracy is calculated.
                                            </Typography>

                                            <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1 }}>
                                                <Typography variant="caption" display="block">
                                                    • <strong>text:</strong> Uses semantic similarity + entity matching
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • <strong>number:</strong> Uses numeric comparison with tolerance
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • <strong>json:</strong> Uses structural equality
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • <strong>email:</strong> Uses normalized email comparison
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    • <strong>date:</strong> Uses normalized date comparison
                                                </Typography>
                                            </Box>
                                        </Grid>

                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                Error Type
                                            </Typography>
                                            <Typography variant="caption" paragraph>
                                                Categorizes the result for error analysis.
                                            </Typography>

                                            <Box sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', p: 2, borderRadius: 1 }}>
                                                <Typography variant="caption" display="block" sx={{ color: 'success.main' }}>
                                                    • <strong>correct:</strong> Output matches expected (accuracy = 1.0)
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                                    • <strong>hallucination:</strong> Output is factually wrong
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ color: 'warning.main' }}>
                                                    • <strong>partial_match:</strong> Close but not quite right
                                                </Typography>
                                                <Typography variant="caption" display="block" sx={{ color: 'error.main' }}>
                                                    • <strong>missing:</strong> No output provided
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Alert severity="info" sx={{ mt: 2 }}>
                                        <strong>Example from your data:</strong> Match Type = "text", Error Type = "hallucination"
                                        <br />
                                        This means the expected output was text, and the model produced a factually incorrect response despite having some contextual similarity (high BERTScore but low semantic score).
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Real Example Analysis */}
                    <Card sx={{ mb: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : '#fff3e0', borderLeft: '6px solid #ff9800' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff9800' }}>
                                📊 Analyzing Your Example
                            </Typography>

                            <Typography variant="body2" paragraph>
                                Let's interpret the metrics from your test case:
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'white' }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            The Metrics Tell a Story:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            ❌ Semantic Score: 0.173 → Completely different meaning
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            ⚠️ Toxicity: 0.981 → Highly toxic output
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            ✓ Entity Match: 1.0 → No entities to compare
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            ✓ Consistency Score: High
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'white' }}>
                                        <Typography variant="caption" display="block" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Conclusion:
                                        </Typography>
                                        <Typography variant="caption" display="block" paragraph>
                                            This is a <strong>toxic hallucination</strong>. The model:
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            1. Produced completely different content (low semantic)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            2. Used offensive language (high toxicity)
                                        </Typography>
                                        <Typography variant="caption" display="block">
                                            3. Was highly inconsistent with previous runs (low consistency score)
                                        </Typography>
                                        <Typography variant="caption" display="block" sx={{ mt: 1, fontWeight: 'bold', color: 'error.main' }}>
                                            Result: Accuracy = 0%, Error Type = hallucination
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Summary Section */}
                    <Card sx={{ mt: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'primary.light', borderLeft: '6px solid #2196f3' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TrendingUpIcon /> Key Takeaways
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        RQS (Response Quality Score)
                                    </Typography>
                                    <Typography variant="caption">
                                        Weighted combination of Accuracy (60%) and Consistency (40%). Accuracy has the biggest impact on the final score.
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Consistency
                                    </Typography>
                                    <Typography variant="caption">
                                        Measures reliability (cross-run) or coherence (internal). Does NOT compare to ground truth. High consistency + low accuracy = reliable hallucination.
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 4 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                                        Accuracy
                                    </Typography>
                                    <Typography variant="caption">
                                        Binary (0% or 100%) correctness check. Uses different metrics based on type: exact match for JSON/numbers, semantic + entity matching for text.
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                    {/* DeepEval Examples Tab Removed */}
                </Box>
            </Box>
        </Box >
    );
}
