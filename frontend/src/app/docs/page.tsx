'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Stack,
    Divider,
    Button,
    Avatar,
    alpha,
    useTheme,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import {
    Book,
    Shield,
    Zap,
    Target,
    Layers,
    Activity,
    CheckCircle2,
    AlertTriangle,
    Mail,
    ExternalLink,
    Code,
    Terminal,
    Cpu,
    Brain,
    History,
    Compass,
    ArrowRight
} from 'lucide-react';
import { UbsLogo } from '../../components/UbsLogo';
import { UnifiedNavBar } from '../../components/UnifiedNavBar';
import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function DocumentationPage() {
    const theme = useTheme();
    const router = useRouter();

    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            setTimeout(() => {
                document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        }
    }, []);

    return (
        <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                pb: 10
            }}>
                <UnifiedNavBar
                    title="NEXUS EVAL"
                    items={[
                        { id: 'platforms', label: 'Platforms', onClick: () => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' }) },
                        { id: 'solutions', label: 'Solutions', onClick: () => document.getElementById('agent-eval')?.scrollIntoView({ behavior: 'smooth' }) },
                        { id: 'enterprise', label: 'Enterprise', onClick: () => document.getElementById('contact-support')?.scrollIntoView({ behavior: 'smooth' }) },
                    ]}
                    onLogoClick={() => router.push('/')}
                    actions={
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/')}
                                sx={{
                                    borderColor: 'divider',
                                    color: 'text.primary',
                                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' }
                                }}
                            >
                                Back to Home
                            </Button>
                            <ThemeToggle />
                        </>
                    }
                />

                <Container maxWidth="xl" sx={{ mt: 4, px: { xs: 2, md: 3 } }}>
                    {/* Header */}
                    <Box sx={{ mb: 8, textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Typography variant="h3" sx={{ fontWeight: 600, mb: 2, letterSpacing: '-0.02em' }}>
                                Platform <Box component="span" sx={{ color: 'primary.main' }}>Documentation</Box>
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: 800, mx: 'auto' }}>
                                The definitive guide to Nexus Eval&apos;s metrics, models, and evaluation frameworks for RAG and Autonomous Agents.
                            </Typography>
                        </motion.div>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Sidebar Navigation (Optional but useful for long docs) */}
                        <Grid size={{ xs: 12, md: 3 }}>
                            <Box sx={{ position: 'sticky', top: 120 }}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', mb: 2, display: 'block' }}>
                                    ON THIS PAGE
                                </Typography>
                                <Stack spacing={1}>
                                    {['Overview', 'Agent Eval', 'RAG Eval', 'Agent Metrics', 'RAG Metrics', 'Decision Engine', 'Models & API', 'Contact Support'].map((item) => (
                                        <Typography
                                            key={item}
                                            variant="body2"
                                            sx={{
                                                cursor: 'pointer',
                                                color: 'text.secondary',
                                                '&:hover': { color: 'primary.main' },
                                                transition: 'color 0.2s',
                                                fontWeight: 500
                                            }}
                                            onClick={() => {
                                                document.getElementById(item.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/-{2,}/g, '-'))?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Main Content */}
                        <Grid size={{ xs: 12, md: 9 }}>
                            <Stack spacing={8}>

                                {/* 1. Overview */}
                                <Box id="overview" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Layers size={24} />} title="Overview" />
                                    <Typography variant="body1" paragraph color="text.secondary">
                                        Nexus Eval is an enterprise-grade evaluation suite for benchmarking Large Language Model applications.
                                        It provides two primary evaluation frameworks:
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DocCard
                                                title="RAG Eval"
                                                icon={<Activity size={20} />}
                                                content="Evaluates Retrieval-Augmented Generation pipelines. Upload Excel datasets, compare multiple RAG architectures, and measure faithfulness, relevancy, context precision/recall, and answer correctness."
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <DocCard
                                                title="Agent Eval"
                                                icon={<Brain size={20} />}
                                                content="Evaluates JSON-structured agent outputs. Measures correctness, completeness, hallucination, consistency, and safety. Supports Batch (JSON files) and single-run JSON evaluation."
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* 2. Agent Eval Implementation */}
                                <Box id="agent-eval" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Brain size={24} />} title="Agent Eval Application" />
                                    <Typography variant="body1" paragraph color="text.secondary">
                                        Agent Eval evaluates autonomous agents that produce JSON outputs. Navigate via: <strong>Dashboard → Experiments → History → Configuration</strong>.
                                    </Typography>
                                    <Stack spacing={2}>
                                        <MetricDetail
                                            title="Dashboard"
                                            description="Real-time overview of the latest evaluation: RQS, Accuracy, Completeness, Hallucination, Consistency, Safety, Status. Includes performance trend charts (last 100 runs) and consistency vs. hallucination over time."
                                        />
                                        <MetricDetail
                                            title="Experiments"
                                            description="Run evaluations via Batch (local JSON files) or JSON Evaluation (paste Ground Truth + AI Outputs). Configure key mapping (query_id, expected_output, match_type). View per-run results with Accuracy, Completeness, Hallucination, Consistency, and Safety tabs."
                                        />
                                        <MetricDetail
                                            title="History"
                                            description="Browse past evaluations, compare runs, and view detailed JSON results."
                                        />
                                        <MetricDetail
                                            title="Configuration"
                                            description="Set thresholds (semantic, fuzzy, accuracy, hallucination, RQS), LLM model (gpt-4o), and JSON weights (accuracy, completeness, hallucination, safety) for the weighted RQS formula."
                                        />
                                    </Stack>
                                </Box>

                                {/* 3. RAG Eval Implementation */}
                                <Box id="rag-eval" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Activity size={24} />} title="RAG Eval Application" />
                                    <Typography variant="body1" paragraph color="text.secondary">
                                        RAG Eval compares multiple RAG architectures on Excel datasets. Navigate via: <strong>Dashboard → Experiments → History → Configuration</strong>.
                                    </Typography>
                                    <Stack spacing={2}>
                                        <MetricDetail
                                            title="Dashboard (Insights)"
                                            description="Production intelligence view: Highest RQS, Answer Correctness, Faithfulness, Relevancy, Context Precision, Context Recall. Area charts show performance trajectory. Export reports as PDF, JSON, or Excel."
                                        />
                                        <MetricDetail
                                            title="Experiments (Drilldown)"
                                            description="Per-question analysis: compare bot responses, ground truth, and metrics (Faithfulness, Relevancy, Context Precision/Recall, Answer Correctness) for each test case."
                                        />
                                        <MetricDetail
                                            title="Configuration"
                                            description="RQS weights (Alpha=Semantic, Beta=Faithful, Gamma=Relevant), Judge model (gpt-4o), strictness, max rows. Weights are normalized if sum exceeds 1.0."
                                        />
                                    </Stack>
                                </Box>

                                {/* 4. Agent Metrics */}
                                <Box id="agent-metrics" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Brain size={24} />} title="Agent Evaluation Metrics" />
                                    <Stack spacing={3}>
                                        <MetricDetail
                                            title="RQS (Retrieval Quality Score)"
                                            description="Weighted composite score for Agent Eval: RQS = w_accuracy × Accuracy + w_completeness × Completeness + w_hallucination × (1 − Hallucination) + w_safety × Safety. Default weights: 0.45, 0.25, 0.15, 0.15."
                                            formula="RQS = w_acc × Acc + w_comp × Comp + w_hall × (1 − Hall) + w_safe × Safe"
                                            example="Accuracy 0.9, Completeness 1.0, Hallucination 0.05, Safety 1.0 → RQS ≈ 0.95 (excellent)."
                                        />
                                        <MetricDetail
                                            title="Accuracy"
                                            description="Correctness based on exact match or semantic similarity (0–1). Uses match_type per field: exact, number, text, or semantic. Semantic uses cosine similarity vs. semantic threshold (default 0.72)."
                                            example="Expected: 42. AI output: 42 → 100%. Expected: 'John Doe'. Output: 'john doe' → 100% (case-insensitive exact). Semantic similarity 0.85 vs threshold 0.72 → pass."
                                        />
                                        <MetricDetail
                                            title="Completeness"
                                            description="Proportion of expected fields from ground truth present in the AI output. Checks that all required JSON keys exist."
                                            example="GT keys: name, age, occupation. AI output has name, age but missing occupation → Completeness ≈ 0.67."
                                        />
                                        <MetricDetail
                                            title="Hallucination"
                                            description="Identifies information in the output not present in reference or context (0–1). Higher = more hallucinated content."
                                            example="Output contains a claim not in ground truth or context → Hallucination score increases. Used with Error Type (correct vs hallucination) for classification."
                                        />
                                        <MetricDetail
                                            title="Consistency"
                                            description="Similarity of outputs across multiple runs for the same query, or internal coherence within a single output (0–1)."
                                            example="Same query run 3 times: outputs A, B, C. If A≈B≈C (high similarity), Consistency ≈ 1.0. High variance → low Consistency."
                                        />
                                        <MetricDetail
                                            title="Safety Score"
                                            description="Unified score (0–1) for content safety (non-toxicity) and qualitative judge results. 1.0 = perfectly safe."
                                            example="LLM evaluates response for harmful, biased, or unsafe content. Score &lt; 0.8 triggers safety issues list."
                                        />
                                    </Stack>
                                </Box>

                                {/* 5. RAG Metrics */}
                                <Box id="rag-metrics" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Activity size={24} />} title="RAG Evaluation Metrics" />
                                    <Stack spacing={3}>
                                        <MetricDetail
                                            title="RQS (Retrieval Quality Score)"
                                            description="Master index for RAG performance. Weighted composite: RQS = α × Answer Correctness + β × Faithfulness + γ × Relevancy. Alpha (Semantic), Beta (Faithful), Gamma (Relevant) are configurable; typically α=0.4, β=0.3, γ=0.3."
                                            formula="RQS = α × Correctness + β × Faithfulness + γ × Relevancy"
                                            example="Correctness 0.9, Faithfulness 0.95, Relevancy 0.85 with default weights → RQS ≈ 0.90."
                                        />
                                        <MetricDetail
                                            title="Answer Correctness"
                                            description="Alignment of the bot response with ground truth. Uses semantic similarity (e.g., cosine) or exact match depending on setup."
                                            example="GT: 'Revenue was $50M in Q3.' Output: 'Q3 revenue reached $50 million.' → High semantic similarity, Correctness ≈ 0.95."
                                        />
                                        <MetricDetail
                                            title="Faithfulness (Groundedness)"
                                            description="Measures how accurately the response is supported by the retrieved context. Detects hallucinations relative to source documents."
                                            example="User asks Q3 profit. Source says $40M. Bot says $50M → Faithfulness = 0.0 (hallucination). Bot says $40M → Faithfulness = 1.0."
                                        />
                                        <MetricDetail
                                            title="Answer Relevancy"
                                            description="Does the response address the user's intent? Measures relevance of the answer to the query."
                                            example="Query: 'What was Q3 revenue?' Answer discusses Q2 → Low Relevancy. Answer focuses on Q3 → High Relevancy."
                                        />
                                        <MetricDetail
                                            title="Context Precision"
                                            description="Signal-to-noise of retrieved chunks. Are the correct chunks ranked at the top? High precision = fewer irrelevant chunks before relevant ones."
                                            example="Top 3 chunks all contain the answer → High Precision. Top 5 chunks include 2 irrelevant → Lower Precision."
                                        />
                                        <MetricDetail
                                            title="Context Recall"
                                            description="Coverage: Did retrieval find the answer at all? Percentage of relevant chunks retrieved."
                                            example="Answer is in 1 of 10 chunks; 8 retrieved and 1 is relevant → Recall depends on that chunk's presence. 100% = answer-containing chunk was retrieved."
                                        />
                                    </Stack>
                                </Box>

                                {/* 6. Decision Engine */}
                                <Box id="decision-engine" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Zap size={24} />} title="The Decision Engine" />
                                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                        <Typography variant="h6" gutterBottom fontWeight={800}>Text Accuracy Logic</Typography>
                                        <Typography variant="body2" paragraph color="text.secondary">
                                            For free-text responses, we use a multi-stage decision tree to ensure factual correctness beyond simple keyword matching:
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <StepItem step="1" title="Exact Match" desc="Case-insensitive equality check. If true, Accuracy = 100%." />
                                            <StepItem step="2" title="Semantic Similarity" desc="LLM-based semantic similarity vs. threshold (default 0.72). If below threshold, Accuracy = 0%." />
                                            <StepItem step="3" title="Match Type" desc="Per-field match_type (exact, number, text, semantic) determines comparison logic. JSON keys are validated against ground truth." />
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* 7. Models & API */}
                                <Box id="models-api" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Cpu size={24} />} title="Models & Infrastructure" />
                                    <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.05) }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>Primary Metric</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>Provider</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[
                                                    { name: 'gpt-4o', metric: 'Semantic Similarity / Fuzzy Match / Consistency', provider: 'OpenAI / Azure' },
                                                    { name: 'gpt-4o-mini', metric: 'Safety & Toxicity Analysis', provider: 'OpenAI / Azure' }
                                                ].map((row) => (
                                                    <TableRow key={row.name}>
                                                        <TableCell sx={{ color: 'text.primary', fontWeight: 600 }}>{row.name}</TableCell>
                                                        <TableCell><Chip label={row.metric} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} /></TableCell>
                                                        <TableCell color="text.secondary">{row.provider}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Agent Eval API: <code style={{ padding: '2px 6px', background: 'rgba(0,0,0,0.1)', borderRadius: 4 }}>/agent-eval</code>. RAG Eval backend: port 8000.
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" startIcon={<Code />} href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer" sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' } }}>Swagger UI</Button>
                                        <Button variant="outlined" startIcon={<Terminal />} href="http://localhost:8000/redoc" target="_blank" rel="noopener noreferrer" sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' } }}>ReDoc</Button>
                                    </Box>
                                </Box>

                                {/* 8. Contact Support */}
                                <Box id="contact-support" sx={{ scrollMarginTop: '80px' }}>
                                    <SectionHeader icon={<Mail size={24} />} title="Technical Ownership" />
                                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: (t) => alpha(t.palette.primary.main, 0.04), border: '1px solid', borderColor: (t) => alpha(t.palette.primary.main, 0.2) }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar src="/Aniket.jpeg" sx={{ width: 80, height: 80, border: '2px solid', borderColor: 'primary.main' }} />
                                            <Box>
                                                <Typography variant="h5" fontWeight={900}>Aniket Marwadi</Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>UBS | Digital Strategy Architect</Typography>
                                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main' }}>
                                                    <Mail size={16} /> aniket.marwadi@ubs.com
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Paper>
                                </Box>

                            </Stack>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    const th = useTheme();
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(th.palette.primary.main, 0.1), color: 'primary.main' }}>
                {icon}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 600, letterSpacing: '-0.02em' }}>{title}</Typography>
        </Box>
    );
}

function DocCard({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) {
    return (
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box sx={{ color: 'primary.main' }}>{icon}</Box>
                <Typography variant="subtitle1" fontWeight={800}>{title}</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{content}</Typography>
        </Paper>
    );
}

function MetricDetail({ title, description, formula, example }: { title: string, description: string, formula?: string, example?: string }) {
    return (
        <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>{title}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>{description}</Typography>
            {formula && (
                <Box sx={{ p: 2, bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: 2, mb: 2, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{formula}</Typography>
                </Box>
            )}
            {example && (
                <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.7 }}>
                    <strong>Example:</strong> {example}
                </Typography>
            )}
        </Paper>
    );
}

function StepItem({ step, title, desc }: { step: string, title: string, desc: string }) {
    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900, opacity: 0.5 }}>{step}.</Typography>
            <Box>
                <Typography variant="body2" fontWeight={700}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{desc}</Typography>
            </Box>
        </Box>
    );
}
