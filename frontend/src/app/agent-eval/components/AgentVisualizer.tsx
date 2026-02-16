"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle, ArrowRight, FileJson, Brain } from "lucide-react";
import { cn } from "@agent-eval/lib/utils";

interface AgentVisualizerProps {
    logs: any[];
    isLoading?: boolean;
}

export function AgentVisualizer({ logs, isLoading }: AgentVisualizerProps) {
    const steps = [
        { id: "input", label: "User Input", icon: FileJson },
        { id: "target", label: "Target Agent", icon: Bot },
        { id: "evaluator", label: "Evaluator Agent", icon: Brain },
        { id: "result", label: "Final Result", icon: CheckCircle },
    ];

    const activeStepIndex = logs.length > 0 ? Math.min(logs.length, steps.length - 1) : 0;

    return (
        <div className="w-full p-6 bg-slate-900 rounded-xl border border-slate-800">
            <h3 className="text-lg font-semibold text-slate-100 mb-6">Agent Workflow</h3>
            <div className="flex items-center justify-between relative">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 transform -translate-y-1/2" />

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= activeStepIndex;
                    const isCurrent = index === activeStepIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-slate-900 px-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    borderColor: isActive ? "#3b82f6" : "#1e293b",
                                    backgroundColor: isActive ? "#1e293b" : "#0f172a",
                                }}
                                className={cn(
                                    "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-colors duration-300",
                                    isActive ? "border-blue-500 text-blue-400" : "border-slate-800 text-slate-600"
                                )}
                            >
                                <Icon size={20} />
                            </motion.div>
                            <span className={cn(
                                "text-sm font-medium",
                                isActive ? "text-slate-200" : "text-slate-600"
                            )}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Logs Display */}
            <div className="mt-8 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {logs.map((log, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono"
                    >
                        <span className="text-blue-400 font-bold">[{log.role}]</span>:{" "}
                        <span className="text-slate-300">{log.content.substring(0, 200)}...</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
