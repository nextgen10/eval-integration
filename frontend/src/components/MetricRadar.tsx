"use client";

import React from 'react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer
} from 'recharts';

interface Metrics {
    faithfulness: number;
    answer_relevancy: number;
    context_precision: number;
    context_recall: number;
}

export default function MetricRadar({ data, color }: { data: any, color: string }) {
    const chartData = [
        { subject: 'Faithfulness', value: data.faithfulness * 100 },
        { subject: 'Relevancy', value: data.answer_relevancy * 100 },
        { subject: 'Precision', value: data.context_precision * 100 },
        { subject: 'Recall', value: data.context_recall * 100 },
    ];

    return (
        <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <Radar
                        name="Metrics"
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.5}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
