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
- Custom hooks in `client/src/hooks/`

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