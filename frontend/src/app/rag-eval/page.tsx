"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  CssBaseline,
  CircularProgress,
  Backdrop,
  Avatar,
  Card,
  CardContent,
  Stack,
  Tooltip,
  alpha,
  Switch,
  FormControlLabel,
  Slider,
  Snackbar,
  Alert,
  useTheme,
  lighten,
  darken,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
  AlignLeft,
  Compass,

  Save,
  Users,
  Target,
  Lock,
  Thermometer,
  FileJson,
  Shield,
  Eye,
  Settings2,
  FileSpreadsheet,
  Download,
  FileText,
  Wrench,
  Info,
  Mail,
  Sun,
  Moon
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
import { GlassCard } from '../../components/Dashboard/GlassCard';
import { MetricSubRow } from '../../components/Dashboard/MetricSubRow';
import { PrintOnlyReport } from '../../components/Reports/PrintOnlyReport';
import { PaginationControl } from '../../components/Common/PaginationControl';
import { getUnifiedTheme, nexusTheme } from '../../components/UnifiedTheme';
import { UnifiedNavBar } from '../../components/UnifiedNavBar';
import { UbsLogo } from '../../components/UbsLogo';
import ThemeRegistry from '../../components/ThemeRegistry';
import ThemeToggle from '../agent-eval/components/ThemeToggle';



// --- Theme is now imported from UnifiedTheme ---
const theme = nexusTheme;


// --- Components ---
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);



// --- Main Pages ---


// --- Metric Explanation Component ---
function MetricExplanationCard({ title, description, details, example, color, icon }: any) {
  const theme = useTheme();
  return (
    <Paper sx={{
      minHeight: 200,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      maxWidth: '96%',
      mx: 'auto',
      p: 3,
      borderRadius: 3,
      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
      border: (theme) => `1px solid ${theme.palette.divider}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        borderColor: alpha(color, 0.4),
        transform: 'translateY(-2px)',
        boxShadow: `0 10px 40px -10px ${alpha(color, 0.2)}`
      }
    }}>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Box sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          color: color,
          height: 'fit-content',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>{title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, fontSize: '0.9rem' }}>
            {description}
          </Typography>
          <Box sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
            borderLeft: `3px solid ${color}`
          }}>
            <Typography variant="caption" sx={{ color: color, fontWeight: 900, textTransform: 'uppercase', display: 'block', mb: 0.5 }}>Architectural Note</Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', opacity: 0.8, fontStyle: 'italic' }}>
              {details}
            </Typography>
          </Box>
          {example && (
            <Box sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: (theme) => `1px dashed ${theme.palette.divider}`
            }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', display: 'block', mb: 1 }}>Real-World Application Example</Typography>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.5 }}>
                {example}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Paper >
  );
}

function EnterpriseDashboardContent() {
  const [config, setConfig] = useState({
    judgeModel: 'gpt-4o',
    alpha: 0.4,
    beta: 0.3,
    gamma: 0.3,
    concurrency: 5,
    strictness: 0.7,
    enableSafety: true,
    temperature: 0.0,
    exportFormat: 'PDF',
    expertMode: false,
    maxRows: 200
  });
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();
  const [activeView, setActiveView] = useState(() => {
    // Initialize from URL if available
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const viewFromUrl = params.get('view');
      if (viewFromUrl && ['insights', 'drilldown', 'history', 'about', 'config'].includes(viewFromUrl)) {
        return viewFromUrl;
      }
    }
    return 'insights';
  });
  // Callback for SearchParamsHandler to update activeView
  const handleViewChangeFromUrl = useCallback((view: string) => {
    setActiveView(view);
  }, []);

  // Update URL when activeView changes
  const handleViewChange = (view: string) => {
    setActiveView(view);
    router.push(`/rag-eval?view=${view}`, { scroll: false });
  };

  const theme = nexusTheme;

  const [data, setData] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false); // Used for generic notifications
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEvaluating && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [statusLogs, isEvaluating]);

  // Pagination State
  const [historyPage, setHistoryPage] = useState(1);
  const [drilldownPage, setDrilldownPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Search State
  const [historySearch, setHistorySearch] = useState('');
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [showComparisonResults, setShowComparisonResults] = useState(false);
  const [compareEval1, setCompareEval1] = useState('');
  const [compareEval2, setCompareEval2] = useState('');
  const [drilldownSearch, setDrilldownSearch] = useState('');

  useEffect(() => {
    if (activeView === 'history') {
      setIsLoadingHistory(true);
      fetch("http://localhost:8000/evaluations")
        .then(res => res.json())
        .then(data => {
          setHistory(data);
          setIsLoadingHistory(false);
        })
        .catch(err => {
          console.error("Failed to fetch history", err);
          setIsLoadingHistory(false);
        });
    }
  }, [activeView]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, historyRes] = await Promise.all([
          fetch("http://localhost:8000/latest"),
          fetch("http://localhost:8000/evaluations")
        ]);

        if (latestRes.ok) {
          const latest = await latestRes.json();
          setData(latest);
        }
        if (historyRes.ok) {
          const hist = await historyRes.json();
          setHistory(hist);
        }
      } catch (e) {
        console.error("Connectivity issue with backend engine.");
      }
    };
    fetchData();
  }, []);

  const filteredHistory = useMemo(() => {
    if (!historySearch) return history;
    const s = historySearch.toLowerCase();
    return history.filter(run =>
      run.name?.toLowerCase().includes(s) ||
      run.id?.toLowerCase().includes(s) ||
      run.winner?.toLowerCase().includes(s)
    );
  }, [history, historySearch]);

  const handleLoadReport = async (runId: string) => {
    setIsLoadingReport(true);
    try {
      const res = await fetch(`http://localhost:8000/evaluations/${runId}`);
      if (res.ok) {
        const fullData = await res.json();
        setData(fullData);
        setDrilldownPage(1);
        handleViewChange('insights');
      } else {
        setSnackbarMsg('Failed to load report details.');
        setSaveSuccess(true);
      }
    } catch (error) {
      console.error("Error loading report:", error);
      setSnackbarMsg('Error connecting to server.');
      setSaveSuccess(true);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const filteredTestCases = useMemo(() => {
    if (!data?.test_cases) return [];
    if (!drilldownSearch) return data.test_cases;
    const s = drilldownSearch.toLowerCase();
    return data.test_cases.filter((tc: any) =>
      tc.query?.toLowerCase().includes(s) ||
      tc.ground_truth?.toLowerCase().includes(s) ||
      tc.id?.toString().toLowerCase().includes(s)
    );
  }, [data, drilldownSearch]);

  const handleExport = async () => {
    if (!data) return;
    setIsExporting(true);
    setStatusLogs(prev => [...prev, `Initiating ${config.exportFormat} report generation...`]);

    // Simulate report collation
    await new Promise(resolve => setTimeout(resolve, 1500));
    setStatusLogs(prev => [...prev, `Collating metrics for ${leaderboardData.length} agents...`]);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const timestamp = new Date().toLocaleString('en-GB', { hour12: false }).replace(/[/, :]/g, '_');
    const fileName = `RAGEval_Report_${timestamp}`;

    if (config.exportFormat === 'JSON') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.json`;
      link.click();
    } else if (config.exportFormat === 'Excel') {
      const s = (v: any) => {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
      };

      // 0. Production Intelligence Sheet (Top Insights)
      const insightHeaders = ['METRIC', 'VALUE', 'CONTEXT'];
      const winner = leaderboardData[0] || {};
      const insightRows = [
        ['TOP_ARCHITECT', winner.id, `MASTER_RQS: ${s(winner.avg_rqs).toFixed(3)}`],
        ['MAX_ANSWER_CORRECTNESS', `${(s(winner.gt_alignment) * 100).toFixed(1)}%`, 'Ground Truth Match'],
        ['TOP_FAITHFULNESS', `${(s(winner.avg_faithfulness) * 100).toFixed(1)}%`, 'Logical Integrity'],
        ['CONTEXT_PRECISION', `${(s(winner.avg_context_precision) * 100).toFixed(1)}%`, 'Information S/N'],
        ['RETRIEVAL_COVERAGE', `${(s(winner.retrieval_success) * 100).toFixed(1)}%`, 'Knowledge Recall'],
        ['HALLUCINATION_RATE', `${((1 - s(winner.avg_faithfulness)) * 100).toFixed(1)}%`, 'Safety Risk'],
        ['TOTAL_TEST_CASES', data.test_cases.length, 'Evaluation Volume']
      ];

      // 1. Summary Sheet (Flattened)
      const summaryHeaders = ['RANK', 'BOT_ID', 'MASTER_RQS', 'ANSWER_CORRECTNESS', 'FAITHFULNESS', 'RELEVANCY', 'CONTEXT_PRECISION', 'RETRIEVAL_SUCCESS'];
      const summaryRows = leaderboardData.map(row => {
        const s = (v: any) => {
          const n = parseFloat(v);
          return isNaN(n) ? 0 : n;
        };
        return [
          row.rank,
          row.id,
          s(row.avg_rqs).toFixed(3),
          (s(row.gt_alignment) * 100).toFixed(1),
          (s(row.avg_faithfulness) * 100).toFixed(1),
          (s(row.avg_relevancy) * 100).toFixed(1),
          (s(row.avg_context_precision) * 100).toFixed(1),
          (s(row.retrieval_success) * 100).toFixed(1)
        ];
      });

      // 2. Detailed Metrics Sheet (Flattened for analysis)
      const detailHeaders = ['TEST_CASE_ID', 'QUERY', 'GROUND_TRUTH', 'BOT_ID', 'RESPONSE', 'FAITHFULNESS', 'RELEVANCY', 'CONTEXT_PRECISION', 'CONTEXT_RECALL', 'ANSWER_CORRECTNESS', 'RQS'];
      const detailRows: any[] = [];

      data.test_cases.forEach((tc: any) => {
        Object.keys(data.summaries).forEach(botId => {
          const m = data.bot_metrics[botId]?.[tc.id] || {};
          const response = (tc.bot_responses?.[botId] || "").replace(/"/g, '""');
          const gt = (tc.ground_truth || "").replace(/"/g, '""');
          const s = (v: any) => {
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
          };
          detailRows.push([
            tc.id,
            `"${tc.query.replace(/"/g, '""')}"`,
            `"${gt}"`,
            botId,
            `"${response}"`,
            s(m.faithfulness).toFixed(3),
            s(m.answer_relevancy).toFixed(3),
            s(m.context_precision).toFixed(3),
            s(m.context_recall).toFixed(3),
            s(m.semantic_similarity).toFixed(3),
            s(m.rqs).toFixed(3)
          ]);
        });
      });

      const csvContent =
        "--- PRODUCTION INTELLIGENCE (TOP INSIGHTS) ---\n" +
        insightHeaders.join(",") + "\n" +
        insightRows.map(e => e.join(",")).join("\n") +
        "\n\n--- COMPARISON LEADERBOARD (SUMMARY) ---\n" +
        summaryHeaders.join(",") + "\n" +
        summaryRows.map(e => e.join(",")).join("\n") +
        "\n\n--- DETAILED TRANSACTIONAL METRICS ---\n" +
        detailHeaders.join(",") + "\n" +
        detailRows.map(e => e.join(",")).join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.csv`;
      link.click();
    } else if (config.exportFormat === 'PDF') {
      const originalTitle = document.title;
      document.title = fileName;
      window.print();
      document.title = originalTitle;
    }

    setIsExporting(false);
    setSnackbarMsg(`${config.exportFormat} Report successfully generated.`);
    setSaveSuccess(true);
  };



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so the same file can be uploaded again without refresh
    e.target.value = '';

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
    formData.append("concurrency", config.concurrency.toString());
    formData.append("strictness", config.strictness.toString());
    formData.append("temperature", config.temperature.toString());
    formData.append("safety", config.enableSafety.toString());
    formData.append("max_rows", config.maxRows.toString());

    try {
      const messages = [
        `[GPU] Computing semantic embedding vectors...`,
        `[JUDGE] Cross-referencing latent space alignment...`,
        `[IO] Writing evaluation metrics to local buffer...`,
        `[SYSTEM] Optimization pass ${Math.floor(Math.random() * 5)} active...`,
        `[RAG] Recalculating Context Precision for Bot B...`,
        `[AUTH] Synchronizing cloud inference tokens...`
      ];

      const timeout = setInterval(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        setStatusLogs(prev => [...prev, msg]);
      }, 1500);

      const response = await fetch("http://localhost:8000/evaluate-excel", {
        method: "POST",
        body: formData,
      });

      clearInterval(timeout);
      if (!response.ok) {
        const errDetail = await response.json().catch(() => ({ detail: "Backend Protocol Failure" }));
        throw new Error(errDetail.detail || "Evaluation Failed");
      }

      const sessionData = await response.json();
      setData(sessionData);
      setDrilldownPage(1);
      setStatusLogs(prev => [...prev, "✨ [SUCCESS] Full evaluation synchronized. Matrix data outputted to internal DB."]);

      // Refresh history to show the new evaluation
      fetch("http://localhost:8000/evaluations")
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error("Failed to refresh history", err));

      setTimeout(() => setIsEvaluating(false), 1200);

    } catch (err: any) {
      setStatusLogs(prev => [...prev, `🛑 [CRITICAL] pipeline failed: ${err.message}`]);
      setTimeout(() => setIsEvaluating(false), 3000);
    }
  };

  const leaderboardData = useMemo(() => {
    if (!data?.summaries) return [];
    return Object.keys(data.summaries).map(id => {
      const s = data.summaries[id];
      const safe = (v: any) => {
        const n = parseFloat(v);
        return isNaN(n) ? 0 : n;
      };
      return {
        id,
        ...s,
        avg_rqs: safe(s.avg_rqs),
        gt_alignment: safe(s.gt_alignment),
        avg_faithfulness: safe(s.avg_faithfulness),
        avg_relevancy: safe(s.avg_relevancy),
        avg_context_precision: safe(s.avg_context_precision),
        retrieval_success: safe(s.retrieval_success),
        rank: 0
      };
    }).sort((a, b) => b.avg_rqs - a.avg_rqs).map((item, idx) => ({ ...item, rank: idx + 1 }));
  }, [data]);

  const winner = leaderboardData.length > 0 ? leaderboardData[0] : null;

  const totalTokens = useMemo(() => {
    if (!data?.bot_metrics) return 0;
    let sum = 0;
    Object.values(data.bot_metrics).forEach((botMap: any) => {
      Object.values(botMap).forEach((m: any) => {
        sum += (m.total_tokens || 0);
      });
    });
    return sum;
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.summaries || leaderboardData.length === 0) return [];
    return leaderboardData.map(d => ({
      name: d.id,
      RQS: Number(((d.avg_rqs || 0) * 100).toFixed(1)),
      AnswerCorrectness: Number(((d.gt_alignment || 0) * 100).toFixed(1)),
      Faithfulness: Number(((d.avg_faithfulness || 0) * 100).toFixed(1)),
      Relevancy: Number(((d.avg_relevancy || 0) * 100).toFixed(1)),
      Precision: Number(((d.avg_context_precision || 0) * 100).toFixed(1)),
      Recall: Number(((d.retrieval_success || 0) * 100).toFixed(1))
    }));
  }, [leaderboardData, data]);

  const trends = useMemo(() => {
    // Early return if no winner or insufficient history
    if (!winner || !history || history.length < 1) return {};

    // Find the most recent run that isn't the current one
    const prevRun = history.find(h => h.id !== data?.id);
    if (!prevRun || !prevRun.summaries) return {};

    const prevWinnerId = prevRun.winner || Object.keys(prevRun.summaries)[0];
    const p = prevRun.summaries[prevWinnerId];
    if (!p) return {};

    const calc = (curr: number | undefined, prev: number | undefined) => {
      // Handle undefined, null, or zero values
      if (curr === undefined || prev === undefined || prev === 0) return null;
      const diff = ((curr - prev) / prev) * 100;
      return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
    };

    return {
      rqs: calc(winner.avg_rqs, p.avg_rqs),
      correctness: calc(winner.gt_alignment, p.gt_alignment),
      faithfulness: calc(winner.avg_faithfulness, p.avg_faithfulness),
      relevancy: calc(winner.avg_relevancy, p.avg_relevancy),
      precision: calc(winner.avg_context_precision, p.avg_context_precision),
      recall: calc(winner.retrieval_success, p.retrieval_success),
    };
  }, [history, data, winner]);

  if (!mounted) return null;

  return (
    <>
      <Suspense fallback={null}>
        <SearchParamsHandler onViewChange={handleViewChangeFromUrl} />
      </Suspense>
      <Box className="main-ui-container" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default', color: 'text.primary' }}>

        {/* Unified Navigation Bar */}
        <UnifiedNavBar title="RAG EVAL"
          items={[
            { id: 'insights', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
            { id: 'drilldown', label: 'Scenario Metrics', icon: <Activity size={16} /> },
            { id: 'history', label: 'History', icon: <History size={16} /> },
            { id: 'config', label: 'Configuration', icon: <Settings size={16} /> },
          ].map(item => ({
            ...item,
            active: activeView === item.id,
            onClick: () => handleViewChange(item.id)
          }))}
          onLogoClick={() => router.push('/')}
          actions={
            <>
              <ThemeToggle />
              {activeView === 'insights' && (
                <Tooltip title={`Export current view as ${config.exportFormat}`}>
                  <IconButton
                    onClick={handleExport}
                    disabled={!data || isExporting}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 99,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      color: 'primary.main',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.8)}`,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`,
                        color: 'primary.light',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.disabled,
                        background: 'none'
                      }
                    }}
                  >
                    {isExporting ? <CircularProgress size={18} color="inherit" /> : <Download size={18} />}
                  </IconButton>
                </Tooltip>
              )}

              {activeView === 'insights' && (
                <Button
                  variant="contained"
                  startIcon={<UploadCloud size={16} />}
                  component="label"
                  sx={{
                    height: 'auto',
                    px: 3,
                    py: 1,
                    borderRadius: 99,
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    backdropFilter: 'blur(10px)',
                    textTransform: 'none',
                    boxShadow: '0 4px 20px rgba(230, 0, 0, 0.3)', // Using theme red hint if possible or hardcoded based on new theme
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 30px rgba(230, 0, 0, 0.45)', // Red shadow
                    }
                  }}
                >
                  Evaluate
                  <input type="file" accept=".xlsx,.xls" hidden onChange={handleFileUpload} />
                </Button>
              )}
            </>
          }
        />

        {/* Main Content Area */}
        <Box component="main" sx={{
          width: '100%',
          flexGrow: 1,
          px: { xs: 2, md: 3 },
          pb: 2,
          pt: 2,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', md: '1.1rem' }, letterSpacing: '-0.02em', mb: 0.5, color: 'text.primary' }}>
                {activeView === 'insights' ? 'Production Intelligence' :
                  activeView === 'history' ? 'Historical Evaluations' :
                    activeView === 'drilldown' ? 'Scenario Metrics' :
                      activeView === 'about' ? 'Methodology & Framework' : 'Configuration'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' } }}>
                {activeView === 'insights' ? `Multimodal evaluation across ${leaderboardData.length} active agent architectures.` :
                  activeView === 'history' ? 'Archive of past evaluation runs and performance benchmarks.' :
                    activeView === 'drilldown' ? 'Deep dive into specific model metrics and granular analysis.' :
                      activeView === 'about' ? 'Detailed breakdown of organizational RAG scoring benchmarks.' : 'System settings and preferences.'}
              </Typography>
            </Box>

            {activeView === 'history' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {filteredHistory.length > ITEMS_PER_PAGE && (
                  <PaginationControl
                    count={Math.ceil(filteredHistory.length / ITEMS_PER_PAGE)}
                    page={historyPage}
                    onChange={(_, v) => setHistoryPage(v)}
                    sx={{ m: 0, scale: '0.9' }}
                  />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {historySearch && (
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 1 }}>
                      FOUND: {filteredHistory.length}
                    </Typography>
                  )}
                  <Box sx={{ position: 'relative', width: 300 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: 16, height: 16 }} />
                    <input
                      placeholder="Search history..."
                      value={historySearch}
                      onChange={(e) => { setHistorySearch(e.target.value); setHistoryPage(1); }}
                      style={{
                        width: '100%',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '10px',
                        padding: '10px 12px 10px 38px',
                        color: theme.palette.text.primary,
                        fontSize: '0.85rem',
                        outline: 'none'
                      }}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setCompareDialogOpen(true)}
                    sx={{
                      px: 2.5,
                      py: 0.8,
                      borderRadius: 99,
                      textTransform: 'none',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                      background: '#E60000',
                      backdropFilter: 'blur(10px)',
                      color: '#fff',
                      border: (theme) => theme.palette.mode === 'dark'
                        ? '1px solid rgba(255, 255, 255, 0.2)'
                        : '1px solid rgba(0, 0, 0, 0.15)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 4px 20px rgba(230, 0, 0, 0.3)'
                        : '0 4px 12px rgba(230, 0, 0, 0.2)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: '#1d4ed8',
                        transform: 'translateY(-2px)',
                        boxShadow: (theme) => theme.palette.mode === 'dark'
                          ? '0 8px 30px rgba(230, 0, 0, 0.45)'
                          : '0 6px 20px rgba(230, 0, 0, 0.3)',
                        color: '#fff',
                      }
                    }}
                  >
                    Compare
                  </Button>
                </Box>
              </Box>
            )}

            {activeView === 'drilldown' && data && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {filteredTestCases.length > ITEMS_PER_PAGE && (
                  <PaginationControl
                    count={Math.ceil(filteredTestCases.length / ITEMS_PER_PAGE)}
                    page={drilldownPage}
                    onChange={(_, v) => {
                      setDrilldownPage(v);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    sx={{ m: 0, scale: '0.9' }}
                  />
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip
                    label={`BATCH LOAD: ${data?.test_cases?.length || 0} QUESTIONS`}
                    sx={{
                      bgcolor: 'rgba(56, 189, 248, 0.1)',
                      color: '#38bdf8',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                      '& .MuiChip-icon': { color: 'inherit' }
                    }}
                  />
                  {drilldownSearch && (
                    <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: 1 }}>
                      FILTERED: {filteredTestCases.length} / {data.test_cases.length}
                    </Typography>
                  )}
                  <Box sx={{ position: 'relative', width: 350 }}>
                    <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', width: 16, height: 16 }} />
                    <input
                      placeholder="Search cases..."
                      value={drilldownSearch}
                      onChange={(e) => { setDrilldownSearch(e.target.value); setDrilldownPage(1); }}
                      style={{
                        width: '100%',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(0, 0, 0, 0.02)',
                        border: (theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : `1px solid ${theme.palette.divider}`),
                        borderRadius: '10px', padding: '10px 12px 10px 38px', color: theme.palette.text.primary, fontSize: '0.85rem', outline: 'none'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Scrollable Content Area (Freeze Pan) */}
          <Box sx={{
            flexGrow: 1,
            overflowY: (activeView === 'about' || activeView === 'history' || activeView === 'config') ? 'hidden' : 'auto',
            overflowX: 'hidden',
            width: '100%',
            maxWidth: '100vw',
            maxHeight: 'none',
            pt: 0,
            pb: 0,
            pr: 1, // room for scrollbar
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)' },
            '&::-webkit-scrollbar-thumb': {
              background: alpha(theme.palette.primary.main, 0.2),
              borderRadius: '10px',
              border: 'none',
              backgroundClip: 'padding-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: alpha(theme.palette.primary.main, 0.4),
              backgroundClip: 'padding-box'
            }
          }}>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                style={{ height: ['about', 'history', 'config'].includes(activeView) ? '100%' : 'auto' }}
              >
                <Box sx={{ height: ['about', 'history', 'config'].includes(activeView) ? '100%' : 'auto' }}>
                  {/* Dashboard View */}
                  {activeView === 'insights' && data && (
                    <Grid container spacing={2} columns={12}>
                      {/* Score Cards - Row 1 */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Highest RQS"
                          value={winner?.id}
                          color="#ffffff"
                          icon={<Trophy size={24} />}
                          subtitle={`Master Score: ${(winner?.avg_rqs || 0).toFixed(2)}`}
                          trend={trends.rqs}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Best Answer Correctness"
                          value={`${((winner?.gt_alignment || 0) * 100).toFixed(0)}%`}
                          color="#22c55e"
                          icon={<CheckCircle2 size={24} />}
                          subtitle="Peak GT consistency"
                          trend={trends.correctness}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Best Faithfulness"
                          value={`${((winner?.avg_faithfulness || 0) * 100).toFixed(0)}%`}
                          color="#e879f9"
                          icon={<ShieldCheck size={24} />}
                          subtitle="Grounded logic (Top Model)"
                          trend={trends.faithfulness}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Best Relevancy"
                          value={`${((winner?.avg_relevancy || 0) * 100).toFixed(0)}%`}
                          color="#f59e0b"
                          icon={<AlignLeft size={24} />}
                          subtitle="Intent accuracy (Top Model)"
                          trend={trends.relevancy}
                        />
                      </Grid>

                      {/* Score Cards - Row 2 */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Max Context Prec."
                          value={`${((winner?.avg_context_precision || 0) * 100).toFixed(0)}%`}
                          color="#06b6d4"
                          icon={<Cpu size={24} />}
                          subtitle="Retrieval Signal-to-Noise"
                          trend={trends.precision}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Max Context Recall"
                          value={`${((winner?.retrieval_success || 0) * 100).toFixed(0)}%`}
                          color="#6366f1"
                          icon={<Layers size={24} />}
                          subtitle="Information Coverage"
                          trend={trends.recall}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Hallucination Rate"
                          value={`${((1 - (winner?.avg_faithfulness || 0)) * 100).toFixed(0)}%`}
                          color="#ef4444"
                          icon={<AlertTriangle size={24} />}
                          subtitle="Safety Risk Assessment"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <GlassCard
                          title="Total Questions"
                          value={data?.test_cases?.length || 0}
                          color="#64748b"
                          icon={<Target size={24} />}
                          subtitle="Total Evaluation Volume"
                        />
                      </Grid>

                      {/* Main Visualization */}
                      <Grid size={{ xs: 12, md: 8 }} className="no-print">
                        <Paper sx={{ px: 3, py: 2.5, height: 440, borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : 'rgba(255, 255, 255, 0.6)', border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 30px rgba(14, 165, 233, 0.35)' : '0 10px 30px rgba(0,0,0,0.05)' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}>Performance Trajectory</Typography>
                              <Typography variant="caption" color="text.secondary">Multidimensional scoring across top architectures</Typography>
                            </Box>
                          </Box>
                          <Box sx={{ height: 320 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="4 4" vertical={true} stroke={theme.palette.divider} strokeWidth={1.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 700 }} />
                                <ChartTooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 600, top: -10 }} />
                                <Area name="Master RQS Score" type="monotone" dataKey="RQS" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                                <Area name="Answer Correctness" type="monotone" dataKey="AnswerCorrectness" stroke="#22c55e" strokeWidth={2} fillOpacity={0} />
                                <Area name="Answer Faithfulness" type="monotone" dataKey="Faithfulness" stroke="#e879f9" strokeWidth={2} fillOpacity={0} />
                                <Area name="Answer Relevancy" type="monotone" dataKey="Relevancy" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                                <Area name="Context Precision" type="monotone" dataKey="Precision" stroke="#06b6d4" strokeWidth={2} fillOpacity={0} />
                                <Area name="Context Recall" type="monotone" dataKey="Recall" stroke="#6366f1" strokeWidth={2} fillOpacity={0} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Neural Profile HUD */}
                      <Grid size={{ xs: 12, md: 4 }} className="no-print">
                        <MotionPaper
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          sx={{
                            p: 2.5,
                            height: 440,
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{ position: 'relative', zIndex: 1, mb: 2 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}>Neural Topology</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Architectural capability mapping (Top 3)
                            </Typography>
                          </Box>

                          <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1, minHeight: 280 }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="55%"
                                data={[
                                  { subject: 'Answer Correctness', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: Number((m.gt_alignment * 100).toFixed(1)) }), {}) },
                                  { subject: 'Answer Faithfulness', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: Number((m.avg_faithfulness * 100).toFixed(1)) }), {}) },
                                  { subject: 'Answer Relevancy', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: Number((m.avg_relevancy * 100).toFixed(1)) }), {}) },
                                  { subject: 'Context Precision', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: Number((m.avg_context_precision * 100).toFixed(1)) }), {}) },
                                  { subject: 'Context Recall', ...leaderboardData.slice(0, 3).reduce((acc, m) => ({ ...acc, [m.id]: Number((m.retrieval_success * 100).toFixed(1)) }), {}) },
                                ]}
                              >
                                <PolarGrid stroke={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} strokeWidth={1.5} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: theme.palette.text.secondary, fontSize: 10, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <ChartTooltip content={<CustomTooltip />} />
                                {leaderboardData.slice(0, 3).map((model, idx) => (
                                  <Radar
                                    key={model.id}
                                    name={model.id}
                                    dataKey={model.id}
                                    stroke={['#E60000', '#fbbf24', '#f472b6'][idx]}
                                    fill={['#E60000', '#fbbf24', '#f472b6'][idx]}
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
                                  bgcolor: ['#E60000', '#fbbf24', '#f472b6'][idx],
                                  boxShadow: `0 0 10px ${['#E60000', '#fbbf24', '#f472b6'][idx]}`
                                }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem' }}>{model.id}</Typography>
                              </Box>
                            ))}
                          </Box>
                        </MotionPaper>
                      </Grid>


                      {/* Leaderboard Table */}
                      <Grid size={{ xs: 12 }}>
                        <TableContainer component={Paper} sx={{ borderRadius: 2, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ px: 3, py: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}>Comparison Leaderboard</Typography>
                            <Button
                              variant="contained"
                              size="small"
                              endIcon={<ChevronRight size={16} />}
                              onClick={() => handleViewChange('history')}
                              sx={{
                                height: 36,
                                px: 2.5,
                                borderRadius: 99,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                background: theme.palette.primary.main,
                                color: '#fff',
                                textTransform: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  background: theme.palette.primary.dark,
                                  transform: 'translateY(-2px)',
                                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                  color: '#fff',
                                }
                              }}
                            >
                              View All Historical Runs
                            </Button>
                          </Box>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Rank</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Model Architecture</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Master RQS Score</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Answer Correctness</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Faithfulness Score</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Answer Relevancy</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Context Precision</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Context Recall</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Analysis</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {leaderboardData.map((row) => (
                                <TableRow key={row.id} hover>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Box sx={{
                                      width: 28,
                                      height: 28,
                                      borderRadius: '50%',
                                      bgcolor: row.rank === 1 ? 'rgba(245, 158, 11, 0.1)' : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
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
                                  <TableCell sx={{ fontWeight: 700, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{row.id}</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Typography sx={{ color: 'primary.main', fontWeight: 900 }}>{(row.avg_rqs || 0).toFixed(3)}</Typography>
                                  </TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={row.gt_alignment * 100}
                                        sx={{ width: 80, height: 6, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                                      />
                                      <Typography variant="caption">{(row.gt_alignment * 100).toFixed(0)}%</Typography>
                                    </Stack>
                                  </TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{(row.avg_faithfulness * 100).toFixed(1)}%</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{(row.avg_relevancy * 100).toFixed(1)}%</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{(row.avg_context_precision * 100).toFixed(1)}%</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{(row.retrieval_success * 100).toFixed(1)}%</TableCell>
                                  <TableCell align="right" sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Tooltip title="View Detailed Analysis" arrow>
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewChange('drilldown')}
                                      >
                                        <ArrowUpRight size={18} />
                                      </IconButton>
                                    </Tooltip>
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
                    <Grid container spacing={3} sx={{ height: '100%' }}>
                      <Grid size={{ xs: 12 }} sx={{ height: '100%' }}>
                        <TableContainer
                          component={Paper}
                          sx={{
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 30px rgba(14, 165, 233, 0.35)' : '0 10px 30px rgba(0,0,0,0.05)',
                            height: '100%',
                            overflowY: 'auto !important',
                            mb: 0,
                            '&::-webkit-scrollbar': { width: '8px' },
                            '&::-webkit-scrollbar-track': { background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)' },
                            '&::-webkit-scrollbar-thumb': {
                              background: (theme) => theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.2)' : 'rgba(230, 0, 0, 0.3)',
                              borderRadius: '10px',
                              border: (theme) => theme.palette.mode === 'dark' ? 'none' : '2px solid transparent',
                              backgroundClip: 'padding-box'
                            },
                            '&::-webkit-scrollbar-thumb:hover': {
                              background: (theme) => theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.4)' : 'rgba(230, 0, 0, 0.5)',
                              backgroundClip: 'padding-box'
                            }
                          }}
                        >
                          <Table sx={{ tableLayout: 'fixed' }}>
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '200px', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '250px', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Name</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '180px', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Winner</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '120px', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Max RQS</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', width: '80px', position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10, borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredHistory.slice((historyPage - 1) * ITEMS_PER_PAGE, historyPage * ITEMS_PER_PAGE).map((run) => (
                                <TableRow key={run.id} hover>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{new Date(run.timestamp).toLocaleString()}</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>{run.name}</TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Chip
                                      label={run.winner}
                                      size="small"
                                      sx={{ bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', fontWeight: 700 }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Typography sx={{ fontWeight: 700, color: 'primary.light' }}>
                                      {run.summaries?.[run.winner]?.avg_rqs?.toFixed(3) || "N/A"}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ width: '80px', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Tooltip title="Load Report" arrow>
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleLoadReport(run.id)}
                                        sx={{
                                          borderRadius: 1.5,
                                          '&:hover': {
                                            bgcolor: 'rgba(59, 130, 246, 0.1)'
                                          }
                                        }}
                                      >
                                        <Eye size={18} />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              ))}
                              {history.length === 0 && !isLoadingHistory && (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <Typography color="text.secondary">No historical evaluations found.</Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                              {isLoadingHistory && (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <CircularProgress size={32} />
                                    <Typography color="text.secondary" sx={{ mt: 2 }}>Loading evaluation history...</Typography>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                        {/* Pagination moved to header */}
                      </Grid>
                    </Grid>
                  )}

                  {activeView === 'drilldown' && data && (
                    <Box>

                      {filteredTestCases.slice((drilldownPage - 1) * ITEMS_PER_PAGE, drilldownPage * ITEMS_PER_PAGE).map((testCase: any, idx: number) => (
                        <Paper key={`${testCase.id}-${idx}`} sx={{ px: 3, py: 2.5, mb: 3, borderRadius: 2, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 30px rgba(14, 165, 233, 0.35)' : '0 10px 30px rgba(0,0,0,0.05)' }}>
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', fontWeight: 800 }}>SCENARIO ID: {testCase.id}</Typography>

                            <Grid container spacing={3} sx={{ mt: 1 }}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(59, 130, 246, 0.05)', borderRadius: 2, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                  <Typography variant="caption" sx={{ color: 'primary.light', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Primary Question / Prompt</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.9rem', lineHeight: 1.5, fontWeight: 500 }}>{testCase.query}</Typography>
                                </Box>
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <Box sx={{ p: 2, bgcolor: 'rgba(16, 185, 129, 0.05)', borderRadius: 2, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                  <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 800, textTransform: 'uppercase', mb: 1, display: 'block' }}>Reference Ground Truth</Typography>
                                  <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.5 }}>
                                    {testCase.ground_truth || 'No reference ground truth provided for this scenario.'}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>

                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', mb: 2, display: 'block' }}>Architectural Comparison (Top Models)</Typography>
                          <Grid container spacing={2}>
                            {Object.keys(data.summaries).map(bot => (
                              <Grid size={{ xs: 12, md: 3 }} key={bot}>
                                <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: (theme) => theme.palette.divider }}>
                                  <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
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
                                      <MetricSubRow label="Answer Correctness" value={data.bot_metrics[bot]?.[testCase.id]?.semantic_similarity} color="#8b5cf6" />
                                    </Box>

                                    <Divider sx={{ my: 1.5, opacity: 0.1 }} />
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                                      <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>MASTER RQS</Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                          {(data.bot_metrics[bot]?.[testCase.id]?.rqs || 0).toFixed(3)}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      ))}
                      {/* Pagination moved to header */}
                    </Box>

                  )}



                  {activeView === 'config' && (
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Grid container spacing={1.5} sx={{ flexGrow: 1, minHeight: 0 }}>
                        {/* Left Column - Core Intelligence & RQS Weights */}
                        <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                          <Paper sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 30px rgba(230, 0, 0, 0.2)' : '0 10px 30px rgba(0, 0, 0, 0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', letterSpacing: '-0.01em' }}>Neural Engine Configuration</Typography>
                              <FormControlLabel
                                control={<Switch size="small" checked={config.expertMode} onChange={(e) => setConfig({ ...config, expertMode: e.target.checked })} />}
                                label={<Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: config.expertMode ? 'primary.main' : 'text.secondary' }}>EXPERT</Typography>}
                              />
                            </Box>

                            {/* Section 1: Core Intelligence */}
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, mb: 0.5, display: 'block', fontSize: '0.6rem' }}>I. Core Intelligence</Typography>

                            <Box sx={{ mb: 1 }}>
                              <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                <Cpu size={14} /> Judge Model (LLM)
                              </Typography>
                              <Grid container spacing={1.5}>
                                {['gpt-4o', 'gpt-3.5-turbo', 'claude-3-sonnet'].map((m) => (
                                  <Grid size={{ xs: 4 }} key={m}>
                                    <Button
                                      fullWidth
                                      onClick={() => setConfig({ ...config, judgeModel: m })}
                                      sx={{
                                        p: 1, borderRadius: 1.5, border: '1px solid',
                                        borderColor: config.judgeModel === m ? theme.palette.primary.main : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                        bgcolor: config.judgeModel === m ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                        color: config.judgeModel === m ? theme.palette.primary.main : 'text.secondary',
                                        textTransform: 'none',
                                        minHeight: 0
                                      }}
                                    >
                                      <Typography variant="caption" fontWeight={700} fontSize="0.65rem">{m.toUpperCase()}</Typography>
                                    </Button>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>

                            <Grid container spacing={1.5} sx={{ mb: 1 }}>
                              <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                  <Thermometer size={14} /> Temperature
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Slider
                                    size="small"
                                    value={config.temperature}
                                    min={0} max={1} step={0.1}
                                    onChange={(_, v) => setConfig({ ...config, temperature: v as number })}
                                    sx={{ flex: 1 }}
                                  />
                                  <Typography variant="caption" sx={{ minWidth: 25, fontWeight: 700, fontSize: '0.7rem' }}>{config.temperature.toFixed(1)}</Typography>
                                </Stack>
                              </Grid>
                              <Grid size={{ xs: 6 }}>
                                <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                  <Users size={14} /> Workers
                                </Typography>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Slider
                                    size="small"
                                    value={config.concurrency}
                                    min={1} max={20} step={1}
                                    onChange={(_, v) => setConfig({ ...config, concurrency: v as number })}
                                    sx={{ flex: 1 }}
                                  />
                                  <Typography variant="caption" sx={{ minWidth: 25, fontWeight: 700, fontSize: '0.7rem' }}>{config.concurrency}x</Typography>
                                </Stack>
                              </Grid>
                            </Grid>

                            <Divider sx={{ my: 1, borderColor: (theme) => theme.palette.divider }} />

                            {/* Section 2: RQS Weights */}
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, mb: 0.5, display: 'block', fontSize: '0.6rem' }}>II. Scoring Architecture (RQS)</Typography>

                            <Grid container spacing={1.5}>
                              {[
                                { label: 'Alpha (Semantic)', key: 'alpha', color: '#E60000' },
                                { label: 'Beta (Faithful)', key: 'beta', color: '#8b5cf6' },
                                { label: 'Gamma (Relevant)', key: 'gamma', color: '#f59e0b' }
                              ].map((param) => (
                                <Grid size={{ xs: 4 }} key={param.key}>
                                  <Box sx={{ p: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 1.5, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.5, fontSize: '0.65rem' }}>{param.label}</Typography>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Slider
                                        size="small"
                                        value={(config as any)[param.key]}
                                        min={0} max={1} step={0.05}
                                        onChange={(_, v) => setConfig({ ...config, [param.key]: v as number })}
                                        sx={{ color: param.color }}
                                      />
                                      <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.7rem', minWidth: 30 }}>{(config as any)[param.key].toFixed(2)}</Typography>
                                    </Stack>
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                            {(config.alpha + config.beta + config.gamma) > 1.0 && (
                              <Alert severity="warning" sx={{ mt: 1, fontSize: '0.65rem', py: 0.25 }}>
                                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                  Weight sum exceeds 1.0 ({(config.alpha + config.beta + config.gamma).toFixed(2)}). Weights will be auto-normalized during evaluation.
                                </Typography>
                              </Alert>
                            )}
                          </Paper>
                        </Grid>

                        {/* Right Column - System Guardrails */}
                        <Grid size={{ xs: 12, md: 6 }}>
                          <Paper sx={{ px: 2, py: 2, borderRadius: 2, bgcolor: 'background.paper', border: (theme) => `1px solid ${theme.palette.divider}`, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 0 30px rgba(14, 165, 233, 0.35)' : '0 10px 30px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, mb: 1, display: 'block', fontSize: '0.6rem' }}>III. System Guardrails</Typography>

                            <Box sx={{ mb: 0.75 }}>
                              <Box sx={{ p: 1.25, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                  <Target size={14} /> Precision Threshold
                                </Typography>
                                <Slider
                                  size="small"
                                  value={config.strictness}
                                  min={0.5} max={1} step={0.01}
                                  onChange={(_, v) => setConfig({ ...config, strictness: v as number })}
                                  valueLabelDisplay="auto"
                                />
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', fontSize: '0.65rem' }}>
                                  Minimum confidence required for a "Pass" status.
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ mb: 0.75 }}>
                              <Box sx={{ p: 1.25, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                                <Typography variant="caption" sx={{ mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                                  <AlignLeft size={14} /> Dataset Size Limit
                                </Typography>
                                <Slider
                                  size="small"
                                  value={config.maxRows}
                                  min={10} max={1000} step={10}
                                  onChange={(_, v) => setConfig({ ...config, maxRows: v as number })}
                                  valueLabelDisplay="auto"
                                />
                                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', fontSize: '0.65rem' }}>
                                  Maximum number of rows allowed for evaluation (Safety Limit: {config.maxRows}).
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ mb: 0.75 }}>
                              <Paper variant="outlined" sx={{ p: 1.25, bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.75rem' }}>
                                    <Shield size={14} /> Automated Safety
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>Scan for hallucination triggers</Typography>
                                </Box>
                                <Switch size="small" checked={config.enableSafety} onChange={(e) => setConfig({ ...config, enableSafety: e.target.checked })} />
                              </Paper>
                            </Box>

                            <Box sx={{ mb: 1 }}>
                              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>
                                <Typography variant="caption" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 1, fontSize: '0.75rem' }}>
                                  <FileJson size={14} /> Export Format
                                </Typography>
                                <Grid container spacing={1.5}>
                                  {['PDF', 'JSON', 'Excel'].map((format) => (
                                    <Grid size={{ xs: 4 }} key={format}>
                                      <Button
                                        fullWidth
                                        onClick={() => setConfig({ ...config, exportFormat: format })}
                                        sx={{
                                          p: 1, borderRadius: 1.5, border: '1px solid',
                                          borderColor: config.exportFormat === format ? theme.palette.primary.main : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                          bgcolor: config.exportFormat === format ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                          color: config.exportFormat === format ? theme.palette.primary.main : 'text.secondary',
                                          textTransform: 'none',
                                          minHeight: 0
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          {format === 'PDF' && <FileText size={12} />}
                                          {format === 'JSON' && <FileJson size={12} />}
                                          {format === 'Excel' && <FileSpreadsheet size={12} />}
                                          <Typography variant="caption" fontWeight={700} fontSize="0.65rem">{format}</Typography>
                                        </Box>
                                      </Button>
                                    </Grid>
                                  ))}
                                </Grid>
                              </Paper>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid> {/* Added missing closing Grid tag here */}

                      {/* Bottom Right Apply Button */}
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                        <Button
                          variant="contained"
                          startIcon={<Settings2 size={18} />}
                          onClick={() => {
                            setSnackbarMsg('Neural Engine synchronized with new parameters.');
                            setSaveSuccess(true);
                          }}
                          sx={{
                            px: 2.5,
                            py: 0.8,
                            borderRadius: 99,
                            fontWeight: 900,
                            textTransform: 'none',
                            fontSize: '0.8rem',
                            background: '#E60000',
                            color: '#fff',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 4px 14px rgba(230, 0, 0, 0.25)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: '#1d4ed8',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(230, 0, 0, 0.45)',
                              border: (theme) => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.1)',
                            }
                          }}
                        >
                          Apply Settings
                        </Button>
                      </Box>
                    </Box>
                  )}


                </Box>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>

        {/* Evaluation Modal Backdrop */}
        <Backdrop
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 999,
            backdropFilter: 'blur(20px) saturate(180%)',
            bgcolor: 'rgba(2, 6, 23, 0.85)'
          }}
          open={isEvaluating}
        >
          <Box sx={{
            width: 860,
            textAlign: 'center',
            animation: 'fadeInScale 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 4 }}>
              <CircularProgress
                size={96}
                thickness={2}
                sx={{
                  color: '#E60000',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  }
                }}
              />
              <Box sx={{
                position: 'absolute',
                top: 0, left: 0, bottom: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <motion.div
                  animate={{ rotate: [0, 15, -15, 15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <UbsLogo size={64} color="#E60000" />
                </motion.div>
              </Box>
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.04em', color: '#fff' }}>
              RAG Diagnostic Engine Processing
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 5, opacity: 0.8, fontWeight: 500 }}>
              Synchronizing tokens and calculating RAG metrics...
            </Typography>

            <Paper
              elevation={0}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.65)',
                p: 0,
                borderRadius: 4,
                border: '1px solid rgba(56, 189, 248, 0.3)',
                height: 480,
                overflow: 'hidden',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 0 50px rgba(0,0,0,0.5), inset 0 0 20px rgba(56, 189, 248, 0.05)'
              }}
            >
              {/* Terminal Header */}
              <Box sx={{
                px: 3,
                py: 1.5,
                bgcolor: 'rgba(15, 23, 42, 0.8)',
                borderBottom: '1px solid rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ef4444', opacity: 0.8 }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f59e0b', opacity: 0.8 }} />
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#10b981', opacity: 0.8 }} />
                <Typography sx={{ ml: 2, fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.1em', opacity: 0.6, color: '#38bdf8' }}>
                  RAG_METRICS_ENGINE_v1.0.0
                </Typography>
              </Box>

              {/* Logs Area */}
              <Box className="custom-scrollbar" sx={{
                flexGrow: 1,
                p: 4,
                overflow: 'auto',
                fontFamily: '"JetBrains Mono", "Fira Code", monospace'
              }}>
                {statusLogs.map((log, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 3, mb: 1.5, animation: 'fadeInLogs 0.2s ease-out' }}>
                    <Typography variant="caption" sx={{
                      fontFamily: 'inherit',
                      color: '#38bdf8',
                      opacity: 0.4,
                      whiteSpace: 'nowrap',
                      width: '90px'
                    }}>
                      [{new Date().toLocaleTimeString()}]
                    </Typography>
                    <Typography sx={{
                      fontFamily: 'inherit',
                      fontSize: '0.9rem',
                      color: log.includes('SUCCESS') ? '#10b981' : log.includes('CRITICAL') ? '#ef4444' : '#f8fafc',
                      lineHeight: 1.6
                    }}>
                      {log}
                    </Typography>
                  </Box>
                ))}
                <div ref={logEndRef} />
              </Box>

              {/* Bottom Cursor Area */}
              <Box sx={{ px: 4, pb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: 'primary.main', fontWeight: 900, fontSize: '0.9rem' }}>$</Typography>
                <Box sx={{ width: 12, height: 20, bgcolor: 'primary.main', animation: 'blink 1s infinite' }} />
              </Box>
            </Paper>
          </Box>
        </Backdrop>

        {/* Report Loading Backdrop */}
        <Backdrop
          sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 2, backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' }}
          open={isLoadingReport}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="secondary" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 3, fontWeight: 700 }}>Loading Full Report...</Typography>
          </Box>
        </Backdrop>
      </Box>

      <PrintOnlyReport data={data} leaderboardData={leaderboardData} />

      {/* Compare Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? `0 0 40px ${alpha(theme.palette.primary.main, 0.4)}` : '0 10px 40px rgba(0,0,0,0.1)',
            minHeight: '80vh',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
          Compare Evaluations
        </DialogTitle>
        <DialogContent sx={{
          pt: 3,
          maxHeight: 'calc(90vh - 180px)',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-track': { background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)' },
          '&::-webkit-scrollbar-thumb': {
            background: (theme) => theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.25)' : 'rgba(230, 0, 0, 0.15)',
            borderRadius: '10px',
            border: (theme) => theme.palette.mode === 'dark' ? '2px solid rgba(15, 23, 42, 0.8)' : '2px solid rgba(255, 255, 255, 0.9)',
            backgroundClip: 'padding-box'
          },
          '&::-webkit-scrollbar-thumb:hover': { background: (theme) => theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.4)' : 'rgba(230, 0, 0, 0.3)' }
        }}>
          {!showComparisonResults ? (
            <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'text.secondary' }}>First Evaluation</InputLabel>
                  <Select
                    value={compareEval1}
                    onChange={(e) => setCompareEval1(e.target.value)}
                    label="First Evaluation"
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: (theme) => theme.palette.divider
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    {history.map((run) => (
                      <MenuItem key={run.id} value={run.id} disabled={run.id === compareEval2}>
                        {run.name} - {new Date(run.timestamp).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'text.secondary' }}>Second Evaluation</InputLabel>
                  <Select
                    value={compareEval2}
                    onChange={(e) => setCompareEval2(e.target.value)}
                    label="Second Evaluation"
                    sx={{
                      bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 2,
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: (theme) => theme.palette.divider
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main'
                      }
                    }}
                  >
                    {history.map((run) => (
                      <MenuItem key={run.id} value={run.id} disabled={run.id === compareEval1}>
                        {run.name} - {new Date(run.timestamp).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          ) : (() => {
            const eval1 = history.find(h => h.id === compareEval1);
            const eval2 = history.find(h => h.id === compareEval2);
            if (!eval1 || !eval2) return null;

            const metrics = [
              { label: 'Master RQS Score', key: 'avg_rqs', format: (v: number) => v?.toFixed(3) || 'N/A' },
              { label: 'Answer Correctness', key: 'gt_alignment', format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { label: 'Faithfulness', key: 'avg_faithfulness', format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { label: 'Relevancy', key: 'avg_relevancy', format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { label: 'Context Precision', key: 'avg_context_precision', format: (v: number) => `${(v * 100).toFixed(1)}%` },
              { label: 'Context Recall', key: 'retrieval_success', format: (v: number) => `${(v * 100).toFixed(1)}%` },
            ];

            return (
              <Box sx={{ mt: 2 }}>
                {/* Header */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2.5, bgcolor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Evaluation 1</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 1 }}>{eval1.name}</Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Date:</strong> {new Date(eval1.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Winner:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{eval1.winner}</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Models:</strong> {Object.keys(eval1.summaries || {}).join(', ')}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Paper sx={{ p: 2.5, bgcolor: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Evaluation 2</Typography>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', mb: 1 }}>{eval2.name}</Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Date:</strong> {new Date(eval2.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Winner:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>{eval2.winner}</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          <strong>Models:</strong> {Object.keys(eval2.summaries || {}).join(', ')}
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Winner Metrics Comparison */}
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', mb: 2, color: 'primary.light' }}>Winner Metrics Comparison</Typography>
                <TableContainer component={Paper} sx={{ bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 3 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>Metric</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#3b82f6', fontSize: '0.7rem', textTransform: 'uppercase' }}>Eval 1</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: '#ec4899', fontSize: '0.7rem', textTransform: 'uppercase' }}>Eval 2</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem', textTransform: 'uppercase' }}>Difference</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.map((metric) => {
                        const val1 = eval1.summaries?.[eval1.winner]?.[metric.key] || 0;
                        const val2 = eval2.summaries?.[eval2.winner]?.[metric.key] || 0;
                        const diff = val1 - val2;
                        const diffPercent = metric.key === 'avg_rqs' ? (diff * 100).toFixed(1) : (diff * 100).toFixed(1);
                        const isPositive = diff > 0;

                        return (
                          <TableRow key={metric.key} hover>
                            <TableCell sx={{ fontWeight: 600, fontSize: '0.85rem' }}>{metric.label}</TableCell>
                            <TableCell align="center" sx={{
                              fontWeight: 700,
                              color: isPositive ? '#10b981' : 'text.primary',
                              bgcolor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                            }}>
                              {metric.format(val1)}
                              {isPositive && <Trophy size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                            </TableCell>
                            <TableCell align="center" sx={{
                              fontWeight: 700,
                              color: !isPositive && diff !== 0 ? '#10b981' : 'text.primary',
                              bgcolor: !isPositive && diff !== 0 ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                            }}>
                              {metric.format(val2)}
                              {!isPositive && diff !== 0 && <Trophy size={14} style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${diff > 0 ? '+' : ''}${diffPercent}${metric.key === 'avg_rqs' ? '' : '%'}`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: '0.7rem',
                                  bgcolor: diff > 0 ? 'rgba(16, 185, 129, 0.2)' : diff < 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                  color: diff > 0 ? '#10b981' : diff < 0 ? '#ef4444' : '#64748b'
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
          <Button
            variant="contained"
            onClick={() => {
              setCompareDialogOpen(false);
              setShowComparisonResults(false);
              setCompareEval1('');
              setCompareEval2('');
            }}
            sx={{
              borderRadius: 99,
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              background: '#e11d48',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: '#be123c',
                boxShadow: '0 6px 20px rgba(225, 29, 72, 0.45)',
                transform: 'translateY(-2px)',
                color: '#fff',
              }
            }}
          >
            {showComparisonResults ? 'Close' : 'Cancel'}
          </Button>
          {!showComparisonResults && (
            <Tooltip title={(!compareEval1 || !compareEval2) ? "Please select two evaluations to compare" : ""} arrow>
              <span>
                <Button
                  variant="contained"
                  disabled={!compareEval1 || !compareEval2}
                  onClick={() => {
                    setShowComparisonResults(true);
                  }}
                  sx={{
                    borderRadius: 99,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    background: '#E60000',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                      ? '0 4px 20px rgba(230, 0, 0, 0.3)'
                      : '0 4px 12px rgba(230, 0, 0, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: '#1d4ed8',
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 8px 30px rgba(230, 0, 0, 0.45)'
                        : '0 6px 20px rgba(230, 0, 0, 0.3)',
                      color: '#fff',
                    },
                    '&.Mui-disabled': {
                      background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                      color: (theme) => theme.palette.text.disabled,
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                      boxShadow: 'none'
                    }
                  }}
                >
                  Compare
                </Button>
              </span>
            </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar open={saveSuccess} autoHideDuration={3000} onClose={() => setSaveSuccess(false)}>
        <Alert
          onClose={() => setSaveSuccess(false)}
          icon={snackbarMsg.includes('Report') ? <Download size={18} /> : <CheckCircle2 size={18} />}
          sx={{
            width: '100%',
            borderRadius: 3,
            bgcolor: 'rgba(15, 23, 42, 0.95)',
            color: '#38bdf8',
            fontWeight: 800,
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.4)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            backdropFilter: 'blur(10px)',
            '.MuiAlert-icon': { color: '#38bdf8' }
          }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>

      <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden !important;
          }
          @keyframes blink { 0%, 100% { opacity: 0; } 50% { opacity: 1; } }
          @keyframes shine {
            from { background-position: 200% 0; }
            to { background-position: -200% 0; }
          }
          @keyframes fadeInLogs { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fadeInScale { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .custom-scrollbar::-webkit-scrollbar { width: '8px'; }
          .custom-scrollbar::-webkit-scrollbar-track { background: ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.03)'}; }
          .custom-scrollbar::-webkit-scrollbar-thumb { 
            background: ${theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.2)' : 'rgba(230, 0, 0, 0.3)'}; 
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${theme.palette.mode === 'dark' ? 'rgba(230, 0, 0, 0.4)' : 'rgba(230, 0, 0, 0.5)'}; }
          @media print {
            body { background: ${theme.palette.mode === 'dark' ? '#0f172a' : '#ffffff'} !important; color: ${theme.palette.mode === 'dark' ? '#ffffff' : '#000000'} !important; }
            /* Hide the entire web UI */
            .main-ui-container { display: none !important; }
            /* Show only the print-ready report */
            .print-only-report {
              display: block !important;
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              z-index: 99999 !important;
            }
          }
        `}</style>
    </>
  );
}

// Component to handle search params (wrapped in Suspense)
function SearchParamsHandler({ onViewChange }: { onViewChange: (view: string) => void }) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const viewFromUrl = searchParams.get('view');
    if (viewFromUrl && ['insights', 'drilldown', 'history', 'about', 'config'].includes(viewFromUrl)) {
      onViewChange(viewFromUrl);
    }
  }, [searchParams, onViewChange]);

  return null;
}

// Wrapper component with Suspense boundary
export default function EnterpriseDashboard() {
  return (
    <ThemeRegistry>
      <Suspense fallback={
        <Box sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}>
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        </Box>
      }>
        <EnterpriseDashboardContent />
      </Suspense>
    </ThemeRegistry>
  );
}

// --- Helper Components ---

// --- Additional Helper Components ---

const safeVal = (val: any) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

const formatPercent = (val: any) => `${(safeVal(val) * 100).toFixed(1)}%`;
const formatNum = (val: any, dec = 3) => safeVal(val).toFixed(dec);



function SidebarItem({ icon, label, active, onClick }: any) {
  const theme = useTheme();
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 2,
          color: active ? 'primary.main' : 'text.secondary',
          bgcolor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
          '&:hover': {
            bgcolor: active ? alpha(theme.palette.primary.main, 0.12) : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
            color: active ? 'primary.main' : 'text.primary',
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
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)', border: (theme) => `1px solid ${theme.palette.divider}` }}>
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
