"use client";

import React from "react";
import { Box } from "@mui/material";
import Dashboard from "../components/Dashboard";
import { useEvaluation } from '../contexts/EvaluationContext';

export default function DashboardPage() {
    const { latestResult } = useEvaluation();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Dashboard latestResult={latestResult} />
        </Box>
    );
}
