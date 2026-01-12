# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production (runs prisma generate first)
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio

# Type checking
npx tsc --noEmit     # Run TypeScript type check
```

## Architecture

**KEPT** is a political promise accountability platform built with Next.js 15 App Router, supporting trilingual content (Latvian, English, Russian).

### Routing Structure
- `app/[locale]/(public)/*` - Public pages (home, promises, politicians, about)
- `app/[locale]/(admin)/admin/*` - Protected admin backoffice
- `app/api/*` - REST API endpoints

### Key Patterns

**Internationalization**: Uses `next-intl` with locale-based routing. All user-facing text in `messages/{lv,en,ru}.json`. Database content uses JSON fields with `{lv, en, ru}` structure.

**Database**: Prisma 7 with PostgreSQL adapter (`@prisma/adapter-pg`). Schema at `prisma/schema.prisma`, config at `prisma.config.ts`. Trilingual fields stored as JSON.

**Authentication**: NextAuth.js v5 beta with credentials provider. Config at `lib/auth.ts`. Admin routes protected via layout.

**Styling**: Tailwind CSS 4 with glassmorphism effects. Status colors defined in `lib/utils.ts`:statusConfig`.

**Dynamic Rendering**: Pages using Prisma export `dynamic = "force-dynamic"` to prevent build-time database queries.

**Reusable Components**: navigate with `NavLink` component for localized links with active state handling. Use standard UI components from `components/ui`.

### Data Models
- **Promise** - Political promises with status (KEPT/NOT_KEPT/IN_PROGRESS/ABANDONED/PARTIAL)
- **Politician** - Linked to Party, has multiple Promises
- **Party** - Political parties with color branding
- **Category** - Promise categories (Economy, Healthcare, etc.)
- **Source/Evidence** - Links supporting promises

### Environment Variables
```
DATABASE_URL        # PostgreSQL connection string
NEXTAUTH_SECRET     # Auth secret
NEXTAUTH_URL        # Base URL
BLOB_READ_WRITE_TOKEN  # Vercel Blob (optional)
```
