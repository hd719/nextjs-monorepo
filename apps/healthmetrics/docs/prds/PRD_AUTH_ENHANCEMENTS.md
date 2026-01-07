# PRD: Authentication Enhancements

## Overview

Future enhancements to the authentication system to improve security, user experience, and feature completeness.

---

## 1. Email Service Integration

**Priority:** High
**Status:** Not Started
**Effort:** Small (1-2 hours)

### Problem

Currently, verification and password reset emails are logged to the console. This works for development but is not suitable for production.

### Solution

Integrate a transactional email service (Resend recommended).

### Implementation

```typescript
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

emailVerification: {
  sendVerificationEmail: async ({ user, token }) => {
    const url = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

    await resend.emails.send({
      from: "noreply@healthmetrics.app",
      to: user.email,
      subject: "Verify your email",
      html: `<a href="${url}">Click here to verify</a>`,
    });
  },
}
```

### Requirements

- [ ] Set up Resend account
- [ ] Add `RESEND_API_KEY` to environment
- [ ] Create email templates (verification, password reset)
- [ ] Test email delivery in staging

---

## 2. Social Authentication (OAuth)

**Priority:** Medium
**Status:** Not Started
**Effort:** Medium (4-6 hours)

### Problem

Users must create a new account with email/password. Many users prefer signing in with existing accounts.

### Solution

Add Google and GitHub OAuth providers.

### Implementation

```typescript
socialProviders: {
  google: {
    enabled: true,
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  },
  github: {
    enabled: true,
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}
```

### Requirements

- [ ] Create Google OAuth app in Google Cloud Console
- [ ] Create GitHub OAuth app in GitHub Developer Settings
- [ ] Add OAuth buttons to login/signup pages
- [ ] Handle account linking (existing email)
- [ ] Test OAuth flows

### UI Changes

- Add "Continue with Google" button
- Add "Continue with GitHub" button
- Add divider "or" between OAuth and email form

---

## 3. Two-Factor Authentication (2FA)

**Priority:** Medium
**Status:** Not Started
**Effort:** Medium (6-8 hours)

### Problem

Email/password authentication is vulnerable to credential theft. High-security users need additional protection.

### Solution

Add TOTP-based two-factor authentication.

### Implementation

```typescript
twoFactor: {
  enabled: true,
  issuer: "HealthMetrics",
}
```

### Requirements

- [ ] Add 2FA setup page in profile settings
- [ ] Generate and display QR code for authenticator apps
- [ ] Store backup codes securely
- [ ] Add 2FA verification step during login
- [ ] Allow 2FA disable with password confirmation

### UI Changes

- Profile settings: "Enable Two-Factor Authentication"
- Setup wizard with QR code
- Backup codes display (one-time view)
- Login: 2FA code input step

---

## 4. Session Management UI

**Priority:** Low
**Status:** Not Started
**Effort:** Medium (4-6 hours)

### Problem

Users cannot see or manage their active sessions. If a session is compromised, they cannot revoke it.

### Solution

Build a session management page in profile settings.

### Features

- List all active sessions
- Display device information (browser, OS)
- Show IP address and location (approximate)
- Show last active time
- "Sign out" button per session
- "Sign out all other sessions" button

### Requirements

- [ ] Create `/profile/sessions` page
- [ ] Fetch active sessions from Better-Auth API
- [ ] Display session details in a table/list
- [ ] Add revoke session functionality
- [ ] Highlight current session

---

## 5. Account Deletion

**Priority:** Low
**Status:** Not Started
**Effort:** Small (2-3 hours)

### Problem

Users cannot delete their account (GDPR compliance concern).

### Solution

Add account deletion flow with confirmation.

### Requirements

- [ ] Add "Delete Account" button in profile settings
- [ ] Require password confirmation
- [ ] Show warning about data loss
- [ ] Cascade delete all user data
- [ ] Send confirmation email after deletion

---

## Implementation Order

1. **Email Service** - Required for production
2. **Social Auth** - Improves signup conversion
3. **2FA** - Security enhancement
4. **Session Management** - User transparency
5. **Account Deletion** - Compliance

---

## Environment Variables Needed

```bash
# Email (Resend)
RESEND_API_KEY=re_xxxxx

# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx

# GitHub OAuth
GITHUB_CLIENT_ID=xxxxx
GITHUB_CLIENT_SECRET=xxxxx
```
