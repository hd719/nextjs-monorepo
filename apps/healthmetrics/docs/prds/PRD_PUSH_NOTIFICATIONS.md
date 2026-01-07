# PRD: Push Notifications

> **Status:** Not Started
> **Priority:** Medium
> **Effort:** Medium (3-4 days)
> **Dependencies:** Service Worker, Push API, Backend notification service

---

## Problem Statement

Users forget to log meals, drink water, and maintain healthy habits. Without timely reminders:

- Meal logging becomes inconsistent (missed entries)
- Water intake goals aren't met
- Streaks are broken unintentionally
- Users disengage from the app over time

**Goal:** Increase user engagement and habit formation through timely, personalized push notifications.

---

## Goals

### Must Have

- [ ] Browser push notifications (Web Push API)
- [ ] Meal reminder notifications (breakfast, lunch, dinner)
- [ ] Water reminder notifications
- [ ] User can enable/disable notifications
- [ ] User can customize reminder times

### Should Have

- [ ] Streak protection alerts ("Log now to keep your streak!")
- [ ] Daily summary notifications
- [ ] Smart timing based on user behavior
- [ ] Quiet hours setting

### Nice to Have

- [ ] Achievement unlock notifications
- [ ] Weekly progress reports
- [ ] Motivational quotes/tips
- [ ] Social notifications (when social features added)

### Non-Goals

- Native mobile push (requires native app)
- SMS notifications
- Email notifications (separate feature)
- Marketing/promotional notifications

---

## User Stories

### As a user wanting reminders

- I want meal reminders at times I choose
- I want water reminders throughout the day
- I want to snooze or dismiss reminders easily
- I want to disable notifications without uninstalling

### As a user with streaks

- I want to be warned before my streak breaks
- I want celebration notifications for streak milestones

### As a busy user

- I want quiet hours so I'm not disturbed at night
- I want smart reminders that adapt to my schedule

---

## Technical Architecture

### Technology Stack

| Component | Technology | Reasoning |
|-----------|------------|-----------|
| Push Service | Web Push API | Native browser support, no third-party |
| Service Worker | Vanilla JS | Required for background push |
| Backend | Node.js with web-push | Lightweight, well-documented |
| Storage | Prisma/PostgreSQL | Store subscriptions and preferences |

### Push Notification Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Server  │────▶│  Push    │────▶│  Browser │
│  (App)   │     │  (API)   │     │  Service │     │  (User)  │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
     │                │                                  │
     │ 1. Subscribe   │                                  │
     │───────────────▶│                                  │
     │                │                                  │
     │ 2. Save        │                                  │
     │   subscription │                                  │
     │                │                                  │
     │                │ 3. Send notification             │
     │                │─────────────────────────────────▶│
     │                │                                  │
     │                │                     4. Display   │
     │                │                        push      │
```

### Database Schema

```prisma
model PushSubscription {
  id           String   @id @default(cuid())
  userId       String
  endpoint     String   @unique
  p256dh       String   // Public key
  auth         String   // Auth secret
  userAgent    String?
  createdAt    DateTime @default(now())
  lastUsedAt   DateTime @default(now())

  user         BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("push_subscription")
}

model NotificationPreference {
  id                String   @id @default(cuid())
  userId            String   @unique

  // Master toggle
  enabled           Boolean  @default(true)

  // Meal reminders
  mealReminders     Boolean  @default(true)
  breakfastTime     String?  // "08:00"
  lunchTime         String?  // "12:30"
  dinnerTime        String?  // "18:30"

  // Water reminders
  waterReminders    Boolean  @default(true)
  waterInterval     Int      @default(120) // minutes between reminders
  waterStartTime    String?  // "08:00"
  waterEndTime      String?  // "21:00"

  // Other reminders
  streakReminders   Boolean  @default(true)
  dailySummary      Boolean  @default(false)
  summaryTime       String?  // "20:00"

  // Quiet hours
  quietHoursEnabled Boolean  @default(true)
  quietStart        String   @default("22:00")
  quietEnd          String   @default("07:00")

  // Timezone for scheduling
  timezone          String   @default("UTC")

  user              BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preference")
}

model ScheduledNotification {
  id           String   @id @default(cuid())
  userId       String
  type         String   // "meal", "water", "streak", "summary"
  scheduledFor DateTime
  payload      Json     // Notification content
  sent         Boolean  @default(false)
  sentAt       DateTime?

  user         BetterAuthUser @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([scheduledFor, sent])
  @@map("scheduled_notification")
}
```

---

## Implementation Plan

### Phase 1: Infrastructure (Day 1)

#### 1.1 VAPID Key Generation

```bash
# Generate VAPID keys for Web Push
npx web-push generate-vapid-keys
```

**Environment Variables:**

```env
VAPID_PUBLIC_KEY=BEl62iUYgU...
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:notifications@healthmetrics.app
```

#### 1.2 Service Worker

**File:** `public/sw.js`

```javascript
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/badge-icon.png',
    tag: data.tag,
    data: { url: data.url },
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.openWindow(url)
  );
});
```

#### 1.3 Server Functions

**File:** `src/server/notifications.ts`

```typescript
// Subscribe user to push notifications
export async function subscribeToPush(subscription: PushSubscriptionData): Promise<void>

// Unsubscribe from push notifications
export async function unsubscribeFromPush(endpoint: string): Promise<void>

// Send notification to user
export async function sendNotification(userId: string, notification: NotificationPayload): Promise<void>

// Get/update notification preferences
export async function getNotificationPreferences(userId: string): Promise<NotificationPreference>
export async function updateNotificationPreferences(userId: string, prefs: Partial<NotificationPreference>): Promise<void>
```

### Phase 2: Subscription UI (Day 2)

#### 2.1 Permission Request

**File:** `src/components/notifications/NotificationPrompt.tsx`

```typescript
interface NotificationPromptProps {
  onSubscribe: () => void;
  onDismiss: () => void;
}
```

- Show after user logs first meal
- Explain benefits clearly
- Non-intrusive dismissal

#### 2.2 Settings Page

**File:** `src/components/notifications/NotificationSettings.tsx`

- Master enable/disable toggle
- Meal reminder time pickers
- Water reminder interval slider
- Quiet hours configuration
- Test notification button

### Phase 3: Notification Scheduler (Day 3)

#### 3.1 Cron Job / Scheduled Task

**Options:**

- Vercel Cron (if deployed on Vercel)
- Node-cron for self-hosted
- External service (Quirrel, Inngest)

**File:** `src/jobs/notification-scheduler.ts`

```typescript
// Runs every minute
export async function processScheduledNotifications(): Promise<void> {
  const now = new Date();

  // Get all due notifications
  const due = await prisma.scheduledNotification.findMany({
    where: {
      scheduledFor: { lte: now },
      sent: false,
    },
    include: { user: true },
  });

  for (const notification of due) {
    await sendNotification(notification.userId, notification.payload);
    await markAsSent(notification.id);
  }
}
```

#### 3.2 Smart Scheduling

- Schedule next day's notifications at midnight (user's timezone)
- Skip reminders if user already logged that meal
- Adjust water reminders based on current intake

### Phase 4: Notification Types (Day 4)

#### 4.1 Meal Reminders

```typescript
{
  title: "Time for lunch! 🍽️",
  body: "Don't forget to log your meal",
  tag: "meal-lunch",
  url: "/diary",
  actions: [
    { action: "log", title: "Log Now" },
    { action: "snooze", title: "Remind in 30min" },
  ],
}
```

#### 4.2 Water Reminders

```typescript
{
  title: "Stay hydrated!",
  body: "You've had 4/8 glasses today",
  tag: "water-reminder",
  url: "/dashboard",
  actions: [
    { action: "log", title: "+1 Glass" },
    { action: "dismiss", title: "Dismiss" },
  ],
}
```

#### 4.3 Streak Protection

```typescript
{
  title: "Protect your streak!",
  body: "Log a meal in the next 2 hours to keep your 15-day streak",
  tag: "streak-warning",
  url: "/diary",
}
```

#### 4.4 Daily Summary

```typescript
{
  title: "Your day in review",
  body: "1,850 cal • 120g protein • 8 glasses water",
  tag: "daily-summary",
  url: "/progress",
}
```

---

## UI/UX Design

### Permission Prompt (First-time)

```
┌─────────────────────────────────┐
│                                 │
│  Stay on track with         │
│     reminders                   │
│                                 │
│  Get helpful notifications for: │
│  • Meal logging reminders       │
│  • Water intake goals           │
│  • Streak protection            │
│                                 │
│  ┌─────────────────────────────┐│
│  │     Enable Notifications    ││
│  └─────────────────────────────┘│
│                                 │
│        Maybe later              │
│                                 │
└─────────────────────────────────┘
```

### Notification Settings

```
┌─────────────────────────────────┐
│  ← Notification Settings        │
├─────────────────────────────────┤
│                                 │
│  Push Notifications    [====●] │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Meal Reminders        [====●] │
│    Breakfast           08:00 ▼ │
│    Lunch               12:30 ▼ │
│    Dinner              18:30 ▼ │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Water Reminders       [====●] │
│    Every 2 hours       ──●──── │
│    From 08:00 to 21:00         │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Streak Alerts         [====●] │
│  Daily Summary         [●────] │
│    At                  20:00 ▼ │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Quiet Hours           [====●] │
│    22:00 to 07:00              │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  [  Send Test Notification  ]   │
│                                 │
└─────────────────────────────────┘
```

---

## File Structure

```
src/
├── components/
│   └── notifications/
│       ├── NotificationPrompt.tsx
│       ├── NotificationSettings.tsx
│       ├── TimePickerField.tsx
│       └── index.ts
├── server/
│   └── notifications.ts
├── hooks/
│   ├── usePushSubscription.ts
│   └── useNotificationPreferences.ts
├── jobs/
│   └── notification-scheduler.ts
├── types/
│   └── notifications.ts
└── utils/
    └── push-helpers.ts

public/
├── sw.js                    # Service worker
└── icons/
    ├── notification-icon.png
    └── badge-icon.png
```

---

## Error Handling

| Scenario | User Experience |
|----------|-----------------|
| Push permission denied | Show instructions to enable in browser settings |
| Service worker not supported | Hide notification features gracefully |
| Subscription expired | Re-prompt for permission |
| Notification failed to send | Retry with exponential backoff |
| User offline | Queue for when online |

---

## Acceptance Criteria

### Functional

- [ ] User can subscribe to push notifications
- [ ] User receives meal reminders at configured times
- [ ] User receives water reminders at intervals
- [ ] User can customize all reminder times
- [ ] User can disable notifications entirely
- [ ] Quiet hours respected

### Technical

- [ ] Service worker registered successfully
- [ ] Push subscription stored in database
- [ ] Notifications sent within 1 minute of scheduled time
- [ ] Failed notifications retried

### UX

- [ ] Permission prompt is non-intrusive
- [ ] Settings are easy to understand
- [ ] Test notification works
- [ ] Clicking notification opens correct page

---

## Privacy & Compliance

- Notifications are opt-in only
- Clear explanation of what notifications will be sent
- Easy unsubscribe at any time
- No tracking pixels in notifications
- Subscriptions deleted when user deletes account

---

## Future Enhancements

- **Rich notifications**: Images, progress bars
- **Notification grouping**: Bundle multiple reminders
- **Smart timing**: ML-based optimal send times
- **Cross-device sync**: Same preferences across devices
- **Notification history**: View past notifications in app

---

## References

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push npm package](https://github.com/web-push-libs/web-push)
- [VAPID Protocol](https://datatracker.ietf.org/doc/html/rfc8292)
