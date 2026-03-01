"use client";
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Tooltip, IconButton, Box, Divider } from '@mui/material';
import { Video, FileText, Settings, Target, Activity, Wand2, Sparkles, TrendingUp, Network, Book, Layers } from 'lucide-react';

import { StudioView } from './Views/StudioView';
import { TestExecutionView } from './Views/TestExecutionView';
import { SettingsView } from './Views/SettingsView';
import { LocatorManagementView } from './Views/LocatorManagementView';
import { UserGuideView } from './Views/UserGuideView';
import { PromptsView } from './Views/PromptsView';
import { TestDesignView } from './Views/TestDesignView';
import { HealRecordingView } from './Views/HealRecordingView';
import { ArchitectureView } from './Views/ArchitectureView';
import { RoiView } from './Views/RoiView';
import { ReusableFlowsView } from './Views/ReusableFlowsView';
import BackgroundPatterns from './BackgroundPatterns';

const PRIMARY_NAV = [
  { id: 'test_design', label: 'Test Design',      icon: Sparkles, color: '#9c27b0' },
  { id: 'studio',      label: 'Test Studio',       icon: Video,    color: '#2196f3' },
  { id: 'flows',       label: 'Reusable Flows',    icon: Layers,   color: '#3f51b5' },
  { id: 'execution',   label: 'Test Execution',    icon: FileText, color: '#ff9800' },
  { id: 'locators',    label: 'Manage Locators',   icon: Target,   color: '#f44336' },
  { id: 'heal',        label: 'Heal Recording',    icon: Activity, color: '#e91e63' },
  { id: 'prompts',     label: 'AI Prompts',        icon: Wand2,    color: '#673ab7' },
  { id: 'settings',    label: 'Configuration',     icon: Settings, color: '#607d8b' },
];

const SECONDARY_NAV = [
  { id: 'roi',          label: 'ROI & Savings', icon: TrendingUp, color: '#4caf50' },
  { id: 'architecture', label: 'Architecture',  icon: Network,    color: '#00bcd4' },
  { id: 'guide',        label: 'User Guide',    icon: Book,       color: '#009688' },
];

function NavIcons({ currentView, setView }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const container = typeof document !== 'undefined'
    ? document.getElementById('pws-navbar-menus')
    : null;
  if (!container) return null;

  const renderBtn = ({ id, label, icon: Icon, color }) => {
    const active = currentView === id;
    return (
      <Tooltip key={id} title={label} arrow placement="bottom">
        <IconButton
          size="small"
          onClick={() => setView(id)}
          sx={{
            color: active ? color : 'text.secondary',
            bgcolor: active ? `${color}22` : 'transparent',
            border: `1px solid ${active ? color + '55' : 'transparent'}`,
            borderRadius: 1.5,
            width: 32,
            height: 32,
            p: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            '&:hover': { bgcolor: `${color}18`, color },
            transition: 'all 0.15s ease',
          }}
        >
          <Icon size={17} />
        </IconButton>
      </Tooltip>
    );
  };

  return ReactDOM.createPortal(
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
      {PRIMARY_NAV.map(renderBtn)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, opacity: 0.3, alignSelf: 'stretch' }} />
      {SECONDARY_NAV.map(renderBtn)}
    </Box>,
    container,
  );
}

function App() {
  const getInitialView = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('view') || 'studio';
    }
    return 'studio';
  };

  const [currentView, setView] = useState(getInitialView());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') !== currentView) {
      window.history.pushState({}, '', `${window.location.pathname}?view=${currentView}`);
    }
  }, [currentView]);

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setView(params.get('view') || 'studio');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'studio':       return <StudioView />;
      case 'flows':        return <ReusableFlowsView />;
      case 'execution':    return <TestExecutionView />;
      case 'settings':     return <SettingsView />;
      case 'locators':     return <LocatorManagementView />;
      case 'guide':        return <UserGuideView />;
      case 'prompts':      return <PromptsView />;
      case 'test_design':  return <TestDesignView />;
      case 'heal':         return <HealRecordingView />;
      case 'architecture': return <ArchitectureView />;
      case 'roi':          return <RoiView />;
      default:             return <StudioView />;
    }
  };

  return (
    <>
      <BackgroundPatterns />
      <NavIcons currentView={currentView} setView={setView} />
      {renderView()}
    </>
  );
}

export default App;
