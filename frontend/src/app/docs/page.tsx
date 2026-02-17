'use client';

import React, { useState } from 'react';
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
import ThemeRegistry from '../../components/ThemeRegistry';
import { UnifiedNavBar } from '../../components/UnifiedNavBar';
import ThemeToggle from '../agent-eval/components/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function DocumentationPage() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <ThemeRegistry>
            <Box sx={{
                minHeight: '100vh',
                bgcolor: 'background.default',
                color: 'text.primary',
                pb: 10
            }}>
                <UnifiedNavBar
                    title="NEXUS DOCS"
                    items={[
                        { id: 'home', label: 'Back to Home', onClick: () => router.push('/') }
                    ]}
                    onLogoClick={() => router.push('/')}
                    actions={<ThemeToggle />}
                />

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 8, textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: '-0.04em' }}>
                                Platform <Box component="span" sx={{ color: 'primary.main' }}>Documentation</Box>
                            </Typography>
                            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', opacity: 0.8 }}>
                                The definitive guide to Nexus Eval's metrics, models, and evaluation frameworks for RAG and Autonomous Agents.
                            </Typography>
                        </motion.div>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Sidebar Navigation (Optional but useful for long docs) */}
                        <Grid item xs={12} md={3}>
                            <Box sx={{ position: 'sticky', top: 120 }}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', mb: 2, display: 'block' }}>
                                    ON THIS PAGE
                                </Typography>
                                <Stack spacing={1}>
                                    {['Core Framework', 'RAG Metrics', 'Agent Metrics', 'Decision Engine', 'Models & API', 'Contact Support'].map((item) => (
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
                                                document.getElementById(item.toLowerCase().replace(/ /g, '-'))?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            {item}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Main Content */}
                        <Grid item xs={12} md={9}>
                            <Stack spacing={8}>

                                {/* 1. Core Framework */}
                                <Box id="core-framework">
                                    <SectionHeader icon={<Layers size={24} />} title="Core Framework" />
                                    <Typography variant="body1" paragraph color="text.secondary">
                                        Nexus Eval is an enterprise-grade evaluation suite designed to benchmark Large Language Model applications.
                                        It operates across two primary domains:
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <DocCard
                                                title="RAG EVAL"
                                                icon={<Activity size={20} />}
                                                content="Specialized pipeline for Retrieval-Augmented Generation. Measures the health of your retrieval system and the faithfulness of generated responses."
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <DocCard
                                                title="AGENT EVAL"
                                                icon={<Brain size={20} />}
                                                content="Framework for multi-step autonomous agents. Focuses on planning consistency, tool usage accuracy, and hallucination rates."
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>

                                {/* 2. RAG Metrics */}
                                <Box id="rag-metrics">
                                    <SectionHeader icon={<Activity size={24} />} title="RAG Evaluation Metrics" />
                                    <Stack spacing={3}>
                                        <MetricDetail
                                            title="RQS (Retrieval Quality Score)"
                                            description="The master index of RAG performance. A weighted composite of Similarity, Faithfulness, Relevancy, and Context Health."
                                            formula="RQS = (α * Sim) + (β * Faith) + (γ * Rel) + (δ * Context)"
                                            example="If weights sum to 0.8, the remaining 0.2 is automatically assigned to Context Health to penalize retrieval noise."
                                        />
                                        <MetricDetail
                                            title="Faithfulness (Groundedness)"
                                            description="Measures how accurately the bot's response is supported by the retrieved context."
                                            example="User asks for Q3 profit. Bot says $50M. Source says $40M. -> Faithfulness = 0.0 (Hallucination detected)."
                                        />
                                        <MetricDetail
                                            title="Context Precision vs. Recall"
                                            description="Precision measures 'signal-to-noise' (correct chunks at top), while Recall measures 'coverage' (finding the answer at all)."
                                        />
                                    </Stack>
                                </Box>

                                {/* 3. Agent Metrics */}
                                <Box id="agent-metrics">
                                    <SectionHeader icon={<Brain size={24} />} title="Agent Evaluation Metrics" />
                                    <Stack spacing={3}>
                                        <MetricDetail
                                            title="Accuracy (Factual Correctness)"
                                            description="Binary decision (0% or 100%) determining if an output is correct based on the expected type (JSON, Number, or Text)."
                                        />
                                        <MetricDetail
                                            title="Consistency"
                                            description="Cross-run: How similar are outputs for the same query? Internal: How coherent are sentences within a single output?"
                                        />
                                        <MetricDetail
                                            title="Toxicity"
                                            description="Measures harmful, offensive, or biased content (0.0 - 1.0) using BERT-based safety classifiers."
                                        />
                                    </Stack>
                                </Box>

                                {/* 4. Decision Engine */}
                                <Box id="decision-engine">
                                    <SectionHeader icon={<Zap size={24} />} title="The Decision Engine" />
                                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Typography variant="h6" gutterBottom fontWeight={800}>Text Accuracy Logic</Typography>
                                        <Typography variant="body2" paragraph color="text.secondary">
                                            For free-text responses, we use a multi-stage decision tree to ensure factual correctness beyond simple keyword matching:
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            <StepItem step="1" title="Exact Match" desc="Case-insensitive equality check. If true, Accuracy = 100%." />
                                            <StepItem step="2" title="Semantic check" desc="Cosine similarity > 0.72. If false, Accuracy = 0%." />
                                            <StepItem step="3" title="Entity Verification" desc="NER cross-check. If entities (dates, names) mismatch (< 0.5), Accuracy = 0% even if semantic score is high." />
                                            <StepItem step="4" title="LLM Judge (Optional)" desc="Qualitative override using GPT-4o for nuanced reasoning." />
                                        </Stack>
                                    </Paper>
                                </Box>

                                {/* 5. Models & API */}
                                <Box id="models-&-api">
                                    <SectionHeader icon={<Cpu size={24} />} title="Models & Infrastructure" />
                                    <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.03)' }}>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 800 }}>Model</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>Primary Metric</TableCell>
                                                    <TableCell sx={{ fontWeight: 800 }}>Provider</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {[
                                                    { name: 'all-MiniLM-L12-v2', metric: 'Semantic Similarity', provider: 'HuggingFace' },
                                                    { name: 'gpt-4o', metric: 'LLM Judge / Reasoning', provider: 'Azure OpenAI' },
                                                    { name: 'toxic-bert', metric: 'Toxicity', provider: 'Unitary' },
                                                    { name: 'BERTScore', metric: 'Contextual Precision', provider: 'RoBERTa' }
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
                                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                        <Button variant="outlined" startIcon={<Code />} href="http://localhost:8000/docs" target="_blank">Swagger UI</Button>
                                        <Button variant="outlined" startIcon={<Terminal />} href="http://localhost:8000/redoc" target="_blank">ReDoc</Button>
                                    </Box>
                                </Box>

                                {/* 6. Contact Support */}
                                <Box id="contact-support">
                                    <SectionHeader icon={<Mail size={24} />} title="Technical Ownership" />
                                    <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(230, 0, 0, 0.03)', border: '1px solid rgba(230, 0, 0, 0.1)' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar src="/Aniket.jpeg" sx={{ width: 80, height: 80, border: '2px solid #E60000' }} />
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
        </ThemeRegistry>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#E60000', 0.1), color: '#E60000' }}>
                {icon}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>{title}</Typography>
        </Box>
    );
}

function DocCard({ title, icon, content }: { title: string, icon: React.ReactNode, content: string }) {
    return (
        <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', '&:hover': { border: '1px solid rgba(230,0,0,0.3)', transform: 'translateY(-2px)' } }}>
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
        <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'transparent' }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>{title}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>{description}</Typography>
            {formula && (
                <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 2, borderLeft: '3px solid #E60000' }}>
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
