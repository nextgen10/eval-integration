"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Grid,
  Button
} from '@mui/material';
import {
  Scale,
  Rocket,
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Terminal,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- Theme Definition ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#fff',
    },
    background: {
      default: '#000',
      paper: '#0A0A0A',
    },
    text: {
      primary: '#EDEDED',
      secondary: '#A1A1AA',
    }
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: { fontSize: '4rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 },
    h2: { fontSize: '2.5rem', fontWeight: 600, letterSpacing: '-0.02em' },
    h3: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
    body1: { fontSize: '1.05rem', lineHeight: 1.6, color: '#A1A1AA' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
        }
      }
    }
  }
});

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: '#000',
        color: '#fff',
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
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          bgcolor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)'
        }}>
          <Container maxWidth="xl" sx={{ height: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <motion.div
                animate={{ rotate: [0, 15, -15, 15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Scale size={20} color="#fff" />
              </motion.div>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>NEXUS EVAL</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Platform</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Solutions</Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { color: '#fff' }, transition: 'color 0.2s' }}>Enterprise</Typography>
            </Box>
            <Box>
              <Button variant="outlined" sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#fff',
                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
              }}>
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
          // borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: `
            linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 100%),
            url('/images/enterprise-bg.png')
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          <Container maxWidth="lg">
            <Grid container spacing={8} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >

                  <Typography variant="h1" sx={{ mb: 3 }}>
                    The Enterprise Standard for <br />
                    <span style={{
                      background: 'linear-gradient(to right, #fff, #94a3b8)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>AI Evaluation</span>.
                  </Typography>
                  <Typography variant="body1" sx={{ fontSize: '1.25rem', maxWidth: 600, mb: 5 }}>
                    Nexus Eval provides the rigorous testing infrastructure required to deploy Large Language Models and Autonomous Agents with confidence.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" size="large" sx={{
                      bgcolor: '#fff',
                      color: '#000',
                      height: 52,
                      '&:hover': { bgcolor: '#e2e2e2' }
                    }}>
                      Start Evaluating
                    </Button>
                    <Button variant="outlined" size="large" endIcon={<ChevronRight />} sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      height: 52,
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
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
        <Container maxWidth="xl" sx={{ py: 4, mt: { xs: 0, md: -20 }, position: 'relative', zIndex: 10 }}>
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
                  bgcolor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.2)'
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
                  <Typography variant="h3" sx={{ mb: 1 }}>RAG EVAL</Typography>
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
                  bgcolor: '#0a0a0a',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 4,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.2)'
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
                  <Typography variant="h3" sx={{ mb: 1 }}>AGENT EVAL</Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 15, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Scale size={20} color="#fff" />
                  </motion.div>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>NEXUS EVAL</Typography>
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
    </ThemeProvider>
  );
}
