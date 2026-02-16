'use client';
import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Divider, Chip, alpha } from '@mui/material';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
import GavelIcon from '@mui/icons-material/Gavel';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SchoolIcon from '@mui/icons-material/School';
import { useSidebar } from '../contexts/SidebarContext';

export default function AboutPage() {
    const { sidebarWidth } = useSidebar();

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'margin-left 0.3s ease-in-out' }}>
                {/* Header */}
                <Box sx={{ p: 2, height: '70px', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper' }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            About the Framework
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Comprehensive Guide to Evaluation Metrics
                        </Typography>
                    </Box>
                    <ThemeToggle />
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, pb: 5 }}>
                    <Grid container spacing={2}>
                        {/* Full Width Column: Metrics Descriptions */}
                        <Grid size={{ xs: 12, md: 12 }}>

                            {/* Core Metrics Section */}
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <SchoolIcon /> Core Evaluation Metrics
                            </Typography>
                            {/* <Divider sx={{ mb: 3 }} /> */}

                            <Grid container spacing={2}>
                                {/* RQS */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Response Quality Score (RQS)"
                                        icon={<PsychologyIcon fontSize="large" sx={{ color: '#2196f3' }} />}
                                        color="#2196f3"
                                        description="The primary composite score representing the overall quality of the agent's output. It aggregates Accuracy, Consistency, and PDF Grounding into a single holistic metric."
                                        formula="RQS = (α × Accuracy) + (β × Consistency) + (γ × PDF_Support)"
                                        notes="Weights α, β, γ are configurable (Default: 0.6, 0.2, 0.2)."
                                    />
                                </Grid>

                                {/* Accuracy */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Accuracy"
                                        icon={<CheckCircleIcon fontSize="large" sx={{ color: '#673ab7' }} />}
                                        color="#673ab7"
                                        description="Measures the correctness of the answer against the Ground Truth. It dynamically switches between Exact Match (for numbers/dates) and Semantic Similarity (for text)."
                                        formula="Score = 1.0 if Exact Match OR Cosine_Sim(Output, GT) > Threshold"
                                        notes="Semantic Threshold default: 0.72. Supports fuzzy matching."
                                    />
                                </Grid>

                                {/* Consistency */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Consistency"
                                        icon={<TimelineIcon fontSize="large" sx={{ color: '#009688' }} />}
                                        color="#009688"
                                        description="Evaluates the stability and reliability of the agent. For multiple runs, it checks if the agent produces similar answers. For single runs, it checks internal logical consistency."
                                        formula="Consistency = Average(Cosine_Sim(Run_i, Run_j)) ∀ i,j pairs"
                                        notes="High consistency implies the agent is deterministic and confident."
                                    />
                                </Grid>

                                {/* Hallucination Rate */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Hallucination Rate"
                                        icon={<WarningIcon fontSize="large" sx={{ color: '#f44336' }} />}
                                        color="#f44336"
                                        description="The percentage of generated answers that are not supported by the source context (PDF) or are factually incorrect compared to the Ground Truth."
                                        formula="Rate = (Count(Hallucinations) / Total Queries) × 100%"
                                        notes="Lower is better. A hallucination is flagged if the answer contradicts the PDF context."
                                    />
                                </Grid>
                            </Grid>

                            {/* Advanced NLP Metrics Section */}
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main', mt: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextFieldsIcon /> Advanced NLP Metrics
                            </Typography>
                            {/* <Divider sx={{ mb: 3 }} /> */}

                            <Grid container spacing={2}>
                                {/* LLM Judge */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="LLM Judge"
                                        icon={<GavelIcon fontSize="large" sx={{ color: '#e91e63' }} />}
                                        color="#e91e63"
                                        description="Uses a powerful LLM (e.g., GPT-4) to act as a human evaluator. It grades the response based on relevance, completeness, and tone."
                                        formula="Score (0.0 - 1.0) based on predefined rubric prompts"
                                        notes="Requires an API key. Highly accurate but slower and costlier."
                                    />
                                </Grid>

                                {/* Semantic Similarity */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Semantic Similarity"
                                        icon={<CompareArrowsIcon fontSize="large" sx={{ color: '#ff9800' }} />}
                                        color="#ff9800"
                                        description="Uses embedding models (e.g., all-MiniLM-L12-v2) to convert text into vectors and calculates the cosine angle between them."
                                        formula="Cosine_Sim(A, B) = (A · B) / (||A|| ||B||)"
                                        notes="Captures meaning rather than just keyword overlap."
                                    />
                                </Grid>

                                {/* Entity Matching (NER) */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Entity Matching (NER)"
                                        icon={<Typography variant="h6" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>EM</Typography>}
                                        color="#9c27b0"
                                        description="Uses Named Entity Recognition to extract and compare entities (people, places, organizations, dates) between expected and actual outputs. Detects factual errors that may have high semantic similarity but different facts."
                                        formula="Entity Match Score = (Matching Entities) / (Total Unique Entities)"
                                        notes="Helps catch hallucinations like 'Paris' vs 'Berlin' despite high semantic similarity. Score < 0.5 overrides semantic similarity to mark as incorrect."
                                    />
                                </Grid>

                                {/* BERTScore */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="BERTScore"
                                        icon={<Typography variant="h6" sx={{ fontWeight: 'bold', color: '#795548' }}>BS</Typography>}
                                        color="#795548"
                                        description="Computes similarity using contextual embeddings from BERT. It aligns tokens in the candidate sentence with those in the reference sentence."
                                        formula="F1 Score of soft token alignments"
                                        notes="Robust to paraphrasing and word order changes."
                                    />
                                </Grid>

                                {/* ROUGE / BLEU / METEOR */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <MetricCard
                                        title="Traditional Metrics (ROUGE, BLEU, METEOR)"
                                        icon={<Typography variant="h6" sx={{ fontWeight: 'bold', color: '#607d8b' }}>TR</Typography>}
                                        color="#607d8b"
                                        description={
                                            <Box>
                                                <Typography variant="body1" paragraph>
                                                    N-gram based metrics commonly used in translation and summarization. While less semantically aware, they provide a baseline for structural similarity.
                                                </Typography>
                                                <ul style={{ paddingLeft: '20px', margin: 0 }}>
                                                    <li><strong>ROUGE (Recall-Oriented Understudy for Gisting Evaluation):</strong> Measures overlap of N-grams, LCS (Longest Common Subsequence), and skip-bigrams. Focuses on recall (how much of the reference is captured).</li>
                                                    <li><strong>BLEU (Bilingual Evaluation Understudy):</strong> Precision-based metric that counts matching N-grams. Penalizes brevity to prevent short, high-precision answers.</li>
                                                    <li><strong>METEOR (Metric for Evaluation of Translation with Explicit ORdering):</strong> Improves on BLEU by using stemming and synonym matching (via WordNet) to handle linguistic variations better.</li>
                                                </ul>
                                            </Box>
                                        }
                                        formula="ROUGE-L (LCS) | BLEU (Precision) | METEOR (Alignment)"
                                        notes="Good for surface-level text overlap but may miss semantic meaning."
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box >
    );
}

function MetricCard({ title, icon, color, description, formula, notes }: any) {
    return (
        <Card sx={{ borderLeft: `6px solid ${color}`, boxShadow: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {icon}
                    <Typography variant="h6" sx={{ color: color, fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ mb: 1 }}>
                    {description}
                </Box>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontFamily: 'monospace', fontSize: '0.85rem', mb: 1 }}>
                    <strong>Formula:</strong> {formula}
                </Paper>
                {notes && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InfoIcon fontSize="inherit" /> {notes}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}

import InfoIcon from '@mui/icons-material/Info';
