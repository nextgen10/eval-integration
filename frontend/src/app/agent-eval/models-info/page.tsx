'use client';
import React from 'react';
import { Box, Typography, Paper, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Tooltip } from '@mui/material';

import GavelIcon from '@mui/icons-material/Gavel';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ApiIcon from '@mui/icons-material/Api';
import DescriptionIcon from '@mui/icons-material/Description';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CodeIcon from '@mui/icons-material/Code';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import { useSidebar } from '../contexts/SidebarContext';

export default function ModelsInfoPage() {
    const { sidebarWidth } = useSidebar();

    const unifiedData = [
        {
            name: "all-MiniLM-L12-v2",
            metrics: ["Semantic Similarity"],
            provider: "HuggingFace",
            cost: "Free",
            description: "Maps sentences to a 384-dimensional dense vector space for similarity comparison.",
            icon: <PsychologyIcon fontSize="small" sx={{ color: '#673ab7' }} />
        },
        {
            name: "gpt-4o",
            metrics: ["LLM Judge (Correctness)", "Consistency", "Completeness", "Relevance", "Clarity", "Coherence", "Contextual Relevance", "Factuality", "Safety"],
            provider: "Azure OpenAI",
            cost: "Paid",
            description: "Evaluates complex outputs for correctness, coherence, and relevance using advanced reasoning.",
            icon: <GavelIcon fontSize="small" sx={{ color: '#2196f3' }} />
        },
        {
            name: "unitary/toxic-bert",
            metrics: ["Toxicity"],
            provider: "HuggingFace",
            cost: "Free",
            description: "BERT-based model fine-tuned to detect toxic content and hate speech.",
            icon: <HealthAndSafetyIcon fontSize="small" sx={{ color: '#f44336' }} />
        },
        {
            name: "BERTScore",
            metrics: ["Precision", "Recall", "F1"],
            provider: "HuggingFace / BERTScore",
            cost: "Free",
            description: "Computes similarity using contextual embeddings (RoBERTa default) to capture meaning beyond exact matches.",
            icon: <CompareArrowsIcon fontSize="small" sx={{ color: '#e91e63' }} />
        },
        {
            name: "ROUGE",
            metrics: ["ROUGE-1", "ROUGE-2", "ROUGE-L"],
            provider: "Google Research (Open Source)",
            cost: "Free",
            description: "Measures n-gram overlap (unigrams, bigrams, longest common subsequence) between candidate and reference.",
            icon: <CodeIcon fontSize="small" sx={{ color: '#795548' }} />
        },
        {
            name: "SacreBLEU",
            metrics: ["BLEU Score"],
            provider: "SacreBLEU",
            cost: "Free",
            description: "Standard machine translation metric based on n-gram precision with a brevity penalty.",
            icon: <CodeIcon fontSize="small" sx={{ color: '#607d8b' }} />
        },
        {
            name: "METEOR",
            metrics: ["METEOR Score"],
            provider: "NLTK",
            cost: "Free",
            description: "Harmonic mean of unigram precision and recall, with stemming and synonym matching.",
            icon: <CodeIcon fontSize="small" sx={{ color: '#9c27b0' }} />
        },
        {
            name: "String Match",
            metrics: ["Accuracy (Exact Match)"],
            provider: "Built-in Logic",
            cost: "Free",
            description: "Performs strict equality checks (case-insensitive) for ID fields and categorical data.",
            icon: <CodeIcon fontSize="small" sx={{ color: '#4caf50' }} />
        },
        {
            name: "Spacy / NLTK",
            metrics: ["Entity Match"],
            provider: "Open Source Libs",
            cost: "Free",
            description: "Extracts named entities (Person, Org, etc.) to verify their presence in the output.",
            icon: <SpellcheckIcon fontSize="small" sx={{ color: '#ff9800' }} />
        }
    ];

    const apiLinks = [
        { name: "Swagger UI", url: "http://localhost:8000/docs", icon: <ApiIcon fontSize="small" /> },
        { name: "API Docs", url: "http://localhost:8000/redoc", icon: <DescriptionIcon fontSize="small" /> }
    ];

    const currentData = unifiedData;

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'margin-left 0.3s ease-in-out' }}>

                {/* Header Area */}
                <Box sx={{ height: '70px', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                            Models & API Information
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Comprehensive overview of models, their associated metrics.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {apiLinks.map((link, index) => (
                            <Button
                                key={index}
                                variant="outlined"
                                size="small"
                                startIcon={link.icon}
                                endIcon={<OpenInNewIcon fontSize="small" />}
                                href={link.url}
                                target="_blank"
                                sx={{ textTransform: 'none' }}
                            >
                                {link.name}
                            </Button>
                        ))}
                        <ThemeToggle />
                    </Box>
                </Box>


                {/* Content Area */}
                <Box sx={{ p: 2, pb: 5, flexGrow: 1, overflow: 'hidden' }}>
                    <Paper variant="outlined" sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <TableContainer sx={{ flexGrow: 1, overflow: 'hidden' }}>
                            <Table size="small" stickyHeader sx={{ height: '100%' }}>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'background.paper' }}>
                                        <TableCell sx={{ fontWeight: 'bold', width: '25%', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>MODEL NAME</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '45%', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>METRICS TYPE</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', width: '20%', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>PROVIDER</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', width: '10%', borderBottom: '1px solid', borderColor: 'divider', py: 2 }}>COST</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentData.map((row, index) => (
                                        <TableRow key={index} hover sx={{ '& td, & th': { borderBottom: '1px solid', borderColor: 'divider' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                                            <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                                                <Tooltip
                                                    title={row.description}
                                                    arrow
                                                    placement="right"
                                                    enterDelay={300}
                                                    sx={{ cursor: 'help' }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'help' }}>
                                                        {row.icon}
                                                        <Typography variant="body2" fontWeight="bold">{row.name}</Typography>
                                                    </Box>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {row.metrics.map((metric, i) => (
                                                        <Chip
                                                            key={i}
                                                            label={metric}
                                                            size="small"
                                                            color="secondary"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem', height: '20px' }}
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ py: 1.5 }}>
                                                <Typography variant="body2" color="text.secondary">{row.provider}</Typography>
                                            </TableCell>
                                            <TableCell align="center" sx={{ py: 1.5 }}>
                                                <Chip
                                                    label={row.cost}
                                                    color={row.cost === 'Free' ? 'success' : 'warning'}
                                                    size="small"
                                                    variant={row.cost === 'Free' ? 'outlined' : 'filled'}
                                                    sx={{ fontWeight: 'bold', minWidth: 60, height: '20px', fontSize: '0.7rem' }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
