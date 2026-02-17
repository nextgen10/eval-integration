'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Activity,
    Bot,
    Settings,
    History,
    Lightbulb,
    Info,
    Brain
} from 'lucide-react';

import './agent_globals.css';
import CopyProtection from './components/CopyProtection';
import { EvaluationProvider } from './contexts/EvaluationContext';
import ThemeRegistry from '../../components/ThemeRegistry';
import ThemeToggle from './components/ThemeToggle';
import { UnifiedNavBar } from '../../components/UnifiedNavBar';

export default function AgentEvalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        {
            id: '/agent-eval/dashboard',
            label: 'Dashboard',
            icon: <LayoutDashboard size={16} />,
            path: '/agent-eval/dashboard'
        },
        {
            id: '/agent-eval/test-evaluations',
            label: 'Test Eval', // Shortened for space
            icon: <Activity size={16} />,
            path: '/agent-eval/test-evaluations'
        },
        {
            id: '/agent-eval/agent-interaction',
            label: 'Interaction',
            icon: <Bot size={16} />,
            path: '/agent-eval/agent-interaction'
        },
        {
            id: '/agent-eval/configuration',
            label: 'Config',
            icon: <Settings size={16} />,
            path: '/agent-eval/configuration'
        },
        {
            id: '/agent-eval/history',
            label: 'History',
            icon: <History size={16} />,
            path: '/agent-eval/history'
        },
    ];

    return (
        <ThemeRegistry>
            <EvaluationProvider>
                <CopyProtection />

                <UnifiedNavBar
                    title="AGENT EVAL"
                    items={menuItems.map(item => ({
                        id: item.id,
                        label: item.label,
                        icon: item.icon,
                        active: pathname === item.path || pathname.startsWith(item.path + '/'),
                        onClick: () => router.push(item.path)
                    }))}
                    onLogoClick={() => router.push('/')}
                    actions={<ThemeToggle />}
                />

                <div style={{
                    paddingTop: '20px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    maxWidth: '1600px',
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {children}
                </div>
            </EvaluationProvider>
        </ThemeRegistry>
    );
}
