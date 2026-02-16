"use client";

import React from "react";
import { Box } from "@mui/material";
import Dashboard from "../components/Dashboard";
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { useEvaluation } from '../contexts/EvaluationContext';

export default function DashboardPage() {
    const { sidebarWidth } = useSidebar();
    const { latestResult } = useEvaluation();

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box component="main" sx={{ flexGrow: 1, ml: `${sidebarWidth}px`, transition: 'margin-left 0.3s ease-in-out' }}>
                <Dashboard latestResult={latestResult} />
            </Box>
        </Box>
    );
}
