# PRD: Fasting Timer Feature

> **Feature:** Track your intermittent fasts and nutrition in one app

---

## Implementation Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Core Timer | Complete | All core components implemented |
| Phase 2: History & Stats | Complete | History and stats components done |
| Phase 3: Dashboard Integration | Complete | FastingCard added to dashboard |
| Phase 4: Advanced Features | Complete | Calendar, preferences, protocol creation done |
| Phase 5: Polish & Optimization | Complete | UI polish and diary integration done |

### Completed Items (Phase 1 & 2)

- [x] Database schema + migration (`prisma/schema.prisma`)
- [x] Types and constants (`types/fasting.ts`, `constants/fasting.ts`)
- [x] Server functions (`server/fasting.ts`)
- [x] React Query hooks (`hooks/useFasting.ts`)
- [x] FastingTimer component (with Lucide icons)
- [x] FastingControls component (with AlertDialog confirmation)
- [x] FastingProgress component (circular SVG ring)
- [x] FastingProtocolSelector component (enhanced with icons, visual indicators, difficulty badges)
- [x] FastingHistory component
- [x] FastingStatsCard component
- [x] FastingPage component
- [x] CSS styles (`styles/components/fasting.css`)
- [x] Route with auth guard (`routes/fasting/`)
- [x] Navigation integration (Sidebar + BottomNav)
- [x] Seed preset protocols (`prisma/seed.ts`)

### Design System Enhancements

- [x] Added `accent` button variant to `components/ui/button.tsx`
- [x] Added `xl` button size for prominent CTAs
- [x] Enhanced Dialog component with `closeOnOutsideClick` prop
- [x] Enhanced Dialog component with `onClose` callback

### UI/UX Polish Completed

- [x] Protocol selector with visual icons (Timer, Clock, Hourglass, Target)
- [x] Protocol cards with gradient backgrounds and hover effects
- [x] Difficulty badges (Beginner, Intermediate, Advanced, Expert)
- [x] Replaced `window.confirm` with shadcn AlertDialog
- [x] Click outside dialog to close functionality
- [x] Design system colors from `styles/colors.css`

### Pending Items

- [x] FastingDashboardWidget (added as `FastingCard` to dashboard Row 2)
- [x] Pause/Resume functionality (fully implemented in `FastingControls`)
- [x] FastingCalendar component (monthly calendar with color-coded fasts)
- [x] Progress insights integration (`FastingProgressCard` on progress page)
- [x] Profile fasting preferences (`FastingPreferences` component)
- [x] Custom protocol creation UI (form in `FastingProtocolSelector`)
- [x] Diary integration (eating window warnings) - `FastingWarningBanner` and `FastingWarningDialog`

### All Items Complete

The Fasting Timer feature is fully implemented. See `docs/FASTING_FEATURE.md` for technical documentation.

### Files Created/Modified

| File | Type | Description |
|------|------|-------------|
| `prisma/schema.prisma` | Modified | Added `FastingProtocol`, `FastingSession` models and `FastingStatus` enum |
| `prisma/seed.ts` | Modified | Added preset fasting protocols seeding |
| `src/types/fasting.ts` | Created | TypeScript types for fasting feature |
| `src/constants/fasting.ts` | Created | Fasting protocol definitions and constants |
| `src/server/fasting.ts` | Created | Server functions for fasting CRUD operations |
| `src/hooks/useFasting.ts` | Created | TanStack Query hooks for fasting data |
| `src/components/fasting/*.tsx` | Created | 7 components (Timer, Controls, Progress, ProtocolSelector, History, StatsCard, Page) |
| `src/components/fasting/index.ts` | Created | Barrel exports |
| `src/styles/components/fasting.css` | Created | ~500 lines of CSS with `@apply` pattern |
| `src/routes/fasting/index.tsx` | Created | Route with auth guard |
| `src/routes/fasting/index.lazy.tsx` | Created | Lazy-loaded page component |
| `src/components/layout/Sidebar.tsx` | Modified | Added Fasting nav item |
| `src/components/layout/BottomNav.tsx` | Modified | Added Fasting nav item |
| `src/components/dashboard/FastingCard.tsx` | Created | Dashboard widget showing active fast or stats |
| `src/routes/dashboard/index.lazy.tsx` | Modified | Added FastingCard to dashboard grid |
| `src/styles/components/dashboard.css` | Modified | Added fasting widget styles + 4-column grid |
| `src/components/ui/button.tsx` | Modified | Added `accent` variant and `xl` size |
| `src/components/ui/dialog.tsx` | Modified | Added `closeOnOutsideClick` and `onClose` props |
| `src/utils/query-keys.ts` | Modified | Added fasting query keys |
| `src/constants/routes.ts` | Modified | Added `FASTING` route |
| `docs/FASTING_FEATURE.md` | Created | Technical documentation for fasting feature |
| `src/components/fasting/FastingCalendar.tsx` | Created | Monthly calendar with color-coded fasts |
| `src/components/progress/FastingProgressCard.tsx` | Created | Progress page fasting stats card |
| `src/components/profile/FastingPreferences.tsx` | Created | Profile page fasting settings |
| `src/types/profile.ts` | Modified | Added fasting preference fields |
| `src/server/profile.ts` | Modified | Return fasting preferences |
| `src/routes/progress/index.lazy.tsx` | Modified | Added FastingProgressCard |
| `src/components/diary/FastingWarningBanner.tsx` | Created | Banner shown on diary when actively fasting |
| `src/components/diary/FastingWarningDialog.tsx` | Created | Warning dialog when logging food during a fast |
| `src/components/diary/AddFoodDialog.tsx` | Modified | Integrated fasting warning before food logging |
| `src/components/diary/DiaryDayView.tsx` | Modified | Added FastingWarningBanner and activeFast state |
| `src/styles/components/diary.css` | Modified | Added fasting warning banner and dialog styles |
| `src/utils/time-helpers.ts` | Created | Shared `formatDuration` utility function |

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Goals & Success Metrics](#goals--success-metrics)
4. [User Stories](#user-stories)
5. [Feature Requirements](#feature-requirements)
6. [Technical Architecture](#technical-architecture)
7. [Database Schema](#database-schema)
8. [API Design](#api-design)
9. [UI/UX Design](#uiux-design)
10. [Integration Points](#integration-points)
11. [Implementation Phases](#implementation-phases)
12. [Testing Strategy](#testing-strategy)
13. [Future Considerations](#future-considerations)

---

## Executive Summary

The Fasting Timer feature enables users to track intermittent fasting sessions alongside their existing nutrition tracking. Users can start, pause, and complete fasts using popular protocols (16:8, 18:6, 20:4, OMAD, or custom), view their fasting history, track streaks, and see how fasting correlates with their nutrition goals.

This feature seamlessly integrates with the existing HealthMetrics ecosystem, appearing on the dashboard and providing insights in the progress section.

---

## Problem Statement

### Current State

- Users track meals, water, steps, weight, and exercise
- No way to track fasting windows alongside nutrition
- Users interested in intermittent fasting must use separate apps
- Disconnected experience between fasting and eating windows

### Desired State

- Unified experience for fasting and nutrition tracking
- Visual timer showing current fast progress
- Historical data and streak tracking
- Smart integration with diary (eating window awareness)
- Insights correlating fasting with weight/nutrition trends

### Target Users

- Intermittent fasting practitioners (16:8, 18:6, 20:4, OMAD)
- Users exploring fasting for weight management
- Health-conscious users wanting complete daily health tracking

---

## Goals & Success Metrics

### Primary Goals

1. Enable users to track intermittent fasting sessions
2. Integrate fasting data with existing nutrition tracking
3. Provide motivational feedback through streaks and achievements

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Adoption | 40% of active users try fasting within 30 days | Database query |
| Retention | 60% of fasting users complete 7+ fasts | Streak tracking |
| Completion Rate | 70% of started fasts reach target duration | Fasting records |
| User Satisfaction | 4.0+ rating in feedback | Survey/feedback |

---

## User Stories

### Core Stories

| ID | As a... | I want to... | So that... | Priority |
|----|---------|--------------|------------|----------|
| F-01 | User | Start a fast with a preset protocol | I can quickly begin tracking | P0 |
| F-02 | User | See a live timer of my current fast | I know how much time remains | P0 |
| F-03 | User | End my fast early or mark it complete | I can accurately log my fasting | P0 |
| F-04 | User | View my fasting history | I can see patterns over time | P0 |
| F-05 | User | Track my fasting streak | I stay motivated to continue | P1 |
| F-06 | User | Create custom fasting protocols | I can follow my own schedule | P1 |
| F-07 | User | See fasting status on dashboard | I have a quick overview | P1 |
| F-08 | User | Get notified when my fast is complete | I know when I can eat | P2 |
| F-09 | User | See correlations between fasting and weight | I understand my progress | P2 |
| F-10 | User | Pause and resume a fast | I can handle unexpected situations | P2 |

### Edge Cases

- User starts a new fast while one is already active
- User logs food during a fast (warning/confirmation)
- User's fast spans midnight (new day)
- User changes timezones mid-fast
- Fast data sync across devices

---

## Feature Requirements

### Functional Requirements

#### FR-01: Fasting Protocols

- **Preset Protocols:**
  - 16:8 (16 hours fasting, 8 hours eating)
  - 18:6 (18 hours fasting, 6 hours eating)
  - 20:4 (20 hours fasting, 4 hours eating)
  - OMAD (23:1 - One Meal A Day)
  - Custom (user-defined duration)
- **Default Protocol:** Configurable in user profile (default: 16:8)
- **Quick Start:** One-tap to start fast with default protocol

#### FR-02: Fast Timer

- Real-time countdown/count-up display
- Visual progress indicator (circular or linear)
- Current phase indication (fasting vs eating window)
- Time elapsed and time remaining
- Estimated completion time

#### FR-03: Fast Management

- Start fast (with protocol selection)
- End fast (early or at target)
- Cancel fast (delete without logging)
- Pause/Resume fast (optional P2)
- Edit fast start time (for retroactive logging)

#### FR-04: Fasting History

- List of past fasts with duration and completion status
- Calendar view of fasting days
- Weekly/monthly fasting summaries
- Average fasting duration
- Longest fast achieved

#### FR-05: Streaks & Achievements

- Current streak (consecutive days with completed fast)
- Longest streak (historical best)
- Achievements for milestones (first fast, 7-day streak, etc.)
- Weekly fasting goal tracking

#### FR-06: Dashboard Integration

- Fasting widget showing current status
- Quick action to start/view fast
- Integration with daily summary

### Non-Functional Requirements

| Requirement | Specification |
|-------------|---------------|
| Performance | Timer updates every second with <100ms latency |
| Offline | Timer continues in offline mode, syncs on reconnect |
| Persistence | Active fast survives app restart/refresh |
| Responsiveness | Works on mobile, tablet, and desktop |
| Accessibility | WCAG 2.1 AA compliant |
