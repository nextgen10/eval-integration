# 🏦 Next.js Application Merge & UBS-Inspired UI Refactor (Dashboard + Analytics)

## 📌 Project Context

I have **two existing React front-end applications** that must be merged into a **single unified Next.js application**.

Both applications are fully functional and contain valid business logic.

**Stack:** Next.js (App Router), TypeScript, MUI, Tailwind CSS

The goal is:

✅ Merge both apps  
✅ Unify UI & layout  
✅ Standardize design system  
✅ Preserve logic & data behavior  

This is a **refactor and unification task**, NOT a rewrite.

---

## 📁 Next.js App Router Conventions

- **File-based routing** – Routes live under `src/app/`; each folder with `page.tsx` is a route
- **Layouts** – `layout.tsx` wraps child routes; root layout in `src/app/layout.tsx`, nested layouts in route folders
- **No React Router** – Use `<Link>` from `next/link` and `usePathname()` from `next/navigation` for nav

---

## 🎯 Design Inspiration

The unified UI should follow **clean, modern banking / fintech design principles** inspired by UBS-style interfaces:

https://www.ubs.com/ch/en/services/accounts-and-cards/daily-banking/private-account-adults/key4.html

⚠ IMPORTANT:

- Do NOT copy UBS logos, branding, assets, or proprietary visuals
- Only follow design philosophy: clean layout, spacing, hierarchy, neutrality

---

## 🎯 Primary Objectives

### ✅ 1. Centralized Design System

Create a reusable theme system containing:

- Color tokens
- Typography scale
- Spacing system
- Border radius / elevation
- Semantic states

Create or extend:

```
src/theme/index.ts
```

Integrate with MUI's `createTheme()` and ensure compatibility with existing `ThemeContext` / `ThemeRegistry`. Use a professional financial dashboard aesthetic.

---

## 🎨 UBS-Inspired Color Palette

### Background & Surfaces

- Background Primary → `#FFFFFF`
- Background Secondary → `#F5F7FA`
- Background Tertiary → `#EEF1F5`

- Surface Primary → `#FFFFFF`
- Surface Elevated → `#FAFBFC`

---

### Borders

- Subtle Border → `#E3E7ED`
- Strong Border → `#C9D1DC`

---

### Typography

- Primary Text → `#1C1F24`
- Secondary Text → `#5B6472`
- Muted Text → `#8C96A5`
- Inverse Text → `#FFFFFF`

---

### Primary Accent (High-Importance Actions)

- Primary → `#D00000`
- Hover → `#A60000`
- Light Variant → `#FFE5E5`

Usage:

- Primary buttons
- Key highlights
- Active states

---

### Secondary Accent (Navigation / Structure)

- Secondary → `#2F3A4A`
- Hover → `#1F2933`
- Light Variant → `#E5E9F0`

Usage:

- Header / sidebar
- Secondary controls

---

### Semantic Colors

Success → `#1F8A70`  
Warning → `#D9822B`  
Error → `#C23030`  
Info → `#2D6CDF`

---

## 🧱 2. Unified Application Layout (Next.js Layouts)

Use **Next.js layout hierarchy** for shared UI:

- **Root layout** (`src/app/layout.tsx`) – Theme providers, fonts, global structure
- **Shared layout** – Header, sidebar, main content area
- **Nested layouts** – Per-section layouts (e.g. `agent-eval/layout.tsx`, `rag-eval/layout.tsx`) if needed

Rules:

- All pages inherit from root layout
- No duplicated layout logic across route groups
- Fully responsive

Structure:

```
src/app/
├── layout.tsx           # Root: providers, html/body
└── (shared layout via components)
```

Create reusable layout components:

```
src/components/layout/
├── AppLayout.tsx        # Header + Sidebar + main content shell
├── Header.tsx
└── Sidebar.tsx
```

Compose these inside `layout.tsx` or a nested layout.

---

## 🧭 3. Routing & Navigation (Next.js App Router)

- **No React Router** – Next.js uses file-based routing
- Route structure lives in `src/app/` folder hierarchy
- Each `page.tsx` defines a route; folder path = URL path

Merge routing by:

- Consolidating existing route groups (`agent-eval/`, `rag-eval/`, etc.) under one app structure
- Using route groups `(groupName)` if you need logical grouping without URL segments
- Ensuring each route has a single `page.tsx`

Navigation:

- Use `next/link` (`<Link href="...">`) for internal links
- Use `next/navigation` (`usePathname()`) for active state detection
- Keep nav config in a single source (e.g. `src/config/nav.ts`)

Create or extend:

```
src/config/nav.ts        # Central nav menu structure
src/components/navigation/
├── UnifiedNavBar.tsx    # Top nav or sidebar links
└── NavLink.tsx          # Styled Link with active state
```

Requirements:

- Consistent menu structure
- Clear active states (via `usePathname()`)
- Unified styling

---

## 📊 4. Graphs & Data Visualizations (Critical Section)

Both applications contain charts / graphs.

Refactor rules:

✅ Preserve existing data logic & transformations  
✅ Do NOT change datasets or calculations  
✅ Standardize visual appearance  

Unification goals:

- Consistent padding & spacing
- Clean background surfaces
- Subtle gridlines
- Minimal visual noise
- Neutral default colors

If charts use different libraries (Recharts / MUI X Charts / Chart.js / etc.):

- Do NOT rewrite chart logic unless necessary
- Normalize container components & styling

Create shared wrapper:

```
src/components/shared/ChartContainer.tsx
```

Responsibilities:

- Standard spacing
- Background & border styling
- Title / label alignment

---

## 📈 5. Metrics / KPI Cards

Applications include metric cards displaying numbers / stats.

Unify card design:

- Clean surface background
- Soft border or subtle shadow
- Clear typography hierarchy
- Consistent spacing
- No excessive colors

Create shared component:

```
src/components/shared/MetricCard.tsx
```

Design requirements:

- Label (secondary text)
- Value (primary text)
- Optional trend / indicator
- Responsive sizing

---

## 🏷 6. Logos & Brand Assets

Applications include logos.

Rules:

✅ Preserve existing logos & assets  
✅ Do NOT distort or resize improperly  
✅ Maintain aspect ratios  

Unification goals:

- Consistent placement (header / sidebar)
- Consistent padding & alignment
- Avoid visual clutter

Create reusable component:

```
src/components/shared/BrandLogo.tsx
```

Responsibilities:

- Proper scaling
- Layout-safe rendering
- Theming compatibility (light/dark surfaces)

---

## 🧩 7. Component Standardization

Identify duplicated UI components:

- Buttons
- Inputs
- Cards
- Modals
- Containers
- Typography

Refactor into:

```
src/components/shared/
```

Enforce:

- Consistent naming
- Consistent props API
- No duplication

---

## 🎨 8. Styling Refactor

Standardize styling system (MUI + Tailwind):

- Remove conflicting CSS; reconcile MUI `sx` / `styled()` with Tailwind classes
- Eliminate redundant styles in `globals.css` and component-level overrides
- Normalize spacing & typography via theme tokens
- Ensure responsive behavior (MUI breakpoints, Tailwind responsive utilities)
- Define a convention: e.g. MUI for layout/components, Tailwind for utilities

Follow modern Next.js and React best practices.

---

## 🧠 9. Preserve Business Logic (Critical Constraint)

- Do NOT rewrite working logic
- Do NOT modify API contracts
- Do NOT alter calculations

Refactor UI & structure only where needed.

---

## 🚫 Constraints

❌ No full rewrites  
❌ No destructive refactors  
❌ No proprietary UBS asset copying  

✅ Minimal safe modifications  
✅ Preserve functionality  

---

## ✅ Expected Deliverables

Provide:

1. Theme system implementation
2. Unified layout components (composed in `layout.tsx`)
3. Consolidated App Router structure (route groups, `page.tsx` files)
4. Shared UI components
5. Chart container standardization
6. Metric card standardization
7. Logo handling component
8. Suggested folder structure
9. Explanation of design decisions

---

## 🗂 Suggested Folder Structure (Next.js App Router)

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (providers, etc.)
│   ├── page.tsx                  # /
│   ├── agent-eval/
│   │   ├── layout.tsx            # Optional nested layout
│   │   ├── page.tsx
│   │   ├── dashboard/page.tsx
│   │   └── ...
│   ├── rag-eval/
│   │   └── ...
│   └── docs/
│       └── ...
├── components/
│   ├── shared/
│   │   ├── MetricCard.tsx
│   │   ├── ChartContainer.tsx
│   │   └── BrandLogo.tsx
│   ├── layout/
│   └── navigation/
├── theme/
├── config/
│   └── nav.ts
├── contexts/
└── utils/
```

---

## ▶ Execution Instructions

Work incrementally:

### Step 1
Create or extend theme system & tokens (`src/theme/`).

### Step 2
Create unified layout components; wire into `src/app/layout.tsx` (and nested layouts if needed).

### Step 3
Consolidate routing: ensure `page.tsx` files and folder structure under `src/app/` match desired URLs; unify nav config and `Link` usage.

### Step 4
Refactor MetricCard & ChartContainer into shared components.

### Step 5
Normalize styling conflicts (MUI vs Tailwind, globals.css).

Show diffs when applicable.

Avoid destructive rewrites.

---

## 🎯 Visual Design Intent

Target UI:

- Clean banking / analytics dashboard
- Professional & neutral appearance
- Generous whitespace
- Clear hierarchy
- Minimalist data visualization
- Consistent component styling

---

**Begin by implementing the theme system and layout architecture (Steps 1–2).**

RAG EVAL - Rename Scenario metrics as Experiments
AGENT EVAL - Remove Interaction page
AGENT EVAL - Rename Config to Configuration and move to last item
AGENT EVAL - Experiments page - Evaluation analysis section is cluttered and overlapping infomration..make it more nicer

There toggle should always be at right most