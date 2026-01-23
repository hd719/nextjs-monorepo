# HealthMetrics Production Deployment Checklist

---

## Quick Reference

| Service | Provider | Monthly Cost | Status |
|---------|----------|--------------|--------|
| Database | Prisma Postgres | $10-49 |  |
| File Storage | AWS S3 | ~$0.50 |  |
| Email | AWS SES | ~$0.10 |  |
| Hosting | Vercel/Railway | $0-20 |  |
| **Total** | | **$10-80** | |

---

## Pre-Deployment Setup

### 1. Database (Prisma Postgres)

| Task | Details | Status |
|------|---------|--------|
| Create Prisma account | [console.prisma.io](https://console.prisma.io) |  |
| Create production project | Name: `healthmetrics-production` |  |
| Select region | Choose closest to users (e.g., `us-east-1`) |  |
| Choose plan | Starter ($10/mo) or Pro ($49/mo for backups) |  |
| Copy DATABASE_URL | Save securely, don't commit to git |  |
| Enable spend limits | Pro plan only - prevent surprise bills |  |

**Connection String Format:**

```
prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGci...
```

---

### 2. AWS Infrastructure (S3 + SES)

> See `docs/prds/PRD_AWS_INFRASTRUCTURE.md` for detailed Terraform setup.

#### 2.1 AWS Account Setup

| Task | Details | Status |
|------|---------|--------|
| Create AWS account | [aws.amazon.com](https://aws.amazon.com) |  |
| Enable MFA | Security > MFA for root account |  |
| Create IAM admin user | Don't use root for daily operations |  |
| Install AWS CLI | `brew install awscli` |  |
| Configure credentials | `aws configure` |  |

#### 2.2 S3 (File Uploads)

| Task | Details | Status |
|------|---------|--------|
| Run Terraform | Creates bucket, IAM user, CloudFront |  |
| Note bucket name | `healthmetrics-uploads-prod` |  |
| Note CloudFront URL | For serving files |  |
| Save access keys | `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` |  |

#### 2.3 SES (Email)

| Task | Details | Status |
|------|---------|--------|
| Verify domain | Add DNS records for `healthmetrics.com` |  |
| Request production access | Exit sandbox mode (can take 24-48h) |  |
| Create SMTP credentials | For sending emails |  |
| Test email sending | Send test to your email |  |

---

### 3. Authentication (Better Auth)

#### 3.1 Generate Secrets

| Task | Command | Status |
|------|---------|--------|
| Generate auth secret | `openssl rand -base64 64` |  |
| Generate API key | `openssl rand -hex 16` |  |

**Example Output:**

```bash
# BETTER_AUTH_SECRET (64 chars)
qL9fJ8kPm3nR7vX2wY5zA1bC4dE6gH9iK0lM2nO3pQ4rS5tU6vW7xY8zA9bC0dE1f

# BARCODE_SERVICE_API_KEY (32 chars)
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

#### 3.2 Update Configuration

| Task | File | Status |
|------|------|--------|
| Update `trustedOrigins` | `src/lib/auth-config.ts` |  |
| Update email sending | Replace console.log with SES |  |
| Verify production URLs | `BETTER_AUTH_URL`, `APP_URL` |  |

**Code Change - trustedOrigins:**

```typescript
// src/lib/auth-config.ts
trustedOrigins: process.env.TRUSTED_ORIGINS?.split(',') || [DEFAULT_DEV_URL],
```

---

### 4. Domain & SSL

| Task | Details | Status |
|------|---------|--------|
| Purchase domain | `healthmetrics.com` or similar |  |
| Configure DNS | Point to hosting provider |  |
| SSL certificate | Usually automatic (Vercel/Railway) |  |
| Verify HTTPS | All URLs use `https://` |  |

---

## Environment Variables

### Required Variables

Copy this template to your hosting platform's environment settings:

```env
# ============================================
# DATABASE (Prisma Postgres)
# ============================================
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"

# ============================================
# AUTHENTICATION (Better Auth)
# ============================================
BETTER_AUTH_SECRET="your-64-char-cryptographically-secure-secret"
BETTER_AUTH_URL="https://healthmetrics.com"
APP_URL="https://healthmetrics.com"
TRUSTED_ORIGINS="https://healthmetrics.com,https://www.healthmetrics.com"

# ============================================
# AWS S3 (File Uploads)
# ============================================
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="healthmetrics-uploads-prod"
CLOUDFRONT_URL="https://d1234567890.cloudfront.net"

# ============================================
# AWS SES (Email)
# ============================================
SES_FROM_EMAIL="noreply@healthmetrics.com"
SES_REGION="us-east-1"
# Uses same AWS credentials as S3

# ============================================
# APP CONFIG
# ============================================
NODE_ENV="production"
LOG_LEVEL="error"

# ============================================
# BARCODE SERVICE (if deployed)
# ============================================
GO_SERVICE_URL="https://barcode.healthmetrics.com"
BARCODE_SERVICE_API_KEY="your-32-char-api-key"

# ============================================
# CLIENT-SIDE (Vite)
# ============================================
VITE_AUTH_URL="https://healthmetrics.com"
```

### Variables to NOT Set in Production

```env
# DO NOT SET THESE - they enable mock data
# VITE_USE_MOCK_DASHBOARD
# VITE_USE_MOCK_ACHIEVEMENTS
# VITE_USE_MOCK_BARCODE
# VITE_SIMULATE_SCANNER_OFFLINE
# VITE_SHOW_DEV_TOOLS
```

---

## Deployment Steps

### Step 1: Run Database Migrations

```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="your-prod-connection-string"

# Deploy all migrations (does NOT create new ones)
bunx prisma migrate deploy

# Verify migration status
bunx prisma migrate status
```

### Step 2: Seed Initial Data

```bash
# Seed achievements, fasting protocols, etc.
DATABASE_URL="your-prod-url" bun prisma/seed.ts
```

### Step 3: Deploy Application

#### Option A: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings > Environment Variables
```

#### Option B: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

#### Option C: Docker

```bash
# Build image
docker build -f Dockerfile.healthmetrics -t healthmetrics:prod .

# Run with env file
docker run --env-file .env.production -p 3003:3003 healthmetrics:prod
```

### Step 4: Configure Domain

1. Add custom domain in hosting dashboard
2. Update DNS records (CNAME or A record)
3. Wait for SSL certificate provisioning
4. Verify HTTPS works

---

## Monitoring & Observability

### Recommended Services

| Service | Purpose | Provider Options |
|---------|---------|------------------|
| Error tracking | Catch runtime errors | Sentry, LogRocket |
| Logging | Centralized logs | Axiom, LogTail, DataDog |
| Uptime monitoring | Detect outages | Better Uptime, Pingdom |
| Performance | Core Web Vitals | Vercel Analytics, SpeedCurve |

### Setup Checklist

| Task | Details | Status |
|------|---------|--------|
| Set up Sentry | Error tracking + performance |  |
| Configure alerts | Email/Slack on errors |  |
| Add uptime monitor | Check `/api/health` endpoint |  |
| Review logs | Check for errors after deploy |  |

---

## Security Hardening

> See `docs/prds/PRD_SECURITY_HARDENING.md` for detailed implementation.

### Pre-Launch Security

| Task | Details | Status |
|------|---------|--------|
| Enable CSP headers | Restrict resource loading |  |
| Add rate limiting | Prevent brute force |  |
| Review input validation | All user inputs sanitized |  |
| Check CORS settings | Only allow trusted origins |  |
| Disable debug mode | `NODE_ENV=production` |  |
| Remove console.logs | No sensitive data logged |  |

### Secrets Management

| Task | Details | Status |
|------|---------|--------|
| Rotate auth secret | Use new secret for prod |  |
| Verify no secrets in code | Search codebase for keys |  |
| Check .gitignore | `.env*` files excluded |  |
| Use platform secrets | Not .env files in production |  |

---

## Backup & Recovery

### Database Backups

| Task | Details | Status |
|------|---------|--------|
| Verify automatic backups | Prisma Pro plan includes daily |  |
| Test restore process | Document recovery steps |  |
| Export user data | Ability to export on request |  |

### Disaster Recovery

| Task | Details | Status |
|------|---------|--------|
| Document recovery steps | How to restore from backup |  |
| Keep infrastructure as code | Terraform for reproducibility |  |
| Test failover | Verify recovery process works |  |

---

## Launch Checklist (Final Review)

### 24 Hours Before Launch

- [ ] All environment variables set in production
- [ ] Database migrations applied
- [ ] Initial data seeded
- [ ] SSL certificate active
- [ ] Email sending verified
- [ ] File uploads working
- [ ] Error tracking configured
- [ ] Smoke test all critical flows
