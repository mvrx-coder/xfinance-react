# xFinance Dashboard

## Overview

xFinance is a financial management dashboard system for inspections and operations. It's a full-stack React/TypeScript application with a modern dark-themed UI inspired by productivity tools like Linear and Notion. The system provides a data-grid-centric cockpit interface with toolbar controls, filtering, KPI displays, and various administrative modals for managing financial workflows, payments, and inspections.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom dark theme design system
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- Page components in `client/src/pages/`
- Reusable UI primitives in `client/src/components/ui/`
- Dashboard-specific components in `client/src/components/dashboard/`
- Modal components in `client/src/components/dashboard/modals/`
- Custom hooks in `client/src/hooks/`

### Performance Module Structure
The PerformanceModal has been refactored into a modular structure:
- `modals/performance/data.ts` - Centralized mock data, types, animation variants, and utility functions
- `modals/performance/KPICard.tsx` - Reusable KPI card component
- `modals/performance/PremiumTabs.tsx` - Tab navigation component
- `modals/performance/MarketShareChart.tsx` - Horizontal bar chart for market share
- `modals/performance/BusinessLineChart.tsx` - Multi-year line chart with hover interactions
- `modals/performance/OperationalBarChart.tsx` - Grouped bar chart by person/year
- `modals/performance/DetailsGrid.tsx` - Paginated table grid for player details

### Investments Module Structure
The InvestmentsModal has been refactored into a modular structure:
- `modals/investments/data.ts` - Centralized mock data, formatters, and animation variants
- `modals/investments/KPICard.tsx` - Reusable KPI card component with gradient backgrounds
- `modals/investments/HighlightCard.tsx` - Card for top winner/loser/largest position
- `modals/investments/AllocationLegend.tsx` - Interactive legend for donut chart
- `modals/investments/PremiumDonutChart.tsx` - Interactive animated donut chart
- `modals/investments/PortfolioGrid.tsx` - Paginated portfolio table with investment details

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful JSON API under `/api/` prefix
- **Development**: tsx for TypeScript execution, Vite dev server integration

The server handles:
- Static file serving in production
- API routes for inspections CRUD operations
- KPI aggregation endpoints

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's table definitions
- **Validation**: Zod schemas generated from Drizzle schemas via drizzle-zod
- **Migrations**: Managed via drizzle-kit with output to `./migrations`

Currently uses an in-memory storage implementation (`server/storage.ts`) with mock data, designed to be replaced with PostgreSQL when database is provisioned.

### Design System
The application implements a comprehensive dark theme with:
- Custom CSS variables for colors, spacing, and typography
- Design tokens defined in `client/src/index.css`
- Tailwind configuration extended in `tailwind.config.ts`
- Color palette: Deep purple backgrounds (#0A0A1F, #1A1A3A), magenta primary (#CE62D9), cyan accent (#00BCD4)

### Visual Depth System (3 Tiers)
Inspired by Linear, Stripe, Notion and Figma dashboards:

1. **Background Tier** (`bg-depth-gradient`):
   - Multi-zone vertical gradient (#070717 → #111133 → #080820)
   - Cyan vignette bottom-right, magenta vignette top-left

2. **Shell Tier** (translucent surfaces with backdrop-blur):
   - `shell-toolbar`: rgba(28, 28, 60, 0.85) - TopBar
   - `shell-kpi`: rgba(26, 26, 58, 0.75) - KPI panels
   - `shell-grid`: rgba(21, 21, 48, 0.9) - DataGrid container
   - `grid-header-shell`: rgba(15, 15, 35, 0.95) - Grid header

3. **Grid Tier** (zebra striping + cadence):
   - `grid-row-even`: transparent background
   - `grid-row-odd`: 2.5% white overlay
   - `grid-row-cadence`: magenta separator every 4 rows (Stripe-inspired)
   - Row hover states preserve zebra contrast
   - Selected rows show status gradient + glow effect

### Key Data Models
- **Users**: Authentication with username/password, roles
- **Inspections**: Core entity with workflow status, financial data (honorarios, despesas), payment tracking, and multiple category flags

## External Dependencies

### Database
- PostgreSQL (configured via `DATABASE_URL` environment variable)
- Drizzle ORM for database operations
- connect-pg-simple for session storage

### UI Libraries
- Radix UI primitives (dialog, popover, dropdown, tabs, etc.)
- Lucide React for icons
- Embla Carousel for carousel components
- cmdk for command palette functionality
- date-fns for date formatting

### Build & Development
- Vite for frontend bundling
- esbuild for server bundling
- Replit-specific plugins for development (cartographer, dev-banner, runtime-error-modal)

### Form & Validation
- React Hook Form with @hookform/resolvers
- Zod for schema validation
- drizzle-zod for database schema to Zod conversion