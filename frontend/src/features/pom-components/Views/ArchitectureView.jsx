import React, { useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Typography, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Network } from 'lucide-react';

// Custom node styles
const createNodeStyle = (color, gradient) => ({
    background: gradient,
    color: 'white',
    border: `2px solid ${color}`,
    borderRadius: '12px',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 180,
    boxShadow: `0 4px 20px ${color}40`,
});

const initialNodes = [
    // User Input Layer - Top Center
    {
        id: 'user',
        type: 'input',
        data: { label: '👤 User\nRequirements & Actions' },
        position: { x: 1050, y: 0 },
        style: createNodeStyle('#4caf50', 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)'),
    },

    // Test Design Layer - Far Left
    {
        id: 'test-design',
        data: { label: '🌟 Test Design Module' },
        position: { x: 0, y: 220 },
        style: createNodeStyle('#9c27b0', 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'),
    },
    {
        id: 'ai-engine',
        data: { label: '🤖 AI Engine\nGemini/OpenAI' },
        position: { x: 0, y: 440 },
        style: createNodeStyle('#9c27b0', 'linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%)'),
    },
    {
        id: 'test-scenarios',
        data: { label: '📋 Test Scenarios\nGenerated Cases' },
        position: { x: 0, y: 660 },
        style: createNodeStyle('#9c27b0', 'linear-gradient(135deg, #ba68c8 0%, #9c27b0 100%)'),
    },

    // AI Prompts Layer - Left Side
    {
        id: 'prompts',
        data: { label: '🪄 AI Prompts' },
        position: { x: 350, y: 220 },
        style: createNodeStyle('#673ab7', 'linear-gradient(135deg, #673ab7 0%, #512da8 100%)'),
    },
    {
        id: 'prompt-templates',
        data: { label: '📝 Prompt Templates\nCustomizable' },
        position: { x: 350, y: 440 },
        style: createNodeStyle('#673ab7', 'linear-gradient(135deg, #7e57c2 0%, #5e35b1 100%)'),
    },

    // Studio Layer - Left-Center
    {
        id: 'studio',
        data: { label: '🎬 Test Studio' },
        position: { x: 700, y: 220 },
        style: createNodeStyle('#2196f3', 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)'),
    },
    {
        id: 'recorder',
        data: { label: '🎥 Playwright Recorder\nBrowser Automation' },
        position: { x: 700, y: 440 },
        style: createNodeStyle('#2196f3', 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 100%)'),
    },
    {
        id: 'code-editor',
        data: { label: '💻 Code Editor\nPython/POM' },
        position: { x: 700, y: 660 },
        style: createNodeStyle('#2196f3', 'linear-gradient(135deg, #64b5f6 0%, #2196f3 100%)'),
    },

    // Execution Layer - Center
    {
        id: 'execution',
        data: { label: '📄 Test Execution' },
        position: { x: 1050, y: 220 },
        style: createNodeStyle('#ff9800', 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'),
    },
    {
        id: 'pytest',
        data: { label: '🧪 Pytest Runner\nTest Framework' },
        position: { x: 1050, y: 440 },
        style: createNodeStyle('#ff9800', 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)'),
    },
    {
        id: 'playwright',
        data: { label: '🎭 Playwright\nBrowser Driver' },
        position: { x: 1050, y: 660 },
        style: createNodeStyle('#ff9800', 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)'),
    },
    {
        id: 'reports',
        data: { label: '📊 Reports\nExtent/Allure' },
        position: { x: 1050, y: 880 },
        style: createNodeStyle('#ff9800', 'linear-gradient(135deg, #ffcc80 0%, #ffa726 100%)'),
    },

    // Healing Layer - Center-Right
    {
        id: 'heal',
        data: { label: '💗 Heal Recording' },
        position: { x: 1400, y: 220 },
        style: createNodeStyle('#e91e63', 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)'),
    },
    {
        id: 'failure-detection',
        data: { label: '⚠️ Failure Detection\nError Analysis' },
        position: { x: 1400, y: 440 },
        style: createNodeStyle('#e91e63', 'linear-gradient(135deg, #ec407a 0%, #d81b60 100%)'),
    },
    {
        id: 'ai-healing',
        data: { label: '🔧 AI Healing Engine\nAuto-Fix Logic' },
        position: { x: 1400, y: 660 },
        style: createNodeStyle('#e91e63', 'linear-gradient(135deg, #f06292 0%, #e91e63 100%)'),
    },

    // Locator Management Layer - Right
    {
        id: 'locators',
        data: { label: '🎯 Locator Management' },
        position: { x: 1750, y: 220 },
        style: createNodeStyle('#f44336', 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'),
    },
    {
        id: 'locator-repo',
        data: { label: '📦 Locator Repository\nPython Files' },
        position: { x: 1750, y: 440 },
        style: createNodeStyle('#f44336', 'linear-gradient(135deg, #ef5350 0%, #e53935 100%)'),
    },
    {
        id: 'ai-locator',
        data: { label: '🔍 AI Locator Assistant\nSmart Suggestions' },
        position: { x: 1750, y: 660 },
        style: createNodeStyle('#f44336', 'linear-gradient(135deg, #e57373 0%, #f44336 100%)'),
    },

    // Configuration Layer - Far Right
    {
        id: 'config',
        data: { label: '⚙️ Configuration' },
        position: { x: 2100, y: 220 },
        style: createNodeStyle('#607d8b', 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)'),
    },
    {
        id: 'env-settings',
        data: { label: '🌐 Environment\nBrowser/URL Config' },
        position: { x: 2100, y: 440 },
        style: createNodeStyle('#607d8b', 'linear-gradient(135deg, #78909c 0%, #546e7a 100%)'),
    },
    {
        id: 'timing-params',
        data: { label: '⏱️ Timing Parameters\nTimeouts/Waits' },
        position: { x: 2100, y: 660 },
        style: createNodeStyle('#607d8b', 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)'),
    },

    // Backend/Database Layer - Bottom Center
    {
        id: 'backend',
        type: 'output',
        data: { label: '🗄️ Backend Services\nFastAPI + SQLite' },
        position: { x: 1050, y: 1100 },
        style: createNodeStyle('#00bcd4', 'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)'),
    },
];

const initialEdges = [
    // User to main modules
    { id: 'e-user-design', source: 'user', target: 'test-design', animated: true, label: 'Requirements', style: { stroke: '#9c27b0', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0' } },
    { id: 'e-user-studio', source: 'user', target: 'studio', animated: true, label: 'Record', style: { stroke: '#2196f3', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' } },
    { id: 'e-user-exec', source: 'user', target: 'execution', animated: true, label: 'Run Tests', style: { stroke: '#ff9800', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },

    // Test Design flow
    { id: 'e-design-ai', source: 'test-design', target: 'ai-engine', animated: true, label: 'Analyze', style: { stroke: '#9c27b0', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0' } },
    { id: 'e-ai-scenarios', source: 'ai-engine', target: 'test-scenarios', animated: true, label: 'Generate', style: { stroke: '#9c27b0', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0' } },
    { id: 'e-scenarios-studio', source: 'test-scenarios', target: 'studio', animated: true, label: 'Export', style: { stroke: '#2196f3', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' } },

    // Studio flow
    { id: 'e-studio-recorder', source: 'studio', target: 'recorder', animated: true, label: 'Record', style: { stroke: '#2196f3', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' } },
    { id: 'e-recorder-editor', source: 'recorder', target: 'code-editor', animated: true, label: 'Generate', style: { stroke: '#2196f3', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' } },
    { id: 'e-editor-locators', source: 'code-editor', target: 'locators', animated: true, label: 'Store', style: { stroke: '#f44336', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' } },
    { id: 'e-editor-exec', source: 'code-editor', target: 'execution', animated: true, label: 'Deploy', style: { stroke: '#ff9800', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },

    // Execution flow
    { id: 'e-exec-pytest', source: 'execution', target: 'pytest', animated: true, label: 'Run', style: { stroke: '#ff9800', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },
    { id: 'e-pytest-playwright', source: 'pytest', target: 'playwright', animated: true, label: 'Execute', style: { stroke: '#ff9800', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },
    { id: 'e-playwright-reports', source: 'playwright', target: 'reports', animated: true, label: 'Results', style: { stroke: '#ff9800', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },
    { id: 'e-reports-heal', source: 'reports', target: 'heal', animated: true, label: 'Failures', style: { stroke: '#e91e63', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e91e63' } },

    // Locator Management flow
    { id: 'e-locators-repo', source: 'locators', target: 'locator-repo', animated: true, label: 'Manage', style: { stroke: '#f44336', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' } },
    { id: 'e-locators-ai', source: 'locators', target: 'ai-locator', animated: true, label: 'Suggest', style: { stroke: '#f44336', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' } },
    { id: 'e-repo-playwright', source: 'locator-repo', target: 'playwright', animated: true, label: 'Use', style: { stroke: '#ff9800', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },

    // Healing flow
    { id: 'e-heal-detection', source: 'heal', target: 'failure-detection', animated: true, label: 'Analyze', style: { stroke: '#e91e63', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e91e63' } },
    { id: 'e-heal-ai', source: 'heal', target: 'ai-healing', animated: true, label: 'Process', style: { stroke: '#e91e63', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e91e63' } },
    { id: 'e-ai-heal-studio', source: 'ai-healing', target: 'studio', animated: true, label: 'Fix', style: { stroke: '#2196f3', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#2196f3' } },
    { id: 'e-ai-heal-locators', source: 'ai-healing', target: 'locators', animated: true, label: 'Update', style: { stroke: '#f44336', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' } },

    // AI Prompts flow
    { id: 'e-prompts-templates', source: 'prompts', target: 'prompt-templates', animated: true, label: 'Manage', style: { stroke: '#673ab7', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#673ab7' } },
    { id: 'e-templates-ai-engine', source: 'prompt-templates', target: 'ai-engine', animated: true, label: 'Configure', style: { stroke: '#9c27b0', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#9c27b0' } },
    { id: 'e-templates-ai-healing', source: 'prompt-templates', target: 'ai-healing', animated: true, label: 'Tune', style: { stroke: '#e91e63', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#e91e63' } },
    { id: 'e-templates-ai-locator', source: 'prompt-templates', target: 'ai-locator', animated: true, label: 'Guide', style: { stroke: '#f44336', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#f44336' } },

    // Configuration flow
    { id: 'e-config-env', source: 'config', target: 'env-settings', animated: true, label: 'Setup', style: { stroke: '#607d8b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#607d8b' } },
    { id: 'e-config-timing', source: 'config', target: 'timing-params', animated: true, label: 'Define', style: { stroke: '#607d8b', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#607d8b' } },
    { id: 'e-env-playwright', source: 'env-settings', target: 'playwright', animated: true, label: 'Apply', style: { stroke: '#ff9800', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },
    { id: 'e-timing-playwright', source: 'timing-params', target: 'playwright', animated: true, label: 'Apply', style: { stroke: '#ff9800', strokeWidth: 2, strokeDasharray: '5,5' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#ff9800' } },

    // Backend connections
    { id: 'e-studio-backend', source: 'code-editor', target: 'backend', animated: true, label: 'Save', style: { stroke: '#00bcd4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00bcd4' } },
    { id: 'e-locator-backend', source: 'locator-repo', target: 'backend', animated: true, label: 'Persist', style: { stroke: '#00bcd4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00bcd4' } },
    { id: 'e-reports-backend', source: 'reports', target: 'backend', animated: true, label: 'Store', style: { stroke: '#00bcd4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00bcd4' } },
    { id: 'e-config-backend', source: 'env-settings', target: 'backend', animated: true, label: 'Save', style: { stroke: '#00bcd4', strokeWidth: 2 }, markerEnd: { type: MarkerType.ArrowClosed, color: '#00bcd4' } },
];

export function ArchitectureView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    return (
        <Box sx={{
            height: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'none' }}>
                <Box sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            System Architecture
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Detailed workflow and component interactions
                    </Typography>
                </Box>
                <div className="flex gap-2 items-center">
                    <ThemeToggle />
                </div>
            </Box>

            {/* Legend */}
            <Box sx={{
                p: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: isDark ? alpha('#fff', 0.02) : alpha('#000', 0.02),
            }}>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    {/* Legend Title */}
                    <Typography variant="body1" fontWeight="bold" color="text.primary" sx={{ minWidth: '80px', pt: 0.5 }}>
                        Legend
                    </Typography>

                    {/* Component Types */}
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="600" color="text.secondary" sx={{ mb: 1 }}>
                            Component Modules (Color-coded):
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                                label="👤 User"
                                size="small"
                                sx={{ bgcolor: alpha('#4caf50', 0.15), color: '#4caf50', fontWeight: 600, border: '1px solid', borderColor: alpha('#4caf50', 0.3) }}
                            />
                            <Chip
                                label="🌟 Test Design"
                                size="small"
                                sx={{ bgcolor: alpha('#9c27b0', 0.15), color: '#9c27b0', fontWeight: 600, border: '1px solid', borderColor: alpha('#9c27b0', 0.3) }}
                            />
                            <Chip
                                label="🎬 Test Studio"
                                size="small"
                                sx={{ bgcolor: alpha('#2196f3', 0.15), color: '#2196f3', fontWeight: 600, border: '1px solid', borderColor: alpha('#2196f3', 0.3) }}
                            />
                            <Chip
                                label="📄 Test Execution"
                                size="small"
                                sx={{ bgcolor: alpha('#ff9800', 0.15), color: '#ff9800', fontWeight: 600, border: '1px solid', borderColor: alpha('#ff9800', 0.3) }}
                            />
                            <Chip
                                label="🎯 Locator Mgmt"
                                size="small"
                                sx={{ bgcolor: alpha('#f44336', 0.15), color: '#f44336', fontWeight: 600, border: '1px solid', borderColor: alpha('#f44336', 0.3) }}
                            />
                            <Chip
                                label="💗 Heal Recording"
                                size="small"
                                sx={{ bgcolor: alpha('#e91e63', 0.15), color: '#e91e63', fontWeight: 600, border: '1px solid', borderColor: alpha('#e91e63', 0.3) }}
                            />
                            <Chip
                                label="🪄 AI Prompts"
                                size="small"
                                sx={{ bgcolor: alpha('#673ab7', 0.15), color: '#673ab7', fontWeight: 600, border: '1px solid', borderColor: alpha('#673ab7', 0.3) }}
                            />
                            <Chip
                                label="⚙️ Configuration"
                                size="small"
                                sx={{ bgcolor: alpha('#607d8b', 0.15), color: '#607d8b', fontWeight: 600, border: '1px solid', borderColor: alpha('#607d8b', 0.3) }}
                            />
                            <Chip
                                label="🗄️ Backend"
                                size="small"
                                sx={{ bgcolor: alpha('#00bcd4', 0.15), color: '#00bcd4', fontWeight: 600, border: '1px solid', borderColor: alpha('#00bcd4', 0.3) }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            {/* React Flow Canvas */}
            <Box sx={{ flex: 1, position: 'relative' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                    fitViewOptions={{
                        padding: 0.15,
                        minZoom: 0.5,
                        maxZoom: 1.5,
                    }}
                    minZoom={0.3}
                    maxZoom={2}
                    defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
                    proOptions={{ hideAttribution: true }}
                    style={{
                        background: isDark ? '#1a1a1a' : '#f5f5f5',
                    }}
                >
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            return node.style?.background || '#666';
                        }}
                        style={{
                            background: isDark ? '#2a2a2a' : '#fff',
                        }}
                    />
                    <Background
                        variant="dots"
                        gap={16}
                        size={1}
                        color={isDark ? '#444' : '#ccc'}
                    />
                </ReactFlow>
            </Box>
        </Box>
    );
}
