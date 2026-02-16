'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText, Button, Chip, useTheme, alpha } from '@mui/material';
import { ReactFlow, Node, Edge, Background, Controls, useNodesState, useEdgesState, MarkerType, ReactFlowProvider, useReactFlow, Handle, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useAgentEvents } from '../hooks/useAgentEvents';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import TerminalIcon from '@mui/icons-material/Terminal';
import { useSidebar } from '../contexts/SidebarContext';

// Agent Name to Node ID Mapping
const agentNodeMap: Record<string, string> = {
    'Orchestrator': 'orchestrator',
    'Target Agent': 'target',
    'Semantic Similarity Agent': 'semantic',
    'Safety Agent': 'safety',
    'LLM Judge Agent': 'llm_judge',
    'Consistency Agent': 'aggregator',
    'Exact Match Agent': 'exact'
};

// Custom LLM Judge Node with right-side handle
const LLMJudgeNode = ({ data }: any) => {
    const theme = useTheme();
    return (
        <div style={{
            background: alpha('#ed6c02', 0.15),
            color: theme.palette.text.primary,
            borderWidth: '3px',
            borderStyle: 'solid',
            borderColor: '#ed6c02',
            borderRadius: '50%',
            width: '140px',
            height: '140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 600,
            boxShadow: `0 4px 20px ${alpha('#ed6c02', 0.3)}`,
            padding: '10px'
        }}>
            <Handle type="target" position={Position.Top} style={{ background: '#ed6c02' }} />
            {data.label}
            <Handle type="source" position={Position.Right} id="right" style={{ background: '#ed6c02' }} />
        </div>
    );
};

const nodeTypes = {
    llmJudge: LLMJudgeNode
};


// --- Initial Graph Setup ---
// Helper to generate nodes based on theme
const getInitialNodes = (theme: any): Node[] => {
    const nodeStyle = {
        background: alpha(theme.palette.background.paper, 0.9),
        color: theme.palette.text.primary,
        borderWidth: '2px',
        borderStyle: 'solid' as const,
        borderColor: theme.palette.divider,
        borderRadius: '12px',
        padding: '10px',
        fontSize: '18px',
        fontWeight: 600,
        width: '200px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center' as const,
        boxShadow: theme.shadows[3],
    };

    // Layout Constants
    const CENTER_X = 600;
    const NODE_WIDTH = 200;
    const GAP_X = 50;
    const START_Y = 20;
    const GAP_Y = 150;

    // Helper to calculate X for a row of N nodes centered at CENTER_X
    const getRowX = (index: number, total: number) => {
        const totalWidth = total * NODE_WIDTH + (total - 1) * GAP_X;
        const startX = CENTER_X - totalWidth / 2;
        return startX + index * (NODE_WIDTH + GAP_X);
    };

    const nodes = [
        // Top: Orchestrator
        {
            id: 'orchestrator',
            position: { x: CENTER_X - NODE_WIDTH / 2, y: START_Y },
            data: { label: 'Orchestrator Agent' },
            type: 'input',
            style: {
                ...nodeStyle,
                background: alpha(theme.palette.primary.main, 0.15),
                borderColor: theme.palette.primary.main,
                borderWidth: '3px',
                fontSize: '18px',
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`
            }
        },

        // Second level: Target Agent
        {
            id: 'target',
            position: { x: CENTER_X - NODE_WIDTH / 2, y: START_Y + GAP_Y },
            data: { label: 'Target Agent' },
            style: {
                ...nodeStyle,
                background: alpha('#9c27b0', 0.15),
                borderColor: '#9c27b0',
                borderWidth: '2px',
                boxShadow: `0 4px 20px ${alpha('#9c27b0', 0.3)}`
            }
        },

        // Third level: Metric Agents (Row 1) - 2 agents
        { id: 'semantic', position: { x: getRowX(0, 2), y: START_Y + GAP_Y * 2 }, data: { label: 'Semantic Agent' }, style: { ...nodeStyle, background: alpha('#2e7d32', 0.15), borderColor: '#2e7d32', boxShadow: `0 4px 20px ${alpha('#2e7d32', 0.3)}` } },
        { id: 'exact', position: { x: getRowX(1, 2), y: START_Y + GAP_Y * 2 }, data: { label: 'Exact Match Agent' }, style: { ...nodeStyle, background: alpha('#f57c00', 0.15), borderColor: '#f57c00', boxShadow: `0 4px 20px ${alpha('#f57c00', 0.3)}` } },

        // Fourth level: Metric Agents (Row 2) - 1 agent
        { id: 'safety', position: { x: CENTER_X - NODE_WIDTH / 2, y: START_Y + GAP_Y * 3 }, data: { label: 'Safety Agent' }, style: { ...nodeStyle, background: alpha('#009688', 0.15), borderColor: '#009688', boxShadow: `0 4px 20px ${alpha('#009688', 0.3)}` } },

        // Bottom: Aggregator & LLM Judge
        {
            id: 'llm_judge',
            type: 'llmJudge',
            position: { x: getRowX(0, 4), y: START_Y + GAP_Y * 4 },
            data: { label: 'LLM Judge Agent' }
        },
        {
            id: 'aggregator',
            position: { x: CENTER_X - NODE_WIDTH / 2, y: START_Y + GAP_Y * 5 },
            data: { label: 'Aggregator Agent' },
            type: 'output',
            style: {
                ...nodeStyle,
                background: alpha('#0288d1', 0.15),
                borderColor: '#0288d1',
                borderWidth: '3px',
                fontSize: '18px',
                boxShadow: `0 4px 20px ${alpha('#0288d1', 0.3)}`
            }
        },
    ];
    // console.log('Initial Nodes:', nodes);
    return nodes;
};

const getInitialEdges = (theme: any): Edge[] => {
    const edgeStyle = { stroke: theme.palette.text.secondary, strokeWidth: 1, strokeDasharray: '5,5' };
    const marker = { type: MarkerType.ArrowClosed, color: theme.palette.text.secondary };

    const edges = [
        { id: 'e1', source: 'orchestrator', target: 'target' },
        { id: 'e2', source: 'target', target: 'semantic' },
        { id: 'e7', source: 'target', target: 'safety' },
        { id: 'e8', source: 'orchestrator', target: 'llm_judge' },
        { id: 'e9', source: 'target', target: 'exact' },
        { id: 'e10', source: 'semantic', target: 'aggregator' },
        { id: 'e15', source: 'safety', target: 'aggregator' },
        { id: 'e16', source: 'llm_judge', sourceHandle: 'right', target: 'aggregator' },
        { id: 'e17', source: 'exact', target: 'aggregator' }
    ];

    return edges.map(e => ({
        ...e,
        animated: false,
        style: edgeStyle,
        markerEnd: marker
    }));
};

// Inner component that uses ReactFlow hooks
function FlowContent() {
    const theme = useTheme();
    const { sidebarWidth } = useSidebar();
    const { events, isConnected, clearEvents } = useAgentEvents();
    const reactFlowInstance = useReactFlow();

    const bottomRef = useRef<HTMLDivElement>(null);

    // Get theme-aware colors
    const flowBgColor = theme.palette.mode === 'dark' ? '#1e1e1e' : theme.palette.background.paper;
    const gridColor = theme.palette.mode === 'dark' ? '#444' : '#e0e7ff';

    // React Flow State
    const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(theme));
    const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges(theme));

    // Update node styles when theme changes
    useEffect(() => {
        const newNodes = getInitialNodes(theme);
        setNodes((nds) => nds.map((node) => {
            const matchingNewNode = newNodes.find(n => n.id === node.id);
            return {
                ...node,
                style: matchingNewNode ? matchingNewNode.style : node.style
            };
        }));
    }, [theme.palette.mode, setNodes, theme]);

    // Fit view when nodes are initialized
    useEffect(() => {
        const timer = setTimeout(() => {
            reactFlowInstance.fitView({ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 });
        }, 100);
        return () => clearTimeout(timer);
    }, [reactFlowInstance]);

    // Handle incoming events to animate EDGES
    // We rebuild the edge state from the entire event history to ensure consistency
    useEffect(() => {
        if (events.length === 0) {
            setEdges(getInitialEdges(theme)); // Reset to initial if no events
            return;
        }

        // 1. Start with clean edges
        let currentEdges = getInitialEdges(theme);
        const baseEdges = getInitialEdges(theme); // Reference for base styles

        // 2. Replay all events to determine final state of each edge
        events.forEach(event => {
            const nodeId = agentNodeMap[event.agent_name];
            if (!nodeId) return;

            currentEdges = currentEdges.map(edge => {
                // We only care about edges pointing TO the active agent
                if (edge.target === nodeId) {
                    const baseEdge = baseEdges.find(e => e.id === edge.id);
                    const baseStyle = baseEdge?.style || {};

                    if (event.status === 'working') {
                        return {
                            ...edge,
                            animated: true,
                            style: { ...baseStyle, stroke: '#2196f3', strokeWidth: 3 }
                        };
                    } else if (event.status === 'completed') {
                        return {
                            ...edge,
                            animated: true,
                            style: { ...baseStyle, stroke: '#4caf50', strokeWidth: 3 }
                        };
                    } else if (event.status === 'failed') {
                        return {
                            ...edge,
                            animated: false,
                            style: { ...baseStyle, stroke: '#f44336', strokeWidth: 3 }
                        };
                    }
                }
                return edge;
            });
        });

        // 4. Update ReactFlow state
        setEdges(currentEdges);

    }, [events, theme, setEdges]);

    // Scroll log
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', transition: 'margin-left 0.3s ease-in-out' }}>

                {/* Header */}
                {/* Header */}
                <Box sx={{ height: '70px', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: (theme) => alpha(theme.palette.background.paper, 0.7), backdropFilter: 'blur(10px)', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ pt: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Agent Interaction
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Live Agent Communication Flow
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            startIcon={<AssessmentIcon />}
                            href="/test-evaluations"
                            sx={{
                                fontWeight: 'bold',
                            }}
                        >
                            View Results
                        </Button>
                        <Chip
                            icon={<TerminalIcon />}
                            label={isConnected ? "System Online" : "Disconnected"}
                            color={isConnected ? "success" : "error"}
                            variant="outlined"
                        />
                        <ThemeToggle />
                    </Box>
                </Box>

                <Box sx={{ flexGrow: 1, p: 2, overflow: 'hidden' }}>
                    <Grid container spacing={2} sx={{ height: '100%' }}>

                        {/* Center Panel: Flow Diagram */}
                        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%' }}>
                            <Paper sx={{
                                height: '100%',
                                borderRadius: 2,
                                overflow: 'hidden',
                                bgcolor: flowBgColor,
                                '& .react-flow__node': {
                                    transition: 'all 0.3s ease',
                                },
                                '& .react-flow__node.active': {
                                    animation: 'pulse 2s ease-in-out infinite',
                                    boxShadow: '0 0 20px rgba(25, 118, 210, 0.6)',
                                },
                                '@keyframes pulse': {
                                    '0%, 100%': {
                                        transform: 'scale(1)',
                                        boxShadow: '0 0 20px rgba(25, 118, 210, 0.6)',
                                    },
                                    '50%': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 0 30px rgba(25, 118, 210, 0.8)',
                                    },
                                },
                                // Theme-aware Controls styling
                                '& .react-flow__controls': {
                                    button: {
                                        backgroundColor: theme.palette.mode === 'dark' ? '#424242' : '#fff',
                                        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
                                        borderColor: theme.palette.mode === 'dark' ? '#666' : '#ddd',
                                        '&:hover': {
                                            backgroundColor: theme.palette.mode === 'dark' ? '#616161' : '#f5f5f5',
                                        },
                                    },
                                },
                            }}>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={edges}
                                    onNodesChange={onNodesChange}
                                    onEdgesChange={onEdgesChange}
                                    nodeTypes={nodeTypes}
                                    fitViewOptions={{ padding: 0.2, minZoom: 0.5, maxZoom: 1.5 }}
                                    attributionPosition="bottom-left"
                                    minZoom={0.5}
                                    maxZoom={1.5}
                                    proOptions={{ hideAttribution: true }}
                                >
                                    <Background color={gridColor} gap={16} />
                                    <Controls showInteractive={false} />
                                </ReactFlow>
                            </Paper>
                        </Grid>

                        {/* Right Panel: Event Log */}
                        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%' }}>
                            <Paper sx={{ height: '100%', p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#2196f3' }}>
                                    <DescriptionIcon sx={{ color: '#2196f3' }} /> Event Log
                                </Typography>
                                <List sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1 }}>
                                    {events.map((event, index) => (
                                        <ListItem key={index} divider alignItems="flex-start">
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="subtitle2" sx={{ color: '#2196f3' }}>
                                                            {event.agent_name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(event.timestamp).toLocaleTimeString()}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box component="div">
                                                        <Typography variant="body2" component="div" sx={{ color: 'text.primary', mb: 0.5 }}>
                                                            {event.message}
                                                        </Typography>
                                                        {event.details && (
                                                            <Paper variant="outlined" sx={{ p: 1, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', fontSize: '0.75rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                                                {JSON.stringify(event.details, null, 2)}
                                                            </Paper>
                                                        )}
                                                    </Box>
                                                }
                                                secondaryTypographyProps={{ component: 'div' }}
                                            />
                                        </ListItem>
                                    ))}
                                    <div ref={bottomRef} />
                                </List>
                            </Paper>
                        </Grid>

                    </Grid>
                </Box>
            </Box>
        </Box>
    );
}

export default function AgentInteractionPage() {
    return (
        <ReactFlowProvider>
            <FlowContent />
        </ReactFlowProvider>
    );
}
