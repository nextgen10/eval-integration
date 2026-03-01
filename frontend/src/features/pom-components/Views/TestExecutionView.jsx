import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Play, FileText, Download, Terminal, AlertTriangle,
    List, Copy, Check, Layers,
    Search, Trash2, Filter, RefreshCw, ChevronRight, Tag, Plus, Eye,
    ArrowRight, ArrowDown, ChevronDown, Box as BoxIcon, Folder, FolderOpen, ChevronsDown, X, FileCode, CheckCircle, AlertCircle, XCircle, PlayCircle, Zap
} from 'lucide-react';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ThemeToggle } from '../UI/ThemeToggle';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, alpha } from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function TestExecutionView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const logsEndRef = useRef(null);

    const [tests, setTests] = useState([]);
    const [selectedTests, setSelectedTests] = useState(new Set());
    const [running, setRunning] = useState(false);
    const [result, setResult] = useState(null);
    const [status, setStatus] = useState(null); // { message, severity }
    const [reportAvailable, setReportAvailable] = useState(false);
    const [copied, setCopied] = useState(false);
    const [runningMode, setRunningMode] = useState(null); // 'ALL' or 'SELECTED'

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState("");

    // Folder State
    const [expandedFolders, setExpandedFolders] = useState({});

    // Live log streaming state
    const [liveLogs, setLiveLogs] = useState("");
    const [logOffset, setLogOffset] = useState(0);
    const [autoScroll, setAutoScroll] = useState(true);
    const [availableMarkers, setAvailableMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [isMarkerDropdownOpen, setIsMarkerDropdownOpen] = useState(false);
    const [modalStatus, setModalStatus] = useState(null);
    const [assignMarkerValue, setAssignMarkerValue] = useState("");
    const [showPreview, setShowPreview] = useState(false);
    const [previewData, setPreviewData] = useState(null);
    const [previewActiveTab, setPreviewActiveTab] = useState("test");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewCopied, setPreviewCopied] = useState(false);

    // Parallel Execution State
    const [runParallel, setRunParallel] = useState(false);
    const [parallelWorkers, setParallelWorkers] = useState("");
    const [defaultWorkers, setDefaultWorkers] = useState(4); // Default to 4 until fetched

    // Status helper functions
    const showStatus = (message, severity = 'success') => {
        setStatus({ message, severity });
        setTimeout(() => setStatus(null), 3000);
    };

    const showModalStatus = (message, severity = 'success') => {
        setModalStatus({ message, severity });
        setTimeout(() => setModalStatus(null), 3000);
    };

    useEffect(() => {
        fetchTests();
        fetchMarkers();
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.default_parallel_workers) setDefaultWorkers(data.default_parallel_workers);
        } catch (e) {
            console.error('Failed to fetch settings:', e);
        }
    };

    const fetchMarkers = async () => {
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            if (data.markers) setAvailableMarkers(data.markers);
        } catch (e) {
            console.error('Failed to fetch markers:', e);
        }
    };

    // ... rest of code ...



    // Poll for live logs while test is running
    useEffect(() => {
        let interval;
        if (running) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/tests/logs?offset=${logOffset}`);
                    const data = await res.json();
                    if (data.content) {
                        setLiveLogs(prev => prev + data.content);
                        setLogOffset(data.offset);
                    }
                } catch (err) {
                    console.error('Failed to fetch logs:', err);
                }
            }, 500);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [running, logOffset]);

    // Auto-scroll logs
    useEffect(() => {
        if (autoScroll && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [liveLogs, autoScroll]);

    const getMarkerColor = (marker) => {
        return {
            bg: 'bg-orange-500',
            text: 'text-orange-500',
            lightBg: 'bg-orange-50',
            darkBg: 'bg-orange-500/10',
            border: 'border-orange-500/20'
        };
    };

    const fetchTests = async () => {
        try {
            const res = await fetch('/api/tests/list');
            const data = await res.json();

            // Handle legacy array of strings or new array of objects
            const normalizedTests = (data.tests || []).map(t =>
                typeof t === 'string' ? { path: t, name: t, folder: null } : t
            );

            setTests(normalizedTests);

            // Expand all folders by default on load
            const initialFolders = {};
            normalizedTests.forEach(test => {
                const folder = test.folder || 'root';
                initialFolders[folder] = true;
            });
            setExpandedFolders(initialFolders);

        } catch (e) {
            showStatus("Failed to load test list.", "error");
        }
    };

    const runTest = async (overrideFile = null) => {
        let payload = {};

        if (overrideFile === "ALL") {
            payload = {
                test_file: "ALL",
                parallel: runParallel,
                parallel_workers: runParallel && parallelWorkers ? parseInt(parallelWorkers) : null
            };
        } else {
            if (selectedTests.size === 0 && !selectedMarker) return;
            payload = {
                test_files: selectedTests.size > 0 ? Array.from(selectedTests) : null,
                marker: selectedMarker || null,
                parallel: runParallel,
                parallel_workers: runParallel && parallelWorkers ? parseInt(parallelWorkers) : null
            };
        }

        try {
            setLiveLogs("");
            setLogOffset(0);
            setRunning(true);
            setRunningMode(overrideFile === "ALL" ? 'ALL' : 'SELECTED');
            setResult(null);
            setStatus(null);
            setReportAvailable(false);
            setAutoScroll(true);

            const res = await fetch('/api/tests/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || data.output);

            setResult(data);
            if (data.report_path) setReportAvailable(true);

        } catch (e) {
            showStatus(e.message, "error");
        } finally {
            setRunning(false);
            setRunningMode(null);
        }
    };

    const handleCopy = () => {
        const textToCopy = result?.output || liveLogs;
        if (!textToCopy) return;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleToggle = (testPath) => {
        const newSet = new Set(selectedTests);
        if (newSet.has(testPath)) {
            newSet.delete(testPath);
        } else {
            newSet.add(testPath);
        }
        setSelectedTests(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedTests.size === filteredTests.length && filteredTests.length > 0) {
            setSelectedTests(new Set());
        } else {
            const newSet = new Set(selectedTests);
            filteredTests.forEach(t => newSet.add(t.path));
            setSelectedTests(newSet);
        }
    };

    const toggleFolderSelection = (folderName, testsInFolder) => {
        const newSet = new Set(selectedTests);
        const folderPaths = testsInFolder.map(t => t.path);

        // Check if all are currently selected
        const allSelected = folderPaths.every(path => newSet.has(path));

        if (allSelected) {
            // Deselect all in folder
            folderPaths.forEach(path => newSet.delete(path));
        } else {
            // Select all in folder
            folderPaths.forEach(path => newSet.add(path));
        }
        setSelectedTests(newSet);
    };

    const filteredTests = useMemo(() => tests.filter(test => {
        const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMarker = !selectedMarker || (test.markers && test.markers.includes(selectedMarker));
        return matchesSearch && matchesMarker;
    }), [tests, searchTerm, selectedMarker]);

    // Group tests by folder
    const groupedTests = useMemo(() => {
        const groups = { root: [] };

        filteredTests.forEach(test => {
            const folder = test.folder || 'root';
            if (!groups[folder]) groups[folder] = [];
            groups[folder].push(test);
        });

        // Clean up empty root if needed, or keeping it strictly for root items
        if (groups.root.length === 0 && Object.keys(groups).length > 1) {
            delete groups.root;
        }

        return groups;
    }, [filteredTests]);

    // Auto-expand folders when searching
    useEffect(() => {
        if (searchTerm) {
            const newExpanded = { ...expandedFolders };
            Object.keys(groupedTests).forEach(folder => {
                newExpanded[folder] = true;
            });
            setExpandedFolders(newExpanded);
        }
    }, [searchTerm, groupedTests]); // Reacts to search changes

    const toggleFolder = (folder) => {
        setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
    };

    const clearLogs = () => {
        setLiveLogs("");
        setResult(null);
        setStatus(null);
    };

    const deleteSelectedTests = async () => {
        if (selectedTests.size === 0) return;

        try {
            const deletePromises = Array.from(selectedTests).map(path =>
                fetch(`/api/tests/delete/${path}`, { method: 'DELETE' })
            );

            await Promise.all(deletePromises);

            fetchTests();
            setSelectedTests(new Set());
            setShowDeleteConfirm(false);
            showStatus("Deleted successfully");
        } catch (e) {
            showStatus("Failed to delete items: " + e.message, "error");
        }
    };

    const assignMarkersToTests = async () => {
        if (selectedTests.size === 0 || !assignMarkerValue) return;

        // Check for 3 markers limit
        const testsObj = tests || [];
        const selectedTestsList = testsObj.filter(t => selectedTests.has(t.path));
        const atLimit = selectedTestsList.filter(t => t.markers && t.markers.length >= 3 && !t.markers.includes(assignMarkerValue));

        if (atLimit.length > 0) {
            if (selectedTests.size === 1) {
                showModalStatus("Max 3 markers allowed per test", "warning");
                return;
            } else if (atLimit.length === selectedTests.size) {
                showModalStatus("All selected tests already have 3 markers", "warning");
                return;
            }
        }

        try {
            const res = await fetch('/api/tests/assign-marker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test_files: Array.from(selectedTests),
                    marker: assignMarkerValue
                })
            });

            if (!res.ok) throw new Error("Failed to assign marker");

            const data = await res.json();
            showModalStatus(data.message);

            // Refresh tests and markers
            fetchTests();
            fetchMarkers();

            // Keep modal open
            // setShowAssignModal(false);
            setAssignMarkerValue("");
            // setSelectedTests(new Set());
        } catch (e) {
            showModalStatus("Error: " + e.message, "error");
        }
    };

    const removeMarkersFromTests = async (markerToRemove) => {
        if (selectedTests.size === 0) return;
        const targetMarker = markerToRemove || assignMarkerValue;
        if (!targetMarker) return;

        try {
            const res = await fetch('/api/tests/remove-marker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    test_files: Array.from(selectedTests),
                    marker: targetMarker
                })
            });

            if (!res.ok) throw new Error("Failed to remove marker");

            const data = await res.json();
            showModalStatus(data.message);

            fetchTests();

            // Do not close modal to allow multiple removals
            // setShowAssignModal(false);
            // setAssignMarkerValue("");
            // setSelectedTests(new Set());
        } catch (e) {
            showModalStatus("Error: " + e.message, "error");
        }
    };

    const fetchPreview = async (testPath) => {
        setPreviewLoading(true);
        setShowPreview(true);
        setPreviewActiveTab("test");
        try {
            const res = await fetch(`/api/tests/preview?test_path=${encodeURIComponent(testPath)}`);
            if (!res.ok) throw new Error("Failed to load preview");
            const data = await res.json();
            setPreviewData(data);
        } catch (e) {
            showStatus("Error: " + e.message, "error");
            setShowPreview(false);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight > 50) {
            if (autoScroll) setAutoScroll(false);
        }
    };

    return (
        <div className={`absolute inset-0 flex flex-col overflow-hidden w-full max-w-full`}>
            {/* Assign Marker Modal */}
            {showAssignModal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <div className={`w-[650px] h-[650px] flex flex-col p-5 rounded-xl shadow-2xl border transform transition-all scale-100 ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                <Tag size={18} />
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Assign Marker</h4>
                            </div>
                        </div>
                        <div className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedTests.size === 1 ? (
                                <div>Managing markers for <span className="font-bold text-blue-500">{(Array.from(selectedTests)[0] || "").split('/').pop().replace('.py', '').replace(/^test_/, '')}</span></div>
                            ) : (
                                <div>Assigning to <span className="font-bold text-blue-500">{selectedTests.size}</span> selected tests</div>
                            )}
                            <div className="mt-1 text-[10px] opacity-50 uppercase tracking-tighter font-bold text-orange-500/80">
                                Limit: Max 3 markers per test
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar">
                            {/* Assigned Markers Section */}
                            <div>
                                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Assigned Markers
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-dashed border-gray-500/30 min-h-[36px]">
                                    {(() => {
                                        const uniqueAssigned = new Set();
                                        selectedTests.forEach(path => {
                                            const t = tests.find(test => test.path === path);
                                            if (t && t.markers) t.markers.forEach(m => uniqueAssigned.add(m));
                                        });
                                        const assignedList = Array.from(uniqueAssigned);

                                        if (assignedList.length === 0) {
                                            return <span className="text-[10px] italic opacity-50 pl-1">No markers assigned</span>;
                                        }

                                        return assignedList.map(m => (
                                            <div
                                                key={m}
                                                className={`flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full text-[10px] font-bold uppercase border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                                            >
                                                {m}
                                                <button
                                                    onClick={() => removeMarkersFromTests(m)}
                                                    className={`p-0.5 rounded-full hover:bg-red-500 hover:text-white transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            <div>
                                <label className={`block text-[10px] font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Available Markers
                                </label>
                                <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-dashed border-gray-500/30 max-h-[250px] overflow-y-auto custom-scrollbar">
                                    {availableMarkers.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setAssignMarkerValue(m)}
                                            className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase transition-all
                                                ${assignMarkerValue === m
                                                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                    : (isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group/input">
                                <Plus size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within/input:text-blue-400' : 'text-gray-400 group-focus-within/input:text-blue-500'}`} />
                                <input
                                    type="text"
                                    maxLength={30}
                                    placeholder="Or create new (e.g. nightly) - Max 30 chars"
                                    value={assignMarkerValue}
                                    onChange={(e) => setAssignMarkerValue(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm border transition-all outline-none 
                                        ${isDark
                                            ? 'bg-black/20 border-white/10 focus:border-blue-500/50 text-gray-200 placeholder-gray-600 shadow-inner'
                                            : 'bg-white border-gray-200 focus:border-blue-400 text-gray-700 placeholder-gray-400 shadow-sm'}`}
                                />
                            </div>
                        </div>

                        <div className="h-10 mb-2 flex items-end">
                            {modalStatus ? (
                                <div className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-1 ${modalStatus.severity === 'success' ? (isDark ? 'bg-green-500/10 text-green-400 border border-green-500/10' : 'bg-green-50 text-green-700 border border-green-100') : (isDark ? 'bg-red-500/10 text-red-400 border border-red-500/10' : 'bg-red-50 text-red-700 border border-red-100')}`}>
                                    {modalStatus.severity === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    {modalStatus.message}
                                </div>
                            ) : null}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={() => { setShowAssignModal(false); setAssignMarkerValue(""); }}
                                className="shadow-lg shadow-red-500/20"
                                icon={X}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary-glass"
                                fullWidth
                                onClick={assignMarkersToTests}
                                disabled={!assignMarkerValue}
                                className="shadow-lg shadow-blue-500/20 font-bold"
                            >
                                Assign
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Code Preview Modal */}
            {showPreview && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <div className={`w-[1000px] h-[700px] flex flex-col rounded-xl shadow-22xl border transform transition-all scale-100 ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                        {/* Modal Header */}
                        <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                    <FileCode size={20} />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Code Preview</h4>
                                    <p className={`text-[10px] uppercase tracking-wider font-bold opacity-50 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>View Only</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        {/* Tabs */}
                        <div className={`flex items-center justify-between px-6 border-b backdrop-blur-md ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50/50 border-gray-100'}`}>
                            <div className="flex items-center gap-6">
                                {['test', 'page', 'locator', 'data'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setPreviewActiveTab(tab)}
                                        className={`relative py-4 text-[12px] font-bold uppercase tracking-[0.2em] transition-all duration-300
                                            ${previewActiveTab === tab
                                                ? (isDark ? 'text-blue-400' : 'text-blue-600')
                                                : (isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700')}`}
                                    >
                                        {tab}
                                        {previewActiveTab === tab && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-[0_-4px_12px_rgba(59,130,246,0.5)] rounded-t-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            {previewData?.paths?.[previewActiveTab] && (
                                <div className={`flex items-center gap-2 text-[12px] font-medium opacity-60 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                                    <span className="font-mono tracking-tight">{previewData.paths[previewActiveTab]}</span>
                                </div>
                            )}
                        </div>

                        {/* Code Content */}
                        <div className="flex-1 min-h-0 relative bg-black/10">
                            {previewLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <RefreshCw className="animate-spin text-blue-500" size={32} />
                                    <span className="text-sm font-medium animate-pulse text-gray-500">Loading components...</span>
                                </div>
                            ) : (
                                <div className="h-full relative group/code">
                                    <button
                                        onClick={() => {
                                            const code = previewData?.[previewActiveTab] || "";
                                            navigator.clipboard.writeText(code);
                                            setPreviewCopied(true);
                                            setTimeout(() => setPreviewCopied(false), 2000);
                                        }}
                                        className={`absolute right-6 top-6 p-2 rounded-full backdrop-blur-sm border transition-all z-10 
                                            ${previewCopied
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-black/40 hover:bg-black/60 text-white border-white/10'}`}
                                        title={previewCopied ? "Copied!" : "Copy Code"}
                                    >
                                        {previewCopied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <SyntaxHighlighter
                                        language={previewActiveTab === 'data' ? 'json' : 'python'}
                                        style={isDark ? vscDarkPlus : vs}
                                        customStyle={{
                                            margin: 0,
                                            padding: '24px',
                                            fontSize: '14px',
                                            lineHeight: '1.6',
                                            background: 'transparent',
                                            height: '100%',
                                            width: '100%',
                                            overflow: 'auto'
                                        }}
                                        className="custom-scrollbar"
                                        codeTagProps={{
                                            style: {
                                                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                                            }
                                        }}
                                    >
                                        {previewData?.[previewActiveTab] || `# No ${previewActiveTab} component found for this test.`}
                                    </SyntaxHighlighter>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className={`p-4 border-t flex items-center justify-end ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                            <Button
                                variant="danger"
                                onClick={() => setShowPreview(false)}
                                className="px-8 shadow-lg shadow-red-500/20 font-bold"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                    <div className={`w-[320px] p-5 rounded-xl shadow-2xl border transform transition-all scale-100 ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 rounded-full bg-red-500/10 text-red-500">
                                <Trash2 size={18} />
                            </div>
                            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Selected Tests?</h4>
                        </div>
                        <p className={`text-xs mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Are you sure you want to delete <span className="font-bold text-blue-500">{selectedTests.size}</span> test(s)?
                            <br />This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={() => setShowDeleteConfirm(false)}
                                className="shadow-lg shadow-red-500/20"
                                icon={X}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                fullWidth
                                onClick={deleteSelectedTests}
                                className="shadow-lg shadow-red-500/20 font-bold"
                                icon={Trash2}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <Box sx={{ p: 2, display: 'none', zIndex: 20 }}>
                <Box sx={{ pt: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        Test Execution
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                        Execute and monitor your Playwright test suites.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {status && (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            px: 2,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: (theme) => status.severity === 'success' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: (theme) => status.severity === 'success' ? 'success.main' : 'error.main',
                            mr: 2
                        }}>
                            {status.severity === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                            <Typography variant="body2">{status.message}</Typography>
                        </Box>
                    )}
                    <ThemeToggle />
                </Box>
            </Box>

            <div className="flex-1 flex min-h-0 p-4 gap-4 w-full overflow-hidden">
                {/* Left Panel: Test Selection */}
                <div className={`w-[500px] shrink-0 flex flex-col rounded-xl border shadow-2xl ring-1 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e] border-gray-800 ring-white/5' : 'bg-white border-gray-300 ring-black/5'}`}>
                    {/* Panel Header */}
                    <div className={`p-4 border-b flex flex-col gap-3 ${isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <List className="text-blue-500" size={18} />
                                <h3 className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Test Suite</h3>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-mono ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                {tests.length} available
                            </span>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                            <input
                                type="text"
                                placeholder="Filter tests..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-9 pr-9 py-2 rounded-lg text-sm border transition-all outline-none 
                                    ${isDark
                                        ? 'bg-black/20 border-white/10 focus:border-blue-500/50 text-gray-200 placeholder-gray-600'
                                        : 'bg-white border-gray-200 focus:border-blue-400 text-gray-700 placeholder-gray-400 shadow-sm'}`}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Actions Toolbar */}
                    <div className={`px-4 py-2 border-b flex items-center justify-between text-xs ${isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSelectAll}
                                className={`flex items-center gap-1.5 font-medium transition-colors ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all
                                    ${selectedTests.size > 0 && selectedTests.size === filteredTests.length
                                        ? 'bg-blue-500 border-blue-500'
                                        : (isDark ? 'border-gray-600' : 'border-gray-400')}`}
                                >
                                    {selectedTests.size > 0 && selectedTests.size === filteredTests.length && <Check size={10} className="text-white" />}
                                </div>
                                Select All
                            </button>

                            <div className={`h-4 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>

                            {/* Marker Dropdown with explicit label */}
                            <div className="flex items-center gap-2 ml-1">
                                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Markers:</span>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsMarkerDropdownOpen(!isMarkerDropdownOpen)}
                                        className={`pl-7 pr-7 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider outline-none transition-all w-[140px] relative flex items-center justify-between
                                            ${selectedMarker
                                                ? (isDark ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700')
                                                : (isDark ? 'bg-black/20 border-white/10 text-gray-400 hover:border-white/20' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300')}`}
                                    >
                                        <Filter size={10} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${selectedMarker ? 'text-blue-500' : (isDark ? 'text-gray-600' : 'text-gray-400')}`} />
                                        <span className="truncate flex-1 text-left">{selectedMarker || "None"}</span>
                                        <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                                    </button>

                                    {isMarkerDropdownOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsMarkerDropdownOpen(false)}></div>
                                            <div className={`absolute top-full left-0 mt-1 min-w-[140px] max-w-[240px] max-h-[200px] overflow-y-auto rounded-lg border shadow-xl z-50 p-1 flex flex-col gap-0.5
                                                ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                                                <button
                                                    onClick={() => { setSelectedMarker(""); setIsMarkerDropdownOpen(false); }}
                                                    className={`px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider rounded transition-colors
                                                        ${!selectedMarker ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50')}`}
                                                >
                                                    None
                                                </button>
                                                {availableMarkers.map(m => (
                                                    <button
                                                        key={m}
                                                        onClick={() => { setSelectedMarker(m); setIsMarkerDropdownOpen(false); }}
                                                        className={`px-3 py-1.5 text-left text-[10px] font-bold uppercase tracking-wider rounded transition-colors whitespace-nowrap
                                                            ${selectedMarker === m ? (isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-50')}`}
                                                    >
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`font-medium ${selectedTests.size > 0 ? 'text-blue-500' : (isDark ? 'text-gray-500' : 'text-gray-400')}`}>
                                {selectedTests.size} selected
                            </span>
                            <div className={`h-4 w-px ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                            <button
                                onClick={() => selectedTests.size > 0 && setShowAssignModal(true)}
                                disabled={selectedTests.size === 0}
                                className={`flex items-center gap-1 transition-colors ${selectedTests.size > 0 ? 'text-blue-500 hover:text-blue-600' : (isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}`}
                                title="Assign Marker"
                            >
                                <Tag size={14} />
                            </button>
                            <button
                                onClick={() => selectedTests.size > 0 && setShowDeleteConfirm(true)}
                                disabled={selectedTests.size === 0}
                                className={`flex items-center gap-1 transition-colors ${selectedTests.size > 0 ? 'text-red-500 hover:text-red-600' : (isDark ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}`}
                                title="Delete Selected"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Test List (Grouped) */}
                    <div className={`flex-1 overflow-y-auto p-2 min-h-0 custom-scrollbar ${isDark ? 'bg-[#121212]' : 'bg-[#f8f9fa] border-t border-gray-200'}`}>
                        {filteredTests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                                <Search size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">No matching tests found</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(groupedTests).sort(([a], [b]) => a === 'root' ? -1 : b === 'root' ? 1 : a.localeCompare(b)).map(([folder, folderTests]) => (
                                    <div key={folder} className="select-none">
                                        {/* Folder Header */}
                                        {folder !== 'root' && (
                                            <div
                                                className={`flex items-center px-1 py-1.5 mb-1 cursor-pointer hover:bg-white/5 rounded group ${expandedFolders[folder] ? '' : ''}`}
                                                onClick={() => toggleFolder(folder)}
                                            >
                                                <button
                                                    className={`p-0.5 rounded mr-1 transition-transform duration-200 ${expandedFolders[folder] ? 'rotate-90' : ''} ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                                                >
                                                    <ChevronRight size={14} />
                                                </button>

                                                {/* Folder Checkbox */}
                                                <div
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleFolderSelection(folder, folderTests);
                                                    }}
                                                    className={`mr-2 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors 
                                                        ${folderTests.every(t => selectedTests.has(t.path))
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : (isDark ? 'border-gray-600 hover:border-gray-400' : 'border-gray-400 hover:border-gray-500')}`}
                                                >
                                                    {folderTests.every(t => selectedTests.has(t.path)) && <Check size={10} className="text-white" />}
                                                </div>

                                                <div className={`flex items-center gap-2 text-xs font-medium whitespace-nowrap ${isDark ? 'text-gray-400 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                    {expandedFolders[folder] ? <FolderOpen size={14} className={isDark ? "text-yellow-500" : "text-yellow-600"} /> : <Folder size={14} className={isDark ? "text-yellow-500/70" : "text-yellow-600/70"} />}
                                                    <span>{folder}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Folder Content */}
                                        {(folder === 'root' || expandedFolders[folder]) && (
                                            <div className={`${folder !== 'root' ? 'pl-4 border-l border-dashed border-gray-700/50 ml-2.5' : ''} space-y-1`}>
                                                {folderTests.map(test => {
                                                    const isSelected = selectedTests.has(test.path);
                                                    return (
                                                        <div
                                                            key={test.path}
                                                            onClick={() => handleToggle(test.path)}
                                                            className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer border transition-all duration-200
                                                                ${isSelected
                                                                    ? (isDark ? 'bg-blue-500/[0.02] border-blue-500/20 text-blue-300' : 'bg-blue-50/30 border-blue-100 text-blue-700')
                                                                    : (isDark ? 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                                                                }`}
                                                        >
                                                            {/* Checkbox */}
                                                            <div className={`shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors 
                                                                ${isSelected
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : (isDark ? 'border-gray-600 group-hover:border-gray-400' : 'border-gray-400 group-hover:border-gray-500')}`}
                                                            >
                                                                {isSelected && <Check size={10} className="text-white" />}
                                                            </div>

                                                            <FileCode size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm flex flex-wrap items-center gap-2">
                                                                    <span>{test.name.replace('.py', '').replace(/^test_/, '')}</span>
                                                                    {test.markers && test.markers.map(m => {
                                                                        const c = getMarkerColor(m);
                                                                        return (
                                                                            <span key={m} className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase transition-all duration-300 transform hover:scale-110
                                                                                ${selectedMarker === m
                                                                                    ? `${c.bg} text-white shadow-lg shadow-${c.bg.split('-')[1]}-500/30`
                                                                                    : (isDark ? `${c.darkBg} ${c.text} border ${c.border}` : `${c.lightBg} ${c.text} border ${c.border}`)}`}>
                                                                                {m}
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>

                                                            {/* Right aligned actions */}
                                                            <div className="flex items-center gap-2 shrink-0 pr-1">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        fetchPreview(test.path);
                                                                    }}
                                                                    className={`p-1 rounded transition-all duration-200 ${isDark ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                                    title="View Code"
                                                                >
                                                                    <Eye size={12} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedTests(new Set([test.path]));
                                                                        setShowAssignModal(true);
                                                                    }}
                                                                    className={`p-1 rounded transition-all duration-200 ${isDark ? 'text-gray-500 hover:text-blue-400 hover:bg-blue-500/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                                    title="Assign Marker"
                                                                >
                                                                    <Tag size={12} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Execution Context */}
                <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
                    <div className={`p-5 flex items-center justify-between rounded-xl border shadow-2xl ring-1 overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e] border-gray-800 ring-white/5' : 'bg-white border-gray-300 ring-black/5'}`}>
                        <div className="flex items-center gap-4 min-w-0">
                            <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold truncate ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Execution Control
                                </h3>
                                <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {running ? "Tests are currently running..." : "Ready to start new test run"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            {/* Parallel Controls */}
                            <div className={`flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg border border-dashed transition-colors ${isDark ? 'border-gray-700 bg-white/[0.02]' : 'border-gray-300 bg-gray-50/50'}`}>
                                <button
                                    onClick={() => {
                                        setRunParallel(!runParallel);
                                        if (!runParallel) setParallelWorkers("");
                                    }}
                                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors
                                        ${runParallel ? 'text-orange-500' : (isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700')}`}
                                    title="Toggle Parallel Execution"
                                >
                                    <Zap size={14} className={runParallel ? 'fill-current' : ''} />
                                    Parallel
                                </button>

                                {runParallel && (
                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200 pl-2 border-l border-gray-500/20">
                                        <input
                                            type="number"
                                            min="1"
                                            max="16"
                                            value={parallelWorkers}
                                            onChange={(e) => setParallelWorkers(e.target.value)}
                                            placeholder={defaultWorkers}
                                            className={`w-10 py-0.5 text-center text-xs font-mono rounded transition-all outline-none mb-0.5
                                                ${isDark
                                                    ? 'bg-black/20 text-blue-400 focus:bg-blue-500/10 placeholder-gray-600'
                                                    : 'bg-white text-blue-600 border border-gray-200 focus:border-blue-400 placeholder-gray-300'}`}
                                            title="Number of parallel workers"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-[10px] uppercase font-bold leading-none ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Workers</span>
                                            <span className="text-[8px] text-amber-500 font-medium leading-none mt-0.5 whitespace-nowrap">Rec: Max 4</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open('/api/tests/report/download', '_blank')}
                                    disabled={!reportAvailable || running}
                                    title="Download Report"
                                    className={`p-2.5 rounded-lg border transition-all duration-200 group relative
                                        ${!reportAvailable || running
                                            ? (isDark ? 'border-gray-800 text-gray-600 bg-transparent' : 'border-gray-200 text-gray-300 bg-gray-50')
                                            : (isDark
                                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-400 hover:text-purple-300 hover:border-purple-500/50 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/20'
                                                : 'border-purple-200 bg-purple-50 text-purple-600 hover:text-purple-700 hover:border-purple-300 hover:shadow-md')}`}
                                >
                                    <Download size={18} />
                                </button>

                                <button
                                    onClick={() => runTest("ALL")}
                                    disabled={running}
                                    title="Run All Tests"
                                    className={`p-2.5 rounded-lg border transition-all duration-200 group relative
                                        ${running
                                            ? (isDark ? 'border-gray-800 text-gray-600 bg-transparent' : 'border-gray-200 text-gray-300 bg-gray-50')
                                            : (isDark
                                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/20 hover:shadow-lg hover:shadow-blue-500/20'
                                                : 'border-blue-200 bg-blue-50 text-blue-600 hover:text-blue-700 hover:border-blue-300 hover:shadow-md')}`}
                                >
                                    {running && runningMode === 'ALL' ? <RefreshCw className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                                </button>

                                <button
                                    onClick={() => runTest()}
                                    disabled={(selectedTests.size === 0 && !selectedMarker) || running}
                                    title={`Run Selected (${selectedTests.size})`}
                                    className={`p-2.5 rounded-lg border transition-all duration-200 group relative
                                        ${(selectedTests.size === 0 && !selectedMarker) || running
                                            ? (isDark ? 'border-gray-800 text-gray-600 bg-transparent' : 'border-gray-200 text-gray-300 bg-gray-50')
                                            : (isDark
                                                ? 'border-green-500/30 bg-green-500/10 text-green-400 hover:text-green-300 hover:border-green-500/50 hover:bg-green-500/20 hover:shadow-lg hover:shadow-green-500/20'
                                                : 'border-green-200 bg-green-50 text-green-600 hover:text-green-700 hover:border-green-300 hover:shadow-md')}`}
                                >
                                    {running && runningMode === 'SELECTED' ? <RefreshCw className="animate-spin" size={18} /> : <Play size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Console/Terminal Window */}
                    <div className={`flex-1 flex flex-col min-h-0 w-full min-w-0 rounded-xl border shadow-2xl ring-1 overflow-hidden transition-all duration-300 ${isDark ? 'bg-[#1e1e1e] border-gray-800 ring-white/5' : 'bg-white border-gray-300 ring-black/5'}`}>
                        {/* Terminal Header */}
                        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-[#1e1e1e] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Terminal className={liveLogs || running ? "text-blue-500" : (isDark ? "text-gray-600" : "text-gray-400")} size={18} />
                                    <h3 className={`font-bold ${isDark ? (liveLogs || running ? 'text-gray-200' : 'text-gray-600') : (liveLogs || running ? 'text-gray-700' : 'text-gray-400')}`}>Console Logs</h3>
                                </div>
                                {running && (
                                    <span className="flex items-center gap-2 text-xs font-medium text-blue-500">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        Executing...
                                    </span>
                                )}
                                {!running && result && (
                                    <span className={`flex items-center gap-2 text-xs font-bold ${result.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {result.status === 'success' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                        {result.status === 'success' ? 'PASSED' : 'FAILED'}
                                        <span className={`text-[10px] font-normal opacity-70 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                            (Code: {result.return_code})
                                        </span>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAutoScroll(!autoScroll)}
                                    disabled={!liveLogs}
                                    className={`p-1.5 rounded transition-all 
                                        ${!liveLogs
                                            ? (isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                                            : (autoScroll
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : (isDark ? 'text-blue-400 opacity-60 hover:bg-white/10' : 'text-blue-500 opacity-60 hover:bg-gray-200'))}`}
                                    title="Auto-scroll"
                                >
                                    <ChevronsDown size={16} />
                                </button>
                                <button
                                    onClick={clearLogs}
                                    disabled={!liveLogs}
                                    className={`p-1.5 rounded transition-all 
                                        ${!liveLogs
                                            ? (isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                                            : (isDark ? 'text-red-400 hover:bg-white/10' : 'text-red-500 hover:bg-gray-200')}`}
                                    title="Clear Logs"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={handleCopy}
                                    disabled={!liveLogs}
                                    className={`p-1.5 rounded transition-all 
                                        ${!liveLogs
                                            ? (isDark ? 'text-gray-700 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')
                                            : (copied
                                                ? 'text-green-500 hover:bg-white/10'
                                                : (isDark ? 'text-blue-400 hover:bg-white/10' : 'text-blue-500 hover:bg-gray-200'))}`}
                                    title={copied ? "Copied" : "Copy Logs"}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div
                            className={`flex-1 overflow-auto p-4 custom-scrollbar ${isDark ? 'bg-[#121212]' : 'bg-gray-50'}`}
                            onScroll={handleScroll}
                        >
                            <div className="font-mono text-sm space-y-1">
                                {!running && !liveLogs && !result ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50 mt-20">
                                        <Terminal size={48} className="mb-4" />
                                        <p>Ready for execution output...</p>
                                    </div>
                                ) : (
                                    <>
                                        <pre className={`whitespace-pre-wrap break-all leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                            {liveLogs}
                                        </pre>
                                        {result?.output && (
                                            <pre className={`whitespace-pre-wrap break-all leading-relaxed mt-2 pt-4 border-t border-gray-800 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                                                {result.output.replace(liveLogs, '')}
                                            </pre>
                                        )}
                                        <div ref={logsEndRef} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
