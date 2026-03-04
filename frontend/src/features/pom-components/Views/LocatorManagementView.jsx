import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, Wand2, FileCode, Check, X, AlertCircle,
    RefreshCw, Copy, ChevronRight, ChevronDown, Edit2, Code2, MousePointer2,
    Database, Layers, ArrowRight, Folder, FolderOpen, Trash2
} from 'lucide-react';
import { useTheme } from '@mui/material/styles';
import { Box, Typography, alpha, Menu, MenuItem } from '@mui/material';
import { ThemeToggle } from '../UI/ThemeToggle';
import { Button } from '../UI/Button'; // Assuming we have this, or replicate standard HTML buttons

// --- Reusable UI Sub-components ---


const Tag = ({ children, color = "gray", isDark }) => {
    const colors = {
        gray: isDark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-gray-100 text-gray-600 border-gray-200",
        purple: isDark ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-200",
        blue: isDark ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-600 border-blue-200",
    };
    return (
        <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colors[color] || colors.gray} ml-2`}>
            {children}
        </span>
    );
};

const LocatorCopyButton = ({ value, onCopy, isDark }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        onCopy && onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-1.5 rounded-md transition-all ${copied ? "text-emerald-500 bg-emerald-500/10" : (isDark ? "text-gray-500 hover:text-gray-200 hover:bg-white/10" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100")}`}
            title="Copy value"
        >
            {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
    );
};

// --- Tree Components ---

const buildFileTree = (files) => {
    const root = {};
    files.forEach(file => {
        const parts = file.file_name.split('/').filter(p => p);
        let current = root;
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                current[part] = { type: 'file', name: part, data: file };
            } else {
                if (!current[part]) {
                    current[part] = { type: 'folder', name: part, children: {} };
                }
                current = current[part].children;
            }
        });
    });
    return root;
};

// Recursive Tree Node Component
const FileTreeNode = ({ node, level = 0, onSelect, selectedFile, isDark }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === 'folder';
    const paddingLeft = level * 12 + 12;

    if (isFolder) {
        return (
            <div>
                <div
                    className={`flex items-center gap-2 py-1.5 cursor-pointer transition-colors select-none ${isDark ? 'hover:bg-white/5 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'}`}
                    style={{ paddingLeft: `${paddingLeft}px` }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <button className={`p-0.5 rounded mr-1 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                        <ChevronRight size={12} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    </button>
                    {isOpen ? <FolderOpen size={14} className={isDark ? "text-yellow-500" : "text-yellow-600"} /> : <Folder size={14} className={isDark ? "text-yellow-500/70" : "text-yellow-600/70"} />}
                    <span className="text-xs font-medium whitespace-nowrap">{node.name.replace('.py', '').replace('_locators', '')}</span>
                </div>
                {isOpen && (
                    <div>
                        {Object.values(node.children).map((child) => (
                            <FileTreeNode
                                key={child.name}
                                node={child}
                                level={level + 1}
                                onSelect={onSelect}
                                selectedFile={selectedFile}
                                isDark={isDark}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Is File
    const isSelected = selectedFile?.file_path === node.data.file_path;
    return (
        <div
            onClick={() => onSelect(node.data)}
            className={`flex items-center gap-2 py-1.5 cursor-pointer transition-all select-none border-l-2 ml-8
                ${isSelected
                    ? (isDark ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-blue-50 border-blue-500 text-blue-700')
                    : (isDark ? 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200' : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900')
                }`}
            style={{ paddingLeft: `${paddingLeft}px` }}
        >
            <FileCode size={13} className={isDark ? "text-blue-400" : "text-blue-600"} />
            <span className="text-sm whitespace-nowrap">{node.name.replace('.py', '').replace('_locators', '')}</span>
        </div>
    );
};


// --- Main Component ---

export const LocatorManagementView = () => {
    // Theme Hook
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    // Data State
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [locators, setLocators] = useState([]);
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter State
    const [fileSearch, setFileSearch] = useState('');
    const [locatorSearch, setLocatorSearch] = useState('');
    const [expandedClasses, setExpandedClasses] = useState({});
    const [status, setStatus] = useState(null); // { message, severity }

    // Edit State
    const [editingLocator, setEditingLocator] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', value: '' });

    // AI State
    const [aiModalOpen, setAiModalOpen] = useState(false);
    const [aiTargetLocator, setAiTargetLocator] = useState(null);
    const [selectedRecording, setSelectedRecording] = useState('');
    const [recordingMenuAnchor, setRecordingMenuAnchor] = useState(null);
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);

    const [modifiedLocators, setModifiedLocators] = useState(new Set());

    useEffect(() => {
        fetchFiles();
        fetchRecordings();
    }, []);

    const triggerHighlight = (name, className) => {
        setModifiedLocators(prev => {
            const next = new Set(prev);
            next.add(`${className}-${name}`);
            return next;
        });
    };

    const showStatus = (message, severity = 'success') => {
        setStatus({ message, severity });
        setTimeout(() => setStatus(null), 3000);
    };

    const fetchFiles = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/playwright-pom/locators/');
            const data = await res.json();
            setFiles(data);
            if (selectedFile) {
                const refreshed = data.find(f => f.file_path === selectedFile.file_path);
                if (refreshed) handleFileSelect(refreshed, true);
            }
        } catch (e) {
            console.error(e);
            showStatus("Failed to load locators", "error");
        } finally {
            setLoading(false);
        }
    };

    const fetchRecordings = async () => {
        try {
            const res = await fetch('/api/playwright-pom/record/files');
            const data = await res.json();
            setRecordings(data.files || []);
        } catch (e) { console.error(e); }
    };

    const handleFileSelect = (file, keepSuggestions = false) => {
        setSelectedFile(file);

        const flat = [];
        const initialExpanded = {};

        file.classes.forEach(cls => {
            initialExpanded[cls.name] = true;
            cls.locators.forEach(loc => {
                flat.push({ ...loc, className: cls.name });
            });
        });

        setExpandedClasses(initialExpanded);
        setLocators(flat);
        if (!keepSuggestions) {
            setAiSuggestions(null);
        }
    };

    // --- Filter Logic ---
    const fileTree = useMemo(() => {
        const targetFiles = fileSearch
            ? files.filter(f => f.file_name.toLowerCase().includes(fileSearch.toLowerCase()))
            : files;
        return buildFileTree(targetFiles);
    }, [files, fileSearch]);


    const groupedLocators = useMemo(() => {
        if (!selectedFile) return {};

        let displayLocators = locators;
        if (locatorSearch) {
            const lower = locatorSearch.toLowerCase();
            displayLocators = locators.filter(l =>
                l.name.toLowerCase().includes(lower) ||
                l.value.toLowerCase().includes(lower) ||
                l.className.toLowerCase().includes(lower)
            );
        }

        const groups = {};
        displayLocators.forEach(loc => {
            if (!groups[loc.className]) groups[loc.className] = [];
            groups[loc.className].push(loc);
        });

        return groups;
    }, [locators, locatorSearch, selectedFile]);

    // --- Actions ---

    const toggleClass = (clsName) => {
        setExpandedClasses(prev => ({ ...prev, [clsName]: !prev[clsName] }));
    };

    const handleEdit = (locator, e) => {
        e && e.stopPropagation();
        setEditingLocator(locator);
        setEditForm({ name: locator.name, value: locator.value });
    };

    const handleSaveEdit = async () => {
        if (!selectedFile || !editingLocator) return;
        try {
            const res = await fetch('/api/playwright-pom/locators/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: selectedFile.file_path,
                    class_name: editingLocator.className,
                    locator_name: editingLocator.name,
                    new_name: editForm.name,
                    new_value: editForm.value
                })
            });
            const data = await res.json();

            if (res.ok) {
                setEditingLocator(null);
                const msg = data.refs_updated?.length
                    ? `Saved & updated references in ${data.refs_updated.length} files`
                    : "Locator updated successfully";
                showStatus(msg);
                triggerHighlight(editForm.name, editingLocator.className);
                fetchFiles();
            } else {
                showStatus("Failed to update locator", "error");
            }
        } catch (e) {
            console.error(e);
            showStatus("Error updating locator", "error");
        }
    };

    // --- AI ---
    const openAiModal = (locator = null) => {
        setAiTargetLocator(locator);
        setAiModalOpen(true);
        setAiSuggestions(null);
    };

    const handleAiSuggest = async () => {
        try {
            setAiLoading(true);
            let recordingContent = null;
            if (selectedRecording) {
                const res = await fetch(`/api/playwright-pom/record/load/${encodeURIComponent(selectedRecording)}`);
                const data = await res.json();
                recordingContent = data.content;
            }

            const payload = {
                file_path: selectedFile.file_path,
                locator_name: aiTargetLocator ? aiTargetLocator.name : null,
                recording_content: recordingContent
            };

            const res = await fetch('/api/playwright-pom/locators/ai-suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            setAiSuggestions(result.suggestions || []);
        } catch (e) {
            showStatus("AI Suggestion failed", "error");
        } finally {
            setAiLoading(false);
        }
    };

    const applyAiSuggestion = async (suggestion) => {
        const className = suggestion.class_name || (aiTargetLocator?.className);
        if (!className) {
            showStatus("Could not determine class name", "error");
            return;
        }

        try {
            const res = await fetch('/api/playwright-pom/locators/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_path: selectedFile.file_path,
                    class_name: className,
                    locator_name: suggestion.locator_name,
                    new_name: suggestion.suggested_name,
                    new_value: suggestion.suggested_value
                })
            });

            const data = await res.json();
            if (res.ok) {
                const msg = data.refs_updated?.length
                    ? `Healed! Refactored ${data.refs_updated.length} files`
                    : "Locator healed successfully";
                showStatus(msg);
                triggerHighlight(suggestion.suggested_name, className);

                fetchFiles();
                // Removed auto-close to allow multiple fixes or verification
                // if (aiTargetLocator) setAiModalOpen(false);
            } else {
                showStatus(`Apply failed: ${data.detail || "Server rejected request"}`, "error");
            }
        } catch (e) {
            console.error("Apply suggestion error:", e);
            showStatus(`Apply failed: ${e.message}`, "error");
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <Box sx={{ p: 2, display: 'none' }}>
                <Box sx={{ pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                            Locator Manager
                        </Typography>
                    </Box>
                    <Typography variant="subtitle1" color="text.secondary">
                        Manage and heal your Playwright locators with AI precision.
                    </Typography>
                </Box>
                <div className="flex gap-2 items-center">
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
                            {status.severity === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                            <Typography variant="body2">{status.message}</Typography>
                        </Box>
                    )}
                    <ThemeToggle />
                </div>
            </Box>

            <Box sx={{ flex: 1, p: 2, minHeight: 0, overflow: 'hidden', transition: 'background-color 0.3s' }}>
                <div className="flex h-full gap-4">

                    {/* Sidebar Panel - "Editor Window" style */}
                    <div className="w-80 flex flex-col h-full min-h-0 shrink-0">
                        <div className={`flex-1 flex flex-col rounded-xl border shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e] border-gray-800 ring-white/5' : 'bg-white border-gray-300 ring-black/5'} ring-1`}>

                            {/* Window Header */}
                            <div className={`relative h-10 flex items-center justify-between px-4 shrink-0 transition-colors duration-300 ${isDark ? 'bg-[#252526]' : 'bg-gray-50'}`}>
                                <div className={`absolute bottom-0 left-0 right-0 h-[1px] ${isDark ? 'bg-[#333]' : 'bg-transparent'}`} />
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] shadow-sm ml-0.5" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] shadow-sm" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] shadow-sm" />
                                </div>
                                <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    Locator Files
                                </div>
                            </div>

                            {/* Search Bar */}
                            <div className={`p-3 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                <div className="relative group">
                                    <Search className={`absolute left-3 top-2.5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={14} />
                                    <input
                                        className={`w-full rounded-lg py-2 pl-9 pr-3 text-sm border focus:ring-1 outline-none transition-all shadow-sm ${isDark ? 'bg-[#121212] border-gray-800 focus:border-blue-500/50 text-gray-200 placeholder-gray-600' : 'bg-white border-gray-300 focus:border-blue-500 text-gray-700 placeholder-gray-400'}`}
                                        placeholder="Search files..."
                                        value={fileSearch}
                                        onChange={(e) => setFileSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className={`flex-1 overflow-auto p-2 scrollbar-thin ${isDark ? 'scrollbar-thumb-gray-700/50' : 'scrollbar-thumb-gray-200'}`}>
                                <div className="min-w-max">
                                    {loading && (
                                        <div className="flex flex-col items-center justify-center h-32 text-zinc-500 gap-2">
                                            <RefreshCw className="animate-spin h-5 w-5 opacity-50" />
                                            <span className="text-xs">Loading files...</span>
                                        </div>
                                    )}

                                    {!loading && Object.values(fileTree).map(node => (
                                        <FileTreeNode
                                            key={node.name}
                                            node={node}
                                            onSelect={handleFileSelect}
                                            selectedFile={selectedFile}
                                            isDark={isDark}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - "Editor Window" style */}
                    <div className="flex-1 flex flex-col h-full min-h-0">
                        <div className={`flex-1 flex flex-col rounded-xl border shadow-2xl overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#1e1e1e] border-gray-800 ring-white/5' : 'bg-white border-gray-300 ring-black/5'} ring-1`}>

                            {selectedFile ? (
                                <>
                                    {/* Toolbar/Tab Header */}
                                    <div className={`relative h-12 flex items-center justify-between px-4 shrink-0 transition-colors duration-300 border-b ${isDark ? 'bg-[#252526] border-black/20' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="flex items-end h-full pt-2">
                                            <div className={`flex items-center px-4 py-2 rounded-t-lg text-xs font-medium border-t-2 relative top-[1px] transition-all duration-300 font-sans ${isDark ? 'bg-[#1e1e1e] text-gray-200 border-t-blue-500 border-x border-x-[#333]' : 'bg-white text-gray-700 border-t-blue-500 border-x border-x-gray-200'}`}>
                                                <Database size={13} className={`mr-2 shrink-0 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                                                <span className={`tracking-tight font-bold text-xs truncate max-w-[400px] ${isDark ? 'text-orange-400' : 'text-orange-600'}`} title={selectedFile.file_name}>
                                                    {(selectedFile.file_name.startsWith('/') ? selectedFile.file_name : `/${selectedFile.file_name}`).replace('.py', '').replace('_locators', '')}
                                                </span>
                                                <Tag color="purple" isDark={isDark}>{locators.length} LOCATORS</Tag>
                                                {/* Cover line */}
                                                <div className={`absolute bottom-[-1px] left-0 right-0 h-[1px] ${isDark ? 'bg-[#1e1e1e]' : 'bg-white'}`} />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="relative w-64 group">
                                                <Search className={`absolute left-3 top-2.5 transition-colors ${isDark ? 'text-gray-500 group-focus-within:text-blue-400' : 'text-gray-400 group-focus-within:text-blue-500'}`} size={14} />
                                                <input
                                                    className={`w-full rounded-md py-1.5 pl-9 pr-3 text-sm focus:ring-1 outline-none transition-all ${isDark ? 'bg-[#121212] border border-gray-700 focus:border-blue-500/50 text-gray-200' : 'bg-white border border-gray-300 focus:border-blue-500 text-gray-700'}`}
                                                    placeholder="Filter locators..."
                                                    value={locatorSearch}
                                                    onChange={(e) => setLocatorSearch(e.target.value)}
                                                />
                                            </div>
                                            <Button
                                                variant="primary-glass"
                                                onClick={() => openAiModal(null)}
                                                className="h-8 text-xs font-medium shadow-lg shadow-blue-500/20"
                                            >
                                                <Wand2 className="mr-2 h-3.5 w-3.5" />
                                                AI Analyze
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Tabular Content */}
                                    <div className={`flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6 ${isDark ? 'bg-[#1e1e1e] scrollbar-thumb-gray-700/50' : 'bg-white scrollbar-thumb-gray-200'}`}>
                                        {Object.entries(groupedLocators).map(([className, locs]) => {
                                            const isExpanded = expandedClasses[className];
                                            return (
                                                <div key={className} className={`transition-all duration-300 border rounded-lg overflow-hidden ${isDark ? 'border-gray-800' : 'border-gray-200 shadow-sm'}`}>
                                                    {/* Class Header */}
                                                    <div
                                                        className={`px-4 py-3 flex items-center gap-3 cursor-pointer select-none group transition-colors ${isDark ? 'bg-[#252526] hover:bg-[#2a2a2c]' : 'bg-gray-50 hover:bg-gray-100'}`}
                                                        onClick={() => toggleClass(className)}
                                                    >
                                                        <div className={`p-1 rounded transition-all duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
                                                            <ChevronRight size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Layers size={16} className={isDark ? "text-purple-400" : "text-purple-600"} />
                                                            <span className={`text-sm font-semibold font-mono tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{className}</span>
                                                        </div>
                                                        <div className={`flex-1 mx-4 h-px border-b border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}></div>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-black/20 text-gray-500' : 'bg-white text-gray-500 border border-gray-200'}`}>
                                                            {locs.length}
                                                        </span>
                                                    </div>

                                                    {isExpanded && (
                                                        <div className={`border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                                                            <table className="w-full text-left border-collapse">
                                                                <thead className={isDark ? 'bg-black/20' : 'bg-gray-50/50'}>
                                                                    <tr>
                                                                        <th className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-1/4 pl-12 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Variable Name</th>
                                                                        <th className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Selector Value</th>
                                                                        <th className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider w-24 text-right ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Actions</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-100'}`}>
                                                                    {locs.map((loc, idx) => {
                                                                        const isHighlighted = modifiedLocators.has(`${className}-${loc.name}`);
                                                                        return (
                                                                            <tr
                                                                                key={`${className}-${loc.name}`}
                                                                                className={`group transition-all duration-500 ${isHighlighted
                                                                                    ? (isDark ? 'bg-amber-500/10 shadow-[inset_3px_0_0_0_#f59e0b]' : 'bg-amber-50 shadow-[inset_3px_0_0_0_#d97706]')
                                                                                    : (isDark ? 'hover:bg-white/5' : 'hover:bg-blue-50/30')
                                                                                    }`}
                                                                            >
                                                                                {editingLocator === loc ? (
                                                                                    <>
                                                                                        <td className="px-4 py-2 align-top pl-12">
                                                                                            <input
                                                                                                className={`w-full rounded px-2 py-1 text-sm font-mono outline-none border focus:ring-1 ${isDark ? 'bg-black/20 border-blue-500/50 text-blue-300 focus:ring-blue-500/50' : 'bg-white border-blue-400 text-blue-700 focus:ring-blue-500'}`}
                                                                                                value={editForm.name}
                                                                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                                                                autoFocus
                                                                                            />
                                                                                        </td>
                                                                                        <td className="px-4 py-2 align-top">
                                                                                            <textarea
                                                                                                className={`w-full rounded px-2 py-1 text-sm font-mono outline-none border focus:ring-1 resize-none ${isDark ? 'bg-black/20 border-emerald-500/50 text-emerald-300 focus:ring-emerald-500/50' : 'bg-white border-emerald-500 text-emerald-700 focus:ring-emerald-500'}`}
                                                                                                value={editForm.value}
                                                                                                onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                                                                                                rows={1}
                                                                                            />
                                                                                        </td>
                                                                                        <td className="px-4 py-2 align-top text-right">
                                                                                            <div className="flex items-center justify-end gap-1">
                                                                                                <button onClick={() => setEditingLocator(null)} className={`p-1 rounded ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}><X size={14} /></button>
                                                                                                <button onClick={handleSaveEdit} className={`p-1 rounded ${isDark ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-50'}`}><Check size={14} /></button>
                                                                                            </div>
                                                                                        </td>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <td className="px-4 py-2 align-top pl-12">
                                                                                            <div className={`font-mono text-[13px] font-medium pt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                                                                                                {loc.name}
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2 align-top">
                                                                                            <div className="group/val relative flex items-center pr-8">
                                                                                                <div className={`font-mono text-[13px] break-all px-2 py-0.5 rounded border border-transparent transition-all ${isDark ? 'text-gray-300 group-hover/val:border-gray-700 group-hover/val:bg-black/20' : 'text-gray-600 group-hover/val:border-gray-200 group-hover/val:bg-white '}`}>
                                                                                                    {loc.value}
                                                                                                </div>
                                                                                                <div className="absolute right-0 scale-90">
                                                                                                    <LocatorCopyButton value={loc.value} onCopy={() => showStatus("Copied")} isDark={isDark} />
                                                                                                </div>
                                                                                            </div>
                                                                                        </td>
                                                                                        <td className="px-4 py-2 align-top text-right">
                                                                                            <div className="flex items-center justify-end gap-1">
                                                                                                <button
                                                                                                    onClick={(e) => handleEdit(loc, e)}
                                                                                                    className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-blue-400' : 'hover:bg-gray-100 text-gray-400 hover:text-blue-600'}`}
                                                                                                    title="Edit"
                                                                                                >
                                                                                                    <Edit2 size={14} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => openAiModal(loc)}
                                                                                                    className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-purple-400' : 'hover:bg-gray-100 text-gray-400 hover:text-purple-600'}`}
                                                                                                    title="AI Heal"
                                                                                                >
                                                                                                    <Wand2 size={14} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </td>
                                                                                    </>
                                                                                )}
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {locators.length === 0 && (
                                            <div className={`flex flex-col items-center justify-center py-20 border border-dashed rounded-xl ${isDark ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'}`}>
                                                <div className={`p-4 rounded-full mb-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                                    <FileCode size={32} className="opacity-40" />
                                                </div>
                                                <p className="font-medium text-sm">No locators found</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className={`flex-1 flex flex-col items-center justify-center p-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                    <div className="max-w-md w-full text-center space-y-6">
                                        <div className="relative w-32 h-32 mx-auto">
                                            <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-200/40'}`}></div>
                                            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border shadow-sm ${isDark ? 'bg-[#252526] border-gray-800' : 'bg-white border-gray-100'}`}>
                                                <MousePointer2 size={48} className={isDark ? "text-gray-600" : "text-gray-300"} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className={`text-xl font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Manage Locators</h3>
                                            <p className="text-sm leading-relaxed max-w-xs mx-auto opacity-80">
                                                Select a file from the sidebar to visualize and edit selectors.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Box>

            {/* AI Modal */}
            {
                aiModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                        <div className={`w-[800px] h-[85vh] flex flex-col rounded-xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-300'}`}>
                            <div className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? 'bg-[#252526] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div>
                                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                                        <Wand2 className={isDark ? 'text-indigo-400' : 'text-indigo-600'} size={20} />
                                        AI Locator Assistant
                                    </h3>
                                    {aiTargetLocator && <p className={`text-xs mt-1 font-mono ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Target: <span className={isDark ? 'text-indigo-300' : 'text-indigo-600'}>{aiTargetLocator.name}</span></p>}
                                </div>

                                {status && (
                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium animate-in fade-in slide-in-from-top-2 ${status.severity === 'success' ? (isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700') : (isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-700')}`}>
                                        {status.severity === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
                                        {status.message}
                                    </div>
                                )}

                                <button onClick={() => setAiModalOpen(false)} className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className={`flex-1 overflow-y-auto p-6 scrollbar-thin ${isDark ? 'bg-[#1e1e1e] scrollbar-thumb-gray-700' : 'bg-white scrollbar-thumb-gray-200'}`}>
                                <div className={`mb-8 p-4 rounded-xl border shadow-sm ${isDark ? 'bg-[#252526] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Context Source</label>
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <Box
                                                onClick={(e) => setRecordingMenuAnchor(e.currentTarget)}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: '8px 12px',
                                                    border: '1px solid',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    bgcolor: isDark ? '#121212' : '#ffffff',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        borderColor: theme.palette.primary.main,
                                                        boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`
                                                    }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                                    <div className={`p-1 rounded ${selectedRecording ? 'bg-indigo-500/10 text-indigo-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                                        <FileCode size={14} />
                                                    </div>
                                                    <Typography
                                                        noWrap
                                                        variant="body2"
                                                        sx={{
                                                            color: selectedRecording ? 'text.primary' : 'text.disabled',
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {selectedRecording
                                                            ? (recordings.find(r => r.path === selectedRecording)?.name.replace('.py', '') || selectedRecording)
                                                            : "Select Recording Reference..."}
                                                    </Typography>
                                                </Box>
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-300 ${Boolean(recordingMenuAnchor) ? 'rotate-180 text-indigo-500' : 'text-gray-400'}`}
                                                />
                                            </Box>

                                            <Menu
                                                anchorEl={recordingMenuAnchor}
                                                open={Boolean(recordingMenuAnchor)}
                                                onClose={() => setRecordingMenuAnchor(null)}
                                                PaperProps={{
                                                    sx: {
                                                        mt: 1,
                                                        borderRadius: '8px',
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                                        maxHeight: '300px',
                                                        width: recordingMenuAnchor ? recordingMenuAnchor.clientWidth : 'auto'
                                                    }
                                                }}
                                            >
                                                {recordings.length === 0
                                                    ? [<MenuItem key="no-recordings" disabled>No recordings found</MenuItem>]
                                                    : [
                                                        <MenuItem
                                                            key="clear-recording"
                                                            onClick={() => {
                                                                setSelectedRecording('');
                                                                setRecordingMenuAnchor(null);
                                                            }}
                                                            sx={{ gap: 1.5, fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic' }}
                                                        >
                                                            <X size={14} />
                                                            None (Clear)
                                                        </MenuItem>,
                                                        ...recordings.map((rec) => (
                                                            <MenuItem
                                                                key={rec.path}
                                                                onClick={() => {
                                                                    setSelectedRecording(rec.path);
                                                                    setRecordingMenuAnchor(null);
                                                                }}
                                                                selected={selectedRecording === rec.path}
                                                                sx={{
                                                                    gap: 1.5,
                                                                    fontSize: '0.875rem',
                                                                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }
                                                                }}
                                                            >
                                                                <FileCode size={14} className="opacity-70" />
                                                                {rec.name.replace('.py', '')}
                                                            </MenuItem>
                                                        )),
                                                    ]}
                                            </Menu>
                                        </div>
                                        <Button
                                            variant="primary-glass"
                                            onClick={handleAiSuggest}
                                            disabled={aiLoading}
                                            className="px-6 text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20"
                                        >
                                            {aiLoading ? <RefreshCw className="animate-spin mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                            {aiLoading ? 'Analyzing...' : 'Generate Suggestions'}
                                        </Button>
                                    </div>
                                </div>

                                {aiSuggestions && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-2 border-gray-200 dark:border-gray-800">
                                            <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                                Results
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>{aiSuggestions.length}</span>
                                            </h4>
                                        </div>

                                        {aiSuggestions.map((sug, i) => {
                                            const original = locators.find(l =>
                                                l.name === sug.locator_name &&
                                                (sug.class_name ? l.className === sug.class_name : true)
                                            );

                                            return (
                                                <div key={i} className={`border rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md ${isDark ? 'bg-[#252526] border-white/5 hover:border-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'}`}>
                                                    <div className={`px-4 py-3 border-b flex justify-between items-center ${isDark ? 'bg-[#2a2a2c] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                {i + 1}
                                                            </div>
                                                            <div>
                                                                <div className={`text-sm font-bold font-mono tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{sug.locator_name}</div>
                                                                <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{sug.class_name}</div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => applyAiSuggestion(sug)}
                                                            className={`px-3 py-1.5 rounded-md text-xs font-medium shadow-sm transition-colors ${isDark ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
                                                        >
                                                            Apply Fix
                                                        </button>
                                                    </div>

                                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-red-400' : 'text-red-600'}`}>Current</div>
                                                            </div>
                                                            <div className={`p-3 rounded-lg border font-mono text-xs break-all line-through opacity-70 ${isDark ? 'bg-black/20 border-red-500/20 text-red-300' : 'bg-red-50 border-red-100 text-red-800'}`}>
                                                                {original ? original.value : 'N/A'}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Suggested</div>
                                                            </div>
                                                            <div className={`p-3 rounded-lg border font-mono text-xs break-all flex items-start gap-2 group/new relative ${isDark ? 'bg-black/20 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-100 text-emerald-800'}`}>
                                                                <span className="flex-1">{sug.suggested_value}</span>
                                                                <div className="absolute right-2 top-2 opacity-0 group-hover/new:opacity-100 transition-opacity">
                                                                    <LocatorCopyButton value={sug.suggested_value} onCopy={() => showStatus("Copied")} isDark={isDark} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-4 py-2 border-t flex items-start gap-2 ${isDark ? 'bg-[#2a2a2c] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                                        <Code2 size={14} className={`mt-0.5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                                        <p className={`text-xs italic leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>"{sug.reason}"</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </Box >
    );
};
