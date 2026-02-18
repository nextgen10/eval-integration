# RAG Eval Application: Production-Grade Refactor Plan

This plan applies the same UBS-aligned, production-grade design improvements completed for Agent Eval to the RAG Eval application.

---

## 1. Scope

Apply the design consistency fixes performed on Agent Eval:

- Replace all hardcoded hex colors with theme tokens
- Ensure theme-aware components (light/dark mode)
- Align with `ubs_style.md` and `src/theme/index.ts`
- Use MUI semantic palette (`success`, `error`, `info`, `warning`, `primary`)

---

## 2. Current Issues in RAG Eval

### 2.1 Hardcoded Colors (grep findings)

| Location | Current Value | Replace With |
|----------|---------------|--------------|
| Search icon | `#64748b` | `theme.palette.text.secondary` |
| Primary buttons | `#E60000`, `#1d4ed8` | `theme.palette.primary.main`, `theme.palette.info.main` |
| Chart strokes | `#22c55e`, `#e879f9`, `#f59e0b`, `#06b6d4`, `#6366f1` | `theme.palette.success.main` or chart tokens from `colors.chart` |
| Area chart | `#E60000`, `#fbbf24`, `#f472b6` | theme palette / chart tokens |
| MetricSubRow colors | `#10b981`, `#3b82f6`, `#f59e0b`, etc. | theme or `colors.chart` |
| Alpha/Beta/Gamma | `#E60000`, `#8b5cf6`, `#f59e0b` | `theme.palette.primary`, secondary, warning |
| UbsLogo | `#D00000` | `theme.palette.primary.main` |
| Status indicators | `#ef4444`, `#f59e0b`, `#10b981`, `#38bdf8` | `theme.palette.error`, warning, success, info |
| Print report body | `#0f172a`, `#ffffff` | `theme.palette.background.default`, `theme.palette.text.primary` |

### 2.2 File Locations

Primary file to update: `src/features/rag-eval/components/RAGEvalPage.tsx` (~2000+ lines)

Components that may need updates:

- `MetricExplanationCard` – uses `(theme) =>` callbacks, already theme-aware
- Charts (Recharts) – stroke/fill colors need theme
- Buttons, Chips, Tables – replace inline hex
- Print report – use theme for body/background

### 2.3 Chart Palette

RAG Eval uses RAG-specific metrics. Add to `src/theme/index.ts` if needed:

```ts
// In colors.chart or extend:
rag: {
  correctness: '#1F8A70',   // success
  faithfulness: '#673AB7',  // accuracy-like
  relevancy: '#D9822B',     // warning
  precision: '#2D6CDF',     // info
  recall: '#009688',        // teal
}
```

Or map existing `colors.chart` / MUI semantic palette to RAG metrics.

---

## 3. Implementation Steps

### Phase 1: Theme Hooks & Imports

1. Ensure `useTheme()` is used in any component that needs dynamic colors.
2. Import `{ colors } from '@/theme'` where chart-specific tokens are needed.
3. Replace `const theme = nexusTheme` at top level with `useTheme()` inside components that render UI (so dark/light switching works).

### Phase 2: Replace Search & Icon Colors

- Lines ~764, ~848: Search icon `color: '#64748b'` → `color: theme.palette.text.secondary`

### Phase 3: Replace Button & Chip Colors

- Primary: `#E60000` → `theme.palette.primary.main`
- Secondary/info: `#1d4ed8` → `theme.palette.info.main`
- Use MUI Button `color="primary"` / `variant="contained"` instead of inline styles where possible.

### Phase 4: Replace Chart Colors (Recharts)

- Area chart strokes: map to `theme.palette.success`, `theme.palette.info`, `theme.palette.warning`, etc., or `colors.chart.*`.
- Radar/Bar fills: use `theme.palette.*` or alpha for backgrounds.
- Pie/segment colors: define a small array from theme, e.g. `[theme.palette.primary.main, theme.palette.warning.main, theme.palette.info.main]`.

### Phase 5: Replace MetricSubRow & Metric Cards

- MetricSubRow `color` prop: pass `theme.palette.success.main` etc. instead of hex.
- Ensure `MetricSubRow` and `MetricCard` accept theme values (they likely already do from Agent Eval).

### Phase 6: Replace Status & Semantic Colors

- Success: `#10b981` → `theme.palette.success.main`
- Error: `#ef4444` → `theme.palette.error.main`
- Warning: `#f59e0b` → `theme.palette.warning.main`
- Info: `#38bdf8`, `#3b82f6` → `theme.palette.info.main`

### Phase 7: Print Report & Dialogs

- Print body background/text: use `theme.palette.background.default` and `theme.palette.text.primary`.
- Alert/Backdrop: use theme alpha/background utilities instead of raw rgba.

### Phase 8: UbsLogo & Branding

- `UbsLogo color="#D00000"` → `color={theme.palette.primary.main}`

---

## 4. Checklist

- [ ] Add `useTheme()` where needed; remove static `nexusTheme` usage for dynamic UI
- [ ] Replace all `#...` hex in RAGEvalPage.tsx with theme tokens
- [ ] Add RAG-specific chart tokens to theme if desired (optional)
- [ ] Verify light and dark mode both look correct
- [ ] Run linter; fix any type/import issues

---

## 5. Reference: Agent Eval Fixes Applied

For consistency, the following were done in Agent Eval:

1. **Theme tokens** – `colors.chart` for metrics, MUI palette for semantic states
2. **Dashboard** – SummaryCard, charts use `theme.palette.*` and `colors.chart.*`
3. **MetricsDashboard** – Recharts tooltips, axes, bars use theme
4. **AgentVisualizer** – Migrated from Tailwind to MUI Paper/Box; `useTheme()`, `alpha()`
5. **TestInput** – Migrated to MUI TextField, Button, Paper; theme-aware
6. **agent-interaction** – Node colors, edges, Event Log use theme
7. **test-evaluations** – All Papers, Chips, Accordions, Cards use theme

RAG Eval should mirror this approach.

---

## 6. Estimated Effort

- **Phase 1–3**: ~30 min
- **Phase 4 (Charts)**: ~45 min
- **Phase 5–6**: ~30 min
- **Phase 7–8**: ~20 min
- **Testing & polish**: ~30 min

**Total**: ~2.5 hours
