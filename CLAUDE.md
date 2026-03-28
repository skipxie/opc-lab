# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend (pnpm)
```bash
pnpm dev          # Start dev server (Vite)
pnpm build        # Type check + production build
pnpm lint         # Run ESLint
pnpm check        # Type check only (no emit)
pnpm test         # Run tests (Vitest)
```

### Backend (server/)
```bash
cd server
npm run start:dev  # Start NestJS dev server
npm run build      # Build production bundle
npm run migrate    # Run database migrations
```

## Architecture

**Stack:** React 18 + TypeScript + Vite + TailwindCSS + Zustand + React Router + Leaflet
**Backend:** NestJS + MySQL + Session authentication

**Project:** OPC-Lab (光未在线 OPC) - A policy information platform helping solo entrepreneurs find and action government policies.

### Frontend Structure
- `src/pages/` - Route-level components (Home, PolicyMap, Community, Login, Register)
- `src/components/` - UI components organized by domain (`ui/`, `policy/`, `site/`)
- `src/stores/` - Zustand state stores
- `src/hooks/` - Custom React hooks
- `src/utils/` - Pure utility functions
- `src/types/` - TypeScript type definitions
- `src/data/` - Static/sample data

### Backend Structure (server/)
- `src/auth/` - Authentication module (login, register, logout)
- `src/users/` - User module and profile management
- `src/policies/` - Policy data module
- `src/database/` - Database migrations

### Database Tables
- `users` - User accounts with authentication
- `user_favorites` - User favorite policies
- `policies` - Policy information

**State Management:** Zustand for global state (`usePolicyMapStore` handles policies, filters, favorites, toast notifications)

**Authentication:** Session-based auth with cookies. API endpoints:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user status

**Routing:** React Router with nested routes under `SiteLayout` (provides TopNav, Footer, ToastHost)

**Styling:** TailwindCSS with CSS variables for theming (light/dark mode via `useTheme` hook). Utility `cn()` in `src/lib/utils.ts` for class merging.

**Path Aliases:** `@/*` maps to `./src/*` (via vite-tsconfig-paths)

**API Proxy:** Vite dev server proxies `/api/*` to `http://localhost:3000`

**Tests:** Vitest + jsdom + Testing Library. Setup file at `src/test/setup.ts`.

**Key Patterns:**
- URL state synchronization (filters persist to URL search params, see `src/utils/policyMapUrl.ts`)
- Drawer-based policy detail view (mobile-friendly)
- Responsive design with mobile/desktop filter panels

**Default Admin Account:** admin@opc-lab.com / Admin123!
