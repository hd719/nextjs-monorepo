# HealthMetrics

A modern nutrition and health tracking application built with TanStack Start, React, and Prisma.

## Features

### Implemented

- **User Authentication** - Email/password with Better Auth, email verification, password reset
- **Food Diary** - Log meals with nutrition tracking (calories, protein, carbs, fat)
- **Exercise Logging** - Track workouts with calorie burn estimation
- **Weight Tracking** - Log and visualize weight over time
- **Water Intake** - Track daily water consumption
- **Step Counting** - Daily step tracking
- **Dashboard** - Overview of daily nutrition, activity, and progress
- **Profile Management** - User settings, goals, and preferences
- **Onboarding Flow** - Guided setup for new users
- **Dark/Light Mode** - Theme toggle with system preference detection

### Planned

See `/docs/prds/` for detailed product requirements:

- Barcode Scanner
- AI Food Recognition
- Push Notifications
- Apple Health / Google Fit Integration
- Data Export
- Fasting Timer

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [TanStack Start](https://tanstack.com/start) |
| UI | React 19, Tailwind CSS |
| Routing | TanStack Router (file-based) |
| Data Fetching | TanStack Query |
| Forms | TanStack Form + Zod |
| Database | PostgreSQL + Prisma ORM |
| Authentication | Better Auth |
| Styling | Tailwind CSS + CSS Variables |

## Getting Started

### Prerequisites

- Node.js 22+
- Bun
- PostgreSQL database

### Installation

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.development.local
# Edit .env.development.local with your database URL and secrets

# Run database migrations
bunx prisma migrate dev

# Start development server
bun dev
```

The app will be available at `http://localhost:3003`.

### Environment Variables

```env
DATABASE_URL="postgresql://..."
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3003"
```

## Project Structure

```
src/
├── components/       # React components
│   ├── auth/         # Authentication forms
│   ├── dashboard/    # Dashboard widgets
│   ├── diary/        # Food diary components
│   ├── exercise/     # Workout logging
│   ├── layout/       # App shell, navigation
│   ├── onboarding/   # New user onboarding
│   ├── profile/      # User settings
│   ├── progress/     # Analytics & charts
│   └── ui/           # Shared UI components
├── constants/        # App constants & config
├── data/             # Mock data (dev only)
├── hooks/            # Custom React hooks
├── lib/              # External integrations
├── routes/           # File-based routing
├── server/           # Server functions (RPC)
├── styles/           # CSS files
├── types/            # TypeScript types
└── utils/            # Pure helper functions

docs/
├── prds/             # Product requirements
├── explainations/    # Technical documentation
└── QA_TEST_PLAN.md   # Manual test cases

prisma/
└── schema.prisma     # Database schema
```

## Architecture

### Directory Conventions

| Directory | Purpose | Side Effects |
|-----------|---------|--------------|
| `src/lib/` | External integrations, singletons | Yes (DB, auth clients) |
| `src/utils/` | Pure helper functions | No (easily testable) |
| `src/server/` | Server-side functions (RPC) | Yes (DB queries) |
| `src/hooks/` | React hooks (queries, mutations) | Yes (state, effects) |

### Import Patterns

```typescript
// Direct imports
import { useProfile } from "@/hooks/useProfile";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

// Utils barrel export
import { cn, calculateBMR } from "@/utils";
```

### Lazy Loading

Protected routes use code splitting:

- `index.tsx` - Auth check (`beforeLoad`)
- `index.lazy.tsx` - Page component (loaded on demand)

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start development server |
| `bun build` | Build for production |
| `bun start` | Start production server |
| `bun test` | Run tests (Vitest) |
| `bun prisma studio` | Open Prisma database GUI |
| `bun prisma migrate dev` | Run database migrations |
| `bun tsc --noEmit` | Type check |

## Development

### Mock Data

Enable mock dashboard data for UI development:

```env
VITE_USE_MOCK_DASHBOARD=true
```

### Dev Tools

Enable developer tools (reset onboarding, etc.):

```env
VITE_SHOW_DEV_TOOLS=true
```

A gear icon will appear in the bottom-right corner of the dashboard.

### Database

```bash
# Generate Prisma client after schema changes
bunx prisma generate

# Create a new migration
bunx prisma migrate dev --name your_migration_name

# Reset database (development only)
bunx prisma migrate reset

# Open database GUI
bunx prisma studio
```

## Testing

```bash
# Run all tests
bun test

# Run with UI
bun test --ui

# Run specific test file
bun test src/utils/nutrition-calculator.test.ts
```

See `docs/QA_TEST_PLAN.md` for manual testing checklist.

## Documentation

| Document | Description |
|----------|-------------|
| `docs/prds/` | Product requirements for planned features |
| `docs/explainations/` | Technical deep-dives |
| `docs/QA_TEST_PLAN.md` | Manual test cases |

### Key PRDs

- `PRD_BARCODE_SCANNER.md` - Food barcode scanning
- `PRD_AI_FOOD_RECOGNITION.md` - Photo-based food logging + AI chat
- `PRD_PUSH_NOTIFICATIONS.md` - Meal & water reminders
- `PRD_HEALTH_INTEGRATION.md` - Apple Health / Google Fit sync
- `PRD_DATA_EXPORT.md` - Export data as CSV/JSON/PDF

## License

TODO: Add license
