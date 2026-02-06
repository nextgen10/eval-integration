"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  ThemeProvider,
  createTheme,
  CssBaseline,
  CircularProgress,
  Backdrop,
  Avatar,
  Card,
  CardContent,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  lighten,
  darken
} from '@mui/material';
import {
  LayoutDashboard,
  History,
  Layers,
  Settings,
  UploadCloud,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ChevronRight,
  Search,
  Filter,
  ArrowUpRight,
  Terminal as TerminalIcon,
  Zap,
  Cpu,
  ShieldCheck,
  AlignLeft
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

// --- Helper Components ---

const MetricSubRow = ({ label, value, color }: { label: string; value?: number; color: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>{label}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, justifyContent: 'flex-end', ml: 2 }}>
      <LinearProgress
        variant="determinate"
        value={(value || 0) * 100}
        sx={{
          width: 40,
          height: 4,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          '& .MuiLinearProgress-bar': { bgcolor: color }
        }}
      />
      <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 700, minWidth: 24, textAlign: 'right' }}>
        {(value || 0).toFixed(2)}
      </Typography>
    </Box>
  </Box>
);

// --- Theme Definition (Ultra Dark Premium) ---
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0ea5e9', // Sky 500
      light: '#38bdf8',
      dark: '#0369a1',
    },
    secondary: {
      main: '#2dd4bf', // Teal 400
    },
    background: {
      default: '#020617', // Slate 950
      paper: '#0f172a',    // Slate 900
    },
    text: {
      primary: '#f8fafc',
      secondary: '#64748b',
    },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif',
    h4: { fontWeight: 900, letterSpacing: '-0.04em', fontSize: '1.75rem' },
    h6: { fontWeight: 800, letterSpacing: '-0.02em', fontSize: '1rem' },
    overline: { fontWeight: 900, letterSpacing: '0.1em', fontSize: '0.6rem' },
    body2: { fontSize: '0.85rem' },
    caption: { fontSize: '0.7rem' }
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 800,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '10px 24px',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #0ea5e9 0%, #2dd4bf 100%)',
          boxShadow: '0 4px 20px rgba(14, 165, 233, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #38bdf8 0%, #14b8a6 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(14, 165, 233, 0.5)',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
          padding: '20px 16px',
        },
        head: {
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
        }
      }
    }
  }
});

// --- Components ---

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

function GlassCard({ title, value, color, icon, subtitle, trend }: any) {
  return (
    <MotionPaper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      sx={{
        p: 3,
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(color, 0.05)} 0%, ${alpha('#0f172a', 0.4)} 100%)`,
        backdropFilter: 'blur(30px)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: `0 0 30px ${alpha(color, 0.35)}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, color: 'text.primary', letterSpacing: '-0.05em' }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{
          bgcolor: alpha(color, 0.1),
          color: color,
          width: 44,
          height: 44,
          border: `1px solid ${alpha(color, 0.2)}`,
          boxShadow: `0 0 15px ${alpha(color, 0.2)}`
        }}>
          {icon}
        </Avatar>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {trend && (
          <Typography variant="caption" sx={{ color: color, fontWeight: 900, fontSize: '0.7rem', bgcolor: alpha(color, 0.1), px: 1, py: 0.2, borderRadius: 1 }}>
            {trend}
          </Typography>
        )}
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 600 }}>
          {subtitle}
        </Typography>
      </Box>
    </MotionPaper>
  );
}

// --- Main Pages ---


// --- Landing Page ---
function LandingPage({ onEnter }: { onEnter: () => void }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Generate random stars with increased density
  const stars = useMemo(() => Array.from({ length: 300 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2.5 + 0.5,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  })), []);

  // Track mouse movement for real-time star blinking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box sx={{
      height: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: '#0f172a',
      background: 'radial-gradient(ellipse at bottom, #1e293b 0%, #020617 100%)',
    }}>
      {/* Star Field with Mouse Tracking */}
      {stars.map((star) => {
        // Calculate distance from mouse to star
        const starX = (star.left / 100) * window.innerWidth;
        const starY = (star.top / 100) * window.innerHeight;
        const distance = Math.sqrt(Math.pow(mousePos.x - starX, 2) + Math.pow(mousePos.y - starY, 2));
        const isNearMouse = distance < 120;
        const proximityIntensity = Math.max(0, 1 - distance / 120);

        return (
          <motion.div
            key={star.id}
            initial={{ opacity: 0.2, scale: 0.8 }}
            animate={{
              opacity: isNearMouse ? [0.3, 1, 0.3] : [0.2, 0.7, 0.2],
              scale: isNearMouse ? [1, 1.8 + proximityIntensity * 0.7, 1] : [0.8, 1, 0.8]
            }}
            transition={{
              duration: isNearMouse ? 0.4 : star.duration,
              repeat: Infinity,
              delay: star.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              backgroundColor: '#fff',
              boxShadow: isNearMouse
                ? `0 0 ${star.size * 8}px rgba(56, 189, 248, ${0.7 + proximityIntensity * 0.3}), 0 0 ${star.size * 4}px rgba(255, 255, 255, ${proximityIntensity})`
                : `0 0 ${star.size * 2}px rgba(56, 189, 248, 0.4)`,
              pointerEvents: 'none'
            }}
          />
        );
      })}

      {/* Comets / Shooting Stars */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ top: '-10%', left: '120%', opacity: 0 }}
            animate={{
              top: ['-10%', '120%'],
              left: ['120%', '-20%'],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 3,
              delay: i * 2,
              ease: "linear"
            }}
            style={{
              position: 'absolute',
              width: 300,
              height: 2,
              background: 'linear-gradient(90deg, transparent, #38bdf8, #fff)',
              transform: 'rotate(-45deg)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.8)'
            }}
          />
        ))}
      </Box>

      {/* Background Glow */}
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '60vw',
        height: '60vw',
        background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo Icon */}
          <motion.div
            animate={{
              boxShadow: ['0 0 0px rgba(56, 189, 248, 0)', '0 0 30px rgba(56, 189, 248, 0.3)', '0 0 0px rgba(56, 189, 248, 0)']
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              display: 'inline-flex',
              padding: '24px',
              marginBottom: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(56, 189, 248, 0.1))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Zap size={64} color="#38bdf8" fill="rgba(56, 189, 248, 0.2)" />
          </motion.div>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '3.5rem', md: '6.5rem' },
              fontWeight: 900,
              lineHeight: 0.9,
              mb: 3,
              letterSpacing: '-0.04em',
              background: 'linear-gradient(to bottom, #f8fafc 30%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(56, 189, 248, 0.2)'
            }}
          >
            NEXUS <span style={{ color: '#38bdf8' }}>EVAL</span>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: '#cbd5e1',
              mb: 2,
              fontWeight: 500,
              letterSpacing: '0.01em',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Advanced RAG Evaluation Framework
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#94a3b8',
              mb: 8,
              fontWeight: 400,
              maxWidth: '650px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: '1.1rem'
            }}
          >
            Comprehensive evaluation suite for RAG systems with enterprise-grade metrics and real-time insights.
          </Typography>

          {/* Architect Credit */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              mb: 8,
              px: 3,
              py: 1.5,
              borderRadius: 99,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(56, 189, 248, 0.15)',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.05)'
            }}>
              <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Design AI Architect: <span style={{ color: '#e2e8f0', fontWeight: 700 }}>Aniket Marwadi</span>
              </Typography>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgba(56, 189, 248, 0.5)',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#1e293b'
              }}>
                <img
                  src="/Aniket.jpeg"
                  alt="Aniket Marwadi"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Button
              onClick={onEnter}
              variant="contained"
              size="large"
              endIcon={<ChevronRight />}
              sx={{
                px: 8,
                py: 3,
                fontSize: '1.2rem',
                borderRadius: 99,
                backgroundImage: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                color: '#fff',
                fontWeight: 800,
                border: '3px solid rgba(56, 189, 248, 0.4)',
                boxShadow: '0 0 40px rgba(14, 165, 233, 0.5), 0 10px 30px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transition: 'left 0.5s',
                },
                '&:hover': {
                  transform: 'translateY(-3px) scale(1.03)',
                  boxShadow: '0 0 60px rgba(14, 165, 233, 0.8), 0 15px 40px rgba(0,0,0,0.4)',
                  border: '3px solid rgba(56, 189, 248, 0.8)',
                  '&::before': {
                    left: '100%',
                  }
                },
                '&:active': {
                  transform: 'translateY(-1px) scale(1.01)',
                }
              }}
            >
              Get Started
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}

export default function EnterpriseDashboard() {
  const [showLanding, setShowLanding] = useState(true);
  const [config, setConfig] = useState({
    judgeModel: 'gpt-4o',
    alpha: 0.4,
    beta: 0.3,
    gamma: 0.3
  });
  const [activeView, setActiveView] = useState('insights');
  const [data, setData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (activeView === 'history') {
      fetch("http://localhost:8000/evaluations")
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to fetch history", err));
    }
  }, [activeView]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/latest");
        if (res.ok) {
          const latest = await res.json();
          setData(latest);
        }
      } catch (e) {
        console.error("Connectivity issue with backend engine.");
      }
    };
    fetchData();
  }, []);



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsEvaluating(true);
    setStatusLogs([
      `⚡ [ENGINE] Initializing Parallel Inference Pipeline...`,
      `📁 [FS] Mounting dataset: ${file.name}`,
      `JUDGE [GPT-4o] Active. Warming up reasoning tokens...`
    ]);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("model", config.judgeModel);
    formData.append("alpha", config.alpha.toString());
    formData.append("beta", config.beta.toString());
    formData.append("gamma", config.gamma.toString());

    try {
      const timeout = setInterval(() => {
        setStatusLogs(prev => [
          ...prev,
          `[SYSTEM] Analysing batch chunk ${Math.floor(Math.random() * 100)}...`,
          `[JUDGE] Verifying Ground Truth alignment...`
        ].slice(-10));
      }, 3000);

      const response = await fetch("http://localhost:8000/evaluate-excel", {
        method: "POST",
        body: formData,
      });

      clearInterval(timeout);
      if (!response.ok) throw new Error("Backend Protocol Failure");

      const sessionData = await response.json();
      setData(sessionData);
      setStatusLogs(prev => [...prev, "✨ [SUCCESS] Full evaluation synchronized. Outputting to DB."]);
      setTimeout(() => setIsEvaluating(false), 1200);

    } catch (err: any) {
      setStatusLogs(prev => [...prev, `🛑 [CRITICAL] pipeline failed: ${err.message}`]);
      setTimeout(() => setIsEvaluating(false), 3000);
    }
  };

  const leaderboardData = useMemo(() => {
    if (!data?.summaries) return [];
    return Object.keys(data.summaries).map(id => ({
      id,
      ...data.summaries[id],
      rank: 0
    })).sort((a, b) => b.avg_rqs - a.avg_rqs).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [data]);

  const winner = leaderboardData[0];

  const chartData = useMemo(() => {
    if (!data?.summaries) return [];
    return leaderboardData.map(d => ({
      name: d.id,
      RQS: ((d.avg_rqs || 0) * 100).toFixed(1),
      SemanticScore: ((d.gt_alignment || 0) * 100).toFixed(1),
      Faithfulness: ((d.avg_faithfulness || 0) * 100).toFixed(1),
      Relevancy: ((d.avg_relevancy || 0) * 100).toFixed(1),
      Precision: ((d.avg_context_precision || 0) * 100).toFixed(1),
      Recall: ((d.retrieval_success || 0) * 100).toFixed(1)
    }));
  }, [leaderboardData]);

  if (!mounted) return null;
  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>

        {/* Top Navigation Bar */}
        <Box sx={{
          position: 'fixed',
          top: 24,
          left: 24,
          right: 24,
          height: 80,
          zIndex: 1200,
          px: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(15, 23, 42, 0.7)',
          borderRadius: 6,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Brand Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(59, 130, 246, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Zap size={20} color="white" fill="white" />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: '#fff' }}>
                NEXUS <span style={{ color: '#38bdf8' }}>EVAL</span>
              </Typography>
            </Box>
          </Box>

          {/* Center Navigation */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            p: 0.75,
            bgcolor: 'rgba(0,0,0,0.2)',
            borderRadius: 99,
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {[
              { id: 'insights', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
              { id: 'history', label: 'History', icon: <History size={16} /> },
              { id: 'drilldown', label: 'Drilldown', icon: <Layers size={16} /> },
              { id: 'config', label: 'Configuration', icon: <Settings size={16} /> },
            ].map((item) => (
              <Button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                startIcon={item.icon}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 99,
                  fontSize: '0.85rem',
                  color: activeView === item.id ? '#fff' : '#94a3b8',
                  bgcolor: activeView === item.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  border: activeView === item.id ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
                  fontWeight: activeView === item.id ? 700 : 500,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    color: '#fff',
                    bgcolor: activeView === item.id ? 'rgba(59, 130, 246, 0.25)' : 'rgba(255,255,255,0.05)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>


            <Button
              variant="contained"
              startIcon={<UploadCloud size={16} />}
              component="label"
              sx={{
                height: 48,
                px: 4,
                borderRadius: 3,
                fontSize: '0.9rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #fff 0%, #e2e8f0 100%)',
                color: '#0f172a',
                boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)',
                border: '1px solid #fff',
                '&:hover': {
                  background: '#fff',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
                }
              }}
            >
              Bulk Re-evaluation
              <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileUpload} />
            </Button>
          </Box>

        </Box>

        {/* Main Content Area */}
        <Box component="main" sx={{ flexGrow: 1, pt: 16, px: 6, pb: 6, overflow: 'auto' }}>

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                {activeView === 'insights' ? 'Production Intelligence' :
                  activeView === 'history' ? 'Historical Evaluations' :
                    activeView === 'drilldown' ? 'Drilldown Matrix' : 'Configuration'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeView === 'insights' ? `Multimodal evaluation across ${leaderboardData.length} active agent architectures.` :
                  activeView === 'history' ? 'Archive of past evaluation runs and performance benchmarks.' :
                    activeView === 'drilldown' ? 'Deep dive into specific model metrics and granular analysis.' : 'System settings and preferences.'}
              </Typography>
            </Box>

          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Dashboard View */}
              {activeView === 'insights' && data && (
                <Grid container spacing={3}>
                  {/* Score Cards - Row 1 */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Highest RQS"
                      value={winner?.id}
                      color="#0ea5e9"
                      icon={<Trophy size={24} />}
                      subtitle={`Master Score: ${(winner?.avg_rqs || 0).toFixed(2)}`}
                      trend="+2.4%"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Best Semantic Score"
                      value={`${((winner?.gt_alignment || 0) * 100).toFixed(0)}%`}
                      color="#2dd4bf"
                      icon={<CheckCircle2 size={24} />}
                      subtitle="Peak GT consistency"
                      trend="+1.8%"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Best Faithfulness"
                      value={`${((winner?.avg_faithfulness || 0) * 100).toFixed(0)}%`}
                      color="#8b5cf6"
                      icon={<ShieldCheck size={24} />}
                      subtitle="Grounded logic (Top Model)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Best Relevancy"
                      value={`${((winner?.avg_relevancy || 0) * 100).toFixed(0)}%`}
                      color="#2196f3"
                      icon={<AlignLeft size={24} />}
                      subtitle="Intent accuracy (Top Model)"
                    />
                  </Grid>

                  {/* Score Cards - Row 2 */}
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Max Context Prec."
                      value={`${((winner?.avg_context_precision || 0) * 100).toFixed(0)}%`}
                      color="#f59e0b"
                      icon={<Cpu size={24} />}
                      subtitle="Retrieval Signal-to-Noise"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Max Context Recall"
                      value={`${((winner?.retrieval_success || 0) * 100).toFixed(0)}%`}
                      color="#ec4899"
                      icon={<Layers size={24} />}
                      subtitle="Information Coverage"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Active Tests"
                      value={data.test_cases?.length || 0}
                      color="#64748b"
                      icon={<Activity size={24} />}
                      subtitle="Total Scenarios Evaluated"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <GlassCard
                      title="Average Latency"
                      value={`${(winner?.avg_latency || 0).toFixed(0)} ms`}
                      color="#10b981"
                      icon={<Zap size={24} />}
                      subtitle="Inference Speed (est.)"
                    />
                  </Grid>

                  {/* Main Visualization */}
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4, height: 480, borderRadius: 5, bgcolor: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box>
                          <Typography variant="h6">Performance Trajectory</Typography>
                          <Typography variant="caption" color="text.secondary">Multidimensional scoring across top architectures</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ height: 360 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }} />
                            <ChartTooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingBottom: 20 }} />
                            <Area name="Master RQS" type="monotone" dataKey="RQS" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorPrimary)" />
                            <Area name="Semantic" type="monotone" dataKey="SemanticScore" stroke="#2dd4bf" strokeWidth={2} fillOpacity={0} />
                            <Area name="Faithfulness" type="monotone" dataKey="Faithfulness" stroke="#8b5cf6" strokeWidth={2} fillOpacity={0} />
                            <Area name="Relevancy" type="monotone" dataKey="Relevancy" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                            <Area name="Precision" type="monotone" dataKey="Precision" stroke="#ec4899" strokeWidth={2} fillOpacity={0} />
                            <Area name="Recall" type="monotone" dataKey="Recall" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Neural Profile HUD */}
                  <Grid size={{ xs: 12, md: 4 }}>
                    <MotionPaper
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      sx={{
                        p: 4,
                        height: 480,
                        borderRadius: 5,
                        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(2, 6, 23, 0.8) 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.25)',
                        boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>Neural Topology</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Architectural capability mapping (Top 3)
                        </Typography>
                      </Box>

                      <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1, minHeight: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%"
                            data={[
                              { subject: 'Semantic', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: m.gt_alignment }), {}) },
                              { subject: 'Faithfulness', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: m.avg_faithfulness }), {}) },
                              { subject: 'Relevancy', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: m.avg_relevancy }), {}) },
                              { subject: 'Precision', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: m.avg_context_precision }), {}) },
                              { subject: 'Recall', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: m.retrieval_success }), {}) },
                            ]}
                          >
                            <PolarGrid stroke="rgba(255,255,255,0.05)" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
                            {leaderboardData.slice(0, 3).map((model, idx) => (
                              <Radar
                                key={model.id}
                                name={model.id}
                                dataKey={model.id}
                                stroke={['#0ea5e9', '#2dd4bf', '#8b5cf6'][idx]}
                                fill={['#0ea5e9', '#2dd4bf', '#8b5cf6'][idx]}
                                fillOpacity={0.25}
                                strokeWidth={3}
                              />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </Box>

                      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
                        {leaderboardData.slice(0, 3).map((model, idx) => (
                          <Box key={model.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: ['#0ea5e9', '#2dd4bf', '#8b5cf6'][idx],
                              boxShadow: `0 0 10px ${['#0ea5e9', '#2dd4bf', '#8b5cf6'][idx]}`
                            }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>{model.id}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </MotionPaper>
                  </Grid>


                  {/* Leaderboard Table */}
                  <Grid size={{ xs: 12 }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.25)', boxShadow: '0 0 30px rgba(255, 255, 255, 0.15)' }}>
                      <Box sx={{ p: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Comparison Leaderboard</Typography>
                        <Button size="small" endIcon={<ChevronRight size={16} />} onClick={() => setActiveView('history')}>View All Historical Runs</Button>
                      </Box>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Rank</TableCell>
                            <TableCell>Architecture</TableCell>
                            <TableCell>Master RQS</TableCell>
                            <TableCell>Semantic</TableCell>
                            <TableCell>Faithful</TableCell>
                            <TableCell>Relevant</TableCell>
                            <TableCell>Precision</TableCell>
                            <TableCell>Recall</TableCell>
                            <TableCell align="right">Diag</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {leaderboardData.map((row) => (
                            <TableRow key={row.id} hover>
                              <TableCell>
                                <Box sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: '50%',
                                  bgcolor: row.rank === 1 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.05)',
                                  color: row.rank === 1 ? '#f59e0b' : 'inherit',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 800,
                                  fontSize: '0.75rem'
                                }}>
                                  {row.rank}
                                </Box>
                              </TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>{row.id}</TableCell>
                              <TableCell>
                                <Typography sx={{ color: 'primary.main', fontWeight: 900 }}>{(row.avg_rqs || 0).toFixed(3)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={row.gt_alignment * 100}
                                    sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.05)' }}
                                  />
                                  <Typography variant="caption">{(row.gt_alignment * 100).toFixed(0)}%</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>{(row.avg_faithfulness || 0).toFixed(2)}</TableCell>
                              <TableCell>{(row.avg_relevancy || 0).toFixed(2)}</TableCell>
                              <TableCell>{(row.avg_context_precision || 0).toFixed(2)}</TableCell>
                              <TableCell>{(row.retrieval_success || 0).toFixed(2)}</TableCell>
                              <TableCell align="right">
                                <IconButton size="small" color="primary"><ArrowUpRight size={18} /></IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}

              {activeView === 'history' && (
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12 }}>
                    <TableContainer component={Paper} sx={{ borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 0 30px rgba(0,0,0,0.2)' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Winner</TableCell>
                            <TableCell align="right">Max RQS</TableCell>
                            <TableCell align="right">Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {history.map((run) => (
                            <TableRow key={run.id} hover>
                              <TableCell>{new Date(run.timestamp).toLocaleString()}</TableCell>
                              <TableCell>{run.name}</TableCell>
                              <TableCell>
                                <Chip
                                  label={run.winner}
                                  size="small"
                                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography sx={{ fontWeight: 700, color: 'primary.light' }}>
                                  {run.summaries?.[run.winner]?.avg_rqs?.toFixed(3) || "N/A"}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => {
                                    setData(run);
                                    setActiveView('insights');
                                  }}
                                  sx={{ borderRadius: 2 }}
                                >
                                  Load Report
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {history.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                <Typography color="text.secondary">No historical evaluations found.</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </Grid>
              )}

              {activeView === 'drilldown' && data && (
                <Box>
                  <Typography variant="h5" sx={{ mb: 4 }}>Scenario Selection Matrix</Typography>
                  {data.test_cases.slice(0, 3).map((testCase: any, idx: number) => (
                    <Paper key={`${testCase.id}-${idx}`} sx={{ p: 4, mb: 3, borderRadius: 4, bgcolor: '#0f172a' }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="overline" color="text.secondary">SCENARIO ID: {testCase.id}</Typography>
                        <Typography variant="h6" sx={{ mt: 1, color: 'primary.light' }}>&quot;{testCase.query}&quot;</Typography>
                      </Box>
                      <Grid container spacing={2}>
                        {Object.keys(data.summaries).map(bot => (
                          <Grid size={{ xs: 12, md: 3 }} key={bot}>
                            <Card variant="outlined" sx={{ bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
                              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{bot}</Typography>
                              </Box>
                              <CardContent sx={{ p: 2 }}>
                                <Typography variant="body2" sx={{
                                  minHeight: 80,
                                  fontSize: '0.8rem',
                                  lineHeight: 1.6,
                                  color: 'text.secondary',
                                  fontStyle: 'italic',
                                  mb: 2
                                }}>
                                  &quot;{testCase.bot_responses[bot]?.substring(0, 150)}...&quot;
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                  <MetricSubRow label="Faithfulness" value={data.bot_metrics[bot]?.[testCase.id]?.faithfulness} color="#10b981" />
                                  <MetricSubRow label="Relevancy" value={data.bot_metrics[bot]?.[testCase.id]?.answer_relevancy} color="#3b82f6" />
                                  <MetricSubRow label="Context Prec." value={data.bot_metrics[bot]?.[testCase.id]?.context_precision} color="#f59e0b" />
                                  <MetricSubRow label="Context Recall" value={data.bot_metrics[bot]?.[testCase.id]?.context_recall} color="#ec4899" />
                                  <MetricSubRow label="Semantic Score" value={data.bot_metrics[bot]?.[testCase.id]?.semantic_similarity} color="#8b5cf6" />
                                </Box>

                                <Divider sx={{ my: 1.5, opacity: 0.1 }} />
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>MASTER RQS</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                      {(data.bot_metrics[bot]?.[testCase.id]?.rqs || 0).toFixed(3)}
                                    </Typography>
                                  </Box>
                                  <Chip label="Analysis" size="small" sx={{ height: 20, fontSize: '0.6rem', fontWeight: 700 }} />
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  ))}
                </Box>

              )}

              {activeView === 'config' && (
                <Grid container spacing={3} justifyContent="center">
                  <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 6, borderRadius: 4, bgcolor: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <Typography variant="h5" sx={{ mb: 4, fontWeight: 700 }}>Evaluation Configuration</Typography>

                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, color: '#94a3b8' }}>Judge Model (LLM)</Typography>
                        <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>
                          The LLM used for calculating Faithfulness and Relevancy scores.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            onClick={() => setConfig({ ...config, judgeModel: 'gpt-4o' })}
                            sx={{
                              flex: 1, p: 2, borderRadius: 3, border: '1px solid',
                              borderColor: config.judgeModel === 'gpt-4o' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                              bgcolor: config.judgeModel === 'gpt-4o' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              color: config.judgeModel === 'gpt-4o' ? '#fff' : '#64748b'
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={700}>GPT-4o</Typography>
                          </Button>
                          <Button
                            onClick={() => setConfig({ ...config, judgeModel: 'gpt-3.5-turbo' })}
                            sx={{
                              flex: 1, p: 2, borderRadius: 3, border: '1px solid',
                              borderColor: config.judgeModel === 'gpt-3.5-turbo' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                              bgcolor: config.judgeModel === 'gpt-3.5-turbo' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              color: config.judgeModel === 'gpt-3.5-turbo' ? '#fff' : '#64748b'
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={700}>GPT-3.5 Turbo</Typography>
                          </Button>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />

                      <Typography variant="subtitle2" sx={{ mb: 4, color: '#94a3b8' }}>RQS Weighting Parameters</Typography>

                      <Box sx={{ mb: 4 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight={600}>Alpha (Semantic Similarity)</Typography>
                          <Typography variant="caption" color="primary.main">{config.alpha}</Typography>
                        </Stack>
                        <input
                          type="range"
                          min="0" max="1" step="0.1"
                          value={config.alpha}
                          onChange={(e) => setConfig({ ...config, alpha: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: '#0ea5e9' }}
                        />
                      </Box>

                      <Box sx={{ mb: 4 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight={600}>Beta (Faithfulness)</Typography>
                          <Typography variant="caption" color="primary.main">{config.beta}</Typography>
                        </Stack>
                        <input
                          type="range"
                          min="0" max="1" step="0.1"
                          value={config.beta}
                          onChange={(e) => setConfig({ ...config, beta: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: '#8b5cf6' }}
                        />
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight={600}>Gamma (Relevancy)</Typography>
                          <Typography variant="caption" color="primary.main">{config.gamma}</Typography>
                        </Stack>
                        <input
                          type="range"
                          min="0" max="1" step="0.1"
                          value={config.gamma}
                          onChange={(e) => setConfig({ ...config, gamma: parseFloat(e.target.value) })}
                          style={{ width: '100%', accentColor: '#f59e0b' }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              )}


            </motion.div>
          </AnimatePresence>
        </Box>

        {/* Evaluation Modal Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backdropFilter: 'blur(12px)', bgcolor: 'rgba(0,0,0,0.9)' }}
          open={isEvaluating}
        >
          <Box sx={{ width: 640, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
              <CircularProgress color="primary" size={80} thickness={3} />
              <Box sx={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Cpu size={32} color="#3b82f6" />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>Analysis In Progress</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>The Nexus Engine is currently evaluating token alignment and reasoning depth.</Typography>

            <Paper sx={{
              bgcolor: '#020617',
              p: 3,
              borderRadius: '12px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              height: 240,
              overflow: 'auto',
              textAlign: 'left'
            }}>
              {statusLogs.map((log, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main', opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</Typography>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'primary.light' }}>{log}</Typography>
                </Box>
              ))}
              <Box sx={{ width: 10, height: 18, bgcolor: 'primary.main', display: 'inline-block', mt: 1, animation: 'blink 1s infinite' }} />
            </Paper>
          </Box>
        </Backdrop>

        <style jsx global>{`
                    @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
                    * { transition: border-color 0.2s ease, background-color 0.2s ease; }
                    .MuiPaper-root { overflow: hidden; }
                    body {
                        scrollbar-width: thin;
                        scrollbar-color: #1e293b transparent;
                    }
                `}</style>

      </Box>
    </ThemeProvider>
  );
}

// --- Helper Components ---

function SidebarItem({ icon, label, active, onClick }: any) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          color: active ? '#3b82f6' : '#94a3b8',
          bgcolor: active ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
          '&:hover': {
            bgcolor: active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.03)',
            color: active ? '#3b82f6' : '#fff',
          }
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{icon}</ListItemIcon>
        <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }} />
      </ListItemButton>
    </ListItem>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: '0 10px 40px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>{label}</Typography>
        {payload.map((p: any) => (
          <Box key={p.name} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{p.name}:</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, ml: 'auto' }}>{p.value}%</Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

