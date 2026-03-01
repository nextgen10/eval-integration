import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, XCircle, Terminal, AlertTriangle, Copy, Check, Upload, FolderInput, FileCode, Clock, X } from 'lucide-react';
import { Card, CardHeader, CardContent } from '../UI/Card';
import { Button } from '../UI/Button';
import { PageHeader } from '../UI/PageHeader';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material';

export function TestRunnerView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [runningTest, setRunningTest] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);
    const [generatedFiles, setGeneratedFiles] = useState([]);

    // Live log streaming state
    const [liveLogs, setLiveLogs] = useState("");
    const [logOffset, setLogOffset] = useState(0);

    // Fetch generated files on mount
    useEffect(() => {
        fetch('/api/playwright-pom/generate/files')
            .then(res => res.json())
            .then(data => setGeneratedFiles(data.files || []))
            .catch(console.error);
    }, []);

    // Poll for live logs while test is running
    useEffect(() => {
        let interval;
        if (runningTest) {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/api/playwright-pom/tests/logs?offset=${logOffset}`);
                    const data = await res.json();
                    if (data.content) {
                        setLiveLogs(prev => prev + data.content);
                        setLogOffset(data.offset);
                    }
                } catch (err) {
                    console.error('Failed to fetch logs:', err);
                }
            }, 500); // Poll every 500ms
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [runningTest, logOffset]);

    // Publish State
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [testName, setTestName] = useState("");
    const [folderName, setFolderName] = useState("");
    const [publishing, setPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState(null);

    const runTest = async () => {
        try {
            // Reset logs for new test run
            setLiveLogs("");
            setLogOffset(0);
            setRunningTest(true);
            setTestResult(null);
            setError(null);
            const res = await fetch('/api/playwright-pom/tests/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.output || data.detail);
            setTestResult(data);
        } catch (e) {
            setError(e.message);
        }
        finally { setRunningTest(false); }
    };

    const handleCopy = () => {
        if (!testResult?.output) return;
        navigator.clipboard.writeText(testResult.output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const publishTest = async () => {
        if (!testName.trim()) return;
        try {
            setPublishing(true);
            setError(null);
            const res = await fetch('/api/playwright-pom/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: testName,
                    folder_name: folderName.trim() || null
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail);

            setPublishSuccess(`Successfully published ${data.published_files.length} files to framework!`);
            setTimeout(() => {
                setShowPublishModal(false);
                setPublishSuccess(null);
                setTestName("");
                setFolderName("");
            }, 2000);
        } catch (e) {
            setError(e.message);
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="relative">
            <PageHeader
                title="Pytest Runner"
                description="Execute generated Pytest scenarios and view reports."
            >
                <div className="flex gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setShowPublishModal(true)}
                        icon={Upload}
                        className="shadow-gray-900/20"
                    >
                        Publish to Framework
                    </Button>
                    <Button
                        variant="primary"
                        onClick={runTest}
                        loading={runningTest}
                        icon={Play}
                        disabled={runningTest}
                        className="pl-6 pr-8 shadow-blue-500/20"
                    >
                        {runningTest ? "Running Test..." : "Run Latest Test"}
                    </Button>
                </div>
            </PageHeader>

            <div className="p-6 grid grid-cols-1 gap-6">
                {/* Latest Files Card */}
                {generatedFiles.length > 0 && (
                    <Card className={`${isDark ? '!bg-gray-900/30 !border-gray-800' : '!bg-white !border-gray-200 shadow-sm'}`}>
                        <div className="p-4 flex items-start gap-4">
                            <div className={`p-2 rounded-lg mt-1 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                <Clock size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Staged Files</h3>
                                <p className={`text-xs mb-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>These files will be executed or published.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {generatedFiles.map((file, i) => (
                                        <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded border text-xs font-mono truncated ${isDark ? 'bg-gray-950 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                            <FileCode size={12} className={isDark ? "text-blue-500/50" : "text-blue-500"} />
                                            <span className="truncate">{file}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {error && (
                    <div className={`p-4 rounded-xl text-sm flex items-start gap-3 border ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-800'}`}>
                        <AlertTriangle size={20} className={`mt-0.5 shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        <div className="flex-1">
                            <h4 className={`font-bold mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>Error</h4>
                            <pre className="whitespace-pre-wrap font-mono text-xs opacity-80">{error}</pre>
                        </div>
                    </div>
                )}

                {testResult && (
                    <Card className={`border-l-4 ${testResult.status === 'success' ? 'border-l-green-500' : 'border-l-red-500'} ${isDark ? '!bg-[#1e1e1e]' : '!bg-white shadow-sm'}`}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className={`flex items-center gap-3 ${testResult.status === 'success' ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                                    {testResult.status === 'success' ? <CheckCircle size={28} /> : <XCircle size={28} />}
                                    <div>
                                        <h3 className="text-xl font-bold">
                                            Test {testResult.status === 'success' ? 'Passed' : 'Failed'}
                                        </h3>
                                        <p className={`text-sm font-medium opacity-80 uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            Exit Code: {testResult.return_code}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-800'}`}>
                                <div className={`px-4 py-2 border-b flex justify-between items-center ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                                    <div className="flex items-center gap-2">
                                        <Terminal size={14} />
                                        <span className="text-xs font-mono font-medium">Console Output</span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider hover:text-white transition-colors"
                                    >
                                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                                <pre className="p-6 font-mono text-xs text-gray-300 overflow-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
                                    {testResult.output}
                                </pre>
                            </div>
                        </div>
                    </Card>
                )}


                {runningTest && !testResult && !error && (
                    <Card className={`border-blue-500/20 ${isDark ? '!bg-blue-900/5' : '!bg-blue-50/50'}`}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative">
                                    <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full"></div>
                                    <Terminal size={14} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                                </div>
                                <div>
                                    <p className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>Test Running...</p>
                                    <p className="text-xs text-gray-500">Streaming live execution logs</p>
                                </div>
                            </div>
                            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-gray-900 border-gray-800'}`}>
                                <div className={`px-4 py-2 border-b flex items-center gap-2 ${isDark ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-gray-800 border-gray-700 text-gray-300'}`}>
                                    <Terminal size={14} />
                                    <span className="text-xs font-mono font-medium">Live Console Output</span>
                                </div>
                                <div className="p-4 max-h-96 overflow-auto">
                                    <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {liveLogs || "Initializing test execution..."}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {!runningTest && !testResult && !error && (
                    <div className={`flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-xl ${isDark ? 'border-gray-800 bg-gray-900/30 text-gray-600' : 'border-gray-200 bg-gray-50/50 text-gray-400'}`}>
                        <Play size={48} className="mb-4 opacity-20" />
                        <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ready to Execute</p>
                        <p className="text-sm opacity-60">Click "Run Latest Test" to start the Pytest runner.</p>
                    </div>
                )}
            </div>

            {/* Publish Modal */}
            {showPublishModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className={`w-[420px] rounded-xl border shadow-2xl p-6 ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Publish to Framework</h3>
                            <button
                                onClick={() => { setShowPublishModal(false); setTestName(''); setFolderName(''); }}
                                className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {!publishSuccess ? (
                            <>
                                {/* Folder Name Input (Optional) */}
                                <div className="mb-3">
                                    <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        Folder Name <span className="text-gray-600">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <FolderInput size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                                        <input
                                            type="text"
                                            value={folderName}
                                            onChange={(e) => setFolderName(e.target.value)}
                                            placeholder="e.g., authentication"
                                            className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#121212] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-sm'}`}
                                        />
                                    </div>
                                    <p className="text-[11px] mt-1 text-gray-600">
                                        {folderName
                                            ? <>Saves to: <span className="text-gray-400">pages/{folderName.toLowerCase().replace(/[^\w-]/g, '_')}/{testName || 'name'}_page.py</span></>
                                            : 'Leave empty to publish to root pages folder'
                                        }
                                    </p>
                                </div>

                                {/* Scenario Name Input */}
                                <div className="mb-4">
                                    <label className={`block text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
                                        Scenario Name <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FileCode size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                                        <input
                                            autoFocus
                                            type="text"
                                            value={testName}
                                            onChange={(e) => setTestName(e.target.value)}
                                            placeholder="e.g., login_flow"
                                            className={`w-full pl-9 pr-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-[#121212] border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 shadow-sm'}`}
                                            onKeyDown={(e) => e.key === 'Enter' && testName.trim() && publishTest()}
                                        />
                                    </div>
                                    <p className="text-[11px] mt-1 text-gray-600">
                                        Files renamed to: <span className="text-gray-400">{testName || 'name'}_page.py</span>, <span className="text-gray-400">{testName || 'name'}_locators.py</span>, etc.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setShowPublishModal(false); setTestName(''); setFolderName(''); }}
                                        className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={publishTest}
                                        disabled={!testName.trim() || publishing}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                                    >
                                        {publishing ? 'Publishing...' : 'Publish'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6 space-y-4">
                                <div className={`inline-flex p-3 rounded-full ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'}`}>
                                    <CheckCircle size={32} />
                                </div>
                                <p className={isDark ? "text-green-400 font-medium" : "text-green-600 font-medium"}>{publishSuccess}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
