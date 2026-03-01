import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Layers, RefreshCw, Rocket, Sparkles } from 'lucide-react';

export function ReusableFlowsView() {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [sharedFlows, setSharedFlows] = useState([]);
    const [loadingFlows, setLoadingFlows] = useState(false);

    const fetchSharedFlows = async () => {
        try {
            setLoadingFlows(true);
            const res = await fetch('/api/playwright-pom/shared-flows');
            const data = await res.json();
            setSharedFlows(data.flows || []);
        } catch (err) {
            console.error('Failed to fetch shared flows:', err);
            setSharedFlows([]);
        } finally {
            setLoadingFlows(false);
        }
    };

    useEffect(() => {
        fetchSharedFlows();
    }, []);

    return (
        <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ flex: 1, p: 2, minHeight: 0, overflow: 'hidden', display: 'flex' }}>
                <div
                    className={`w-full h-full overflow-hidden flex flex-col p-4 rounded-xl border ${
                        isDark ? 'bg-[#1e1e1e] border-gray-800 shadow-none' : 'bg-white border-gray-300 shadow-sm'
                    }`}
                >
                    <div className="flex items-center justify-between gap-2 mb-4 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <Sparkles size={16} className="text-blue-500 shrink-0" />
                            <span className={`text-xs font-bold uppercase tracking-wider truncate ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                Reusable Flow Library
                            </span>
                        </div>
                        <button
                            onClick={fetchSharedFlows}
                            className={`p-1.5 rounded shrink-0 transition-colors flex items-center justify-center ${
                                isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-black/5 text-gray-500'
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw size={12} className={loadingFlows ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2.5">
                        {sharedFlows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 text-center opacity-40">
                                <Layers size={24} className="mb-2" />
                                <p className="text-xs italic">{loadingFlows ? 'Loading reusable flows...' : 'No shared flows found.'}</p>
                            </div>
                        ) : (
                            sharedFlows.map((flow) => (
                                <div
                                    key={flow.name}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                                        isDark
                                            ? 'bg-black/40 border-gray-800 hover:border-blue-500/50 hover:bg-blue-500/5 shadow-2xl'
                                            : 'bg-white border-gray-200 hover:border-blue-400 shadow-md'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                            <span className={`text-sm font-bold tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{flow.name}</span>
                                        </div>
                                        <Rocket size={13} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-all transform translate-x-1" />
                                    </div>
                                    <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>{flow.description}</p>
                                    {flow.parameters.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {flow.parameters.map((p) => (
                                                <span
                                                    key={p}
                                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                                                        isDark ? 'bg-gray-800 text-blue-400 border border-gray-700' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                                    }`}
                                                >
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Box>
        </Box>
    );
}
