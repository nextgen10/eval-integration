"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { Card } from "@agent-eval/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@agent-eval/components/ui/tabs";

interface Metric {
    name: string;
    score: number;
    reason: string;
    success: boolean;
    category: string;
}

interface RQSMetrics {
    accuracy: number;
    consistency: number;
    pdf_support_rate: number;
    rqs: number;
}

interface MetricsDashboardProps {
    metrics: Metric[];
    rqsMetrics?: RQSMetrics;
    batchResults?: any[]; // simplified for now
}

export function MetricsDashboard({ metrics, rqsMetrics, batchResults }: MetricsDashboardProps) {
    if (!metrics.length && !rqsMetrics) return null;

    // Group metrics for different views
    const nlpMetrics = metrics.filter(m => m.category === "NLP");
    const otherMetrics = metrics.filter(m => m.category !== "NLP");

    return (
        <div className="space-y-6">
            {rqsMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="text-sm text-slate-400">RQS Score</div>
                        <div className="text-3xl font-bold text-blue-400">{rqsMetrics.rqs.toFixed(3)}</div>
                    </Card>
                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="text-sm text-slate-400">Accuracy</div>
                        <div className="text-2xl font-semibold text-slate-200">{rqsMetrics.accuracy.toFixed(3)}</div>
                    </Card>
                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="text-sm text-slate-400">Consistency</div>
                        <div className="text-2xl font-semibold text-slate-200">{rqsMetrics.consistency.toFixed(3)}</div>
                    </Card>
                    <Card className="p-4 bg-slate-900 border-slate-800">
                        <div className="text-sm text-slate-400">PDF Support</div>
                        <div className="text-2xl font-semibold text-slate-200">{rqsMetrics.pdf_support_rate.toFixed(3)}</div>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="charts" className="w-full">
                <TabsList className="bg-slate-900 border border-slate-800">
                    <TabsTrigger value="charts">Visualizations</TabsTrigger>
                    <TabsTrigger value="details">Detailed Breakdown</TabsTrigger>
                    {batchResults && <TabsTrigger value="batch">Batch Results</TabsTrigger>}
                </TabsList>

                <TabsContent value="charts" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Radar Chart for NLP Metrics */}
                        {nlpMetrics.length > 0 && (
                            <Card className="p-6 h-80">
                                <h3 className="text-lg font-semibold text-slate-100 mb-4">NLP Metrics (Radar)</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={nlpMetrics}>
                                        <PolarGrid stroke="#334155" />
                                        <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: '#94a3b8' }} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            fill="#3b82f6"
                                            fillOpacity={0.5}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </Card>
                        )}

                        {/* Bar Chart for Structure/Other */}
                        <Card className="p-6 h-80">
                            <h3 className="text-lg font-semibold text-slate-100 mb-4">Structural & Judge Scores</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={otherMetrics}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 1]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                                        itemStyle={{ color: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                                        {otherMetrics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.success ? "#22c55e" : "#ef4444"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="details">
                    <div className="space-y-4">
                        {metrics.map((metric, idx) => (
                            <Card key={idx} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-medium text-slate-200">{metric.name}</h4>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                            {metric.category}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${metric.success ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {metric.score.toFixed(3)}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400">{metric.reason}</p>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {batchResults && (
                    <TabsContent value="batch">
                        <div className="space-y-4">
                            {batchResults.map((res: any, idx: number) => (
                                <Card key={idx} className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-slate-200">Run #{idx + 1}</h4>
                                        {/* Show summary of metrics for this run */}
                                        <div className="flex gap-2">
                                            {res.metrics.map((m: any, i: number) => (
                                                <span key={i} className={`text-xs px-2 py-1 rounded ${m.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                    {m.name}: {m.score.toFixed(2)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 font-mono bg-slate-950 p-2 rounded">
                                        {JSON.stringify(res.output)}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
