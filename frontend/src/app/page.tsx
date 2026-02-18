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
  Stack,
  useTheme
} from '@mui/material';
import {
  Activity,
  ChevronRight,
  ShieldCheck,
  Zap,
  BarChart3,
  ArrowRight,
  Brain,
  FileSpreadsheet,
  GitCompare,
  FileJson,
  Download,
  Target,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  MessageCircle,
  Gauge,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import ThemeToggle from '@/components/ThemeToggle';
import { UbsLogoFull } from '../components/UbsLogoFull';
import { BrandPipe } from '@/components/BrandPipe';
import { UnifiedNavBar } from '@/components/UnifiedNavBar';

const MotionPaper = motion(Paper);

export default function NexusEvalLanding() {
  const router = useRouter();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <Box sx={{
        minHeight: '100vh',
        width: '100vw',
        bgcolor: 'background.default',
        color: 'text.primary',
        overflowX: 'hidden',
        position: 'relative'
      }}>

        <UnifiedNavBar
          title="NEXUS EVAL"
          items={[
            { id: 'platforms', label: 'Platforms', onClick: () => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { id: 'methodology', label: 'Methodology', onClick: () => document.getElementById('methodology-section')?.scrollIntoView({ behavior: 'smooth' }) },
            { id: 'capabilities', label: 'Capabilities', onClick: () => document.getElementById('capabilities-section')?.scrollIntoView({ behavior: 'smooth' }) },
          ]}
          onLogoClick={() => router.push('/')}
          actions={
            <>
              <Button
                variant="outlined"
                onClick={() => router.push('/docs')}
                sx={{
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' }
                }}
              >
                Documentation
              </Button>
              <ThemeToggle />
            </>
          }
        />

        {/* Hero Section */}
        <Box sx={{
          pt: { xs: 6, md: 4 },
          pb: { xs: 10, md: 16 },
          position: 'relative',
          bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'background.default',
        }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Badge */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}>
                    <Box sx={{
                      display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, mb: 4,
                      borderRadius: 5, border: '1px solid', borderColor: 'divider',
                      bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                    }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#1F8A70', animation: 'pulse 2s infinite' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: '0.04em', fontSize: '0.7rem' }}>
                        ENTERPRISE AI EVALUATION PLATFORM
                      </Typography>
                    </Box>
                  </motion.div>

                  <Typography variant="h1" sx={{
                    mb: 3, fontWeight: 700, letterSpacing: '-0.03em', color: 'text.primary',
                    fontSize: { xs: '2.25rem', sm: '2.75rem', md: '3.25rem' }, lineHeight: 1.15,
                  }}>
                    Enterprise-Grade{' '}
                    <br />
                    Evaluation for{' '}
                    <Box component="span" sx={{ color: 'primary.main' }}>RAG Pipelines</Box>
                    {' & '}
                    <Box component="span" sx={{ color: 'primary.main' }}>AI Agents</Box>.
                  </Typography>

                  <Typography variant="h6" sx={{
                    fontSize: { xs: '1rem', md: '1.15rem' }, maxWidth: 560, mb: 5,
                    color: 'text.secondary', fontWeight: 400, lineHeight: 1.7,
                  }}>
                    Benchmark your Retrieval-Augmented Generation systems and autonomous agents with rigorous metrics.
                    Upload datasets, compare architectures, and export production-ready reports.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 6 }}>
                    <Button variant="contained" color="primary" size="large" sx={{
                      height: 52, px: 4.5, fontSize: '0.95rem', fontWeight: 600, borderRadius: 2,
                      boxShadow: '0 4px 14px rgba(208,0,0,0.25)',
                      '&:hover': { boxShadow: '0 6px 20px rgba(208,0,0,0.35)' },
                    }} onClick={() => {
                      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}>
                      Start Evaluating
                    </Button>
                    <Button variant="outlined" size="large" endIcon={<ChevronRight />} sx={{
                      borderColor: 'divider', color: 'text.primary', height: 52, px: 4,
                      fontSize: '0.95rem', fontWeight: 500, borderRadius: 2,
                      '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' }
                    }}>
                      View Demo
                    </Button>
                  </Box>

                  {/* Trust stats */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>
                    <Box sx={{ display: 'flex', gap: { xs: 3, md: 5 }, flexWrap: 'wrap' }}>
                      {[
                        { value: '15+', label: 'Evaluation Metrics' },
                        { value: 'Multi-Bot', label: 'Architecture Compare' },
                        { value: 'RQS', label: 'Composite Scoring' },
                      ].map((stat) => (
                        <Box key={stat.label}>
                          <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem', lineHeight: 1 }}>{stat.value}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{stat.label}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </motion.div>
                </motion.div>
              </Grid>

              {/* Hero Visual — animated orbital visualization */}
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ position: 'relative', width: '100%', height: 580, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                  {/* Background sparkles */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                      key={`spark-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
                      transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                      style={{
                        position: 'absolute',
                        left: `${10 + (i * 7.3) % 80}%`,
                        top: `${5 + (i * 11.7) % 90}%`,
                        width: 3 + (i % 3),
                        height: 3 + (i % 3),
                        borderRadius: '50%',
                        background: i % 3 === 0 ? '#D00000' : i % 3 === 1 ? '#2D6CDF' : '#1F8A70',
                      }}
                    />
                  ))}

                  {/* Slowly rotating orbit rings with pulsing opacity */}
                  {[120, 180, 240].map((r, i) => (
                    <motion.div
                      key={r}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? 360 : -360 }}
                      transition={{
                        opacity: { delay: 0.2 + i * 0.15, duration: 0.6 },
                        scale: { delay: 0.2 + i * 0.15, duration: 0.6 },
                        rotate: { duration: 60 + i * 20, repeat: Infinity, ease: 'linear' },
                      }}
                      style={{ position: 'absolute', width: r * 2, height: r * 2, borderRadius: '50%', border: `1px dashed ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)'}` }}
                    />
                  ))}

                  {/* Pulsing glow halos behind center */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={`glow-${i}`}
                      animate={{ scale: [1, 1.6 + i * 0.3, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1 }}
                      style={{
                        position: 'absolute', zIndex: 1,
                        width: 110, height: 110, borderRadius: '50%',
                        background: `radial-gradient(circle, ${isLight ? 'rgba(208,0,0,0.12)' : 'rgba(208,0,0,0.2)'} 0%, transparent 70%)`,
                      }}
                    />
                  ))}

                  {/* Central hub — breathing + rotating border */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
                    style={{ position: 'absolute', zIndex: 5 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.06, 1], rotate: [0, 360] }}
                      transition={{
                        scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                        rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
                      }}
                      style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `2px dashed ${isLight ? 'rgba(208,0,0,0.15)' : 'rgba(208,0,0,0.25)'}` }}
                    />
                    <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                      <Paper elevation={0} sx={{
                        width: 110, height: 110, borderRadius: '50%', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', border: '2px solid', borderColor: 'primary.main',
                        bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(208,0,0,0.1)' : 'rgba(208,0,0,0.04)',
                        boxShadow: (t) => `0 0 50px ${t.palette.mode === 'dark' ? 'rgba(208,0,0,0.3)' : 'rgba(208,0,0,0.15)'}`,
                      }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.65rem', letterSpacing: '0.06em', lineHeight: 1 }}>NEXUS</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '0.65rem', mt: 0.25, letterSpacing: '0.06em', lineHeight: 1 }}>EVAL</Typography>
                      </Paper>
                    </motion.div>
                  </motion.div>

                  {/* Floating metric & feature cards across 3 rings */}
                  {[
                    { icon: <FileSpreadsheet size={14} />, label: 'Upload',            angle: 45,  radius: 120, delay: 0.4, dur: 16, color: '#D9822B' },
                    { icon: <FileJson size={14} />,        label: 'Ingest',            angle: 135, radius: 120, delay: 0.6, dur: 18, color: '#673AB7' },
                    { icon: <GitCompare size={14} />,      label: 'Compare',           angle: 225, radius: 120, delay: 0.8, dur: 17, color: '#1F8A70' },
                    { icon: <Download size={14} />,        label: 'Export',            angle: 315, radius: 120, delay: 1.0, dur: 19, color: '#D9822B' },

                    { icon: <ShieldCheck size={14} />,     label: 'Faithfulness',      angle: 0,   radius: 180, delay: 0.5, dur: 20, color: '#D00000' },
                    { icon: <Target size={14} />,          label: 'Relevancy',         angle: 60,  radius: 180, delay: 0.7, dur: 22, color: '#D00000' },
                    { icon: <Gauge size={14} />,           label: 'Context Precision', angle: 120, radius: 180, delay: 0.9, dur: 21, color: '#D00000' },
                    { icon: <CheckCircle2 size={14} />,    label: 'Correctness',       angle: 180, radius: 180, delay: 1.1, dur: 23, color: '#D00000' },
                    { icon: <MessageCircle size={14} />,   label: 'Answer Relevancy',  angle: 240, radius: 180, delay: 1.3, dur: 20, color: '#D00000' },
                    { icon: <BarChart3 size={14} />,       label: 'RQS Score',         angle: 300, radius: 180, delay: 1.5, dur: 24, color: '#D00000' },

                    { icon: <Target size={14} />,          label: 'Accuracy',          angle: 30,  radius: 240, delay: 0.6, dur: 26, color: '#2D6CDF' },
                    { icon: <AlertTriangle size={14} />,   label: 'Hallucination',     angle: 90,  radius: 240, delay: 0.8, dur: 24, color: '#2D6CDF' },
                    { icon: <ShieldCheck size={14} />,     label: 'Safety Score',      angle: 150, radius: 240, delay: 1.0, dur: 28, color: '#2D6CDF' },
                    { icon: <CheckCircle2 size={14} />,    label: 'Task Completion',   angle: 210, radius: 240, delay: 1.2, dur: 22, color: '#2D6CDF' },
                    { icon: <Wrench size={14} />,          label: 'Tool Usage',        angle: 270, radius: 240, delay: 1.4, dur: 25, color: '#2D6CDF' },
                    { icon: <Brain size={14} />,           label: 'Reasoning',         angle: 330, radius: 240, delay: 1.6, dur: 23, color: '#2D6CDF' },
                  ].map((card) => {
                    const rad = (card.angle * Math.PI) / 180;
                    const x = Math.cos(rad) * card.radius;
                    const y = Math.sin(rad) * card.radius;
                    const sz = 56;
                    return (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: card.delay, duration: 0.5, type: 'spring', stiffness: 120 }}
                        style={{ position: 'absolute', left: `calc(50% + ${x}px - ${sz / 2}px)`, top: `calc(50% + ${y}px - ${sz / 2}px)`, zIndex: 3 }}
                      >
                        <motion.div
                          animate={{
                            y: [0, -7, 0, 3, 0],
                            x: [0, 3, 0, -3, 0],
                            rotate: [0, 2, 0, -2, 0],
                            scale: [1, 1.04, 1, 0.97, 1],
                          }}
                          transition={{ duration: card.dur / 2.5, repeat: Infinity, ease: 'easeInOut', delay: card.delay * 0.4 }}
                        >
                          <Paper elevation={0} sx={{
                            width: sz, height: sz, borderRadius: 2, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', border: '1px solid', borderColor: 'divider',
                            bgcolor: 'background.paper', cursor: 'default', transition: 'all 0.3s ease',
                            '&:hover': { borderColor: card.color, boxShadow: `0 0 20px ${card.color}44`, transform: 'scale(1.1)' },
                          }}>
                            <Box sx={{ color: card.color, display: 'flex' }}>{card.icon}</Box>
                            <Typography variant="caption" sx={{ fontSize: '0.45rem', fontWeight: 700, color: 'text.secondary', mt: 0.25, lineHeight: 1, textAlign: 'center', px: 0.25 }}>{card.label}</Typography>
                          </Paper>
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {/* Orbiting particles — multiple rings, both directions, varied sizes */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const ringSize = [240, 240, 360, 360, 480, 480, 300, 300][i];
                    const dotSize = [5, 4, 6, 3, 4, 5, 3, 4][i];
                    const colors = ['#D00000', '#2D6CDF', '#D00000', '#1F8A70', '#2D6CDF', '#D9822B', '#673AB7', '#D00000'];
                    return (
                      <motion.div
                        key={`orb-${i}`}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 8 + i * 2.5, repeat: Infinity, ease: 'linear', delay: i * 0.8 }}
                        style={{ position: 'absolute', width: ringSize, height: ringSize }}
                      >
                        <motion.div
                          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.3, 0.8] }}
                          transition={{ duration: 2 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                            width: dotSize, height: dotSize, borderRadius: '50%', background: colors[i],
                          }}
                        />
                      </motion.div>
                    );
                  })}

                  {/* Sweeping arc lines */}
                  {[0, 1].map((i) => (
                    <motion.div
                      key={`sweep-${i}`}
                      animate={{ rotate: i === 0 ? 360 : -360 }}
                      transition={{ duration: 15 + i * 10, repeat: Infinity, ease: 'linear' }}
                      style={{ position: 'absolute', width: 360, height: 360 }}
                    >
                      <Box sx={{
                        position: 'absolute', top: 0, left: '50%', width: '50%', height: 1,
                        background: `linear-gradient(to right, transparent, ${i === 0 ? 'rgba(208,0,0,0.15)' : 'rgba(45,108,223,0.12)'}, transparent)`,
                        transformOrigin: 'left center',
                      }} />
                    </motion.div>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Hero-to-content gradient fade */}
        <Box sx={{
          height: 80,
          mt: -10,
          position: 'relative',
          zIndex: 1,
          background: (t) => `linear-gradient(to bottom, ${t.palette.mode === 'light' ? '#F5F7FA' : t.palette.background.default}, ${t.palette.background.default})`,
        }} />

        {/* Products Section */}
        <Container id="products-section" maxWidth="xl" sx={{
          py: 2,
          px: { xs: 2, md: 3 },
          mt: -4,
          position: 'relative',
          zIndex: 10,
          scrollMarginTop: '80px'
        }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 4, letterSpacing: '0.08em', color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
              EVALUATION PLATFORMS
            </Typography>
          </motion.div>
          <Grid container spacing={4}>

            {/* RAG EVAL Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div style={{ height: '100%' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: 0.1 }}>
                <MotionPaper
                  whileHover={{ y: -4 }}
                  onClick={() => router.push('/rag-eval')}
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: (t) => t.palette.mode === 'light' ? '0 8px 30px rgba(208,0,0,0.1)' : '0 8px 30px rgba(208,0,0,0.2)',
                    }
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 2,
                      bgcolor: (t) => t.palette.mode === 'light' ? '#FFE5E5' : alpha(t.palette.primary.main, 0.15),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                    }}>
                      <Activity size={24} color="#D00000" />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1, whiteSpace: 'nowrap', fontWeight: 600 }}>RAG <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Upload Excel datasets to evaluate and compare multiple RAG architectures side-by-side.
                      Measure faithfulness, relevancy, context precision, and retrieval quality with a configurable RQS formula.
                    </Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                        <FileSpreadsheet size={16} style={{ marginBottom: 8, color: '#5B6472' }} />
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Data Input</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Excel Upload</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                        <GitCompare size={16} style={{ marginBottom: 8, color: '#5B6472' }} />
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Architecture</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>Multi-Bot Compare</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontSize: '0.9rem', fontWeight: 600, transition: 'gap 0.2s', '&:hover': { gap: 1.5 } }}>
                    Launch RAG Eval <ArrowRight size={16} />
                  </Box>
                </MotionPaper>
              </motion.div>
            </Grid>

            {/* AGENT EVAL Card */}
            <Grid size={{ xs: 12, md: 6 }}>
              <motion.div style={{ height: '100%' }} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: 0.2 }}>
                <MotionPaper
                  whileHover={{ y: -4 }}
                  onClick={() => router.push('/agent-eval')}
                  elevation={0}
                  sx={{
                    p: 4,
                    height: '100%',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: (t) => t.palette.mode === 'light' ? '0 8px 30px rgba(208,0,0,0.1)' : '0 8px 30px rgba(208,0,0,0.2)',
                    }
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{
                      width: 48, height: 48, borderRadius: 2,
                      bgcolor: (t) => t.palette.mode === 'light' ? '#FFE5E5' : alpha(t.palette.primary.main, 0.15),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2,
                    }}>
                      <Brain size={24} color="#D00000" />
                    </Box>
                    <Typography variant="h4" sx={{ mb: 1, whiteSpace: 'nowrap', fontWeight: 600 }}>AGENT <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      Evaluate autonomous agent outputs against ground truth using JSON or batch workflows.
                      Score accuracy, completeness, hallucination, consistency, and safety with a weighted composite RQS formula.
                    </Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                        <FileJson size={16} style={{ marginBottom: 8, color: '#5B6472' }} />
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Evaluation Mode</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>JSON & Batch</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Box sx={{ p: 2, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                        <ShieldCheck size={16} style={{ marginBottom: 8, color: '#5B6472' }} />
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Content Safety</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>LLM Judge</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontSize: '0.9rem', fontWeight: 600, transition: 'gap 0.2s', '&:hover': { gap: 1.5 } }}>
                    Launch Agent Eval <ArrowRight size={16} />
                  </Box>
                </MotionPaper>
              </motion.div>
            </Grid>

          </Grid>
        </Container>

        {/* Methodology Section */}
        <Container id="methodology-section" maxWidth="xl" sx={{ py: 10, px: { xs: 2, md: 3 }, scrollMarginTop: '80px' }}>
          <Stack spacing={6}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.1em' }}>
                  METHODOLOGY
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 600, mt: 2, mb: 3 }}>
                  How We <Box component="span" sx={{ color: 'primary.main' }}>Evaluate</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.7 }}>
                  Both platforms use a composite Retrieval Quality Score (RQS) built from configurable weighted metrics,
                  powered by semantic embeddings, Ragas, and LLM-based reasoning.
                </Typography>
              </Box>
            </motion.div>

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#FFE5E5' : 'rgba(208,0,0,0.15)', color: 'primary.main' }}>
                        <Activity size={24} />
                      </Box>
                      <Typography variant="h5" fontWeight={600}>RAG Metrics</Typography>
                    </Box>
                    <Stack spacing={3}>
                      <MetricItem
                        title="RQS (Retrieval Quality Score)"
                        desc="Weighted composite: RQS = α × Correctness + β × Faithfulness + γ × Relevancy. Configurable weights with context precision and recall."
                      />
                      <MetricItem
                        title="Faithfulness & Relevancy"
                        desc="Faithfulness measures grounding in retrieved context. Relevancy scores how well the answer addresses the original query intent."
                      />
                      <MetricItem
                        title="Context Precision & Recall"
                        desc="Precision evaluates signal-to-noise in retrieved chunks. Recall measures whether the retrieval found the answer at all."
                      />
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#FFE5E5' : 'rgba(208,0,0,0.15)', color: 'primary.main' }}>
                        <Brain size={24} />
                      </Box>
                      <Typography variant="h5" fontWeight={600}>Agent Metrics</Typography>
                    </Box>
                    <Stack spacing={3}>
                      <MetricItem
                        title="Accuracy & Completeness"
                        desc="Accuracy uses exact, numeric, or semantic matching against ground truth. Completeness checks all expected JSON keys are present."
                      />
                      <MetricItem
                        title="Hallucination Detection"
                        desc="Identifies output content not grounded in reference data. Scored 0-1 and inversely weighted in the Agent RQS formula."
                      />
                      <MetricItem
                        title="Consistency & Safety"
                        desc="Consistency measures output stability across identical runs. Safety uses LLM judge scoring to detect harmful or biased content."
                      />
                    </Stack>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/docs')}
                  sx={{
                    borderRadius: 2, px: 4, py: 1.5,
                    borderColor: 'divider', color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(208,0,0,0.04)' }
                  }}
                >
                  View Full Documentation & Formulas
                </Button>
              </Box>
            </motion.div>
          </Stack>
        </Container>

        {/* Capabilities Section */}
        <Box id="capabilities-section" sx={{ borderTop: '1px solid', borderColor: 'divider', py: 10, bgcolor: (t) => t.palette.mode === 'light' ? '#EEF1F5' : 'action.hover', scrollMarginTop: '80px' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.5 }}>
              <Typography variant="overline" sx={{ display: 'block', mb: 2, textAlign: 'center', color: 'primary.main', fontWeight: 800, letterSpacing: '0.1em', fontSize: '0.75rem' }}>
                CAPABILITIES
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 600, textAlign: 'center', mb: 6 }}>
                Built for <Box component="span" sx={{ color: 'primary.main' }}>Production Workflows</Box>
              </Typography>
            </motion.div>
            <Grid container spacing={3}>
              {[
                { icon: <FileSpreadsheet size={22} />, title: 'Excel-Driven Evaluation', desc: 'Upload .xlsx datasets with queries, ground truth, and multiple bot columns. Auto-detected architectures scored in parallel.' },
                { icon: <GitCompare size={22} />, title: 'Architecture Comparison', desc: 'Leaderboard ranking across Bot_A, Bot_B, Bot_C and more. Compare any two historical evaluations side-by-side.' },
                { icon: <FileJson size={22} />, title: 'JSON & Batch Workflows', desc: 'Paste JSON or provide file paths for agent evaluation. Configurable key mapping for query_id, expected, and actual outputs.' },
                { icon: <BarChart3 size={22} />, title: 'Real-Time Dashboards', desc: 'Production intelligence view with area charts, radar plots, and trend analysis across the last 100 evaluation runs.' },
                { icon: <Download size={22} />, title: 'Multi-Format Export', desc: 'Export evaluation reports as PDF, JSON, or Excel with production intelligence summaries, leaderboards, and transactional detail.' },
                { icon: <Zap size={22} />, title: 'Configurable RQS Engine', desc: 'Tune α, β, γ weights, semantic thresholds, judge models, strictness, temperature, and safety scoring per evaluation.' },
              ].map((item, idx) => (
                <Grid key={item.title} size={{ xs: 12, sm: 6, md: 4 }}>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4, delay: 0.08 * idx }}
                  >
                    <Paper elevation={0} sx={{
                      p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                      height: '100%', transition: 'all 0.25s ease',
                      '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: (t) => t.palette.mode === 'light' ? '0 6px 20px rgba(0,0,0,0.06)' : '0 6px 20px rgba(0,0,0,0.3)' }
                    }}>
                      <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: (t) => t.palette.mode === 'light' ? '#FFE5E5' : alpha(t.palette.primary.main, 0.15), color: 'primary.main', display: 'inline-flex', mb: 2 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{item.desc}</Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Tech Stack Strip */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 6, bgcolor: 'background.default' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <Typography variant="overline" sx={{ display: 'block', mb: 4, textAlign: 'center', color: 'text.secondary', fontWeight: 600, fontSize: '0.75rem' }}>
                POWERED BY
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 2, md: 0 }, flexWrap: 'wrap', alignItems: 'center' }}>
                {['FastAPI', 'Next.js', 'Ragas', 'Azure OpenAI', 'Sentence Transformers'].map((tech, i, arr) => (
                  <Box key={tech} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, letterSpacing: '-0.02em', color: 'text.secondary', fontSize: { xs: '0.85rem', md: '1rem' }, opacity: 0.75, px: { xs: 1, md: 3 } }}>{tech}</Typography>
                    {i < arr.length - 1 && <Box sx={{ width: '1px', height: 16, bgcolor: 'divider', display: { xs: 'none', md: 'block' } }} />}
                  </Box>
                ))}
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', py: 8, bgcolor: (t) => t.palette.mode === 'light' ? '#F5F7FA' : 'background.paper' }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <UbsLogoFull
                    height={36}
                    keysColor={isLight ? theme.palette.text.primary : theme.palette.primary.main}
                    wordmarkColor={isLight ? theme.palette.primary.main : '#FFFFFF'}
                  />
                  <BrandPipe />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap', fontSize: '1.125rem' }}>NEXUS <Box component="span" sx={{ color: 'primary.main' }}>EVAL</Box></Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enterprise-grade evaluation infrastructure for RAG pipelines and autonomous AI agents.
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>About</Typography>
                <Stack spacing={1.5}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>RAG Evaluation</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Agent Evaluation</Typography>
                  <Typography variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }} onClick={() => router.push('/docs#contact-support')}>Contact</Typography>
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, md: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>Resources</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }} onClick={() => router.push('/docs')}>Documentation</Typography>
                  <Typography variant="body2" sx={{ cursor: 'pointer', color: 'text.secondary', '&:hover': { color: 'primary.main' }, transition: 'color 0.2s' }} onClick={() => window.open('http://localhost:8000/docs', '_blank')}>API Reference</Typography>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 8, pt: 4, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © 2026 UBS. Nexus Eval — Internal Evaluation Platform. <b>Designed & Developed by Aniket Marwadi.</b>
              </Typography>
                            
            </Box>
          </Container>
        </Box>

      </Box>
  );
}

function MetricItem({ title, desc }: { title: string; desc: string }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{desc}</Typography>
    </Box>
  );
}
