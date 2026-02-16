"use client";

import React from 'react';
import './agent_globals.css';
import ThemeRegistry from './components/ThemeRegistry';
import BackgroundPatterns from './components/BackgroundPatterns';
import { SidebarProvider } from './contexts/SidebarContext';
import CopyProtection from './components/CopyProtection';
import { EvaluationProvider } from './contexts/EvaluationContext';

export default function AgentEvalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ThemeRegistry>
            <SidebarProvider>
                <EvaluationProvider>
                    <CopyProtection />
                    <BackgroundPatterns />
                    {children}
                </EvaluationProvider>
            </SidebarProvider>
        </ThemeRegistry>
    );
}
