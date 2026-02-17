"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  alpha,
  Stack
} from '@mui/material';
import {
  Rocket,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Terminal,
  ArrowRight,
  Brain
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- Theme Definition ---
import ThemeRegistry from '../components/ThemeRegistry';
import ThemeToggle from './agent-eval/components/ThemeToggle';

import { UbsLogo } from '../components/UbsLogo';

const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

export default function NexusEvalLanding() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <ThemeRegistry>
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflowX: 'hidden',
        position: 'relative'
      }}>

        {/* Navigation */}
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          bgcolor: 'background.default',
          background: (theme) => alpha(theme.palette.background.default, 0.7),
          backdropFilter: 'blur(12px)'
        }}>
          <Container maxWidth="xl" sx={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <UbsLogo size={32} color="#E60000" />
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary', whiteSpace: 'nowrap' }}>
                NEXUS <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Platform</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Solutions</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Enterprise</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ThemeToggle />
              <Button
                variant="outlined"
                onClick={() => router.push('/docs')}
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(239,68,68,0.05)' }
                }}
              >
                Documentation
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box sx={{
          pt: 18,
          pb: { xs: 12, md: 32 },
          position: 'relative',
          background: (theme) => theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.05) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.05) 0%, transparent 50%)'
            : 'radial-gradient(circle at 100% 100%, rgba(239, 68, 68, 0.03) 0%, transparent 50%), radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.03) 0%, transparent 50%)',
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >

                  <Typography variant="h1" sx={{ mb: 3, fontWeight: 800, letterSpacing: '-0.04em', color: 'text.primary' }}>
                    The Enterprise Standard <br />
                    <Box component="span" sx={{ color: 'primary.main' }}>AI for AI Assurance</Box>.
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.25rem', maxWidth: 600, mb: 5, color: 'text.secondary' }}>
                    The Enterprise Standard for rigorous testing infrastructure. Deploy Large Language Models and Autonomous Agents with confidence.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" size="large" sx={{
                      height: 52,
                      px: 4
                    }} onClick={() => {
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Start Evaluating
                    </Button>
                    <Button variant="outlined" size="large" endIcon={<ChevronRight />} sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      height: 52,
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(239,68,68,0.05)' }
                    }}>
                      View Demo
                    </Button>
                  </Box>
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Products Section */}
        <Container id="products-section" maxWidth="xl" sx={{
          py: 4,
          mt: { xs: 0, md: -20 },
          position: 'relative',
          zIndex: 10,
          scrollMarginTop: '100px'
        }}>
          <Typography variant="overline" sx={{ display: 'block', mb: 4, letterSpacing: '0.1em', color: '#A1A1AA', fontWeight: 700, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            CORE PLATFORM
          </Typography>
          <Grid container spacing={4}>

            {/* RAG EVAL Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionPaper
                whileHover={{ y: -5 }}
                onClick={() => router.push('/rag-eval')}
                sx={{
                  p: 6,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Box sx={{ mb: 4 }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <Activity size={24} color="#fff" />
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, whiteSpace: 'nowrap' }}>RAG <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                  <Typography variant="body1">
                    Advanced observability for Retrieval-Augmented Generation. Measure drift, hallucination rates, and retrieval precision in real-time.
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Zap size={16} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ display: 'block', color: '#A1A1AA' }}>Latency Analysis</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>P99 Tracking</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <ShieldCheck size={16} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ display: 'block', color: '#A1A1AA' }}>Safety Guidelines</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Toxicity Check</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  Launch Console <ArrowRight size={16} />
                </Box>
              </MotionPaper>
            </Grid>

            {/* AGENT EVAL Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <MotionPaper
                whileHover={{ y: -5 }}
                onClick={() => router.push('/agent-eval')}
                sx={{
                  p: 6,
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-8px)',
                    boxShadow: (theme) => `0 20px 40px ${alpha(theme.palette.primary.main, 0.1)}`
                  }
                }}
              >
                <Box sx={{
                  position: 'absolute',
                  top: 24,
                  right: 24,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 100,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>BETA</Typography>
                </Box>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{
                    width: 50,
                    height: 50,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <Rocket size={24} color="#fff" />
                  </Box>
                  <Typography variant="h3" sx={{ mb: 1, whiteSpace: 'nowrap' }}>AGENT <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                  <Typography variant="body1">
                    Evaluation framework for multi-step autonomous agents. Analyze tool usage, planning logic, and state management consistency.
                  </Typography>
                </Box>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <Terminal size={16} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ display: 'block', color: '#A1A1AA' }}>Tool Usage</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Function Calling</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <BarChart3 size={16} style={{ marginBottom: 8, opacity: 0.5 }} />
                      <Typography variant="caption" sx={{ display: 'block', color: '#A1A1AA' }}>Success Rate</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Goal Completion</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>
                  Launch Console <ArrowRight size={16} />
                </Box>
              </MotionPaper>
            </Grid>

          </Grid>
        </Container>

        {/* Documentation Section */}
        <Container id="documentation-section" maxWidth="xl" sx={{ py: 12, scrollMarginTop: '100px' }}>
          <Stack spacing={8}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.1em' }}>
                METHODOLOGY
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 900, mt: 2, mb: 3 }}>
                How We <Box component="span" sx={{ color: 'primary.main' }}>Evaluate</Box>
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
                Nexus Eval uses a proprietary blend of semantic similarity, named entity verification,
                and LLM-based reasoning to provide high-fidelity accuracy scores.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(230,0,0,0.1)', color: 'primary.main' }}>
                      <Activity size={24} />
                    </Box>
                    <Typography variant="h5" fontWeight={800}>RAG Benchmarks</Typography>
                  </Box>
                  <Stack spacing={4}>
                    <MetricItem
                      title="RQS (Retrieval Quality Score)"
                      desc="A composite index measuring the end-to-end health of RAG systems."
                    />
                    <MetricItem
                      title="Faithfulness"
                      desc="Ensures the model output is grounded in retrieved context to prevent hallucination."
                    />
                    <MetricItem
                      title="Answer Relevancy"
                      desc="Measures how well the answer addresses the user's original intent."
                    />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 4, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(230,0,0,0.1)', color: 'primary.main' }}>
                      <Brain size={24} />
                    </Box>
                    <Typography variant="h5" fontWeight={800}>Agent Performance</Typography>
                  </Box>
                  <Stack spacing={4}>
                    <MetricItem
                      title="Decision Consistency"
                      desc="Evaluates if an agent performs the same reasoning steps for identical tasks."
                    />
                    <MetricItem
                      title="Tool Usage Accuracy"
                      desc="Measures the precision of function calls and external data retrieval."
                    />
                    <MetricItem
                      title="Toxicity & Safety"
                      desc="BERT-based safety classifiers detect harmful or biased generated content."
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/docs')}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(230,0,0,0.05)' }
                }}
              >
                View Full Documentation & Formulas
              </Button>
            </Box>
          </Stack>
        </Container>

        {/* Feature Strip */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: 8, bgcolor: '#050505' }}>
          <Container maxWidth="xl">
            <Typography variant="overline" sx={{ display: 'block', mb: 6, textAlign: 'center', color: '#525252' }}>
              TRUSTED BY ENGINEERING TEAMS AT
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 8, opacity: 0.4, flexWrap: 'wrap' }}>
              {/* Imaginary Logos represented by text for now, could be SVG paths */}
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em' }}>ACME_CORP</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em' }}>OBSIDIAN</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em' }}>NEBULA.AI</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em' }}>QUANTUM</Typography>
              <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: '-0.05em' }}>VERTEX</Typography>
            </Box>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.08)', py: 8 }}>
          <Container maxWidth="xl">
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <UbsLogo size={32} color="#E60000" />
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', whiteSpace: 'nowrap' }}>NEXUS <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  The future of reliable AI infrastructure. Built for scale.
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>Product</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Diagnostics</Typography>
                  <Typography variant="body2" color="text.secondary">Agents</Typography>
                  <Typography variant="body2" color="text.secondary">Pricing</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>Resources</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Documentation</Typography>
                  <Typography variant="body2" color="text.secondary">API Reference</Typography>
                  <Typography variant="body2" color="text.secondary">Community</Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>Company</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">About</Typography>
                  <Typography variant="body2" color="text.secondary">Blog</Typography>
                  <Typography variant="body2" color="text.secondary">Careers</Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © 2026 Nexus Eval Inc. All rights reserved.
              </Typography>
            </Box>
          </Container>
        </Box>

      </Box>
    </ThemeRegistry>
  );
}

function MetricItem({ title, desc }: { title: string; desc: string }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{desc}</Typography>
    </Box>
  );
}
