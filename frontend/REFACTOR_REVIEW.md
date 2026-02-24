# Comprehensive Frontend Review: Structure & Design Consistency

## Executive Summary

The Qualaris frontend has **two parallel app structures** (agent-eval, rag-eval) with inconsistent design systems, duplicated/conflicting code, and structural coupling. This document outlines findings and the refactoring plan.

---

## 1. Structural Issues

### 1.1 Fragmented App Structure

| Area | agent-eval | rag-eval |
|------|------------|----------|
| **Layout** | Has `layout.tsx` with UnifiedNavBar | No layout; renders nav inside 2100-line page |
| **Components** | `components/`, `contexts/`, `hooks/`, `lib/`, `utils/` inside route folder | Everything inline in single page |
| **Pages** | 7 pages (dashboard, test-eval, interaction, config, history, feedback, page) | 1 monolithic page with view switching |
| **Styling** | agent_globals.css (Tailwind), MUI, Radix | MUI only |

**Problem:** agent-eval behaves like a full sub-app; rag-eval is a giant single file. No shared abstraction.

### 1.2 Route-Coupled Imports

- **@agent-eval/\*** path alias ties components to `/agent-eval` route
- `MetricsDashboard`, `card.tsx`, `tabs.tsx` use `@agent-eval/components/ui/*`
- `docs/page.tsx` and `rag-eval/page.tsx` import `ThemeToggle` from `../agent-eval/components/ThemeToggle`
- `rag-eval` imports `MetricSubRow` from `../../components/Dashboard/MetricSubRow` (dashboard is agent-eval concept)

**Problem:** Cannot rename routes or reorganize without breaking imports.

### 1.3 Dead / Orphaned Code

| Item | Location | Status |
|------|----------|--------|
| **Sidebar** | agent-eval/components/Sidebar.tsx | Never rendered; layout uses UnifiedNavBar |
| **SidebarContext** | agent-eval/contexts/SidebarContext.tsx | SidebarProvider never used |
| **ColorModeContext** | agent-eval/contexts/ColorModeContext.tsx | Only used by unused Sidebar; root uses ThemeContext |
| **agent-eval ThemeRegistry** | agent-eval/components/ThemeRegistry.tsx | Orphaned; root layout has its own ThemeRegistry |
| **agent-eval theme.ts** | agent-eval/theme.ts | Duplicate; root uses src/theme/ |

### 1.4 CSS Conflicts

- **globals.css**: MUI-friendly, scrollbar vars, no body background override
- **agent_globals.css**: Tailwind directives, `body { background: transparent }`, `.custom-scrollbar`, `user-select: none`, keyframes
- Both apply to the same app; agent_globals is imported only in agent-eval layout
- agent_globals `user-select: none !important` affects entire app when agent-eval is mounted

---

## 2. Design Inconsistencies

### 2.1 Branding & Accent Colors

| Component | Accent | Notes |
|-----------|--------|-------|
| **UnifiedNavBar** | `primary.main` (UBS red #D00000) | Correct |
| **Sidebar (unused)** | `#673ab7`, `#2196f3` (purple/blue gradient) | Wrong; not UBS palette |
| **rag-eval** | `#E60000`, `#D00000` | Red, aligned |
| **MetricsDashboard** | `slate-900`, `blue-400`, `green-400` | Tailwind; ignores theme |
| **agent-eval ui/card** | `slate-800`, `slate-900` | Hardcoded; no theme support |

### 2.2 Component Libraries

| Area | Library | Issue |
|------|---------|-------|
| agent-eval MetricsDashboard | Radix Card, Tabs | Tailwind classes; doesn't use MUI theme |
| agent-eval ui/card, tabs | Radix + Tailwind | Duplicates MUI Paper/Card |
| agent-eval Details/Batch views | Radix Card | Inconsistent with rag-eval MUI Paper |
| rag-eval | MUI throughout | Good; matches shared components |

### 2.3 Navigation Patterns

- **agent-eval**: Dashboard, Test Eval, Interaction, Config, History (5 items)
- **rag-eval**: Dashboard, Scenario Metrics, History, Configuration (4 items, different labels)
- **docs**: Single "Back to Home" link
- No shared nav component that adapts per section; each builds its own

### 2.4 Layout & Spacing

- agent-eval layout: `paddingTop: 20px`, `paddingLeft/Right: 24px`, `maxWidth: 1600px`
- rag-eval: Inline styles, different padding
- No shared `AppLayout` usage (exists but not used)

---

## 3. Refactoring Plan

### Phase 1: Structure Unification
1. Move `ThemeToggle` to `src/components/ThemeToggle.tsx` (shared)
2. Create `src/features/agent-eval/` and `src/features/rag-eval/` for feature-specific logic
3. Move agent-eval `contexts/EvaluationContext`, `hooks/useAgentEvents`, `utils/config` to features
4. Keep `app/agent-eval/` and `app/rag-eval/` as route folders with thin page components only
5. Replace `@agent-eval/*` with `@/features/agent-eval/*` or `@/*`

### Phase 2: Dead Code & Consolidation
1. Delete Sidebar, SidebarContext, ColorModeContext
2. Delete agent-eval ThemeRegistry, agent-eval theme.ts
3. Merge agent_globals.css into globals.css (Tailwind, keyframes); remove conflicting rules

### Phase 3: Rag-Eval Layout
1. Create `app/rag-eval/layout.tsx` with UnifiedNavBar (like agent-eval)
2. Add ragEvalNavItems to nav config
3. Split rag-eval page into components: RAGDashboard, RAGHistory, RAGConfig, RAGDrilldown

### Phase 4: Design Consistency
1. Migrate MetricsDashboard Radix Card/Tabs to MUI
2. Replace agent-eval ui/card, ui/tabs with MUI or shared components
3. Ensure all components use theme tokens (no hardcoded slate-*, #673ab7, etc.)

---

## 4. Completed Refactoring (Summary)

### Done
- **ThemeToggle** moved to `src/components/ThemeToggle.tsx`; all imports updated
- **@agent-eval path alias** removed from tsconfig; `cn` and ui components now use `@/lib/utils`
- **MetricsDashboard** migrated from Radix Card/Tabs to MUI Paper/Tabs
- **Dead code removed**: Sidebar, SidebarContext, ColorModeContext, agent-eval ThemeRegistry, agent-eval theme.ts
- **agent_globals.css** merged into globals.css (Tailwind, .custom-scrollbar); file deleted
- **rag-eval layout** added; **ragEvalNavItems** added to nav config
- **src/lib/utils.ts** created for shared `cn` utility
- **src/features/agent-eval/** created: contexts, hooks, utils, components; route folder now thin (layout + pages only)
- **src/features/rag-eval/** created: RAGEvalPage extracted; route page is thin wrapper

### Deferred
- rag-eval page further split into RAGDashboard, RAGHistory, RAGConfig, RAGDrilldown (monolith moved to feature, full split TBD)

---

## 5. Current Structure (Post-Refactor)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── agent-eval/
│   │   ├── layout.tsx          # EvaluationProvider, UnifiedNavBar
│   │   ├── page.tsx            # Redirect to dashboard
│   │   ├── dashboard/page.tsx  # Thin; imports from features
│   │   └── ...                 # All pages thin
│   ├── rag-eval/
│   │   ├── layout.tsx          # Placeholder
│   │   └── page.tsx            # Thin; imports RAGEvalPage
│   └── docs/
├── components/
│   ├── shared/                 # MetricCard, ChartContainer, BrandLogo
│   ├── Dashboard/              # MetricSubRow
│   ├── layout/                 # AppLayout
│   ├── ThemeToggle.tsx
│   └── ...
├── features/
│   ├── agent-eval/             # DONE
│   │   ├── contexts/           # EvaluationContext
│   │   ├── hooks/              # useAgentEvents
│   │   ├── utils/              # config, webglCheck
│   │   └── components/         # Dashboard, MetricsDashboard, 3d/, ui/, etc.
│   └── rag-eval/               # DONE
│       └── components/         # RAGEvalPage (monolith, can be split further)
├── theme/
├── config/
└── contexts/
```
