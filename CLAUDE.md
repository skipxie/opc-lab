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

### Running Single Tests
```bash
pnpm test Home.test.tsx     # Run specific test file
pnpm test policyMapUrl      # Run tests matching pattern
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
- `src/policies/` - Policy data module (CRUD operations)
- `src/articles/` - Article module with static page generation (SEO)
- `src/rbac/` - Role-based access control (roles, permissions, menus)
- `src/seo/` - SEO endpoints (sitemap.xml, robots.txt)
- `src/database/` - Database migrations
- `src/common/` - Shared services (StaticPageService)

### Database Tables
**User & Auth:**
- `users` - User accounts with authentication
- `user_favorites` - User favorite policies
- `user_roles` - User role assignments

**RBAC:**
- `roles` - User roles (super_admin, editor, user)
- `permissions` - Permission definitions (module:action format)
- `role_permissions` - Role-permission mappings
- `menus` - Admin navigation menus

**Content:**
- `policies` - Policy information
- `articles` - Articles with SEO fields
- `article_categories` - Article categories
- `article_category_map` - Article-category mappings
- `article_tags` - Article tags

**State Management:** Zustand for global state (`usePolicyMapStore` handles policies, filters, favorites, toast notifications)

**Authentication:** Session-based auth with cookies + JWT. Backend uses `express-session` middleware. API endpoints:
- `POST /api/auth/login` - User login (returns access_token + user info)
- `POST /api/auth/register` - User registration (returns access_token + user info)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user status

**Backend Architecture:** NestJS modules pattern
- `AuthModule` - Authentication logic with JWT + bcrypt password hashing
- `UsersModule` - User management with TypeORM repository pattern
- `PoliciesModule` - Policy CRUD operations
- Database: MySQL with TypeORM (entities, migrations)
- Environment config via `@nestjs/config` with `.env` file

**Key Frontend Utilities:**
- `cn()` in `src/lib/utils.ts` - Tailwind class merging with `clsx` + `tailwind-merge`
- `buildPolicyMapSearch()` / `parsePolicyMapSearch()` in `src/utils/policyMapUrl.ts` - URL state sync for filters
- `safeLocalStorage` in `src/utils/storage.ts` - Error-safe localStorage JSON operations
- `setPageMeta()` in `src/utils/meta.ts` - Set document title and meta description
- API client in `src/api/index.ts` - Fetch wrapper for all API endpoints

**Admin Components:**
- `AdminLayout` - Admin dashboard layout with sidebar navigation
- Rich text editor using Quill for article editing

**Routing:** React Router with nested routes under `SiteLayout` (provides TopNav, Footer, ToastHost)

**Styling:** TailwindCSS with CSS variables for theming (light/dark mode via `useTheme` hook). Utility `cn()` in `src/lib/utils.ts` for class merging.

**Path Aliases:** `@/*` maps to `./src/*` (via vite-tsconfig-paths)

**API Proxy:** Vite dev server proxies `/api/*` to `http://localhost:3000`

**SEO:**
- Static article pages generated at `/static/articles/{slug}.html`
- Sitemap at `/sitemap.xml`
- Robots.txt at `/robots.txt`
- JSON-LD structured data in article pages

**Admin Routes:**
- `/admin/dashboard` - Dashboard
- `/admin/policies` - Policy management
- `/admin/articles` - Article management
- `/admin/articles/new` - Create article
- `/admin/articles/:id/edit` - Edit article
- `/admin/roles` - Role management

**Public Routes:**
- `/articles/:slug` - Article detail page (SEO optimized)

**Tests:** Vitest + jsdom + Testing Library. Setup file at `src/test/setup.ts`.

**Entity Types:** Defined with TypeORM decorators in `server/src/**/*.entity.ts`
- `User` - User account entity with passwordHash (bcrypt)
- `UserFavorite` - User policy favorites (many-to-one with users)
- `Policy` - Policy information entity

**Environment Variables:**
- Backend uses `.env` file with: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `SESSION_SECRET`, `JWT_SECRET`, `FRONTEND_URL`, `PORT`, `NODE_ENV`
- Frontend proxies `/api` to `http://localhost:3000` in development

**Key Patterns:**
- URL state synchronization (filters persist to URL search params, see `src/utils/policyMapUrl.ts`)
- Drawer-based policy detail view (mobile-friendly)
- Responsive design with mobile/desktop filter panels

**Default Admin Account:** admin@opc-lab.com / Admin123!
