import React from 'react';
import { Sidebar } from './Sidebar';
import { useSidebar } from '@/contexts/SidebarContext';
import { Box } from '@mui/material';

export function DashboardLayout({ children, currentView, setView, setShowLanding }) {
    const { sidebarWidth } = useSidebar();

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>
            {/* Ambient Background - kept for compatibility */}
            <Box sx={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: -2
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(103, 58, 183, 0.15) 0%, transparent 70%)',
                    filter: 'blur(120px)',
                    animation: 'pulse 4s ease-in-out infinite',
                    '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.2 },
                        '50%': { opacity: 0.3 }
                    }
                }} />
                <Box sx={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(33, 150, 243, 0.1) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }} />
            </Box>

            <Sidebar currentView={currentView} setView={setView} setShowLanding={setShowLanding} />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    ml: `${sidebarWidth}px`,
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                    zIndex: 10,
                    transition: 'margin-left 0.3s ease-in-out',
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

