# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (Vite)
pnpm build        # Type check + production build
pnpm lint         # Run ESLint
pnpm check        # Type check only (no emit)
pnpm test         # Run tests (Vitest)
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Router + Leaflet

**Project:** OPC-Lab (光未在线 OPC) - A policy information platform helping solo entrepreneurs find and action government policies.

**Structure:**
- `src/pages/` - Route-level components (Home, PolicyMap, Community)
- `src/components/` - UI components organized by domain (`ui/`, `policy/`, `site/`)
- `src/stores/` - Zustand state stores
- `src/hooks/` - Custom React hooks
- `src/utils/` - Pure utility functions
- `src/types/` - TypeScript type definitions
- `src/data/` - Static/sample data

**State Management:** Zustand for global state (`usePolicyMapStore` handles policies, filters, favorites, toast notifications)

**Routing:** React Router with nested routes under `SiteLayout` (provides TopNav, Footer, ToastHost)

**Styling:** TailwindCSS with CSS variables for theming (light/dark mode via `useTheme` hook). Utility `cn()` in `src/lib/utils.ts` for class merging.

**Path Aliases:** `@/*` maps to `./src/*` (via vite-tsconfig-paths)

**Tests:** Vitest + jsdom + Testing Library. Setup file at `src/test/setup.ts`.

**Key Patterns:**
- URL state synchronization (filters persist to URL search params, see `src/utils/policyMapUrl.ts`)
- Drawer-based policy detail view (mobile-friendly)
- Responsive design with mobile/desktop filter panels
