'use client';

import React from 'react';
import AuthGuard from '@/components/AuthGuard';

export default function RAGEvalLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
