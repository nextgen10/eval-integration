"use client";

import { useState } from "react";
import { Play, Loader2 } from "lucide-react";

interface TestInputProps {
    onRunTest: (prompt: string, expectedKeys: string[], expectedOutput: string, enableLlmJudge: boolean) => Promise<void>;
    isLoading: boolean;
}

export function TestInput({ onRunTest, isLoading }: TestInputProps) {
    const [prompt, setPrompt] = useState("Generate a user profile for John Doe, age 30, software engineer.");
    const [expectedKeys, setExpectedKeys] = useState("name, age, occupation");
    const [expectedOutput, setExpectedOutput] = useState("");
    const [enableLlmJudge, setEnableLlmJudge] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const keys = expectedKeys.split(",").map(k => k.trim()).filter(k => k);
        onRunTest(prompt, keys, expectedOutput, enableLlmJudge);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-slate-900 rounded-xl border border-slate-800">
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Test Prompt</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="Enter instructions for the agent..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ground Truth JSON Keys (comma separated)</label>
                <input
                    type="text"
                    value={expectedKeys}
                    onChange={(e) => setExpectedKeys(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder="name, age, email..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ground Truth Output (Optional - for NLP Metrics)</label>
                <textarea
                    value={expectedOutput}
                    onChange={(e) => setExpectedOutput(e.target.value)}
                    className="w-full h-24 bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    placeholder='{"name": "John Doe", "age": 30} ...'
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="llmJudge"
                    checked={enableLlmJudge}
                    onChange={(e) => setEnableLlmJudge(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="llmJudge" className="text-sm font-medium text-slate-400 select-none cursor-pointer">
                    Enable LLM Judge (Requires API Key)
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="animate-spin" size={18} />
                        Running Evaluation...
                    </>
                ) : (
                    <>
                        <Play size={18} />
                        Run Test
                    </>
                )}
            </button>
        </form>
    );
}
