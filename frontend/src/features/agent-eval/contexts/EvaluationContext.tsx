'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL } from '../utils/config';
import { authFetch } from '../utils/authFetch';

interface EvaluationContextType {
    latestResult: any;
    loading: boolean;
    refreshLatestResult: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export function EvaluationProvider({ children }: { children: ReactNode }) {
    const [latestResult, setLatestResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchLatestResult = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/latest-result`);
            if (!res.ok) return;
            const data = await res.json();
            if (data && data.result) {
                setLatestResult(data.result);
            }
        } catch (err) {
            console.error("Failed to fetch latest result:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestResult();
    }, []);

    const refreshLatestResult = async () => {
        await fetchLatestResult();
    };

    return (
        <EvaluationContext.Provider value={{ latestResult, loading, refreshLatestResult }}>
            {children}
        </EvaluationContext.Provider>
    );
}

export function useEvaluation() {
    const context = useContext(EvaluationContext);
    if (context === undefined) {
        throw new Error('useEvaluation must be used within an EvaluationProvider');
    }
    return context;
}
